import { NextRequest, NextResponse } from 'next/server';
import { FirebaseAuthService } from '@/lib/services/firebase-auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { HCaptchaService } from '@/lib/services/hcaptcha.service';
import { studentRegistrationSchema } from '@/lib/validators/auth';
import { UserRole, EventType } from '@/types/auth';
import { z } from 'zod';

/**
 * Student Registration API Endpoint
 * POST /api/auth/register/student
 */
export async function POST(request: NextRequest) {
  const firebaseAuthService = new FirebaseAuthService();
  const databaseService = new DatabaseService();
  const hcaptchaService = new HCaptchaService();

  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input data
    const validationResult = studentRegistrationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validationResult.error.flatten()
          }
        },
        { status: 400 }
      );
    }

    const registrationData = validationResult.data;

    // Verify hCaptcha token
    const hcaptchaResult = await hcaptchaService.verifyToken(
      registrationData.hcaptchaToken,
      'student_registration'
    );

    if (!hcaptchaResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CAPTCHA_VERIFICATION_FAILED',
            message: 'Please complete the captcha verification'
          }
        },
        { status: 400 }
      );
    }

    // Get client information for audit logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create Firebase Auth account
    const authResult = await firebaseAuthService.registerStudent(registrationData);

    if (!authResult.success || !authResult.user) {
      // Log failed registration attempt
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_REGISTER,
        action: 'student_registration_failed',
        ipAddress: clientIP,
        userAgent,
        success: false,
        errorMessage: authResult.error?.message || 'Unknown error',
        metadata: {
          email: registrationData.email,
          role: UserRole.STUDENT,
          errorCode: authResult.error?.code
        }
      });

      return NextResponse.json(
        {
          success: false,
          error: authResult.error
        },
        { status: 400 }
      );
    }

    // Create user profile in Neon DB
    try {
      const userProfile = await databaseService.createUserProfile(authResult.user.uid, {
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        role: UserRole.STUDENT,
        emailVerified: false,
        studentProfile: {
          gradeLevel: registrationData.gradeLevel,
          subjects: registrationData.subjects,
          profileCompletionPercentage: 40 // Basic info + grade + subjects
        }
      });

      // Sync email verification status to Neon DB
      await databaseService.updateUserProfile(authResult.user.uid, {
        emailVerified: authResult.user.emailVerified
      });

      // Log successful registration
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_REGISTER,
        action: 'student_registration_success',
        firebaseUid: authResult.user.uid,
        ipAddress: clientIP,
        userAgent,
        success: true,
        metadata: {
          email: registrationData.email,
          role: UserRole.STUDENT,
          gradeLevel: registrationData.gradeLevel,
          subjects: registrationData.subjects,
          profileId: userProfile.id
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          user: {
            uid: authResult.user.uid,
            email: authResult.user.email,
            emailVerified: authResult.user.emailVerified,
            displayName: `${registrationData.firstName} ${registrationData.lastName}`
          },
          profile: {
            id: userProfile.id,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            role: userProfile.role,
            profileCompletionPercentage: userProfile.studentProfile?.profileCompletionPercentage || 40
          },
          needsEmailVerification: authResult.needsEmailVerification,
          idToken: authResult.idToken
        }
      });

    } catch (dbError: any) {
      // If Neon DB creation fails, we should clean up the Firebase user
      // However, for now we'll log the error and return success since Firebase account was created
      console.error('Failed to create user profile in Neon DB:', dbError);

      // Log the database sync failure
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_REGISTER,
        action: 'student_registration_db_sync_failed',
        firebaseUid: authResult.user.uid,
        ipAddress: clientIP,
        userAgent,
        success: false,
        errorMessage: dbError.message,
        metadata: {
          email: registrationData.email,
          role: UserRole.STUDENT,
          firebaseAccountCreated: true
        }
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_SYNC_ERROR',
            message: 'Account created but profile sync failed. Please contact support.'
          }
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Student registration error:', error);

    // Log unexpected error
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_REGISTER,
        action: 'student_registration_error',
        ipAddress: clientIP,
        userAgent,
        success: false,
        errorMessage: error.message,
        metadata: {
          errorStack: error.stack
        }
      });
    } catch (logError) {
      console.error('Failed to log audit event:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred during registration'
        }
      },
      { status: 500 }
    );
  } finally {
    // Cleanup database connection
    await databaseService.disconnect();
  }
}

/**
 * Helper function to log audit events
 */
async function logAuditEvent(
  databaseService: DatabaseService,
  event: {
    eventType: EventType;
    action: string;
    firebaseUid?: string;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
  }
) {
  try {
    // Note: This would typically use a dedicated audit service
    // For now, we'll use Prisma directly through the database service
    const prisma = (databaseService as any).prisma;
    
    await prisma.auditLog.create({
      data: {
        firebaseUid: event.firebaseUid,
        eventType: event.eventType,
        action: event.action,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        success: event.success,
        errorMessage: event.errorMessage,
        metadata: event.metadata || {},
        deviceFingerprint: generateDeviceFingerprint(event.userAgent, event.ipAddress)
      }
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw here to avoid breaking the main flow
  }
}

/**
 * Generate a simple device fingerprint
 */
function generateDeviceFingerprint(userAgent: string, ipAddress: string): string {
  // Simple fingerprint based on user agent and IP
  // In production, this would be more sophisticated
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(`${userAgent}:${ipAddress}`)
    .digest('hex')
    .substring(0, 16);
}
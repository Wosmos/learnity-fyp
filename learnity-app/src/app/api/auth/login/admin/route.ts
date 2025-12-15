import { NextRequest, NextResponse } from 'next/server';
import { FirebaseAuthService } from '@/lib/services/firebase-auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { HCaptchaService } from '@/lib/services/hcaptcha.service';
import { auditService } from '@/lib/services/audit.service';
import { staticAdminLoginSchema } from '@/lib/validators/auth';
import { UserRole, EventType } from '@/types/auth';
import { generateDeviceFingerprintLegacy } from '@/lib/utils/device-fingerprint';

/**
 * Static Admin Login API Endpoint
 * POST /api/auth/login/admin
 */
export async function POST(request: NextRequest) {
  const firebaseAuthService = new FirebaseAuthService();
  const databaseService = new DatabaseService();
  const hcaptchaService = new HCaptchaService();

  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input data
    const validationResult = staticAdminLoginSchema.safeParse(body);
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

    const loginData = validationResult.data;

    // Verify hCaptcha token (always required for admin login)
    const hcaptchaResult = await hcaptchaService.verifyToken(
      loginData.hcaptchaToken,
      'admin_login'
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

    // Authenticate static admin with Firebase Auth
    const authResult = await firebaseAuthService.loginStaticAdmin(loginData);

    if (!authResult.success || !authResult.user) {
      // Log failed admin login attempt
      await auditService.logAuthenticationEvent({
        eventType: EventType.AUTH_LOGIN,
        action: 'admin_login_failed',
        ipAddress: clientIP,
        userAgent,
        success: false,
        errorMessage: authResult.error?.message || 'Unknown error',
        metadata: {
          email: loginData.email,
          role: UserRole.ADMIN,
          errorCode: authResult.error?.code,
          attemptType: 'static_admin'
        }
      });

      return NextResponse.json(
        {
          success: false,
          error: authResult.error
        },
        { status: 401 }
      );
    }

    // Create or update admin profile in Neon DB
    try {
      let userProfile;
      
      // Check if admin profile already exists
      const existingProfile = await databaseService.getUserProfile(authResult.user.uid);
      
      if (existingProfile) {
        // Update existing profile
        userProfile = await databaseService.updateUserProfile(authResult.user.uid, {
          emailVerified: true,
          lastLoginAt: new Date()
        });
      } else {
        // Create new admin profile
        userProfile = await databaseService.createUserProfile(authResult.user.uid, {
          firstName: 'Static',
          lastName: 'Admin',
          email: authResult.user.email!,
          role: UserRole.ADMIN,
          emailVerified: true,
          adminProfile: {
            department: 'Platform Management',
            isStatic: true,
            createdBy: 'system'
          }
        });
      }

      // Log successful admin login
      await auditService.logAuthenticationEvent({
        firebaseUid: authResult.user.uid,
        eventType: EventType.AUTH_LOGIN,
        action: 'admin_login_success',
        ipAddress: clientIP,
        userAgent,
        success: true,
        metadata: {
          email: authResult.user.email,
          role: UserRole.ADMIN,
          profileId: userProfile.id,
          isStatic: true,
          loginType: 'static_admin'
        }
      });

      // Log admin action for enhanced audit trail
      await auditService.logAdminAction({
        adminFirebaseUid: authResult.user.uid,
        action: 'admin_session_started',
        targetResource: 'admin_session',
        ipAddress: clientIP,
        userAgent,
        success: true,
        newValues: {
          sessionType: 'static_admin',
          adminLevel: 'platform_owner'
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          user: {
            uid: authResult.user.uid,
            email: authResult.user.email,
            emailVerified: authResult.user.emailVerified,
            displayName: `${userProfile.firstName} ${userProfile.lastName}`
          },
          profile: {
            id: userProfile.id,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            role: userProfile.role,
            isStatic: userProfile.adminProfile?.isStatic || false,
            department: userProfile.adminProfile?.department || 'Platform Management'
          },
          idToken: authResult.idToken,
          permissions: [
            'view:admin_panel',
            'manage:users',
            'approve:teachers',
            'view:audit_logs',
            'manage:platform'
          ]
        }
      });

    } catch (dbError: any) {
      console.error('Failed to create/update admin profile in Neon DB:', dbError);

      // Log the database sync failure
      await auditService.logAuthenticationEvent({
        firebaseUid: authResult.user.uid,
        eventType: EventType.AUTH_LOGIN,
        action: 'admin_login_db_sync_failed',
        ipAddress: clientIP,
        userAgent,
        success: false,
        errorMessage: dbError.message,
        metadata: {
          email: authResult.user.email,
          role: UserRole.ADMIN,
          firebaseAuthSuccess: true
        }
      });

      // Still return success since Firebase auth worked
      // Admin can still access the system with limited functionality
      return NextResponse.json({
        success: true,
        data: {
          user: {
            uid: authResult.user.uid,
            email: authResult.user.email,
            emailVerified: authResult.user.emailVerified,
            displayName: 'Static Admin'
          },
          profile: {
            id: 'temp',
            firstName: 'Static',
            lastName: 'Admin',
            role: UserRole.ADMIN,
            isStatic: true,
            department: 'Platform Management'
          },
          idToken: authResult.idToken,
          permissions: [
            'view:admin_panel',
            'manage:users',
            'approve:teachers',
            'view:audit_logs',
            'manage:platform'
          ],
          warning: 'Profile sync failed. Some features may be limited.'
        }
      });
    }

  } catch (error: unknown) {
    console.error('Static admin login error:', error);

    // Log unexpected error
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
      await auditService.logAuthenticationEvent({
        eventType: EventType.AUTH_LOGIN,
        action: 'admin_login_error',
        ipAddress: clientIP,
        userAgent,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          errorStack: error instanceof Error ? error.stack : 'No stack trace',
          attemptType: 'static_admin'
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
          message: 'An unexpected error occurred during admin login'
        }
      },
      { status: 500 }
    );
  } finally {
    // Cleanup database connection
    await databaseService.disconnect();
  }
}


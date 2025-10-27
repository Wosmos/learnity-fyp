import { NextRequest, NextResponse } from 'next/server';
import { FirebaseAuthService } from '@/lib/services/firebase-auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { HCaptchaService } from '@/lib/services/hcaptcha.service';
import { loginSchema } from '@/lib/validators/auth';
import { EventType, SecurityEventType, RiskLevel, UserRole, Permission } from '@/types/auth';

/**
 * User Login API Endpoint
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
  const firebaseAuthService = new FirebaseAuthService();
  const databaseService = new DatabaseService();
  const hcaptchaService = new HCaptchaService();

  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input data
    const validationResult = loginSchema.safeParse(body);
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

    // Get client information for security analysis
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const deviceFingerprint = generateDeviceFingerprint(userAgent, clientIP);

    // Check for suspicious activity (rate limiting, multiple failed attempts)
    const securityAssessment = await analyzeLoginAttempt(databaseService, {
      email: loginData.email,
      ipAddress: clientIP,
      userAgent,
      deviceFingerprint
    });

    // If high risk and no captcha provided, require captcha
    if (securityAssessment.requiresCaptcha && !loginData.hcaptchaToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CAPTCHA_REQUIRED',
            message: 'Additional verification required. Please complete the captcha.',
            requiresCaptcha: true
          }
        },
        { status: 429 }
      );
    }

    // Verify hCaptcha token if provided
    if (loginData.hcaptchaToken) {
      const hcaptchaResult = await hcaptchaService.verifyToken(
        loginData.hcaptchaToken,
        'user_login'
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
    }

    // Attempt Firebase Auth login
    const authResult = await firebaseAuthService.login(loginData);

    if (!authResult.success || !authResult.user) {
      // Log failed login attempt
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_LOGIN,
        action: 'login_failed',
        ipAddress: clientIP,
        userAgent,
        deviceFingerprint,
        success: false,
        errorMessage: authResult.error?.message || 'Unknown error',
        metadata: {
          email: loginData.email,
          errorCode: authResult.error?.code,
          riskLevel: securityAssessment.riskLevel
        }
      });

      // Log security event for failed login
      await logSecurityEvent(databaseService, {
        eventType: SecurityEventType.MULTIPLE_FAILED_ATTEMPTS,
        riskLevel: RiskLevel.MEDIUM,
        ipAddress: clientIP,
        userAgent,
        deviceFingerprint,
        blocked: false,
        reason: `Failed login attempt for ${loginData.email}`,
        metadata: {
          email: loginData.email,
          errorCode: authResult.error?.code
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

    // Retrieve user profile from Neon DB
    try {
      let userProfile = await databaseService.getUserProfile(authResult.user.uid);
      
      if (!userProfile) {
        // User exists in Firebase but not in Neon DB - create profile
        userProfile = await databaseService.createUserProfile(authResult.user.uid, {
          firstName: authResult.user.displayName?.split(' ')[0] || 'User',
          lastName: authResult.user.displayName?.split(' ').slice(1).join(' ') || '',
          email: authResult.user.email!,
          role: UserRole.STUDENT, // Default role
          emailVerified: authResult.user.emailVerified
        });
      } else {
        // Update last login time and email verification status
        userProfile = await databaseService.updateUserProfile(authResult.user.uid, {
          emailVerified: authResult.user.emailVerified,
          lastLoginAt: new Date()
        });
      }

      // Enrich Firebase custom claims with role data from Neon DB
      await firebaseAuthService.setCustomClaims(authResult.user.uid, {
        role: userProfile!.role as UserRole,
        permissions: getPermissionsForRole(userProfile!.role as string),
        profileComplete: calculateProfileCompletion(userProfile!),
        emailVerified: userProfile!.emailVerified
      });

      // Check for new device login
      const isNewDevice = await checkNewDeviceLogin(databaseService, authResult.user.uid, deviceFingerprint);
      
      if (isNewDevice) {
        await logSecurityEvent(databaseService, {
          eventType: SecurityEventType.NEW_DEVICE_LOGIN,
          riskLevel: RiskLevel.LOW,
          firebaseUid: authResult.user.uid,
          ipAddress: clientIP,
          userAgent,
          deviceFingerprint,
          blocked: false,
          reason: 'Login from new device detected',
          metadata: {
            email: authResult.user.email,
            deviceInfo: userAgent
          }
        });
      }

      // Log successful login
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_LOGIN,
        action: 'login_success',
        firebaseUid: authResult.user.uid,
        ipAddress: clientIP,
        userAgent,
        deviceFingerprint,
        success: true,
        metadata: {
          email: authResult.user.email,
          role: userProfile!.role,
          profileId: userProfile!.id,
          isNewDevice,
          riskLevel: securityAssessment.riskLevel
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          user: {
            uid: authResult.user.uid,
            email: authResult.user.email,
            emailVerified: authResult.user.emailVerified,
            displayName: `${userProfile!.firstName} ${userProfile!.lastName}`
          },
          profile: {
            id: userProfile!.id,
            firstName: userProfile!.firstName,
            lastName: userProfile!.lastName,
            role: userProfile!.role,
            profilePicture: userProfile!.profilePicture,
            profileComplete: calculateProfileCompletion(userProfile!),
            lastLoginAt: userProfile!.lastLoginAt
          },
          idToken: authResult.idToken,
          permissions: getPermissionsForRole(userProfile!.role as string),
          isNewDevice
        }
      });

    } catch (dbError: any) {
      console.error('Failed to retrieve/create user profile in Neon DB:', dbError);

      // Log the database sync failure
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_LOGIN,
        action: 'login_db_sync_failed',
        firebaseUid: authResult.user.uid,
        ipAddress: clientIP,
        userAgent,
        deviceFingerprint,
        success: false,
        errorMessage: dbError.message,
        metadata: {
          email: authResult.user.email,
          firebaseAuthSuccess: true
        }
      });

      // Still return success since Firebase auth worked
      return NextResponse.json({
        success: true,
        data: {
          user: {
            uid: authResult.user.uid,
            email: authResult.user.email,
            emailVerified: authResult.user.emailVerified,
            displayName: authResult.user.displayName || 'User'
          },
          profile: {
            id: 'temp',
            firstName: authResult.user.displayName?.split(' ')[0] || 'User',
            lastName: authResult.user.displayName?.split(' ').slice(1).join(' ') || '',
            role: 'STUDENT',
            profileComplete: false
          },
          idToken: authResult.idToken,
          permissions: ['view:student_dashboard'],
          warning: 'Profile sync failed. Some features may be limited.'
        }
      });
    }

  } catch (error: any) {
    console.error('Login error:', error);

    // Log unexpected error
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_LOGIN,
        action: 'login_error',
        ipAddress: clientIP,
        userAgent,
        deviceFingerprint: generateDeviceFingerprint(userAgent, clientIP),
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
          message: 'An unexpected error occurred during login'
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
 * Analyze login attempt for security risks
 */
async function analyzeLoginAttempt(
  databaseService: DatabaseService,
  attempt: {
    email: string;
    ipAddress: string;
    userAgent: string;
    deviceFingerprint: string;
  }
): Promise<{ riskLevel: RiskLevel; requiresCaptcha: boolean }> {
  try {
    const prisma = (databaseService as any).prisma;
    
    // Check for recent failed attempts from this IP
    const recentFailures = await prisma.auditLog.count({
      where: {
        ipAddress: attempt.ipAddress,
        eventType: EventType.AUTH_LOGIN,
        success: false,
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
        }
      }
    });

    // Check for recent failed attempts for this email
    const emailFailures = await prisma.auditLog.count({
      where: {
        metadata: {
          path: ['email'],
          equals: attempt.email
        },
        eventType: EventType.AUTH_LOGIN,
        success: false,
        createdAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000) // Last 30 minutes
        }
      }
    });

    let riskLevel = RiskLevel.LOW;
    let requiresCaptcha = false;

    if (recentFailures >= 5 || emailFailures >= 3) {
      riskLevel = RiskLevel.HIGH;
      requiresCaptcha = true;
    } else if (recentFailures >= 3 || emailFailures >= 2) {
      riskLevel = RiskLevel.MEDIUM;
      requiresCaptcha = true;
    }

    return { riskLevel, requiresCaptcha };
  } catch (error) {
    console.error('Failed to analyze login attempt:', error);
    return { riskLevel: RiskLevel.LOW, requiresCaptcha: false };
  }
}

/**
 * Check if this is a new device login
 */
async function checkNewDeviceLogin(
  databaseService: DatabaseService,
  firebaseUid: string,
  deviceFingerprint: string
): Promise<boolean> {
  try {
    const prisma = (databaseService as any).prisma;
    
    const existingLogin = await prisma.auditLog.findFirst({
      where: {
        firebaseUid,
        eventType: EventType.AUTH_LOGIN,
        success: true,
        deviceFingerprint
      }
    });

    return !existingLogin;
  } catch (error) {
    console.error('Failed to check new device login:', error);
    return false;
  }
}

/**
 * Get permissions for a user role
 */
function getPermissionsForRole(role: string): Permission[] {
  switch (role) {
    case 'STUDENT':
      return [Permission.VIEW_STUDENT_DASHBOARD, Permission.JOIN_STUDY_GROUPS, Permission.BOOK_TUTORING, Permission.ENHANCE_PROFILE];
    case 'TEACHER':
      return [Permission.VIEW_TEACHER_DASHBOARD, Permission.MANAGE_SESSIONS, Permission.UPLOAD_CONTENT, Permission.VIEW_STUDENT_PROGRESS];
    case 'PENDING_TEACHER':
      return [Permission.VIEW_APPLICATION_STATUS, Permission.UPDATE_APPLICATION];
    case 'ADMIN':
      return [Permission.VIEW_ADMIN_PANEL, Permission.MANAGE_USERS, Permission.APPROVE_TEACHERS, Permission.VIEW_AUDIT_LOGS, Permission.MANAGE_PLATFORM];
    default:
      return [Permission.VIEW_STUDENT_DASHBOARD];
  }
}

/**
 * Calculate profile completion status
 */
function calculateProfileCompletion(userProfile: any): boolean {
  if (userProfile.role === 'STUDENT') {
    return userProfile.studentProfile?.profileCompletionPercentage >= 80;
  } else if (userProfile.role === 'TEACHER') {
    return userProfile.teacherProfile?.applicationStatus === 'APPROVED';
  } else if (userProfile.role === 'ADMIN') {
    return true;
  }
  return false;
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
    deviceFingerprint: string;
    success: boolean;
    errorMessage?: string;
    metadata?: Record<string, any>;
  }
) {
  try {
    const prisma = (databaseService as any).prisma;
    
    await prisma.auditLog.create({
      data: {
        firebaseUid: event.firebaseUid,
        eventType: event.eventType,
        action: event.action,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        deviceFingerprint: event.deviceFingerprint,
        success: event.success,
        errorMessage: event.errorMessage,
        metadata: event.metadata || {}
      }
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Helper function to log security events
 */
async function logSecurityEvent(
  databaseService: DatabaseService,
  event: {
    eventType: SecurityEventType;
    riskLevel: RiskLevel;
    firebaseUid?: string;
    ipAddress: string;
    userAgent: string;
    deviceFingerprint: string;
    blocked: boolean;
    reason: string;
    metadata?: Record<string, any>;
  }
) {
  try {
    const prisma = (databaseService as any).prisma;
    
    await prisma.securityEvent.create({
      data: {
        firebaseUid: event.firebaseUid,
        eventType: event.eventType,
        riskLevel: event.riskLevel,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        deviceFingerprint: event.deviceFingerprint,
        blocked: event.blocked,
        reason: event.reason,
        metadata: event.metadata || {}
      }
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Generate a simple device fingerprint
 */
function generateDeviceFingerprint(userAgent: string, ipAddress: string): string {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(`${userAgent}:${ipAddress}`)
    .digest('hex')
    .substring(0, 16);
}
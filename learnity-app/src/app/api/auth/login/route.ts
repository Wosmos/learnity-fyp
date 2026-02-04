import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FirebaseAuthService } from '@/lib/services/firebase-auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { HCaptchaService } from '@/lib/services/hcaptcha.service';
import { AppCheckService } from '@/lib/services/app-check.service';
import { RoleManagerService } from '@/lib/services/role-manager.service';
import { loginSchema } from '@/lib/validators/auth';
import {
  EventType,
  SecurityEventType,
  RiskLevel,
  UserRole,
  Permission,
  SecurityAction,
} from '@/types/auth';

/**
 * Enhanced User Login API Endpoint with Firebase Auth + Neon DB Integration
 * POST /api/auth/login
 *
 * Features:
 * - Firebase Auth validation with enhanced rate limiting
 * - Neon DB profile retrieval and synchronization
 * - Firebase custom claims enrichment with role data
 * - Comprehensive audit logging with IP, device, and security tracking
 * - Advanced bot protection and fraud detection
 */
export async function POST(request: NextRequest) {
  const firebaseAuthService = new FirebaseAuthService();
  const databaseService = new DatabaseService();
  const hcaptchaService = new HCaptchaService();
  const appCheckService = new AppCheckService();
  const roleManagerService = new RoleManagerService();

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
            details: validationResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const loginData = validationResult.data;

    // Enhanced client information extraction for comprehensive security analysis
    const clientIP =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') || // Cloudflare
      request.headers.get('x-client-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const acceptLanguage = request.headers.get('accept-language') || 'unknown';
    const referer = request.headers.get('referer') || 'direct';
    const deviceFingerprint = generateEnhancedDeviceFingerprint(
      userAgent,
      clientIP,
      acceptLanguage
    );

    // Enhanced security assessment with comprehensive rate limiting
    const securityAssessment = await analyzeLoginAttemptEnhanced(
      databaseService,
      {
        email: loginData.email,
        ipAddress: clientIP,
        userAgent,
        deviceFingerprint,
        acceptLanguage,
        referer,
      }
    );

    // Firebase App Check integration for bot protection
    const appCheckResult = await appCheckService.getAppCheckTokenForAction(
      SecurityAction.LOGIN
    );

    // Adjust security assessment based on App Check results
    if (!appCheckResult.success && process.env.NODE_ENV === 'production') {
      securityAssessment.riskLevel = RiskLevel.HIGH;
      securityAssessment.requiresCaptcha = true;
    }

    // If high risk and no captcha provided, require captcha
    if (securityAssessment.requiresCaptcha && !loginData.hcaptchaToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CAPTCHA_REQUIRED',
            message:
              'Additional verification required. Please complete the captcha.',
            requiresCaptcha: true,
          },
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
              message: 'Please complete the captcha verification',
            },
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
          riskLevel: securityAssessment.riskLevel,
        },
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
          errorCode: authResult.error?.code,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
        },
        { status: 401 }
      );
    }

    // Enhanced user profile retrieval and synchronization with Neon DB
    try {
      let userProfile = await databaseService.getUserProfile(
        authResult.user.uid
      );
      let isNewUser = false;

      if (!userProfile) {
        // User exists in Firebase but not in Neon DB - create synchronized profile
        isNewUser = true;
        userProfile = await databaseService.createUserProfile(
          authResult.user.uid,
          {
            firstName: authResult.user.displayName?.split(' ')[0] || 'User',
            lastName:
              authResult.user.displayName?.split(' ').slice(1).join(' ') || '',
            email: authResult.user.email!,
            role: UserRole.STUDENT, // Default role for new users
            emailVerified: authResult.user.emailVerified,
            profilePicture: authResult.user.photoURL || undefined,
            studentProfile: {
              gradeLevel: 'Not specified',
              subjects: [],
              learningGoals: [],
              interests: [],
              studyPreferences: [],
              profileCompletionPercentage: 20,
            },
          }
        );

        // Log new user creation for audit
        await logAuditEvent(databaseService, {
          eventType: EventType.PROFILE_UPDATE,
          action: 'profile_created_on_login',
          firebaseUid: authResult.user.uid,
          ipAddress: clientIP,
          userAgent,
          deviceFingerprint,
          success: true,
          metadata: {
            email: authResult.user.email,
            isNewUser: true,
            createdFromFirebaseAuth: true,
          },
        });
      } else {
        // Update existing profile with latest Firebase Auth data
        userProfile = await databaseService.updateUserProfile(
          authResult.user.uid,
          {
            emailVerified: authResult.user.emailVerified,
            lastLoginAt: new Date(),
            ...(authResult.user.photoURL &&
              !userProfile.profilePicture && {
                profilePicture: authResult.user.photoURL || undefined,
              }),
          }
        );
      }

      // Enhanced Firebase custom claims enrichment with comprehensive role data from Neon DB
      const customClaims = {
        role: userProfile!.role as UserRole,
        permissions: await roleManagerService.getRolePermissions(
          userProfile!.role as UserRole
        ),
        profileComplete: calculateProfileCompletion(userProfile!),
        emailVerified: userProfile!.emailVerified,
        lastLoginAt: new Date().toISOString(),
        profileId: userProfile!.id,
      };

      await roleManagerService.setCustomClaims(
        authResult.user.uid,
        customClaims
      );

      // Enhanced device and location analysis
      const deviceAnalysis = await analyzeDeviceAndLocation(
        databaseService,
        authResult.user.uid,
        {
          deviceFingerprint,
          ipAddress: clientIP,
          userAgent,
          acceptLanguage,
          referer,
        }
      );

      // Comprehensive security event logging
      if (deviceAnalysis.isNewDevice) {
        await logSecurityEvent(databaseService, {
          eventType: SecurityEventType.NEW_DEVICE_LOGIN,
          riskLevel: deviceAnalysis.isNewLocation
            ? RiskLevel.MEDIUM
            : RiskLevel.LOW,
          firebaseUid: authResult.user.uid,
          ipAddress: clientIP,
          userAgent,
          deviceFingerprint,
          blocked: false,
          reason: `Login from ${deviceAnalysis.isNewLocation ? 'new device and location' : 'new device'}`,
          metadata: {
            email: authResult.user.email,
            deviceInfo: userAgent,
            isNewLocation: deviceAnalysis.isNewLocation,
            previousLoginCount: deviceAnalysis.previousLoginCount,
            lastLoginLocation: deviceAnalysis.lastKnownLocation,
            appCheckSuccess: appCheckResult.success,
          },
        });
      }

      // Enhanced successful login audit logging
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
          isNewUser,
          isNewDevice: deviceAnalysis.isNewDevice,
          isNewLocation: deviceAnalysis.isNewLocation,
          riskLevel: securityAssessment.riskLevel,
          appCheckSuccess: appCheckResult.success,
          captchaUsed: !!loginData.hcaptchaToken,
          loginDuration:
            Date.now() -
            new Date(
              authResult.user.metadata.lastSignInTime || Date.now()
            ).getTime(),
          sessionInfo: {
            acceptLanguage,
            referer,
            timezone: request.headers.get('x-timezone') || 'unknown',
          },
        },
      });

      // Ensure idToken exists
      if (!authResult.idToken) {
        console.error('Login succeeded but no ID token returned from Firebase');
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_ID_TOKEN',
              message: 'Authentication succeeded but session token is missing.',
            },
          },
          { status: 500 }
        );
      }

      // Build response body (note: consider removing idToken from response for security)
      const responseBody = {
        success: true,
        data: {
          user: {
            uid: authResult.user.uid,
            email: authResult.user.email,
            emailVerified: authResult.user.emailVerified,
            displayName: `${userProfile!.firstName} ${userProfile!.lastName}`,
          },
          profile: {
            id: userProfile!.id,
            firstName: userProfile!.firstName,
            lastName: userProfile!.lastName,
            role: userProfile!.role,
            profilePicture: userProfile!.profilePicture,
            profileComplete: calculateProfileCompletion(userProfile!),
            lastLoginAt: userProfile!.lastLoginAt,
          },
          // ⚠️ Optional: remove `idToken` from response since it's in HTTP-only cookie
          idToken: authResult.idToken,
          permissions: customClaims.permissions,
          isNewDevice: deviceAnalysis.isNewDevice,
          isNewLocation: deviceAnalysis.isNewLocation,
          securityInfo: {
            riskLevel: securityAssessment.riskLevel,
            appCheckVerified: appCheckResult.success,
            captchaVerified: !!loginData.hcaptchaToken,
          },
        },
      };

      // Create response
      const response = NextResponse.json(responseBody);

      // ✅ Set HTTP-only session cookie via header (reliable in Route Handlers)
      const maxAge = 7 * 24 * 60 * 60; // 1 week in seconds
      const cookieParts = [
        `session=${encodeURIComponent(authResult.idToken)}`,
        'HttpOnly',
        'Path=/',
        'SameSite=Lax',
        `Max-Age=${maxAge}`,
      ];

      if (process.env.NODE_ENV === 'production') {
        cookieParts.push('Secure');
      }

      response.headers.set('Set-Cookie', cookieParts.join('; '));

      return response;
    } catch (dbError: any) {
      console.error(
        'Failed to retrieve/create user profile in Neon DB:',
        dbError
      );

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
          firebaseAuthSuccess: true,
        },
      });

      // Still return success since Firebase auth worked
      return NextResponse.json({
        success: true,
        data: {
          user: {
            uid: authResult.user.uid,
            email: authResult.user.email,
            emailVerified: authResult.user.emailVerified,
            displayName: authResult.user.displayName || 'User',
          },
          profile: {
            id: 'temp',
            firstName: authResult.user.displayName?.split(' ')[0] || 'User',
            lastName:
              authResult.user.displayName?.split(' ').slice(1).join(' ') || '',
            role: 'STUDENT',
            profileComplete: false,
          },
          idToken: authResult.idToken,
          permissions: ['view:student_dashboard'],
          warning: 'Profile sync failed. Some features may be limited.',
        },
      });
    }
  } catch (error: any) {
    console.error('Login error:', error);

    // Log unexpected error
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_LOGIN,
        action: 'login_error',
        ipAddress: clientIP,
        userAgent,
        deviceFingerprint: generateEnhancedDeviceFingerprint(
          userAgent,
          clientIP,
          'unknown'
        ),
        success: false,
        errorMessage: error.message,
        metadata: {
          errorStack: error.stack,
        },
      });
    } catch (logError) {
      console.error('Failed to log audit event:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred during login',
        },
      },
      { status: 500 }
    );
  } finally {
    // Cleanup database connection
    await databaseService.disconnect();
  }
}

/**
 * Enhanced login attempt analysis with comprehensive security assessment
 */
async function analyzeLoginAttemptEnhanced(
  databaseService: DatabaseService,
  attempt: {
    email: string;
    ipAddress: string;
    userAgent: string;
    deviceFingerprint: string;
    acceptLanguage: string;
    referer: string;
  }
): Promise<{
  riskLevel: RiskLevel;
  requiresCaptcha: boolean;
  blockedReasons: string[];
}> {
  try {
    const prisma = (databaseService as any).prisma;
    const now = new Date();
    const blockedReasons: string[] = [];

    // Enhanced time windows for different types of analysis
    const timeWindows = {
      immediate: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes
      short: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes
      medium: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour
      long: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24 hours
    };

    // 1. IP-based analysis with progressive time windows
    const [
      immediateIPFailures,
      shortIPFailures,
      mediumIPFailures,
      longIPFailures,
    ] = await Promise.all([
      prisma.auditLog.count({
        where: {
          ipAddress: attempt.ipAddress,
          eventType: EventType.AUTH_LOGIN,
          success: false,
          createdAt: { gte: timeWindows.immediate },
        },
      }),
      prisma.auditLog.count({
        where: {
          ipAddress: attempt.ipAddress,
          eventType: EventType.AUTH_LOGIN,
          success: false,
          createdAt: { gte: timeWindows.short },
        },
      }),
      prisma.auditLog.count({
        where: {
          ipAddress: attempt.ipAddress,
          eventType: EventType.AUTH_LOGIN,
          success: false,
          createdAt: { gte: timeWindows.medium },
        },
      }),
      prisma.auditLog.count({
        where: {
          ipAddress: attempt.ipAddress,
          eventType: EventType.AUTH_LOGIN,
          success: false,
          createdAt: { gte: timeWindows.long },
        },
      }),
    ]);

    // 2. Email-based analysis
    const [emailFailuresShort, emailFailuresMedium] = await Promise.all([
      prisma.auditLog.count({
        where: {
          metadata: {
            path: ['email'],
            equals: attempt.email,
          },
          eventType: EventType.AUTH_LOGIN,
          success: false,
          createdAt: { gte: timeWindows.short },
        },
      }),
      prisma.auditLog.count({
        where: {
          metadata: {
            path: ['email'],
            equals: attempt.email,
          },
          eventType: EventType.AUTH_LOGIN,
          success: false,
          createdAt: { gte: timeWindows.medium },
        },
      }),
    ]);

    // 3. Device fingerprint analysis
    const deviceFailures = await prisma.auditLog.count({
      where: {
        deviceFingerprint: attempt.deviceFingerprint,
        eventType: EventType.AUTH_LOGIN,
        success: false,
        createdAt: { gte: timeWindows.medium },
      },
    });

    // 4. Check for existing security events
    const recentSecurityEvents = await prisma.securityEvent.count({
      where: {
        ipAddress: attempt.ipAddress,
        eventType: {
          in: [
            SecurityEventType.SUSPICIOUS_LOGIN,
            SecurityEventType.BOT_DETECTED,
            SecurityEventType.RATE_LIMIT_EXCEEDED,
          ],
        },
        createdAt: { gte: timeWindows.medium },
      },
    });

    // 5. Pattern analysis for bot detection
    const recentAttempts = await prisma.auditLog.findMany({
      where: {
        ipAddress: attempt.ipAddress,
        eventType: EventType.AUTH_LOGIN,
        createdAt: { gte: timeWindows.short },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Analyze timing patterns (bot detection)
    const isSuspiciousPattern = analyzeTimmingPatterns(recentAttempts);

    // Risk assessment logic
    let riskLevel = RiskLevel.LOW;
    let requiresCaptcha = false;

    // Critical risk factors
    if (immediateIPFailures >= 3) {
      riskLevel = RiskLevel.CRITICAL;
      requiresCaptcha = true;
      blockedReasons.push(
        `${immediateIPFailures} failed attempts in last 5 minutes`
      );
    } else if (shortIPFailures >= 8 || emailFailuresShort >= 5) {
      riskLevel = RiskLevel.HIGH;
      requiresCaptcha = true;
      blockedReasons.push(
        `High failure rate: IP(${shortIPFailures}) Email(${emailFailuresShort})`
      );
    } else if (
      mediumIPFailures >= 15 ||
      emailFailuresMedium >= 8 ||
      deviceFailures >= 10
    ) {
      riskLevel = RiskLevel.HIGH;
      requiresCaptcha = true;
      blockedReasons.push(`Sustained attack pattern detected`);
    } else if (
      longIPFailures >= 25 ||
      recentSecurityEvents > 0 ||
      isSuspiciousPattern
    ) {
      riskLevel = RiskLevel.MEDIUM;
      requiresCaptcha = true;
      if (isSuspiciousPattern)
        blockedReasons.push('Suspicious timing pattern detected');
      if (recentSecurityEvents > 0)
        blockedReasons.push('Recent security events from IP');
    } else if (shortIPFailures >= 3 || emailFailuresShort >= 2) {
      riskLevel = RiskLevel.MEDIUM;
      requiresCaptcha = true;
      blockedReasons.push('Moderate failure rate detected');
    }

    return { riskLevel, requiresCaptcha, blockedReasons };
  } catch (error) {
    console.error('Failed to analyze login attempt:', error);
    return {
      riskLevel: RiskLevel.MEDIUM,
      requiresCaptcha: true,
      blockedReasons: ['Analysis failed - defaulting to secure'],
    };
  }
}

/**
 * Enhanced device and location analysis
 */
async function analyzeDeviceAndLocation(
  databaseService: DatabaseService,
  firebaseUid: string,
  deviceInfo: {
    deviceFingerprint: string;
    ipAddress: string;
    userAgent: string;
    acceptLanguage: string;
    referer: string;
  }
): Promise<{
  isNewDevice: boolean;
  isNewLocation: boolean;
  previousLoginCount: number;
  lastKnownLocation?: string;
}> {
  try {
    const prisma = (databaseService as any).prisma;

    // Check for existing successful logins with this device
    const existingDeviceLogin = await prisma.auditLog.findFirst({
      where: {
        firebaseUid,
        eventType: EventType.AUTH_LOGIN,
        success: true,
        deviceFingerprint: deviceInfo.deviceFingerprint,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Check for existing successful logins from this IP/location
    const existingLocationLogin = await prisma.auditLog.findFirst({
      where: {
        firebaseUid,
        eventType: EventType.AUTH_LOGIN,
        success: true,
        ipAddress: deviceInfo.ipAddress,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get total login count for this user
    const totalLogins = await prisma.auditLog.count({
      where: {
        firebaseUid,
        eventType: EventType.AUTH_LOGIN,
        success: true,
      },
    });

    // Get last known location for comparison
    const lastLogin = await prisma.auditLog.findFirst({
      where: {
        firebaseUid,
        eventType: EventType.AUTH_LOGIN,
        success: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      isNewDevice: !existingDeviceLogin,
      isNewLocation: !existingLocationLogin,
      previousLoginCount: totalLogins,
      lastKnownLocation: lastLogin?.ipAddress,
    };
  } catch (error) {
    console.error('Failed to analyze device and location:', error);
    return {
      isNewDevice: true,
      isNewLocation: true,
      previousLoginCount: 0,
    };
  }
}

/**
 * Get permissions for a user role
 */
function getPermissionsForRole(role: string): Permission[] {
  switch (role) {
    case 'STUDENT':
      return [
        Permission.VIEW_STUDENT_DASHBOARD,
        Permission.JOIN_STUDY_GROUPS,
        Permission.BOOK_TUTORING,
        Permission.ENHANCE_PROFILE,
      ];
    case 'TEACHER':
      return [
        Permission.VIEW_TEACHER_DASHBOARD,
        Permission.MANAGE_SESSIONS,
        Permission.UPLOAD_CONTENT,
        Permission.VIEW_STUDENT_PROGRESS,
      ];
    case 'PENDING_TEACHER':
      return [
        Permission.VIEW_APPLICATION_STATUS,
        Permission.UPDATE_APPLICATION,
      ];
    case 'ADMIN':
      return [
        Permission.VIEW_ADMIN_PANEL,
        Permission.MANAGE_USERS,
        Permission.APPROVE_TEACHERS,
        Permission.VIEW_AUDIT_LOGS,
        Permission.MANAGE_PLATFORM,
      ];
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
        metadata: event.metadata || {},
      },
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
        metadata: event.metadata || {},
      },
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Generate enhanced device fingerprint with multiple factors
 */
function generateEnhancedDeviceFingerprint(
  userAgent: string,
  ipAddress: string,
  acceptLanguage: string
): string {
  // Extract key components from user agent
  const browserInfo = extractBrowserInfo(userAgent);

  // Create composite fingerprint
  const fingerprintData = [
    userAgent,
    ipAddress,
    acceptLanguage,
    browserInfo.browser,
    browserInfo.os,
    browserInfo.device,
  ].join('|');

  return createHash('sha256')
    .update(fingerprintData)
    .digest('hex')
    .substring(0, 24); // Longer fingerprint for better uniqueness
}

/**
 * Extract browser information from user agent
 */
function extractBrowserInfo(userAgent: string): {
  browser: string;
  os: string;
  device: string;
} {
  const ua = userAgent.toLowerCase();

  // Browser detection
  let browser = 'unknown';
  if (ua.includes('chrome')) browser = 'chrome';
  else if (ua.includes('firefox')) browser = 'firefox';
  else if (ua.includes('safari')) browser = 'safari';
  else if (ua.includes('edge')) browser = 'edge';

  // OS detection
  let os = 'unknown';
  if (ua.includes('windows')) os = 'windows';
  else if (ua.includes('mac')) os = 'macos';
  else if (ua.includes('linux')) os = 'linux';
  else if (ua.includes('android')) os = 'android';
  else if (ua.includes('ios')) os = 'ios';

  // Device detection
  let device = 'desktop';
  if (ua.includes('mobile')) device = 'mobile';
  else if (ua.includes('tablet')) device = 'tablet';

  return { browser, os, device };
}

/**
 * Analyze timing patterns to detect bot behavior
 */
function analyzeTimmingPatterns(attempts: any[]): boolean {
  if (attempts.length < 3) return false;

  const intervals: number[] = [];
  for (let i = 1; i < attempts.length; i++) {
    const interval =
      new Date(attempts[i - 1].createdAt).getTime() -
      new Date(attempts[i].createdAt).getTime();
    intervals.push(interval);
  }

  // Check for suspiciously regular intervals (bot behavior)
  if (intervals.length >= 3) {
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce(
        (sum, interval) => sum + Math.pow(interval - avgInterval, 2),
        0
      ) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // If intervals are too regular (low variance), it might be a bot
    const coefficientOfVariation = stdDev / avgInterval;
    return coefficientOfVariation < 0.1 && avgInterval < 10000; // Less than 10 seconds with low variance
  }

  return false;
}

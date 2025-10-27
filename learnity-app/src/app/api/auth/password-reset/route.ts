import { NextRequest, NextResponse } from 'next/server';
import { FirebaseAuthService } from '@/lib/services/firebase-auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { HCaptchaService } from '@/lib/services/hcaptcha.service';
import { passwordResetRequestSchema } from '@/lib/validators/auth';
import { EventType } from '@/types/auth';

/**
 * Password Reset Request API Endpoint
 * POST /api/auth/password-reset
 */
export async function POST(request: NextRequest) {
  const firebaseAuthService = new FirebaseAuthService();
  const databaseService = new DatabaseService();
  const hcaptchaService = new HCaptchaService();

  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input data
    const validationResult = passwordResetRequestSchema.safeParse(body);
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

    const resetData = validationResult.data;

    // Verify hCaptcha token (always required for password reset)
    const hcaptchaResult = await hcaptchaService.verifyToken(
      resetData.hcaptchaToken,
      'password_reset'
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

    // Check rate limiting for password reset requests
    const isRateLimited = await checkPasswordResetRateLimit(databaseService, resetData.email, clientIP);
    
    if (isRateLimited) {
      // Log rate limited attempt
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_PASSWORD_RESET,
        action: 'password_reset_rate_limited',
        ipAddress: clientIP,
        userAgent,
        success: false,
        errorMessage: 'Rate limit exceeded',
        metadata: {
          email: resetData.email
        }
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many password reset requests. Please try again later.',
            retryAfter: 300 // 5 minutes
          }
        },
        { status: 429 }
      );
    }

    // Send password reset email via Firebase Auth
    try {
      await firebaseAuthService.sendPasswordReset(resetData.email);

      // Log successful password reset request
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_PASSWORD_RESET,
        action: 'password_reset_requested',
        ipAddress: clientIP,
        userAgent,
        success: true,
        metadata: {
          email: resetData.email
        }
      });

      // Always return success to prevent email enumeration attacks
      return NextResponse.json({
        success: true,
        data: {
          message: 'If an account with this email exists, a password reset link has been sent.'
        }
      });

    } catch (resetError: any) {
      console.error('Failed to send password reset email:', resetError);

      // Log the send failure
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_PASSWORD_RESET,
        action: 'password_reset_send_failed',
        ipAddress: clientIP,
        userAgent,
        success: false,
        errorMessage: resetError.message,
        metadata: {
          email: resetData.email,
          errorCode: resetError.code
        }
      });

      // Still return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        data: {
          message: 'If an account with this email exists, a password reset link has been sent.'
        }
      });
    }

  } catch (error: any) {
    console.error('Password reset request error:', error);

    // Log unexpected error
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_PASSWORD_RESET,
        action: 'password_reset_error',
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
          message: 'An unexpected error occurred'
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
 * Password Reset Confirmation API Endpoint
 * PUT /api/auth/password-reset
 * 
 * This endpoint handles the actual password change after user clicks reset link
 */
export async function PUT(request: NextRequest) {
  const firebaseAuthService = new FirebaseAuthService();
  const databaseService = new DatabaseService();

  try {
    // Parse request body
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TOKEN',
            message: 'ID token is required'
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

    // Verify and decode the ID token
    const decodedToken = await firebaseAuthService.validateAndDecodeToken(idToken);
    
    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token'
          }
        },
        { status: 401 }
      );
    }

    const firebaseUid = decodedToken.uid;

    // Log successful password reset completion
    await logAuditEvent(databaseService, {
      eventType: EventType.AUTH_PASSWORD_RESET,
      action: 'password_reset_completed',
      firebaseUid,
      ipAddress: clientIP,
      userAgent,
      success: true,
      metadata: {
        email: decodedToken.email
      }
    });

    // Update last login time in Neon DB since password was changed
    try {
      await databaseService.updateUserProfile(firebaseUid, {
        lastLoginAt: new Date()
      });
    } catch (dbError) {
      console.error('Failed to update last login after password reset:', dbError);
      // Don't fail the request for this
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Password has been reset successfully'
      }
    });

  } catch (error: any) {
    console.error('Password reset confirmation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
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
 * Check rate limiting for password reset requests
 */
async function checkPasswordResetRateLimit(
  databaseService: DatabaseService,
  email: string,
  ipAddress: string
): Promise<boolean> {
  try {
    const prisma = (databaseService as any).prisma;
    
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    // Check requests from this email in the last 15 minutes
    const emailRequests = await prisma.auditLog.count({
      where: {
        eventType: EventType.AUTH_PASSWORD_RESET,
        action: 'password_reset_requested',
        metadata: {
          path: ['email'],
          equals: email
        },
        createdAt: {
          gte: fifteenMinutesAgo
        }
      }
    });

    // Check requests from this IP in the last 15 minutes
    const ipRequests = await prisma.auditLog.count({
      where: {
        eventType: EventType.AUTH_PASSWORD_RESET,
        action: 'password_reset_requested',
        ipAddress,
        createdAt: {
          gte: fifteenMinutesAgo
        }
      }
    });

    // Rate limit: max 3 requests per email per 15 minutes, max 10 requests per IP per 15 minutes
    return emailRequests >= 3 || ipRequests >= 10;
  } catch (error) {
    console.error('Failed to check password reset rate limit:', error);
    return false; // Don't block on error
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
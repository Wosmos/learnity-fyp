import { NextRequest, NextResponse } from 'next/server';
import { FirebaseAuthService } from '@/lib/services/firebase-auth.service';
import { DatabaseService } from '@/lib/services/database.service';
import { EventType } from '@/types/auth';
import { generateDeviceFingerprintLegacy } from '@/lib/utils/device-fingerprint';

/**
 * Email Verification Status Sync API Endpoint
 * POST /api/auth/verify-email
 *
 * This endpoint is called after Firebase Auth email verification
 * to sync the verification status to Neon DB
 */
export async function POST(request: NextRequest) {
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
            message: 'ID token is required',
          },
        },
        { status: 400 }
      );
    }

    // Get client information for audit logging
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Verify and decode the ID token
    const decodedToken =
      await firebaseAuthService.validateAndDecodeToken(idToken);

    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token',
          },
        },
        { status: 401 }
      );
    }

    const firebaseUid = decodedToken.uid;
    const emailVerified = decodedToken.email_verified || false;

    // Sync email verification status to Neon DB
    try {
      const userProfile = await databaseService.getUserProfile(firebaseUid);

      if (!userProfile) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User profile not found',
            },
          },
          { status: 404 }
        );
      }

      // Update email verification status in Neon DB
      await databaseService.updateUserProfile(firebaseUid, {
        emailVerified,
      });

      // Update Firebase custom claims to reflect verification status
      const currentClaims =
        await firebaseAuthService.getCustomClaims(firebaseUid);
      await firebaseAuthService.setCustomClaims(firebaseUid, {
        ...currentClaims,
        emailVerified,
      });

      // Log email verification event
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_EMAIL_VERIFY,
        action: emailVerified ? 'email_verified' : 'email_verification_checked',
        firebaseUid,
        ipAddress: clientIP,
        userAgent,
        success: true,
        metadata: {
          email: decodedToken.email,
          emailVerified,
          previousStatus: userProfile.emailVerified,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          emailVerified,
          message: emailVerified
            ? 'Email verification confirmed and synced to profile'
            : 'Email verification status checked',
        },
      });
    } catch (dbError: any) {
      console.error('Failed to sync email verification to Neon DB:', dbError);

      // Log the database sync failure
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_EMAIL_VERIFY,
        action: 'email_verification_sync_failed',
        firebaseUid,
        ipAddress: clientIP,
        userAgent,
        success: false,
        errorMessage: dbError.message,
        metadata: {
          email: decodedToken.email,
          emailVerified,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_SYNC_ERROR',
            message: 'Failed to sync email verification status',
          },
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Email verification sync error:', error);

    // Log unexpected error
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_EMAIL_VERIFY,
        action: 'email_verification_error',
        ipAddress: clientIP,
        userAgent,
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
          message:
            'An unexpected error occurred during email verification sync',
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
 * Resend Email Verification API Endpoint
 * PUT /api/auth/verify-email
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
            message: 'ID token is required',
          },
        },
        { status: 400 }
      );
    }

    // Get client information for audit logging
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Verify and decode the ID token
    const decodedToken =
      await firebaseAuthService.validateAndDecodeToken(idToken);

    if (!decodedToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token',
          },
        },
        { status: 401 }
      );
    }

    // Get current user from Firebase Auth
    const currentUser = await firebaseAuthService.getCurrentUser();

    if (!currentUser || currentUser.uid !== decodedToken.uid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_AUTHENTICATED',
            message: 'User not authenticated',
          },
        },
        { status: 401 }
      );
    }

    // Check if email is already verified
    if (currentUser.emailVerified) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'Email is already verified',
        },
      });
    }

    // Send email verification
    try {
      await firebaseAuthService.sendEmailVerification(currentUser);

      // Log email verification resend
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_EMAIL_VERIFY,
        action: 'email_verification_resent',
        firebaseUid: currentUser.uid,
        ipAddress: clientIP,
        userAgent,
        success: true,
        metadata: {
          email: currentUser.email,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          message: 'Verification email sent successfully',
        },
      });
    } catch (sendError: any) {
      console.error('Failed to send verification email:', sendError);

      // Log the send failure
      await logAuditEvent(databaseService, {
        eventType: EventType.AUTH_EMAIL_VERIFY,
        action: 'email_verification_send_failed',
        firebaseUid: currentUser.uid,
        ipAddress: clientIP,
        userAgent,
        success: false,
        errorMessage: sendError.message,
        metadata: {
          email: currentUser.email,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_SEND_FAILED',
            message: 'Failed to send verification email',
          },
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Email verification resend error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
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
        deviceFingerprint: generateDeviceFingerprintLegacy(
          event.userAgent,
          event.ipAddress
        ),
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Logout API Route
 * Handles server-side logout with token blacklisting and session cleanup
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/services/session-manager.service';
import { securityService } from '@/lib/services/security.service';
import { adminAuth } from '@/lib/config/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // Extract tokens from request
    const authHeader = request.headers.get('authorization');
    const body = await request.json().catch(() => ({}));
    const { refreshToken, allDevices = false } = body;

    let firebaseUid: string | null = null;
    let sessionId: string | null = null;

    // If we have an authorization header, extract the Firebase UID
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.substring(7);

      try {
        // Validate and extract Firebase token payload
        const tokenValidation =
          await sessionManager.validateFirebaseToken(idToken);
        if (tokenValidation.isValid && tokenValidation.payload) {
          firebaseUid = tokenValidation.payload.firebaseUid;
          sessionId = tokenValidation.payload.sessionId;
        }

        // Blacklist the Firebase token
        await sessionManager.blacklistFirebaseToken(idToken, 'User logout');
      } catch (error) {
        console.warn('Failed to process Firebase token during logout:', error);
      }
    }

    // If we have a refresh token, blacklist it and extract user info
    if (refreshToken) {
      try {
        const refreshPayload =
          await sessionManager.extractRefreshTokenPayload(refreshToken);
        if (refreshPayload) {
          firebaseUid = refreshPayload.firebaseUid;
          sessionId = refreshPayload.sessionId;
        }

        // Blacklist the refresh token
        await sessionManager.blacklistToken(refreshToken, 'User logout');
      } catch (error) {
        console.warn('Failed to process refresh token during logout:', error);
      }
    }

    // If we have user info, handle session cleanup
    if (firebaseUid) {
      if (allDevices) {
        // Terminate all user sessions and blacklist all tokens
        await sessionManager.terminateAllUserSessions(
          firebaseUid,
          'User logout from all devices'
        );
        await sessionManager.blacklistAllUserTokens(
          firebaseUid,
          'User logout from all devices'
        );

        // Revoke all Firebase refresh tokens
        try {
          await adminAuth.revokeRefreshTokens(firebaseUid);
        } catch (error) {
          console.warn('Failed to revoke Firebase refresh tokens:', error);
        }
      } else if (sessionId) {
        // Terminate specific session
        await sessionManager.terminateSession(sessionId, 'User logout');
      }

      // Log logout event
      await securityService.logAuthEvent({
        type: 'AUTH_LOGOUT',
        firebaseUid,
        action: 'USER_LOGOUT',
        resource: 'session',
        newValues: {
          allDevices,
          sessionId: sessionId || 'unknown',
        },
        ipAddress:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        deviceFingerprint:
          request.headers.get('x-device-fingerprint') || 'unknown',
        success: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: allDevices
        ? 'Successfully logged out from all devices'
        : 'Successfully logged out',
    });
  } catch (error) {
    console.error('Logout API error:', error);

    // Log failed logout attempt
    try {
      await securityService.logAuthEvent({
        type: 'AUTH_LOGOUT',
        firebaseUid: 'unknown',
        action: 'USER_LOGOUT_FAILED',
        resource: 'session',
        newValues: { error: (error as Error).message },
        ipAddress:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        deviceFingerprint:
          request.headers.get('x-device-fingerprint') || 'unknown',
        success: false,
        errorMessage: (error as Error).message,
      });
    } catch (logError) {
      console.error('Failed to log logout error:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Logout failed',
        message: 'An error occurred during logout',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

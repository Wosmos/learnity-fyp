/**
 * Join Tutoring Session API Route
 * GET /api/tutoring-sessions/[sessionId]/join - Get 100ms room credentials
 */

import { NextRequest, NextResponse } from 'next/server';
import { tutoringSessionService } from '@/lib/services/tutoring-session.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { prisma } from '@/lib/prisma';
import {
  createSuccessResponse,
  createErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.firebaseUid },
      select: { id: true },
    });

    if (!dbUser)
      return createErrorResponse(
        'USER_NOT_FOUND',
        'User not found',
        undefined,
        404
      );

    const credentials = await tutoringSessionService.generateRoomCredentials(
      sessionId,
      dbUser.id
    );

    return createSuccessResponse(
      credentials,
      'Room credentials generated successfully'
    );
  } catch (error: any) {
    if (error.code === 'SESSION_NOT_FOUND') {
      return createErrorResponse(
        'SESSION_NOT_FOUND',
        error.message,
        undefined,
        404
      );
    }
    if (error.code === 'UNAUTHORIZED') {
      return createErrorResponse('UNAUTHORIZED', error.message, undefined, 403);
    }
    console.error('Error generating room credentials:', error);
    return createInternalErrorResponse();
  }
}

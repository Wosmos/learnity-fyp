/**
 * Cancel Tutoring Session API Route
 * POST /api/tutoring-sessions/[sessionId]/cancel - Cancel session
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
import { z } from 'zod';

const CancelSchema = z.object({
  reason: z.string().optional(),
});

export async function POST(
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

    const body = await request.json();
    const { reason } = CancelSchema.parse(body);

    const session = await tutoringSessionService.cancelSession(
      sessionId,
      dbUser.id,
      reason
    );

    return createSuccessResponse(
      session,
      'Tutoring session cancelled successfully'
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid data',
        error.errors,
        400
      );
    }
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
    console.error('Error cancelling tutoring session:', error);
    return createInternalErrorResponse();
  }
}

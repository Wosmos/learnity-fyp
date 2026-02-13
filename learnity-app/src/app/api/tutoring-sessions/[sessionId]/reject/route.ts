/**
 * Reject Tutoring Session API Route
 * POST /api/tutoring-sessions/[sessionId]/reject - Teacher rejects session
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

const RejectSchema = z.object({
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
      select: { id: true, role: true },
    });

    if (!dbUser)
      return createErrorResponse(
        'USER_NOT_FOUND',
        'User not found',
        undefined,
        404
      );

    if (dbUser.role !== 'TEACHER') {
      return createErrorResponse(
        'UNAUTHORIZED',
        'Only teachers can reject sessions',
        undefined,
        403
      );
    }

    const body = await request.json();
    const { reason } = RejectSchema.parse(body);

    const session = await tutoringSessionService.rejectSession(
      sessionId,
      dbUser.id,
      reason
    );

    return createSuccessResponse(
      session,
      'Tutoring session rejected successfully'
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
    console.error('Error rejecting tutoring session:', error);
    return createInternalErrorResponse();
  }
}

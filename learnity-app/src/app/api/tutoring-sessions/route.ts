/**
 * Tutoring Sessions API Route
 * GET /api/tutoring-sessions - Get user's tutoring sessions
 * POST /api/tutoring-sessions - Create a tutoring session request
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

const CreateSessionSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  scheduledAt: z.string().datetime('Invalid date format'),
  duration: z.number().min(15).max(180).optional(),
});

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;

    let sessions;
    if (dbUser.role === 'TEACHER') {
      sessions = await tutoringSessionService.getTeacherSessions(
        dbUser.id,
        status
      );
    } else {
      sessions = await tutoringSessionService.getStudentSessions(
        dbUser.id,
        status
      );
    }

    return createSuccessResponse(
      { sessions },
      'Tutoring sessions retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching tutoring sessions:', error);
    return createInternalErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Only students can create session requests
    if (dbUser.role !== 'STUDENT') {
      return createErrorResponse(
        'UNAUTHORIZED',
        'Only students can request tutoring sessions',
        undefined,
        403
      );
    }

    const body = await request.json();
    const validatedData = CreateSessionSchema.parse(body);

    const session = await tutoringSessionService.createSessionRequest(
      dbUser.id,
      {
        teacherId: validatedData.teacherId,
        title: validatedData.title,
        description: validatedData.description,
        scheduledAt: new Date(validatedData.scheduledAt),
        duration: validatedData.duration,
      }
    );

    return createSuccessResponse(
      session,
      'Tutoring session request created successfully. Waiting for teacher approval.',
      undefined,
      201
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
    console.error('Error creating tutoring session:', error);
    return createInternalErrorResponse();
  }
}

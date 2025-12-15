/**
 * Lesson Complete API Route
 * POST /api/lessons/[lessonId]/complete - Mark lesson as complete
 * 
 * Requirements covered:
 * - 5.4: Award 10 XP points when lesson is completed
 * - 5.5: Allow manual lesson completion
 * - 7.5: Update student's daily streak
 */

import { NextRequest, NextResponse } from 'next/server';
import { progressService } from '@/lib/services/progress.service';
import { ProgressError } from '@/lib/interfaces/progress.interface';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';
import {
  createSuccessResponse,
  createErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

interface RouteParams {
  params: Promise<{ lessonId: string }>;
}

/**
 * POST /api/lessons/[lessonId]/complete
 * Mark lesson as complete manually
 * Requirements: 5.4, 5.5, 7.5
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { lessonId } = await params;

    if (!lessonId) {
      return createErrorResponse(
        'INVALID_LESSON_ID',
        'Lesson ID is required',
        undefined,
        400
      );
    }

    // Authenticate user (students can mark lessons complete)
    const authResult = await authMiddleware(request, {
      allowMultipleRoles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN],
    });

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.firebaseUid },
      select: { id: true },
    });

    if (!dbUser) {
      return createErrorResponse(
        'USER_NOT_FOUND',
        'User not found in database',
        undefined,
        401
      );
    }

    // Mark lesson as complete
    const result = await progressService.markLessonComplete(dbUser.id, lessonId);

    return createSuccessResponse(
      {
        lessonProgress: result.lessonProgress,
        xpAwarded: result.xpAwarded,
        newStreak: result.newStreak,
        enrollmentProgress: result.enrollmentProgress,
        courseCompleted: result.courseCompleted,
      },
      result.courseCompleted
        ? 'Congratulations! Course completed!'
        : `Lesson completed! +${result.xpAwarded} XP`
    );
  } catch (error) {
    console.error('Error marking lesson complete:', error);

    if (error instanceof ProgressError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to mark lesson as complete');
  }
}

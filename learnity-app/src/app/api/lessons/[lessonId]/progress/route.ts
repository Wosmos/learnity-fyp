/**
 * Lesson Progress API Route
 * POST /api/lessons/[lessonId]/progress - Update video watch progress
 * GET /api/lessons/[lessonId]/progress - Get lesson progress
 * 
 * Requirements covered:
 * - 5.3: Track video watch progress and mark lesson complete when 90% watched
 * - 5.6: Remember last watched position and resume
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { progressService } from '@/lib/services/progress.service';
import { ProgressError } from '@/lib/interfaces/progress.interface';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';
import { ZodError } from 'zod';

interface RouteParams {
  params: Promise<{ lessonId: string }>;
}

/**
 * Schema for updating video progress
 */
const UpdateProgressSchema = z.object({
  watchedSeconds: z.number().min(0, 'Watched seconds must be non-negative'),
  lastPosition: z.number().min(0).optional(),
});

/**
 * POST /api/lessons/[lessonId]/progress
 * Update video watch progress
 * Requirements: 5.3, 5.6
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

    // Authenticate user (students can track progress)
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = UpdateProgressSchema.parse(body);

    // Update video progress
    const result = await progressService.updateVideoProgress(
      dbUser.id,
      lessonId,
      validatedData.watchedSeconds,
      validatedData.lastPosition
    );

    return createSuccessResponse(
      {
        lessonProgress: result.lessonProgress,
        autoCompleted: result.autoCompleted,
        xpAwarded: result.xpAwarded,
      },
      result.autoCompleted
        ? 'Lesson auto-completed! XP awarded.'
        : 'Progress updated successfully'
    );
  } catch (error) {
    console.error('Error updating lesson progress:', error);

    if (error instanceof ZodError) {
      return createValidationErrorResponse(error, 'Invalid progress data');
    }

    if (error instanceof ProgressError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to update lesson progress');
  }
}

/**
 * GET /api/lessons/[lessonId]/progress
 * Get lesson progress for current user
 */
export async function GET(
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

    // Authenticate user
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

    // Get lesson progress
    const progress = await progressService.getLessonProgress(dbUser.id, lessonId);

    return createSuccessResponse(
      progress,
      progress ? 'Lesson progress retrieved successfully' : 'No progress found'
    );
  } catch (error) {
    console.error('Error fetching lesson progress:', error);

    if (error instanceof ProgressError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to fetch lesson progress');
  }
}

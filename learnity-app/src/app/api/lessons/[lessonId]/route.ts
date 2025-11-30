/**
 * Lesson Detail API Routes
 * GET /api/lessons/[lessonId] - Get lesson details
 * PUT /api/lessons/[lessonId] - Update lesson
 * DELETE /api/lessons/[lessonId] - Delete lesson
 * 
 * Requirements covered:
 * - 1.7: Lesson management
 */

import { NextRequest, NextResponse } from 'next/server';
import { lessonService } from '@/lib/services/lesson.service';
import { UpdateLessonSchema } from '@/lib/validators/lesson';
import { LessonError } from '@/lib/interfaces/lesson.interface';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';
import { ZodError } from 'zod';

interface RouteParams {
  params: Promise<{ lessonId: string }>;
}

/**
 * GET /api/lessons/[lessonId]
 * Get lesson details with quiz
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

    const lesson = await lessonService.getLessonWithQuiz(lessonId);

    if (!lesson) {
      return createNotFoundErrorResponse('Lesson');
    }

    return createSuccessResponse(lesson, 'Lesson retrieved successfully');
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return createInternalErrorResponse('Failed to fetch lesson');
  }
}


/**
 * PUT /api/lessons/[lessonId]
 * Update lesson details (Teacher only)
 * Requirements: 1.7
 */
export async function PUT(
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

    // Authenticate and verify teacher role
    const authResult = await authMiddleware(request, {
      allowMultipleRoles: [UserRole.TEACHER, UserRole.ADMIN],
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

    // Validate ownership
    const isOwner = await lessonService.validateOwnership(lessonId, dbUser.id);
    if (!isOwner) {
      return createErrorResponse(
        'FORBIDDEN',
        'You do not have permission to update this lesson',
        undefined,
        403
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = UpdateLessonSchema.parse(body);

    // Update lesson
    const lesson = await lessonService.updateLesson(lessonId, validatedData);

    return createSuccessResponse(lesson, 'Lesson updated successfully');
  } catch (error) {
    console.error('Error updating lesson:', error);

    if (error instanceof ZodError) {
      return createValidationErrorResponse(error, 'Invalid lesson data');
    }

    if (error instanceof LessonError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to update lesson');
  }
}


/**
 * DELETE /api/lessons/[lessonId]
 * Delete lesson (Teacher only)
 * Requirements: 1.7
 */
export async function DELETE(
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

    // Authenticate and verify teacher role
    const authResult = await authMiddleware(request, {
      allowMultipleRoles: [UserRole.TEACHER, UserRole.ADMIN],
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

    // Validate ownership
    const isOwner = await lessonService.validateOwnership(lessonId, dbUser.id);
    if (!isOwner) {
      return createErrorResponse(
        'FORBIDDEN',
        'You do not have permission to delete this lesson',
        undefined,
        403
      );
    }

    // Delete lesson
    await lessonService.deleteLesson(lessonId);

    return createSuccessResponse(null, 'Lesson deleted successfully');
  } catch (error) {
    console.error('Error deleting lesson:', error);

    if (error instanceof LessonError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to delete lesson');
  }
}

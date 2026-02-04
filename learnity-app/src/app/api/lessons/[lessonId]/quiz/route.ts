/**
 * Quiz Creation API Route
 * POST /api/lessons/[lessonId]/quiz - Create a quiz for a lesson (Teacher only)
 *
 * Requirements covered:
 * - 6.1: Create multiple-choice quizzes with 2-4 options per question
 * - 6.2: Support explanations for correct answers
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { quizService } from '@/lib/services/quiz.service';
import { lessonService } from '@/lib/services/lesson.service';
import { CreateQuizSchema } from '@/lib/validators/quiz';
import { QuizError } from '@/lib/interfaces/quiz.interface';
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

interface RouteParams {
  params: Promise<{ lessonId: string }>;
}

/**
 * POST /api/lessons/[lessonId]/quiz
 * Create a new quiz for a lesson (Teacher only)
 * Requirements: 6.1, 6.2
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

    // Validate ownership of the lesson
    const isOwner = await lessonService.validateOwnership(lessonId, dbUser.id);
    if (!isOwner) {
      return createErrorResponse(
        'FORBIDDEN',
        'You do not have permission to create a quiz for this lesson',
        undefined,
        403
      );
    }

    // Parse request body
    const body = await request.json();

    // Add lessonId to the body for validation
    const quizData = {
      ...body,
      lessonId,
    };

    // Validate input
    const validatedData = CreateQuizSchema.parse(quizData);

    // Create quiz
    const quiz = await quizService.createQuiz(validatedData);

    return createSuccessResponse(
      quiz,
      'Quiz created successfully',
      undefined,
      201
    );
  } catch (error) {
    console.error('Error creating quiz:', error);

    if (error instanceof ZodError) {
      return createValidationErrorResponse(error, 'Invalid quiz data');
    }

    if (error instanceof QuizError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to create quiz');
  }
}

/**
 * GET /api/lessons/[lessonId]/quiz
 * Get quiz for a lesson
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

    const quiz = await quizService.getQuizByLesson(lessonId);

    if (!quiz) {
      return createNotFoundErrorResponse('Quiz');
    }

    return createSuccessResponse(quiz, 'Quiz retrieved successfully');
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return createInternalErrorResponse('Failed to fetch quiz');
  }
}

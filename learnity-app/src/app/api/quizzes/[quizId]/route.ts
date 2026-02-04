/**
 * Quiz Management API Routes
 * GET /api/quizzes/[quizId] - Get quiz details (Student)
 * PUT /api/quizzes/[quizId] - Update quiz (Teacher only)
 * DELETE /api/quizzes/[quizId] - Delete quiz (Teacher only)
 *
 * Requirements covered:
 * - 6.1: Create multiple-choice quizzes with 2-4 options per question
 * - 6.2: Support explanations for correct answers
 * - 6.3: Display one question at a time with progress indicator
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { quizService } from '@/lib/services/quiz.service';
import { UpdateQuizSchema } from '@/lib/validators/quiz';
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
  params: Promise<{ quizId: string }>;
}

/**
 * Helper function to validate quiz ownership
 * Returns the quiz owner's teacherId if valid
 */
async function validateQuizOwnership(
  quizId: string,
  userId: string
): Promise<{ isOwner: boolean; quiz?: any }> {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      lesson: {
        include: {
          section: {
            include: {
              course: {
                select: { teacherId: true },
              },
            },
          },
        },
      },
    },
  });

  if (!quiz) {
    return { isOwner: false };
  }

  const teacherId = quiz.lesson.section.course.teacherId;
  return { isOwner: teacherId === userId, quiz };
}

/**
 * GET /api/quizzes/[quizId]
 * Get quiz details for taking (Student)
 * Requirements: 6.3
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { quizId } = await params;

    if (!quizId) {
      return createErrorResponse(
        'INVALID_QUIZ_ID',
        'Quiz ID is required',
        undefined,
        400
      );
    }

    const quiz = await quizService.getQuizById(quizId);

    if (!quiz) {
      return createNotFoundErrorResponse('Quiz');
    }

    // For students taking the quiz, we don't expose correct answers
    // The frontend should handle showing questions one at a time
    const quizForStudent = {
      id: quiz.id,
      lessonId: quiz.lessonId,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      questions: quiz.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        order: q.order,
        // Note: correctOptionIndex and explanation are NOT exposed
      })),
      totalQuestions: quiz.questions.length,
    };

    return createSuccessResponse(quizForStudent, 'Quiz retrieved successfully');
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return createInternalErrorResponse('Failed to fetch quiz');
  }
}

/**
 * PUT /api/quizzes/[quizId]
 * Update quiz details (Teacher only)
 * Requirements: 6.1, 6.2
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { quizId } = await params;

    if (!quizId) {
      return createErrorResponse(
        'INVALID_QUIZ_ID',
        'Quiz ID is required',
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
      select: { id: true, role: true },
    });

    if (!dbUser) {
      return createErrorResponse(
        'USER_NOT_FOUND',
        'User not found in database',
        undefined,
        401
      );
    }

    // Validate ownership (admins can bypass)
    if (dbUser.role !== UserRole.ADMIN) {
      const { isOwner, quiz } = await validateQuizOwnership(quizId, dbUser.id);

      if (!quiz) {
        return createNotFoundErrorResponse('Quiz');
      }

      if (!isOwner) {
        return createErrorResponse(
          'FORBIDDEN',
          'You do not have permission to update this quiz',
          undefined,
          403
        );
      }
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = UpdateQuizSchema.parse(body);

    // Update quiz
    const updatedQuiz = await quizService.updateQuiz(quizId, validatedData);

    return createSuccessResponse(updatedQuiz, 'Quiz updated successfully');
  } catch (error) {
    console.error('Error updating quiz:', error);

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

    return createInternalErrorResponse('Failed to update quiz');
  }
}

/**
 * DELETE /api/quizzes/[quizId]
 * Delete quiz (Teacher only)
 * Requirements: 6.1
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { quizId } = await params;

    if (!quizId) {
      return createErrorResponse(
        'INVALID_QUIZ_ID',
        'Quiz ID is required',
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
      select: { id: true, role: true },
    });

    if (!dbUser) {
      return createErrorResponse(
        'USER_NOT_FOUND',
        'User not found in database',
        undefined,
        401
      );
    }

    // Validate ownership (admins can bypass)
    if (dbUser.role !== UserRole.ADMIN) {
      const { isOwner, quiz } = await validateQuizOwnership(quizId, dbUser.id);

      if (!quiz) {
        return createNotFoundErrorResponse('Quiz');
      }

      if (!isOwner) {
        return createErrorResponse(
          'FORBIDDEN',
          'You do not have permission to delete this quiz',
          undefined,
          403
        );
      }
    }

    // Delete quiz
    await quizService.deleteQuiz(quizId);

    return createSuccessResponse(null, 'Quiz deleted successfully');
  } catch (error) {
    console.error('Error deleting quiz:', error);

    if (error instanceof QuizError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to delete quiz');
  }
}

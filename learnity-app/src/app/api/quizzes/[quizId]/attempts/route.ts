/**
 * Quiz Attempts API Route
 * GET /api/quizzes/[quizId]/attempts - Get quiz attempts for a student
 * 
 * Requirements covered:
 * - 6.8: Allow unlimited quiz retakes with best score recorded
 * - 6.9: Track quiz attempts, scores, and time taken
 */

import { NextRequest, NextResponse } from 'next/server';
import { quizService } from '@/lib/services/quiz.service';
import { QuizError } from '@/lib/interfaces/quiz.interface';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { prisma } from '@/lib/prisma';
import {
  createSuccessResponse,
  createErrorResponse,
  createNotFoundErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

interface RouteParams {
  params: Promise<{ quizId: string }>;
}

/**
 * GET /api/quizzes/[quizId]/attempts
 * Get all quiz attempts for the authenticated student
 * Requirements: 6.8, 6.9
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

    // Authenticate user
    const authResult = await authMiddleware(request);

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

    // Verify quiz exists
    const quiz = await quizService.getQuizById(quizId);
    if (!quiz) {
      return createNotFoundErrorResponse('Quiz');
    }

    // Get all attempts for this student
    const attempts = await quizService.getQuizAttempts(dbUser.id, quizId);

    // Get best attempt
    const bestAttempt = await quizService.getBestAttempt(dbUser.id, quizId);

    // Get quiz stats
    const stats = await quizService.getQuizStats(dbUser.id, quizId);

    return createSuccessResponse(
      {
        quizId,
        quizTitle: quiz.title,
        passingScore: quiz.passingScore,
        totalQuestions: quiz.questions.length,
        attempts: attempts.map((attempt) => ({
          id: attempt.id,
          score: attempt.score,
          passed: attempt.passed,
          timeTaken: attempt.timeTaken,
          createdAt: attempt.createdAt,
        })),
        bestAttempt: bestAttempt
          ? {
              id: bestAttempt.id,
              score: bestAttempt.score,
              passed: bestAttempt.passed,
              timeTaken: bestAttempt.timeTaken,
              createdAt: bestAttempt.createdAt,
            }
          : null,
        stats: {
          totalAttempts: stats.totalAttempts,
          bestScore: stats.bestScore,
          averageScore: stats.averageScore,
          passed: stats.passed,
          firstPassedAt: stats.firstPassedAt,
        },
      },
      'Quiz attempts retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);

    if (error instanceof QuizError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to fetch quiz attempts');
  }
}

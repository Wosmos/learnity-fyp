/**
 * Quiz Submission API Route
 * POST /api/quizzes/[quizId]/submit - Submit quiz answers (Student)
 *
 * Requirements covered:
 * - 6.3: Display one question at a time with progress indicator
 * - 6.4: Provide immediate feedback showing correct/incorrect
 * - 6.5: Display final score and review of answers
 * - 6.6: Require 70% score to pass a quiz
 * - 6.7: Award 20 XP bonus points when quiz is passed
 * - 6.9: Track quiz attempts, scores, and time taken
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { quizService } from '@/lib/services/quiz.service';
import { SubmitQuizAttemptSchema } from '@/lib/validators/quiz';
import { QuizError } from '@/lib/interfaces/quiz.interface';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { prisma } from '@/lib/prisma';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

interface RouteParams {
  params: Promise<{ quizId: string }>;
}

/**
 * POST /api/quizzes/[quizId]/submit
 * Submit quiz answers and get results (Student)
 * Requirements: 6.3, 6.4, 6.5, 6.6, 6.7, 6.9
 */
export async function POST(
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

    // Authenticate user (any authenticated user can submit)
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

    // Parse request body
    const body = await request.json();

    // Add quizId to the body for validation
    const submissionData = {
      ...body,
      quizId,
    };

    // Validate input
    const validatedData = SubmitQuizAttemptSchema.parse(submissionData);

    // Submit quiz attempt
    const result = await quizService.submitQuizAttempt(
      dbUser.id,
      quizId,
      validatedData.answers,
      validatedData.timeTaken
    );

    // Return detailed results for review
    return createSuccessResponse(
      {
        attemptId: result.attempt.id,
        score: result.score,
        passed: result.passed,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        passingScore: 70, // Default passing score
        answerResults: result.answerResults,
        xpAwarded: result.xpAwarded,
        createdAt: result.attempt.createdAt,
      },
      result.passed
        ? 'Congratulations! You passed the quiz!'
        : 'Quiz completed. Keep practicing!'
    );
  } catch (error) {
    console.error('Error submitting quiz:', error);

    if (error instanceof ZodError) {
      return createValidationErrorResponse(
        error,
        'Invalid quiz submission data'
      );
    }

    if (error instanceof QuizError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to submit quiz');
  }
}

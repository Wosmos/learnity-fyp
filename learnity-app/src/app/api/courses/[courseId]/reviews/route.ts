/**
 * Course Reviews API Routes
 * POST /api/courses/[courseId]/reviews - Create a review for a course
 * GET /api/courses/[courseId]/reviews - Get all reviews for a course
 * 
 * Requirements covered:
 * - 8.1: Review eligibility (50% progress required)
 * - 8.2: Rating 1-5 with optional comment (10-500 chars)
 * - 8.3: Average rating calculation
 * - 8.4: Course reviews display
 * - 8.6: One review per student per course
 * - 8.7: Teacher notification on new review
 */

import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/lib/services/review.service';
import { ReviewError } from '@/lib/interfaces/review.interface';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import {
  createSuccessResponse,
  createErrorResponse,
  createInternalErrorResponse,
  createValidationErrorResponse,
} from '@/lib/utils/api-response.utils';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * Schema for creating a review (without courseId since it comes from URL)
 */
const CreateReviewBodySchema = z.object({
  rating: z.number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment must be less than 500 characters')
    .trim()
    .optional(),
});

/**
 * Schema for query parameters
 */
const ReviewQuerySchema = z.object({
  minRating: z.coerce.number().int().min(1).max(5).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * POST /api/courses/[courseId]/reviews
 * Create a review for a course
 * Requirements: 8.1, 8.2, 8.3, 8.6
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { courseId } = await params;

    if (!courseId) {
      return createErrorResponse(
        'INVALID_COURSE_ID',
        'Course ID is required',
        undefined,
        400
      );
    }

    // Authenticate user (students, teachers, and admins can review)
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
    const validationResult = CreateReviewBodySchema.safeParse(body);

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    const { rating, comment } = validationResult.data;

    // Create review using service
    const review = await reviewService.createReview(dbUser.id, {
      courseId,
      rating,
      comment,
    });

    return createSuccessResponse(
      review,
      'Review created successfully',
      undefined,
      201
    );
  } catch (error) {
    console.error('Error creating review:', error);

    if (error instanceof ReviewError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to create review');
  }
}

/**
 * GET /api/courses/[courseId]/reviews
 * Get all reviews for a course
 * Requirements: 8.4
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { courseId } = await params;

    if (!courseId) {
      return createErrorResponse(
        'INVALID_COURSE_ID',
        'Course ID is required',
        undefined,
        400
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryValidation = ReviewQuerySchema.safeParse({
      minRating: searchParams.get('minRating') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 10,
    });

    if (!queryValidation.success) {
      return createValidationErrorResponse(queryValidation.error);
    }

    const { minRating, page, limit } = queryValidation.data;

    // Get reviews using service
    const result = await reviewService.getCourseReviews(courseId, {
      minRating,
      page,
      limit,
    });

    // Also get course rating summary
    const rating = await reviewService.getCourseRating(courseId);

    return createSuccessResponse(
      {
        ...result,
        rating,
      },
      'Reviews retrieved successfully'
    );
  } catch (error) {
    console.error('Error getting reviews:', error);

    if (error instanceof ReviewError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to get reviews');
  }
}

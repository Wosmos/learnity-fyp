/**
 * Individual Review API Routes
 * PUT /api/reviews/[reviewId] - Update a review
 * DELETE /api/reviews/[reviewId] - Delete a review
 * GET /api/reviews/[reviewId] - Get a specific review
 *
 * Requirements covered:
 * - 8.5: Review edit/delete with ownership validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { reviewService } from '@/lib/services/review.service';
import { ReviewError } from '@/lib/interfaces/review.interface';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';
import {
  createSuccessResponse,
  createErrorResponse,
  createInternalErrorResponse,
  createValidationErrorResponse,
  createNotFoundErrorResponse,
} from '@/lib/utils/api-response.utils';

interface RouteParams {
  params: Promise<{ reviewId: string }>;
}

/**
 * Schema for updating a review
 */
const UpdateReviewBodySchema = z.object({
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars')
    .optional(),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment must be less than 500 characters')
    .trim()
    .nullable()
    .optional(),
});

/**
 * GET /api/reviews/[reviewId]
 * Get a specific review by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { reviewId } = await params;

    if (!reviewId) {
      return createErrorResponse(
        'INVALID_REVIEW_ID',
        'Review ID is required',
        undefined,
        400
      );
    }

    // Get review from database
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!review) {
      return createNotFoundErrorResponse('Review');
    }

    return createSuccessResponse(review, 'Review retrieved successfully');
  } catch (error) {
    console.error('Error getting review:', error);
    return createInternalErrorResponse('Failed to get review');
  }
}

/**
 * PUT /api/reviews/[reviewId]
 * Update a review (owner only)
 * Requirements: 8.5
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { reviewId } = await params;

    if (!reviewId) {
      return createErrorResponse(
        'INVALID_REVIEW_ID',
        'Review ID is required',
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = UpdateReviewBodySchema.safeParse(body);

    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error);
    }

    // Update review using service (validates ownership)
    const review = await reviewService.updateReview(
      reviewId,
      dbUser.id,
      validationResult.data
    );

    return createSuccessResponse(review, 'Review updated successfully');
  } catch (error) {
    console.error('Error updating review:', error);

    if (error instanceof ReviewError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to update review');
  }
}

/**
 * DELETE /api/reviews/[reviewId]
 * Delete a review (owner only)
 * Requirements: 8.5
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { reviewId } = await params;

    if (!reviewId) {
      return createErrorResponse(
        'INVALID_REVIEW_ID',
        'Review ID is required',
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

    // Delete review using service (validates ownership)
    await reviewService.deleteReview(reviewId, dbUser.id);

    return createSuccessResponse(null, 'Review deleted successfully');
  } catch (error) {
    console.error('Error deleting review:', error);

    if (error instanceof ReviewError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to delete review');
  }
}

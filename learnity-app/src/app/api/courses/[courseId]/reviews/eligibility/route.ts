/**
 * Review Eligibility API Route
 * GET /api/courses/[courseId]/reviews/eligibility - Check if user can review
 * 
 * Requirements covered:
 * - 8.1: Review eligibility (50% progress required)
 * - 8.6: One review per student per course
 */

import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/lib/services/review.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';
import {
  createSuccessResponse,
  createErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/courses/[courseId]/reviews/eligibility
 * Check if the authenticated user can review this course
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

    // Check eligibility
    const eligibility = await reviewService.canReview(dbUser.id, courseId);

    // Get existing review if any
    let existingReview = null;
    if (eligibility.hasExistingReview) {
      existingReview = await reviewService.getStudentReview(dbUser.id, courseId);
    }

    return createSuccessResponse({
      ...eligibility,
      existingReview,
    }, 'Review eligibility checked successfully');
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return createInternalErrorResponse('Failed to check review eligibility');
  }
}

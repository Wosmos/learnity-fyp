/**
 * Course Detail API Routes
 * GET /api/courses/[courseId] - Get course details with sections, lessons
 * PUT /api/courses/[courseId] - Update course details (Teacher only)
 * DELETE /api/courses/[courseId] - Delete draft course (Teacher only)
 *
 * Requirements covered:
 * - 2.4: Course editing
 * - 2.5, 2.6: Course deletion
 * - 3.5, 3.6: Course detail view
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { courseService } from '@/lib/services/course.service';
import { UpdateCourseSchema } from '@/lib/validators/course';
import { CourseError } from '@/lib/interfaces/course.interface';
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
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/courses/[courseId]
 * Get course details with sections, lessons, teacher info, reviews summary
 * Requirements: 3.5, 3.6
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

    // Get course with all details
    const course = await courseService.getCourseById(courseId);

    if (!course) {
      return createNotFoundErrorResponse('Course');
    }

    // Get reviews summary for the course
    const reviewsSummary = await prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { courseId },
      _count: { rating: true },
    });

    // Format rating distribution
    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    ratingDistribution.forEach(item => {
      distribution[item.rating] = item._count.rating;
    });

    // Calculate estimated duration in human-readable format
    const totalMinutes = Math.ceil(course.totalDuration / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const estimatedDuration =
      hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    const responseData = {
      ...course,
      estimatedDuration,
      reviewsSummary: {
        averageRating: reviewsSummary._avg.rating || 0,
        totalReviews: reviewsSummary._count.rating,
        ratingDistribution: distribution,
      },
    };

    return createSuccessResponse(responseData, 'Course retrieved successfully');
  } catch (error) {
    console.error('Error fetching course:', error);
    return createInternalErrorResponse('Failed to fetch course');
  }
}

/**
 * PUT /api/courses/[courseId]
 * Update course details (Teacher only)
 * Requirements: 2.4
 */
export async function PUT(
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

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = UpdateCourseSchema.parse(body);

    // Update course (service handles ownership validation)
    const course = await courseService.updateCourse(
      courseId,
      dbUser.id,
      validatedData
    );

    return createSuccessResponse(course, 'Course updated successfully');
  } catch (error) {
    console.error('Error updating course:', error);

    if (error instanceof ZodError) {
      return createValidationErrorResponse(error, 'Invalid course data');
    }

    if (error instanceof CourseError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to update course');
  }
}

/**
 * DELETE /api/courses/[courseId]
 * Delete draft course (Teacher only)
 * Requirements: 2.5, 2.6
 */
export async function DELETE(
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

    // Delete course (service handles ownership and enrollment validation)
    await courseService.deleteCourse(courseId, dbUser.id);

    return createSuccessResponse(null, 'Course deleted successfully');
  } catch (error) {
    console.error('Error deleting course:', error);

    if (error instanceof CourseError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to delete course');
  }
}

/**
 * Course Unpublish API Route
 * POST /api/courses/[courseId]/unpublish - Unpublish a course (Teacher only)
 *
 * Requirements covered:
 * - 2.3: Unpublish course, hiding from new enrollments while preserving existing progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { courseService } from '@/lib/services/course.service';
import { CourseError } from '@/lib/interfaces/course.interface';
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
 * POST /api/courses/[courseId]/unpublish
 * Unpublish a course (Teacher only)
 * Requirements: 2.3
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

    // Unpublish course (service handles ownership check)
    const course = await courseService.unpublishCourse(courseId, dbUser.id);

    return createSuccessResponse(
      course,
      'Course unpublished successfully. Existing student progress has been preserved.'
    );
  } catch (error) {
    console.error('Error unpublishing course:', error);

    if (error instanceof CourseError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to unpublish course');
  }
}

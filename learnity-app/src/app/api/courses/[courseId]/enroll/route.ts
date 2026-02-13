/**
 * Course Enrollment API Routes
 * POST /api/courses/[courseId]/enroll - Enroll in a course
 * DELETE /api/courses/[courseId]/enroll - Unenroll from a course
 *
 * Requirements covered:
 * - 4.1: Course enrollment
 * - 4.2: Enrollment record creation with initial state (0% progress, ACTIVE status)
 * - 4.3: Duplicate enrollment prevention
 * - 4.5: Unenrollment with history preservation
 */

import { NextRequest, NextResponse } from 'next/server';
import { enrollmentService } from '@/lib/services/enrollment.service';
import { EnrollmentError } from '@/lib/interfaces/enrollment.interface';
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
 * POST /api/courses/[courseId]/enroll
 * Enroll the authenticated student in a course
 * Requirements: 4.1, 4.2, 4.3
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

    // Authenticate user (students, teachers, and admins can enroll)
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

    // Enroll student in course
    const enrollment = await enrollmentService.enrollStudent(
      dbUser.id,
      courseId
    );

    return createSuccessResponse(
      enrollment,
      'Successfully enrolled in course',
      undefined,
      201
    );
  } catch (error) {
    console.error('Error enrolling in course:', error);

    if (error instanceof EnrollmentError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to enroll in course');
  }
}

/**
 * DELETE /api/courses/[courseId]/enroll
 * Unenroll the authenticated student from a course
 * Requirements: 4.5
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

    // Unenroll student from course
    await enrollmentService.unenrollStudent(dbUser.id, courseId);

    return createSuccessResponse(null, 'Successfully unenrolled from course');
  } catch (error) {
    console.error('Error unenrolling from course:', error);

    if (error instanceof EnrollmentError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to unenroll from course');
  }
}

/**
 * GET /api/courses/[courseId]/enroll
 * Check enrollment status for the authenticated user
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

    // Get enrollment status
    const enrollment = await enrollmentService.getEnrollment(
      dbUser.id,
      courseId
    );
    const isEnrolled = await enrollmentService.isEnrolled(dbUser.id, courseId);

    return createSuccessResponse(
      {
        isEnrolled,
        enrollment,
      },
      'Enrollment status retrieved successfully'
    );
  } catch (error) {
    console.error('Error checking enrollment status:', error);

    if (error instanceof EnrollmentError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to check enrollment status');
  }
}

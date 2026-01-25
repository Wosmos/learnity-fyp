/**
 * Course Certificate API Routes
 * POST /api/courses/[courseId]/certificate - Generate a certificate for a completed course
 * GET /api/courses/[courseId]/certificate - Check certificate status for a course
 *
 * Requirements covered:
 * - 10.1: Mark course as completed when 100% lessons and all quizzes passed
 * - 10.2: Generate completion certificate with student name, course title, date, unique ID
 * - 10.4: Award 50 XP bonus for course completion
 * - 10.6: Unlock "Course Completer" badge after first course completion
 */

import { NextRequest, NextResponse } from 'next/server';
import { certificateService } from '@/lib/services/certificate.service';
import { CertificateError } from '@/lib/interfaces/certificate.interface';
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
 * POST /api/courses/[courseId]/certificate
 * Generate a certificate for a completed course
 * Requirements: 10.1, 10.2, 10.4, 10.6
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

    // Authenticate user (students, teachers, and admins can generate certificates)
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

    // Generate certificate using service
    const result = await certificateService.generateCertificate(
      dbUser.id,
      courseId
    );

    return createSuccessResponse(
      {
        certificate: result.certificate,
        xpAwarded: result.xpAwarded,
        badgeAwarded: result.badgeAwarded,
        isFirstCompletion: result.isFirstCompletion,
      },
      'Certificate generated successfully',
      undefined,
      201
    );
  } catch (error) {
    console.error('Error generating certificate:', error);

    if (error instanceof CertificateError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to generate certificate');
  }
}

/**
 * GET /api/courses/[courseId]/certificate
 * Check certificate status and completion requirements for a course
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

    // Check if certificate already exists
    const existingCertificate =
      await certificateService.getCertificateByStudentAndCourse(
        dbUser.id,
        courseId
      );

    // Check completion status
    const completionStatus = await certificateService.checkCourseCompletion(
      dbUser.id,
      courseId
    );

    return createSuccessResponse(
      {
        hasCertificate: existingCertificate !== null,
        certificate: existingCertificate,
        completionStatus,
      },
      'Certificate status retrieved successfully'
    );
  } catch (error) {
    console.error('Error checking certificate status:', error);

    if (error instanceof CertificateError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to check certificate status');
  }
}

/**
 * Section Reorder API Route
 * PUT /api/courses/[courseId]/sections/reorder - Reorder sections
 *
 * Requirements covered:
 * - 1.9: Reordering sections via drag-and-drop
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { sectionService } from '@/lib/services/section.service';
import { ReorderSectionsSchema } from '@/lib/validators/section';
import { SectionError } from '@/lib/interfaces/section.interface';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * PUT /api/courses/[courseId]/sections/reorder
 * Reorder sections within a course (Teacher only)
 * Requirements: 1.9
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

    // Verify course exists and user owns it
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, teacherId: true },
    });

    if (!course) {
      return createErrorResponse(
        'COURSE_NOT_FOUND',
        'Course not found',
        undefined,
        404
      );
    }

    if (course.teacherId !== dbUser.id) {
      return createErrorResponse(
        'FORBIDDEN',
        'You do not have permission to reorder sections in this course',
        undefined,
        403
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = ReorderSectionsSchema.parse({
      ...body,
      courseId,
    });

    // Reorder sections
    await sectionService.reorderSections(validatedData);

    // Get updated sections
    const sections = await prisma.section.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return createSuccessResponse(sections, 'Sections reordered successfully');
  } catch (error) {
    console.error('Error reordering sections:', error);

    if (error instanceof ZodError) {
      return createValidationErrorResponse(error, 'Invalid reorder data');
    }

    if (error instanceof SectionError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to reorder sections');
  }
}

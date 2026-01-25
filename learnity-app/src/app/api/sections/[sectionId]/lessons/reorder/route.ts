/**
 * Lesson Reorder API Route
 * PUT /api/sections/[sectionId]/lessons/reorder - Reorder lessons
 *
 * Requirements covered:
 * - 1.9: Reordering lessons via drag-and-drop
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { lessonService } from '@/lib/services/lesson.service';
import { sectionService } from '@/lib/services/section.service';
import { ReorderLessonsSchema } from '@/lib/validators/lesson';
import { LessonError } from '@/lib/interfaces/lesson.interface';
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
  params: Promise<{ sectionId: string }>;
}

/**
 * PUT /api/sections/[sectionId]/lessons/reorder
 * Reorder lessons within a section (Teacher only)
 * Requirements: 1.9
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { sectionId } = await params;

    if (!sectionId) {
      return createErrorResponse(
        'INVALID_SECTION_ID',
        'Section ID is required',
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

    // Validate ownership through section
    const isOwner = await sectionService.validateOwnership(
      sectionId,
      dbUser.id
    );
    if (!isOwner) {
      return createErrorResponse(
        'FORBIDDEN',
        'You do not have permission to reorder lessons in this section',
        undefined,
        403
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = ReorderLessonsSchema.parse({
      ...body,
      sectionId,
    });

    // Reorder lessons
    await lessonService.reorderLessons(validatedData);

    // Get updated lessons
    const lessons = await lessonService.getLessonsBySection(sectionId);

    return createSuccessResponse(lessons, 'Lessons reordered successfully');
  } catch (error) {
    console.error('Error reordering lessons:', error);

    if (error instanceof ZodError) {
      return createValidationErrorResponse(error, 'Invalid reorder data');
    }

    if (error instanceof LessonError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to reorder lessons');
  }
}

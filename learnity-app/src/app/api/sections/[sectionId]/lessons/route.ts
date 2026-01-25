/**
 * Lesson API Routes for Section
 * POST /api/sections/[sectionId]/lessons - Create new lesson
 * GET /api/sections/[sectionId]/lessons - Get all lessons for a section
 *
 * Requirements covered:
 * - 1.7: Adding YouTube video links as lessons with title and duration
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { lessonService } from '@/lib/services/lesson.service';
import { sectionService } from '@/lib/services/section.service';
import { CreateLessonSchema } from '@/lib/validators/lesson';
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
 * GET /api/sections/[sectionId]/lessons
 * Get all lessons for a section
 */
export async function GET(
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

    // Verify section exists
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      select: { id: true },
    });

    if (!section) {
      return createErrorResponse(
        'SECTION_NOT_FOUND',
        'Section not found',
        undefined,
        404
      );
    }

    // Get lessons
    const lessons = await lessonService.getLessonsBySection(sectionId);

    return createSuccessResponse(lessons, 'Lessons retrieved successfully');
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return createInternalErrorResponse('Failed to fetch lessons');
  }
}

/**
 * POST /api/sections/[sectionId]/lessons
 * Create a new lesson (Teacher only)
 * Requirements: 1.7
 */
export async function POST(
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
        'You do not have permission to add lessons to this section',
        undefined,
        403
      );
    }

    // Parse request body
    const body = await request.json();

    // Get next order if not provided
    const order = body.order ?? (await lessonService.getNextOrder(sectionId));

    // Validate input
    const validatedData = CreateLessonSchema.parse({
      ...body,
      sectionId,
      order,
    });

    // Create lesson
    const result = await lessonService.createLesson(validatedData);

    return createSuccessResponse(
      {
        lesson: result.lesson,
        youtubeMetadata: result.youtubeMetadata,
      },
      'Lesson created successfully',
      undefined,
      201
    );
  } catch (error) {
    console.error('Error creating lesson:', error);

    if (error instanceof ZodError) {
      return createValidationErrorResponse(error, 'Invalid lesson data');
    }

    if (error instanceof LessonError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to create lesson');
  }
}

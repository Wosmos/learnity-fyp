/**
 * Section API Routes for Course
 * POST /api/courses/[courseId]/sections - Create new section
 * GET /api/courses/[courseId]/sections - Get all sections for a course
 *
 * Requirements covered:
 * - 1.6: Section creation, naming, and ordering
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { sectionService } from '@/lib/services/section.service';
import { CreateSectionSchema } from '@/lib/validators/section';
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
 * GET /api/courses/[courseId]/sections
 * Get all sections for a course
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

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      return createErrorResponse(
        'COURSE_NOT_FOUND',
        'Course not found',
        undefined,
        404
      );
    }

    // Get sections with lessons
    const sections = await prisma.section.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return createSuccessResponse(sections, 'Sections retrieved successfully');
  } catch (error) {
    console.error('Error fetching sections:', error);
    return createInternalErrorResponse('Failed to fetch sections');
  }
}

/**
 * POST /api/courses/[courseId]/sections
 * Create a new section (Teacher only)
 * Requirements: 1.6
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
        'You do not have permission to add sections to this course',
        undefined,
        403
      );
    }

    // Parse request body
    const body = await request.json();

    // Get next order if not provided
    const order = body.order ?? (await sectionService.getNextOrder(courseId));

    // Validate input
    const validatedData = CreateSectionSchema.parse({
      ...body,
      courseId,
      order,
    });

    // Create section
    const section = await sectionService.createSection(validatedData);

    return createSuccessResponse(
      section,
      'Section created successfully',
      undefined,
      201
    );
  } catch (error) {
    console.error('Error creating section:', error);

    if (error instanceof ZodError) {
      return createValidationErrorResponse(error, 'Invalid section data');
    }

    if (error instanceof SectionError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to create section');
  }
}

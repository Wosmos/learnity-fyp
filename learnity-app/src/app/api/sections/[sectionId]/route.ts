/**
 * Section Detail API Routes
 * GET /api/sections/[sectionId] - Get section details
 * PUT /api/sections/[sectionId] - Update section
 * DELETE /api/sections/[sectionId] - Delete section
 * 
 * Requirements covered:
 * - 1.6: Section management
 */

import { NextRequest, NextResponse } from 'next/server';
import { sectionService } from '@/lib/services/section.service';
import { UpdateSectionSchema } from '@/lib/validators/section';
import { SectionError } from '@/lib/interfaces/section.interface';
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
import { ZodError } from 'zod';

interface RouteParams {
  params: Promise<{ sectionId: string }>;
}

/**
 * GET /api/sections/[sectionId]
 * Get section details with lessons
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

    const section = await sectionService.getSectionWithLessons(sectionId);

    if (!section) {
      return createNotFoundErrorResponse('Section');
    }

    return createSuccessResponse(section, 'Section retrieved successfully');
  } catch (error) {
    console.error('Error fetching section:', error);
    return createInternalErrorResponse('Failed to fetch section');
  }
}

/**
 * PUT /api/sections/[sectionId]
 * Update section details (Teacher only)
 * Requirements: 1.6
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

    // Validate ownership
    const isOwner = await sectionService.validateOwnership(sectionId, dbUser.id);
    if (!isOwner) {
      return createErrorResponse(
        'FORBIDDEN',
        'You do not have permission to update this section',
        undefined,
        403
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = UpdateSectionSchema.parse(body);

    // Update section
    const section = await sectionService.updateSection(sectionId, validatedData);

    return createSuccessResponse(section, 'Section updated successfully');
  } catch (error) {
    console.error('Error updating section:', error);

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

    return createInternalErrorResponse('Failed to update section');
  }
}

/**
 * DELETE /api/sections/[sectionId]
 * Delete section (Teacher only)
 * Requirements: 1.6
 */
export async function DELETE(
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

    // Validate ownership
    const isOwner = await sectionService.validateOwnership(sectionId, dbUser.id);
    if (!isOwner) {
      return createErrorResponse(
        'FORBIDDEN',
        'You do not have permission to delete this section',
        undefined,
        403
      );
    }

    // Delete section
    await sectionService.deleteSection(sectionId);

    return createSuccessResponse(null, 'Section deleted successfully');
  } catch (error) {
    console.error('Error deleting section:', error);

    if (error instanceof SectionError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to delete section');
  }
}

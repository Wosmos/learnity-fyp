/**
 * Enrollments API Routes
 * GET /api/enrollments - Get student's enrolled courses
 * 
 * Requirements covered:
 * - 4.4: Student's enrolled courses display
 */

import { NextRequest, NextResponse } from 'next/server';
import { enrollmentService } from '@/lib/services/enrollment.service';
import { EnrollmentFiltersSchema } from '@/lib/validators/enrollment';
import { EnrollmentError } from '@/lib/interfaces/enrollment.interface';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { prisma } from '@/lib/prisma';
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';
import { ZodError } from 'zod';

/**
 * GET /api/enrollments
 * Get all enrolled courses for the authenticated student
 * Requirements: 4.4
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 12,
    };

    // Validate filters
    const validatedFilters = EnrollmentFiltersSchema.parse(filters);

    // Get student's enrollments
    const result = await enrollmentService.getStudentEnrollments(
      dbUser.id,
      validatedFilters
    );

    return createSuccessResponse(
      result,
      'Enrollments retrieved successfully',
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      }
    );
  } catch (error) {
    console.error('Error fetching enrollments:', error);

    if (error instanceof ZodError) {
      return createValidationErrorResponse(error, 'Invalid filter parameters');
    }

    if (error instanceof EnrollmentError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to fetch enrollments');
  }
}

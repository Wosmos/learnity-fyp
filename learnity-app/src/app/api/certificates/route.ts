/**
 * Certificates Collection API Routes
 * GET /api/certificates - Get all certificates for the authenticated student
 *
 * Requirements covered:
 * - 10.5: Display completed courses in student profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { certificateService } from '@/lib/services/certificate.service';
import { CertificateError } from '@/lib/interfaces/certificate.interface';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';
import {
  createSuccessResponse,
  createErrorResponse,
  createInternalErrorResponse,
  createValidationErrorResponse,
} from '@/lib/utils/api-response.utils';

/**
 * Schema for query parameters
 */
const CertificateQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * GET /api/certificates
 * Get all certificates for the authenticated student
 * Requirements: 10.5
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryValidation = CertificateQuerySchema.safeParse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 10,
    });

    if (!queryValidation.success) {
      return createValidationErrorResponse(queryValidation.error);
    }

    const { page, limit } = queryValidation.data;

    // Get certificates using service
    const result = await certificateService.getStudentCertificates(
      dbUser.id,
      page,
      limit
    );

    return createSuccessResponse(result, 'Certificates retrieved successfully');
  } catch (error) {
    console.error('Error getting certificates:', error);

    if (error instanceof CertificateError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to get certificates');
  }
}

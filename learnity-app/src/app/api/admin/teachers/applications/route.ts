/**
 * Teacher Applications Management API
 * Admin endpoint for reviewing teacher applications
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  withAdminApiAuth,
  createApiSuccessResponse,
  createApiErrorResponse,
  validateMethod,
} from '@/lib/utils/api-auth.utils';
import { DatabaseService } from '@/lib/services/database.service';
import { AuthErrorCode, ApplicationStatus } from '@/types/auth';

const databaseService = new DatabaseService();

/**
 * GET /api/admin/teachers/applications
 * Get all teacher applications with optional status filter
 */
async function handleGetApplications(
  request: NextRequest,
  user: any
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ApplicationStatus | null;

    const applications = await databaseService.getTeacherApplications(
      status || undefined
    );

    return createApiSuccessResponse(
      {
        applications,
        total: applications.length,
      },
      'Teacher applications retrieved successfully'
    );
  } catch (error: any) {
    console.error('Failed to get teacher applications:', error);
    return createApiErrorResponse(
      AuthErrorCode.INTERNAL_ERROR,
      'Failed to retrieve teacher applications'
    );
  }
}

/**
 * Main route handler
 */
async function handler(request: NextRequest, user: any): Promise<NextResponse> {
  // Validate HTTP method
  const methodError = validateMethod(request, ['GET']);
  if (methodError) return methodError;

  switch (request.method) {
    case 'GET':
      return handleGetApplications(request, user);

    default:
      return createApiErrorResponse(
        AuthErrorCode.INTERNAL_ERROR,
        'Method not implemented'
      );
  }
}

export const GET = withAdminApiAuth(handler);

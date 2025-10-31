/**
 * Individual Teacher Application Management API
 * Admin endpoint for approving/rejecting specific teacher applications
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  withAdminApiAuth, 
  createApiSuccessResponse, 
  createApiErrorResponse, 
  validateMethod,
  parseRequestBody 
} from '@/lib/utils/api-auth.utils';
import { DatabaseService } from '@/lib/services/database.service';
import { roleManager } from '@/lib/services/role-manager.service';
import { notificationService } from '@/lib/services/notification.service';
import { AuthErrorCode } from '@/types/auth';
import { teacherApprovalSchema } from '@/lib/validators/auth';
import { z } from 'zod';

const databaseService = new DatabaseService();

/**
 * GET /api/admin/teachers/applications/[applicationId]
 * Get specific teacher application details
 */
async function handleGetApplication(
  request: NextRequest, 
  user: any, 
  applicationId: string
): Promise<NextResponse> {
  try {
    const applications = await databaseService.getTeacherApplications();
    const application = applications.find(app => app.id === applicationId);

    if (!application) {
      return createApiErrorResponse(
        AuthErrorCode.ACCOUNT_NOT_FOUND,
        'Teacher application not found'
      );
    }

    return createApiSuccessResponse(
      application,
      'Teacher application retrieved successfully'
    );
  } catch (error: any) {
    console.error('Failed to get teacher application:', error);
    return createApiErrorResponse(
      AuthErrorCode.INTERNAL_ERROR,
      'Failed to retrieve teacher application'
    );
  }
}

/**
 * PUT /api/admin/teachers/applications/[applicationId]
 * Approve or reject teacher application
 */
async function handleUpdateApplication(
  request: NextRequest, 
  user: any, 
  applicationId: string
): Promise<NextResponse> {
  try {
    const body = await parseRequestBody(request);
    if (!body) {
      return createApiErrorResponse(
        AuthErrorCode.INTERNAL_ERROR,
        'Invalid request body'
      );
    }

    // Validate request data
    const validationResult = teacherApprovalSchema.safeParse(body);
    if (!validationResult.success) {
      return createApiErrorResponse(
        AuthErrorCode.INTERNAL_ERROR,
        'Invalid approval data: ' + validationResult.error.message
      );
    }

    const approvalData = validationResult.data;

    // Get the application first to get user info
    const applications = await databaseService.getTeacherApplications();
    const application = applications.find(app => app.id === applicationId);

    if (!application) {
      return createApiErrorResponse(
        AuthErrorCode.ACCOUNT_NOT_FOUND,
        'Teacher application not found'
      );
    }

    // Review the application in database
    await databaseService.reviewTeacherApplication(applicationId, approvalData);

    // Update Firebase Auth role and send notifications
    if (approvalData.decision === 'APPROVED') {
      await roleManager.approveTeacher(application.user.firebaseUid, user.firebaseUid);
      
      // Send approval notification
      try {
        await notificationService.sendTeacherApprovalNotification({
          id: application.user.id,
          firebaseUid: application.user.firebaseUid,
          email: application.user.email,
          firstName: application.user.firstName,
          lastName: application.user.lastName,
          role: 'TEACHER' as any,
          emailVerified: true,
          profilePicture: undefined,
          isActive: true,
          lastLoginAt: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (emailError) {
        console.error('Failed to send approval notification:', emailError);
        // Don't fail the approval process if email fails
      }
    } else {
      await roleManager.rejectTeacher(
        application.user.firebaseUid, 
        approvalData.rejectionReason || 'Application rejected by admin',
        user.firebaseUid
      );
      
      // Send rejection notification
      try {
        await notificationService.sendTeacherRejectionNotification({
          id: application.user.id,
          firebaseUid: application.user.firebaseUid,
          email: application.user.email,
          firstName: application.user.firstName,
          lastName: application.user.lastName,
          role: 'PENDING_TEACHER' as any,
          emailVerified: true,
          profilePicture: undefined,
          isActive: true,
          lastLoginAt: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        }, approvalData.rejectionReason || 'Application rejected by admin');
      } catch (emailError) {
        console.error('Failed to send rejection notification:', emailError);
        // Don't fail the rejection process if email fails
      }
    }

    return createApiSuccessResponse(
      {
        applicationId,
        decision: approvalData.decision,
        reviewedBy: user.firebaseUid,
        reviewedAt: new Date().toISOString()
      },
      `Teacher application ${approvalData.decision.toLowerCase()} successfully`
    );

  } catch (error: any) {
    console.error('Failed to update teacher application:', error);
    return createApiErrorResponse(
      AuthErrorCode.INTERNAL_ERROR,
      'Failed to update teacher application: ' + error.message
    );
  }
}

/**
 * Main route handler
 */
async function handler(
  request: NextRequest, 
  user: any,
  { params }: { params: { applicationId: string } }
): Promise<NextResponse> {
  const applicationId = params.applicationId;

  if (!applicationId) {
    return createApiErrorResponse(
      AuthErrorCode.INTERNAL_ERROR,
      'Application ID is required'
    );
  }

  // Validate HTTP method
  const methodError = validateMethod(request, ['GET', 'PUT']);
  if (methodError) return methodError;

  switch (request.method) {
    case 'GET':
      return handleGetApplication(request, user, applicationId);
    
    case 'PUT':
      return handleUpdateApplication(request, user, applicationId);
    
    default:
      return createApiErrorResponse(
        AuthErrorCode.INTERNAL_ERROR,
        'Method not implemented'
      );
  }
}

export const GET = withAdminApiAuth((req, user, context) => handler(req, user, context));
export const PUT = withAdminApiAuth((req, user, context) => handler(req, user, context));
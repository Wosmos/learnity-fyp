/**
 * Batch Teacher Application Management API
 * Admin endpoint for batch approval/rejection of teacher applications
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
import { AuthErrorCode } from '@/types/auth';
import { z } from 'zod';

const databaseService = new DatabaseService();

// Validation schema for batch operations
const batchApprovalSchema = z.object({
  applications: z.array(z.object({
    applicationId: z.string(),
    decision: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: z.string().optional()
  }))
});

/**
 * POST /api/admin/teachers/applications/batch
 * Batch approve or reject multiple teacher applications
 */
async function handleBatchApproval(request: NextRequest, user: any): Promise<NextResponse> {
  try {
    const body = await parseRequestBody(request);
    if (!body) {
      return createApiErrorResponse(
        AuthErrorCode.INTERNAL_ERROR,
        'Invalid request body'
      );
    }

    // Validate request data
    const validationResult = batchApprovalSchema.safeParse(body);
    if (!validationResult.success) {
      return createApiErrorResponse(
        AuthErrorCode.INTERNAL_ERROR,
        'Invalid batch approval data: ' + validationResult.error.message
      );
    }

    const { applications } = validationResult.data;
    const results: Array<{
      applicationId: string;
      success: boolean;
      error?: string;
    }> = [];

    // Get all applications first
    const allApplications = await databaseService.getTeacherApplications();

    // Process each application
    for (const appRequest of applications) {
      try {
        const application = allApplications.find(app => app.id === appRequest.applicationId);
        
        if (!application) {
          results.push({
            applicationId: appRequest.applicationId,
            success: false,
            error: 'Application not found'
          });
          continue;
        }

        // Review the application in database
        await databaseService.reviewTeacherApplication(appRequest.applicationId, {
          decision: appRequest.decision,
          rejectionReason: appRequest.rejectionReason
        });

        // Update Firebase Auth role
        if (appRequest.decision === 'APPROVED') {
          await roleManager.approveTeacher(application.user.firebaseUid, user.firebaseUid);
        } else {
          await roleManager.rejectTeacher(
            application.user.firebaseUid,
            appRequest.rejectionReason || 'Application rejected by admin',
            user.firebaseUid
          );
        }

        results.push({
          applicationId: appRequest.applicationId,
          success: true
        });

      } catch (error: any) {
        console.error(`Failed to process application ${appRequest.applicationId}:`, error);
        results.push({
          applicationId: appRequest.applicationId,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return createApiSuccessResponse(
      {
        results,
        summary: {
          total: applications.length,
          successful: successCount,
          failed: failureCount
        }
      },
      `Batch operation completed: ${successCount} successful, ${failureCount} failed`
    );

  } catch (error: any) {
    console.error('Failed to process batch approval:', error);
    return createApiErrorResponse(
      AuthErrorCode.INTERNAL_ERROR,
      'Failed to process batch approval: ' + error.message
    );
  }
}

/**
 * Main route handler
 */
async function handler(request: NextRequest, user: any): Promise<NextResponse> {
  // Validate HTTP method
  const methodError = validateMethod(request, ['POST']);
  if (methodError) return methodError;

  switch (request.method) {
    case 'POST':
      return handleBatchApproval(request, user);
    
    default:
      return createApiErrorResponse(
        AuthErrorCode.INTERNAL_ERROR,
        'Method not implemented'
      );
  }
}

export const POST = withAdminApiAuth(handler);
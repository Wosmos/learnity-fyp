import { NextRequest, NextResponse } from 'next/server';
import {
  createApiSuccessResponse,
  createApiErrorResponse,
  parseRequestBody,
} from '@/lib/utils/api-auth.utils';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { DatabaseService } from '@/lib/services/database.service';
import { roleManager } from '@/lib/services/role-manager.service';
import { notificationService } from '@/lib/services/notification.service';
import { AuthErrorCode, UserRole } from '@/types/auth';
import { teacherApprovalSchema } from '@/lib/validators/auth';

const databaseService = new DatabaseService();

async function authenticateAdmin(request: NextRequest) {
  const authResult = await authMiddleware(request, {
    requiredRole: UserRole.ADMIN,
  });
  if (authResult instanceof NextResponse) return null;
  return authResult.user;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
): Promise<NextResponse> {
  const user = await authenticateAdmin(request);
  if (!user) {
    return createApiErrorResponse(AuthErrorCode.INSUFFICIENT_PERMISSIONS, 'Admin access required');
  }

  const { applicationId } = await params;

  const applications = await databaseService.getTeacherApplications();
  const application = applications.find(app => app.id === applicationId);

  if (!application) {
    return createApiErrorResponse(AuthErrorCode.ACCOUNT_NOT_FOUND, 'Teacher application not found');
  }

  return createApiSuccessResponse(application, 'Teacher application retrieved successfully');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
): Promise<NextResponse> {
  const user = await authenticateAdmin(request);
  if (!user) {
    return createApiErrorResponse(AuthErrorCode.INSUFFICIENT_PERMISSIONS, 'Admin access required');
  }

  const { applicationId } = await params;

  const body = await parseRequestBody(request);
  if (!body) {
    return createApiErrorResponse(AuthErrorCode.INTERNAL_ERROR, 'Invalid request body');
  }

  const validationResult = teacherApprovalSchema.safeParse(body);
  if (!validationResult.success) {
    return createApiErrorResponse(
      AuthErrorCode.INTERNAL_ERROR,
      'Invalid approval data: ' + validationResult.error.message
    );
  }

  const approvalData = validationResult.data;

  const applications = await databaseService.getTeacherApplications();
  const application = applications.find(app => app.id === applicationId);

  if (!application) {
    return createApiErrorResponse(AuthErrorCode.ACCOUNT_NOT_FOUND, 'Teacher application not found');
  }

  await databaseService.reviewTeacherApplication(applicationId, approvalData);

  if (approvalData.decision === 'APPROVED') {
    await roleManager.approveTeacher(application.user.firebaseUid, user.firebaseUid);

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
        updatedAt: new Date(),
      });
    } catch {
      // Don't fail approval if notification fails
    }
  } else {
    await roleManager.rejectTeacher(
      application.user.firebaseUid,
      approvalData.rejectionReason || 'Application rejected by admin',
      user.firebaseUid
    );

    try {
      await notificationService.sendTeacherRejectionNotification(
        {
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
          updatedAt: new Date(),
        },
        approvalData.rejectionReason || 'Application rejected by admin'
      );
    } catch {
      // Don't fail rejection if notification fails
    }
  }

  return createApiSuccessResponse(
    {
      applicationId,
      decision: approvalData.decision,
      reviewedBy: user.firebaseUid,
      reviewedAt: new Date().toISOString(),
    },
    `Teacher application ${approvalData.decision.toLowerCase()} successfully`
  );
}

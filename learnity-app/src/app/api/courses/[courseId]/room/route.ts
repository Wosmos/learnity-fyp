/**
 * Course Room API
 * GET /api/courses/[courseId]/room - Get course room details
 * POST /api/courses/[courseId]/room - Create/enable course room
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { courseRoomService } from '@/lib/services/course-room.service';
import { UserRole } from '@/types/auth';
import {
  createSuccessResponse,
  createAuthErrorResponse,
  createErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/courses/[courseId]/room
 * Get course room details (chat channel ID, video room ID, etc.)
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { courseId } = await params;

    // Authenticate user
    const authResult = await authMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.firebaseUid },
      select: { id: true, role: true },
    });

    if (!dbUser) {
      return createAuthErrorResponse('User not found in database');
    }

    // Get course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, teacherId: true, title: true },
    });

    if (!course) {
      return createErrorResponse('NOT_FOUND', 'Course not found', undefined, 404);
    }

    // Check access: must be teacher, admin, or enrolled student
    const isTeacher = course.teacherId === dbUser.id;
    const isAdmin = dbUser.role === 'ADMIN';

    if (!isTeacher && !isAdmin) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: dbUser.id,
            courseId: courseId,
          },
        },
      });

      if (!enrollment || enrollment.status !== 'ACTIVE') {
        return createErrorResponse('FORBIDDEN', 'Access denied', undefined, 403);
      }
    }

    // Get course room
    const room = await courseRoomService.getCourseRoom(courseId);

    if (!room) {
      return createSuccessResponse({
        exists: false,
        courseId,
        chatEnabled: false,
        videoEnabled: false,
      }, 'Course room not found');
    }

    // Self-healing: Ensure the requesting user is in the room's chat channel
    // We already verified they are authorized (teacher, admin, or enrolled student)
    // This fixes errors where the user is enrolled but missing from the Stream channel
    if (dbUser.role !== 'ADMIN') { // Admins might not need to be in chat unless they view it? Or maybe they do.
       await courseRoomService.ensureUserInRoom(courseId, dbUser.id);
    }
    
    return createSuccessResponse({
      exists: true,
      ...room,
      isTeacher,
    }, 'Course room retrieved successfully');
  } catch (error) {
    console.error('Error getting course room:', error);
    return createInternalErrorResponse('Failed to get course room');
  }
}

/**
 * POST /api/courses/[courseId]/room
 * Create or enable course room (teacher only)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { courseId } = await params;

    // Authenticate teacher
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
      select: { id: true, role: true },
    });

    if (!dbUser) {
      return createAuthErrorResponse('User not found in database');
    }

    // Get course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, teacherId: true, title: true },
    });

    if (!course) {
      return createErrorResponse('NOT_FOUND', 'Course not found', undefined, 404);
    }

    // Verify ownership (unless admin)
    if (course.teacherId !== dbUser.id && dbUser.role !== 'ADMIN') {
      return createErrorResponse('FORBIDDEN', 'Only the course teacher can manage the room', undefined, 403);
    }

    // Parse options from body
    const body = await request.json().catch(() => ({}));
    const { enableChat = true, enableVideo = true } = body;

    // Create or get existing room
    const room = await courseRoomService.createCourseRoom({
      courseId: course.id,
      courseName: course.title,
      teacherId: course.teacherId,
      enableChat,
      enableVideo,
    });

    return createSuccessResponse(room, 'Course room created successfully');
  } catch (error) {
    console.error('Error creating course room:', error);
    return createInternalErrorResponse('Failed to create course room');
  }
}

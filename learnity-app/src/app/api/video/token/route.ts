/**
 * 100ms Video Token API
 * POST /api/video/token - Generate auth token for 100ms video room
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { hmsVideoService } from '@/lib/services/hms-video.service';
import { courseRoomService } from '@/lib/services/course-room.service';
import {
  createSuccessResponse,
  createAuthErrorResponse,
  createErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

/**
 * POST /api/video/token
 * Generate a 100ms auth token for joining a video room
 * 
 * Body: { courseId: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const authResult = await authMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Parse request body
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return createErrorResponse('VALIDATION_ERROR', 'courseId is required', undefined, 400);
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.firebaseUid },
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        role: true,
      },
    });

    if (!dbUser) {
      return createAuthErrorResponse('User not found in database');
    }

    // Get course and verify access
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { 
        id: true, 
        teacherId: true,
        title: true,
      },
    });

    if (!course) {
      return createErrorResponse('NOT_FOUND', 'Course not found', undefined, 404);
    }

    // Check if user is teacher or enrolled student
    const isTeacher = course.teacherId === dbUser.id;
    
    if (!isTeacher) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: dbUser.id,
            courseId: courseId,
          },
        },
      });

      if (!enrollment || enrollment.status !== 'ACTIVE') {
        return createErrorResponse('FORBIDDEN', 'You must be enrolled in this course to join video sessions', undefined, 403);
      }
    }

    // Get or create course room
    const room = await courseRoomService.ensureRoomExists(courseId);

    if (!room.hmsRoomId || !room.videoEnabled) {
      return createErrorResponse('NOT_AVAILABLE', 'Video is not enabled for this course', undefined, 400);
    }

    // Determine role: teacher gets 'host', students get 'guest'
    const role = isTeacher ? 'host' : 'guest';

    // Generate token
    const token = hmsVideoService.generateAuthToken({
      roomId: room.hmsRoomId,
      userId: dbUser.id,
      role,
      userName: `${dbUser.firstName} ${dbUser.lastName}`,
    });

    return createSuccessResponse({
      token,
      roomId: room.hmsRoomId,
      role,
      userName: `${dbUser.firstName} ${dbUser.lastName}`,
    }, 'Video token generated successfully');
  } catch (error) {
    console.error('Error generating video token:', error);
    return createInternalErrorResponse('Failed to generate video token');
  }
}

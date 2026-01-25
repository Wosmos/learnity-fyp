/**
 * Live Sessions API
 * GET /api/video/sessions - Get upcoming/active sessions
 * POST /api/video/sessions - Schedule a new live session
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { courseRoomService } from '@/lib/services/course-room.service';
import {
  createSuccessResponse,
  createAuthErrorResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

const CreateSessionSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  scheduledAt: z.string().datetime('Invalid date format'),
  duration: z.number().min(15).max(480).default(60), // 15 min to 8 hours
  maxParticipants: z.number().min(2).max(500).default(100),
});

/**
 * GET /api/video/sessions
 * Get upcoming and active live sessions
 * Query params: courseId (optional), status (optional)
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
      select: { id: true, role: true },
    });

    if (!dbUser) {
      return createAuthErrorResponse('User not found in database');
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');

    // Build query based on user role
    let courseIds: string[] = [];

    if (dbUser.role === 'TEACHER') {
      // Get courses taught by this teacher
      const courses = await prisma.course.findMany({
        where: { teacherId: dbUser.id },
        select: { id: true },
      });
      courseIds = courses.map(c => c.id);
    } else if (dbUser.role === 'STUDENT') {
      // Get enrolled courses
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: dbUser.id, status: 'ACTIVE' },
        select: { courseId: true },
      });
      courseIds = enrollments.map(e => e.courseId);
    } else if (dbUser.role === 'ADMIN') {
      // Admin can see all sessions
      courseIds = [];
    }

    // Get course rooms for the relevant courses
    const roomQuery: any = {};
    if (courseId) {
      roomQuery.courseId = courseId;
    } else if (courseIds.length > 0) {
      roomQuery.courseId = { in: courseIds };
    }

    const rooms = await prisma.courseRoom.findMany({
      where: roomQuery,
      select: { id: true, courseId: true },
    });

    const roomIds = rooms.map(r => r.id);

    // Build session query
    const sessionQuery: any = {
      courseRoomId: { in: roomIds },
    };

    if (status) {
      sessionQuery.status = status.toUpperCase();
    } else {
      // Default: show scheduled and live sessions
      sessionQuery.status = { in: ['SCHEDULED', 'LIVE'] };
    }

    // Get sessions
    const sessions = await prisma.liveSession.findMany({
      where: sessionQuery,
      orderBy: { scheduledAt: 'asc' },
      include: {
        courseRoom: {
          select: {
            courseId: true,
          },
        },
      },
    });

    // Enrich with course details
    const enrichedSessions = await Promise.all(
      sessions.map(async session => {
        const course = await prisma.course.findUnique({
          where: { id: session.courseRoom.courseId },
          select: { id: true, title: true, teacherId: true },
        });

        const teacher = course
          ? await prisma.user.findUnique({
              where: { id: course.teacherId },
              select: { firstName: true, lastName: true },
            })
          : null;

        return {
          ...session,
          course: course
            ? {
                id: course.id,
                title: course.title,
              }
            : null,
          host: teacher
            ? {
                name: `${teacher.firstName} ${teacher.lastName}`,
              }
            : null,
          isHost: course?.teacherId === dbUser.id,
        };
      })
    );

    return createSuccessResponse(
      {
        sessions: enrichedSessions,
        total: enrichedSessions.length,
      },
      'Sessions retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return createInternalErrorResponse('Failed to fetch sessions');
  }
}

/**
 * POST /api/video/sessions
 * Schedule a new live session (teacher only)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
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

    // Parse and validate body
    const body = await request.json();
    const validation = CreateSessionSchema.safeParse(body);

    if (!validation.success) {
      return createValidationErrorResponse(
        validation.error,
        'Invalid session data'
      );
    }

    const {
      courseId,
      title,
      description,
      scheduledAt,
      duration,
      maxParticipants,
    } = validation.data;

    // Get course and verify ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, teacherId: true, title: true },
    });

    if (!course) {
      return createErrorResponse(
        'NOT_FOUND',
        'Course not found',
        undefined,
        404
      );
    }

    if (course.teacherId !== dbUser.id && dbUser.role !== 'ADMIN') {
      return createErrorResponse(
        'FORBIDDEN',
        'Only the course teacher can schedule sessions',
        undefined,
        403
      );
    }

    // Ensure course room exists
    const room = await courseRoomService.ensureRoomExists(courseId);

    if (!room.videoEnabled || !room.hmsRoomId) {
      return createErrorResponse(
        'NOT_AVAILABLE',
        'Video is not enabled for this course',
        undefined,
        400
      );
    }

    // Create session
    const session = await prisma.liveSession.create({
      data: {
        courseRoomId: room.id,
        hostId: dbUser.id,
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        duration,
        maxParticipants,
        status: 'SCHEDULED',
      },
    });

    return createSuccessResponse(
      {
        ...session,
        course: {
          id: course.id,
          title: course.title,
        },
      },
      'Session scheduled successfully'
    );
  } catch (error) {
    console.error('Error creating session:', error);
    return createInternalErrorResponse('Failed to create session');
  }
}

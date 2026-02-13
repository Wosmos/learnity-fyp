/**
 * Teacher Sessions API
 * GET  /api/teacher/sessions - List teacher's sessions
 * POST /api/teacher/sessions - Schedule new session
 */

import { NextRequest, NextResponse } from 'next/server';
import { teacherSessionService } from '@/lib/services/teacher-session.service';
import { pushNotificationService } from '@/lib/services/push-notification.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { SessionType, RecurrenceType } from '@prisma/client';

// Validation schema
const ScheduleSessionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  sessionType: z.enum(['CLASS', 'ONE_ON_ONE', 'GROUP_MEETING']),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(15).max(480), // 15 min to 8 hours
  studentIds: z.array(z.string()).min(1),
  isRecurring: z.boolean().optional(),
  recurrence: z.enum(['DAILY', 'WEEKLY']).optional(),
});

/**
 * GET /api/teacher/sessions
 * List all sessions for the authenticated teacher
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate teacher
    const authResult = await authMiddleware(request, {
      requiredRole: UserRole.TEACHER,
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse query parameters for filters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sessionType = searchParams.get('sessionType');

    const filters: any = {};
    if (status) filters.status = status;
    if (sessionType) filters.sessionType = sessionType;

    // Get sessions
    const sessions = await teacherSessionService.getTeacherSessions(
      dbUser.id,
      filters
    );

    return NextResponse.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teacher/sessions
 * Schedule a new session
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate teacher
    const authResult = await authMiddleware(request, {
      requiredRole: UserRole.TEACHER,
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = ScheduleSessionSchema.parse(body);

    // Schedule session
    const session = await teacherSessionService.scheduleSession({
      teacherId: dbUser.id,
      title: validatedData.title,
      description: validatedData.description,
      sessionType: validatedData.sessionType as SessionType,
      scheduledAt: new Date(validatedData.scheduledAt),
      duration: validatedData.duration,
      studentIds: validatedData.studentIds,
      isRecurring: validatedData.isRecurring,
      recurrence: validatedData.recurrence as RecurrenceType | undefined,
    });

    // Send notifications to students
    await pushNotificationService.notifySessionScheduled(session.id);

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to schedule session:', error);
    return NextResponse.json(
      { error: 'Failed to schedule session' },
      { status: 500 }
    );
  }
}

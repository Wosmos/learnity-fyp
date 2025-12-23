/**
 * Teacher Schedule API Route
 * GET /api/teacher/schedule - Get teacher's upcoming events and sessions
 * POST /api/teacher/schedule - Create a new scheduled event
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import {
  createSuccessResponse,
  createAuthErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

export interface TeacherEvent {
  id: string;
  title: string;
  description: string | null;
  type: 'live_session' | 'office_hours' | 'workshop' | 'other';
  startTime: Date;
  endTime: Date;
  isLive: boolean;
  meetingLink: string | null;
  courseId: string | null;
  courseName: string | null;
  attendeeCount: number;
  maxAttendees: number | null;
}

export interface TeacherScheduleResponse {
  events: TeacherEvent[];
  upcomingCount: number;
  todayCount: number;
  thisWeekCount: number;
}

/**
 * GET /api/teacher/schedule
 * Retrieve teacher's scheduled events
 * Note: This is a simplified implementation. In production, you'd have a dedicated
 * TeacherEvent model in the database.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
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
      select: { 
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!dbUser) {
      return createAuthErrorResponse('User not found in database');
    }

    // Get teacher's courses for context
    const courses = await prisma.course.findMany({
      where: { 
        teacherId: dbUser.id,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        enrollmentCount: true,
      },
    });

    // Since we don't have a dedicated events table, we'll generate sample events
    // based on the teacher's courses. In production, you'd query a TeacherEvent table.
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Generate events based on courses (placeholder - replace with real DB query)
    const events: TeacherEvent[] = [];
    
    courses.forEach((course, index) => {
      // Create a live session for each course
      const sessionDate = new Date(today);
      sessionDate.setDate(sessionDate.getDate() + index);
      sessionDate.setHours(14 + index, 0, 0, 0);
      
      const endDate = new Date(sessionDate);
      endDate.setHours(endDate.getHours() + 1);

      const isToday = sessionDate.toDateString() === today.toDateString();
      const isPast = sessionDate < now;

      events.push({
        id: `event-${course.id}-${index}`,
        title: `Live Q&A: ${course.title}`,
        description: `Interactive session for ${course.title} students`,
        type: 'live_session',
        startTime: sessionDate,
        endTime: endDate,
        isLive: isToday && !isPast && sessionDate.getHours() <= now.getHours(),
        meetingLink: 'https://meet.google.com/xxx-xxxx-xxx',
        courseId: course.id,
        courseName: course.title,
        attendeeCount: Math.min(course.enrollmentCount, 12),
        maxAttendees: 30,
      });
    });

    // Add office hours
    const officeHoursDate = new Date(tomorrow);
    officeHoursDate.setHours(10, 0, 0, 0);
    const officeHoursEnd = new Date(officeHoursDate);
    officeHoursEnd.setHours(12, 0, 0, 0);

    events.push({
      id: 'office-hours-1',
      title: 'Office Hours Q&A',
      description: 'Open session for all students to ask questions',
      type: 'office_hours',
      startTime: officeHoursDate,
      endTime: officeHoursEnd,
      isLive: false,
      meetingLink: 'https://zoom.us/j/xxxxxxxxx',
      courseId: null,
      courseName: null,
      attendeeCount: 0,
      maxAttendees: 20,
    });

    // Sort by start time
    events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Filter to only upcoming events
    const upcomingEvents = events.filter(e => new Date(e.endTime) >= now);

    // Calculate counts
    const todayCount = upcomingEvents.filter(e => 
      new Date(e.startTime).toDateString() === today.toDateString()
    ).length;
    
    const thisWeekCount = upcomingEvents.filter(e => 
      new Date(e.startTime) < nextWeek
    ).length;

    const response: TeacherScheduleResponse = {
      events: upcomingEvents,
      upcomingCount: upcomingEvents.length,
      todayCount,
      thisWeekCount,
    };

    return createSuccessResponse(response, 'Teacher schedule retrieved successfully');
  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    return createInternalErrorResponse('Failed to fetch teacher schedule');
  }
}

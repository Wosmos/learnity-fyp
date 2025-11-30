/**
 * Teacher Activities API Route  
 * GET /api/teacher/activities - Get recent teacher activities
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

/**
 * GET /api/teacher/activities
 * Retrieve recent activities for teacher dashboard
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
      select: { id: true },
    });

    if (!dbUser) {
      return createAuthErrorResponse('User not found in database');
    }

    const activities: Array<{
      id: string;
      type: 'new_enrollment' | 'review_received' | 'course_published' | 'lesson_completed';
      message: string;
      time: string;
      metadata?: any;
    }> = [];

    // Get recent enrollments
    const recentEnrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          teacherId: dbUser.id,
        },
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
      take: 5,
    });

    activities.push(
      ...recentEnrollments.map((enrollment) => ({
        id: enrollment.id,
        type: 'new_enrollment' as const,
        message: `${enrollment.student.firstName} ${enrollment.student.lastName} enrolled in ${enrollment.course.title}`,
        time: getRelativeTime(enrollment.enrolledAt),
        metadata: {
          studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
          courseName: enrollment.course.title,
        },
      }))
    );

    // Get recent reviews
    const recentReviews = await prisma.review.findMany({
      where: {
        course: {
          teacherId: dbUser.id,
        },
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });

    activities.push(
      ...recentReviews.map((review) => ({
        id: review.id,
        type: 'review_received' as const,
        message: `Received ${review.rating}-star review from ${review.student.firstName} ${review.student.lastName}`,
        time: getRelativeTime(review.createdAt),
        metadata: {
          rating: review.rating,
          studentName: `${review.student.firstName} ${review.student.lastName}`,
          courseName: review.course.title,
          comment: review.comment,
        },
      }))
    );

    // Get recently published courses
    const recentlyPublished = await prisma.course.findMany({
      where: {
        teacherId: dbUser.id,
        status: 'PUBLISHED',
        publishedAt: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        publishedAt: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 2,
    });

    activities.push(
      ...recentlyPublished.map((course) => ({
        id: course.id,
        type: 'course_published' as const,
        message: `Published course: "${course.title}"`,
        time: getRelativeTime(course.publishedAt!),
        metadata: {
          courseName: course.title,
        },
      }))
    );

    // Sort all activities by time (most recent first)
    activities.sort((a, b) => {
      const timeA = parseRelativeTime(a.time);
      const timeB = parseRelativeTime(b.time);
      return timeA - timeB;
    });

    // Return top 10 most recent activities
    return createSuccessResponse(
      activities.slice(0, 10),
      'Activities retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching teacher activities:', error);
    return createInternalErrorResponse('Failed to fetch activities');
  }
}

/**
 * Convert date to relative time string
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
}

/**
 * Parse relative time string to milliseconds (for sorting)
 */
function parseRelativeTime(timeStr: string): number {
  if (timeStr === 'just now') return 0;
  
  const match = timeStr.match(/(\d+)\s+(minute|hour|day|week|month)s?\s+ago/);
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const multipliers: Record<string, number> = {
    minute: 60000,
    hour: 3600000,
    day: 86400000,
    week: 604800000,
    month: 2592000000,
  };
  
  return value * multipliers[unit];
}

/**
 * Teacher Stats API Route
 * GET /api/teacher/stats - Get teacher dashboard statistics
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
 * GET /api/teacher/stats
 * Retrieve comprehensive teacher statistics
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
        teacherProfile: {
          select: {
            rating: true,
            reviewCount: true,
            lessonsCompleted: true,
            activeStudents: true,
          },
        },
      },
    });

    if (!dbUser) {
      return createAuthErrorResponse('User not found in database');
    }

    // Get course statistics
    const courses = await prisma.course.findMany({
      where: { teacherId: dbUser.id },
      select: {
        id: true,
        status: true,
        enrollmentCount: true,
        lessonCount: true,
        averageRating: true,
        reviewCount: true,
      },
    });

    // Calculate statistics
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.status === 'PUBLISHED').length;
    const totalEnrollments = courses.reduce((sum, c) => sum + c.enrollmentCount, 0);
    const totalLessons = courses.reduce((sum, c) => sum + c.lessonCount, 0);
    
    // Average rating across all courses (weighted by review count)
    const totalReviews = courses.reduce((sum, c) => sum + c.reviewCount, 0);
    const weightedRatingSum = courses.reduce(
      (sum, c) => sum + (Number(c.averageRating) * c.reviewCount),
      0
    );
    const averageRating = totalReviews > 0 ? weightedRatingSum / totalReviews : 0;

    // Get active enrollments (students currently enrolled)
    const activeEnrollments = await prisma.enrollment.count({
      where: {
        course: {
          teacherId: dbUser.id,
        },
        status: 'ACTIVE',
      },
    });

    // Get recent enrollments (this month)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEnrollments = await prisma.enrollment.count({
      where: {
        course: {
          teacherId: dbUser.id,
        },
        enrolledAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get completed courses count
    const completedEnrollments = await prisma.enrollment.count({
      where: {
        course: {
          teacherId: dbUser.id,
        },
        status: 'COMPLETED',
      },
    });

    const stats = {
      totalCourses,
      publishedCourses,
      draftCourses: courses.filter(c => c.status === 'DRAFT').length,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      recentEnrollments,
      totalLessons,
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
      activeStudents: dbUser.teacherProfile?.activeStudents || 0,
      lessonsCompleted: dbUser.teacherProfile?.lessonsCompleted || 0,
      teacherRating: Number(dbUser.teacherProfile?.rating || 0),
      teacherReviewCount: dbUser.teacherProfile?.reviewCount || 0,
    };

    return createSuccessResponse(stats, 'Teacher stats retrieved successfully');
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    return createInternalErrorResponse('Failed to fetch teacher statistics');
  }
}

/**
 * Teacher Courses API Route
 * GET /api/teacher/courses - Get all courses created by the teacher with detailed stats
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

export interface TeacherCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  status: string;
  difficulty: string;
  isFree: boolean;
  price: number | null;
  totalDuration: number;
  lessonCount: number;
  sectionCount: number;
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
  };
  recentEnrollments: number;
  completionRate: number;
}

export interface TeacherCoursesResponse {
  courses: TeacherCourse[];
  total: number;
  publishedCount: number;
  draftCount: number;
  totalEnrollments: number;
  totalRevenue: number;
}

/**
 * GET /api/teacher/courses
 * Retrieve all courses created by the teacher with detailed statistics
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

    // Get all courses with sections count
    const courses = await prisma.course.findMany({
      where: { teacherId: dbUser.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        sections: {
          select: {
            id: true,
          },
        },
        enrollments: {
          select: {
            status: true,
            enrolledAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Calculate 30 days ago for recent enrollments
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Transform courses with additional stats
    const teacherCourses: TeacherCourse[] = courses.map(course => {
      const recentEnrollments = course.enrollments.filter(
        e => new Date(e.enrolledAt) >= thirtyDaysAgo
      ).length;
      
      const completedEnrollments = course.enrollments.filter(
        e => e.status === 'COMPLETED'
      ).length;
      
      const completionRate = course.enrollments.length > 0
        ? Math.round((completedEnrollments / course.enrollments.length) * 100)
        : 0;

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        status: course.status,
        difficulty: course.difficulty,
        isFree: course.isFree,
        price: course.price ? Number(course.price) : null,
        totalDuration: course.totalDuration,
        lessonCount: course.lessonCount,
        sectionCount: course.sections.length,
        enrollmentCount: course.enrollmentCount,
        averageRating: Number(course.averageRating),
        reviewCount: course.reviewCount,
        publishedAt: course.publishedAt,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        category: course.category,
        recentEnrollments,
        completionRate,
      };
    });

    // Calculate totals
    const publishedCount = teacherCourses.filter(c => c.status === 'PUBLISHED').length;
    const draftCount = teacherCourses.filter(c => c.status === 'DRAFT').length;
    const totalEnrollments = teacherCourses.reduce((sum, c) => sum + c.enrollmentCount, 0);
    const totalRevenue = teacherCourses
      .filter(c => !c.isFree && c.price)
      .reduce((sum, c) => sum + (c.enrollmentCount * (c.price || 0)), 0);

    const response: TeacherCoursesResponse = {
      courses: teacherCourses,
      total: teacherCourses.length,
      publishedCount,
      draftCount,
      totalEnrollments,
      totalRevenue,
    };

    return createSuccessResponse(response, 'Teacher courses retrieved successfully');
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    return createInternalErrorResponse('Failed to fetch teacher courses');
  }
}

/**
 * Student Progress Overview API Route
 * GET /api/student/progress - Get comprehensive learning progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { EnrollmentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import {
  createSuccessResponse,
  createErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user - Allow unverified users to see their own progress overview
    const authResult = await authMiddleware(request, {
      skipEmailVerification: true,
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
      return createErrorResponse(
        'USER_NOT_FOUND',
        'User not found in database',
        undefined,
        401
      );
    }

    const userId = dbUser.id;

    // Parse pagination params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    // Get enrollments with course details (paginated)
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: userId,
        status: { not: EnrollmentStatus.UNENROLLED },
      },
      include: {
        course: {
          include: {
            category: { select: { id: true, name: true } },
            teacher: {
              select: { id: true, firstName: true, lastName: true, profilePicture: true },
            },
            sections: {
              select: {
                id: true,
                title: true,
                order: true,
                lessons: {
                  select: { id: true, title: true, type: true, duration: true, order: true },
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { lastAccessedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get lesson IDs from current page's enrollments only
    const enrolledCourseIds = enrollments.map(e => e.courseId);

    // Get lesson progress only for the courses on this page
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        studentId: userId,
        lesson: { section: { courseId: { in: enrolledCourseIds } } },
      },
      select: {
        lessonId: true,
        completed: true,
        watchedSeconds: true,
        lastPosition: true,
        completedAt: true,
      },
    });

    // Create a map of lesson progress
    const lessonProgressMap = new Map(
      lessonProgress.map(lp => [lp.lessonId, lp])
    );

    // Calculate detailed progress for each course
    const courseProgress = enrollments.map(enrollment => {
      const course = enrollment.course;
      const allLessons = course.sections.flatMap(s => s.lessons);
      const totalLessons = allLessons.length;

      // Calculate completed lessons
      const completedLessons = allLessons.filter(
        lesson => lessonProgressMap.get(lesson.id)?.completed
      ).length;

      // Calculate total watch time
      const totalWatchTime = allLessons.reduce((sum, lesson) => {
        const progress = lessonProgressMap.get(lesson.id);
        return sum + (progress?.watchedSeconds || 0);
      }, 0);

      // Calculate total course duration
      const totalDuration = allLessons.reduce(
        (sum, lesson) => sum + (lesson.duration || 0),
        0
      );

      // Section-wise progress
      const sectionProgress = course.sections.map(section => {
        const sectionLessons = section.lessons;
        const completedInSection = sectionLessons.filter(
          lesson => lessonProgressMap.get(lesson.id)?.completed
        ).length;

        return {
          id: section.id,
          title: section.title,
          order: section.order,
          totalLessons: sectionLessons.length,
          completedLessons: completedInSection,
          progress:
            sectionLessons.length > 0
              ? Math.round((completedInSection / sectionLessons.length) * 100)
              : 0,
        };
      });

      // Find next lesson to continue
      let nextLesson = null;
      for (const section of course.sections) {
        for (const lesson of section.lessons) {
          const progress = lessonProgressMap.get(lesson.id);
          if (!progress?.completed) {
            nextLesson = {
              id: lesson.id,
              title: lesson.title,
              sectionTitle: section.title,
              type: lesson.type,
              duration: lesson.duration,
              lastPosition: progress?.lastPosition || 0,
            };
            break;
          }
        }
        if (nextLesson) break;
      }

      return {
        enrollmentId: enrollment.id,
        courseId: course.id,
        courseTitle: course.title,
        courseDescription: course.description,
        thumbnailUrl: course.thumbnailUrl,
        difficulty: course.difficulty,
        category: course.category,
        teacher: {
          id: course.teacher.id,
          name: `${course.teacher.firstName} ${course.teacher.lastName}`,
          avatarUrl: course.teacher.profilePicture,
        },
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        completedAt: enrollment.completedAt,
        progress: {
          percentage: enrollment.progress,
          totalLessons,
          completedLessons,
          totalDuration,
          watchedDuration: totalWatchTime,
          remainingDuration: totalDuration - totalWatchTime,
        },
        sectionProgress,
        nextLesson,
      };
    });

    // Calculate overall stats using aggregate queries (not paginated data)
    const [totalEnrolled, completedCourses, inProgressCount, lessonStats] = await Promise.all([
      prisma.enrollment.count({
        where: { studentId: userId, status: { not: EnrollmentStatus.UNENROLLED } },
      }),
      prisma.enrollment.count({
        where: { studentId: userId, status: EnrollmentStatus.COMPLETED },
      }),
      prisma.enrollment.count({
        where: { studentId: userId, status: EnrollmentStatus.ACTIVE },
      }),
      prisma.lessonProgress.aggregate({
        where: { studentId: userId },
        _count: { _all: true },
        _sum: { watchedSeconds: true },
      }),
    ]);
    const completedLessonCount = await prisma.lessonProgress.count({
      where: { studentId: userId, completed: true },
    });
    const inProgressCourses = inProgressCount;
    const totalLessonsCompleted = completedLessonCount;
    const totalWatchTime = lessonStats._sum.watchedSeconds || 0;

    // Get weekly activity (lessons completed per day)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyLessonActivity = await prisma.lessonProgress.findMany({
      where: {
        studentId: userId,
        completed: true,
        completedAt: { gte: sevenDaysAgo },
      },
      select: { completedAt: true },
    });

    // Group by day - ensure all 7 days are represented
    const dailyActivity: Record<string, number> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyActivity[dateStr] = 0;
    }

    weeklyLessonActivity.forEach(activity => {
      if (activity.completedAt) {
        const day = activity.completedAt.toISOString().split('T')[0];
        if (dailyActivity[day] !== undefined) {
          dailyActivity[day]++;
        }
      }
    });

    // Get category breakdown
    const categoryBreakdown = enrollments.reduce(
      (acc, enrollment) => {
        const categoryName =
          enrollment.course.category?.name || 'Uncategorized';
        if (!acc[categoryName]) {
          acc[categoryName] = { enrolled: 0, completed: 0, totalProgress: 0 };
        }
        acc[categoryName].enrolled++;
        if (enrollment.status === EnrollmentStatus.COMPLETED) {
          acc[categoryName].completed++;
        }
        acc[categoryName].totalProgress += enrollment.progress;
        return acc;
      },
      {} as Record<
        string,
        { enrolled: number; completed: number; totalProgress: number }
      >
    );

    const categoryStats = Object.entries(categoryBreakdown).map(
      ([name, stats]) => ({
        name,
        enrolled: stats.enrolled,
        completed: stats.completed,
        averageProgress: Math.round(stats.totalProgress / stats.enrolled),
      })
    );

    // Average progress across ALL enrollments (not just current page)
    const avgProgress = totalEnrolled > 0
      ? await prisma.enrollment.aggregate({
          where: { studentId: userId, status: { not: EnrollmentStatus.UNENROLLED } },
          _avg: { progress: true },
        })
      : null;

    return createSuccessResponse({
      overview: {
        totalEnrolled,
        completedCourses,
        inProgressCourses,
        totalLessonsCompleted,
        totalWatchTime,
        averageProgress: Math.round(avgProgress?._avg?.progress || 0),
      },
      courses: courseProgress,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalEnrolled / limit),
        hasMore: page * limit < totalEnrolled,
      },
      weeklyActivity: Object.entries(dailyActivity).map(([date, count]) => ({
        date,
        lessonsCompleted: count,
      })),
      categoryStats,
    });
  } catch (error) {
    console.error('[GET /api/student/progress] Error:', error);
    return createInternalErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch progress data'
    );
  }
}

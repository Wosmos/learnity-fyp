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
    // Authenticate user
    const authResult = await authMiddleware(request);

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

    // Get all enrollments with course details
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: userId,
        status: { not: EnrollmentStatus.UNENROLLED },
      },
      include: {
        course: {
          include: {
            category: true,
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
              },
            },
            sections: {
              include: {
                lessons: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { lastAccessedAt: 'desc' },
    });

    // Get lesson progress for all enrolled courses
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: { studentId: userId },
      include: {
        lesson: {
          include: {
            section: true,
          },
        },
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

    // Calculate overall stats
    const totalEnrolled = enrollments.length;
    const completedCourses = enrollments.filter(
      e => e.status === EnrollmentStatus.COMPLETED
    ).length;
    const inProgressCourses = enrollments.filter(
      e => e.status === EnrollmentStatus.ACTIVE && e.progress < 100
    ).length;

    const totalLessonsCompleted = lessonProgress.filter(
      lp => lp.completed
    ).length;
    const totalWatchTime = lessonProgress.reduce(
      (sum, lp) => sum + (lp.watchedSeconds || 0),
      0
    );

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

    return createSuccessResponse({
      overview: {
        totalEnrolled,
        completedCourses,
        inProgressCourses,
        totalLessonsCompleted,
        totalWatchTime,
        averageProgress:
          totalEnrolled > 0
            ? Math.round(
                enrollments.reduce((sum, e) => sum + e.progress, 0) /
                  totalEnrolled
              )
            : 0,
      },
      courses: courseProgress,
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

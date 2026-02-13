/**
 * Course Analytics API Route
 * GET /api/courses/[courseId]/analytics - Get analytics for a specific course
 *
 * Requirements covered:
 * - 9.1: Total enrollments, completions, and average rating per course
 * - 9.2: Student progress distribution
 * - 9.3: Quiz performance analytics
 * - 9.4: Lesson-wise engagement
 * - 9.5: Drop-off points identification
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';
import {
  createSuccessResponse,
  createErrorResponse,
  createAuthErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/courses/[courseId]/analytics
 * Get comprehensive analytics for a course
 * Requirements: 9.1-9.7
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { courseId } = await params;

    // Authenticate and verify teacher role
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

    // Verify course exists and user owns it
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            lessons: {
              include: {
                quiz: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return createErrorResponse(
        'COURSE_NOT_FOUND',
        'Course not found',
        undefined,
        404
      );
    }

    if (course.teacherId !== dbUser.id) {
      return createErrorResponse(
        'FORBIDDEN',
        'You do not own this course',
        undefined,
        403
      );
    }

    // Get enrollment statistics (Requirement 9.1)
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: {
        id: true,
        status: true,
        progress: true,
        enrolledAt: true,
        completedAt: true,
      },
    });

    const totalEnrollments = enrollments.length;
    const activeEnrollments = enrollments.filter(
      e => e.status === 'ACTIVE'
    ).length;
    const completedEnrollments = enrollments.filter(
      e => e.status === 'COMPLETED'
    ).length;
    const completionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0;

    // Get progress distribution (Requirement 9.2)
    const progressDistribution = {
      '0-25': enrollments.filter(e => e.progress >= 0 && e.progress < 25)
        .length,
      '25-50': enrollments.filter(e => e.progress >= 25 && e.progress < 50)
        .length,
      '50-75': enrollments.filter(e => e.progress >= 50 && e.progress < 75)
        .length,
      '75-100': enrollments.filter(e => e.progress >= 75 && e.progress <= 100)
        .length,
    };

    // Get quiz performance (Requirement 9.3)
    const quizIds = course.sections
      .flatMap(s => s.lessons)
      .filter(l => l.quiz)
      .map(l => l.quiz!.id);

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { quizId: { in: quizIds } },
      select: {
        quizId: true,
        score: true,
        passed: true,
        quiz: {
          select: {
            title: true,
            lesson: {
              select: { title: true },
            },
          },
        },
      },
    });

    // Calculate quiz stats
    const quizStats = quizIds.map(quizId => {
      const attempts = quizAttempts.filter(a => a.quizId === quizId);
      const quizInfo = attempts[0]?.quiz;

      return {
        quizId,
        title: quizInfo?.title || 'Unknown Quiz',
        lessonTitle: quizInfo?.lesson?.title || 'Unknown Lesson',
        totalAttempts: attempts.length,
        passRate:
          attempts.length > 0
            ? Math.round(
                (attempts.filter(a => a.passed).length / attempts.length) * 100
              )
            : 0,
        averageScore:
          attempts.length > 0
            ? Math.round(
                attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
              )
            : 0,
      };
    });

    // Get lesson engagement (Requirement 9.4)
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        lesson: {
          section: {
            courseId,
          },
        },
      },
      select: {
        lessonId: true,
        completed: true,
        watchedSeconds: true,
      },
    });

    const lessonEngagement = course.sections
      .flatMap(section =>
        section.lessons.map(lesson => {
          const progress = lessonProgress.filter(p => p.lessonId === lesson.id);
          const completions = progress.filter(p => p.completed).length;

          return {
            lessonId: lesson.id,
            title: lesson.title,
            sectionTitle: section.title,
            order: lesson.order,
            sectionOrder: section.order,
            totalViews: progress.length,
            completions,
            completionRate:
              progress.length > 0
                ? Math.round((completions / progress.length) * 100)
                : 0,
            averageWatchTime:
              progress.length > 0
                ? Math.round(
                    progress.reduce((sum, p) => sum + p.watchedSeconds, 0) /
                      progress.length
                  )
                : 0,
            duration: lesson.duration,
          };
        })
      )
      .sort((a, b) => {
        if (a.sectionOrder !== b.sectionOrder)
          return a.sectionOrder - b.sectionOrder;
        return a.order - b.order;
      });

    // Identify drop-off points (Requirement 9.5)
    const dropOffPoints = lessonEngagement
      .filter((lesson, index, arr) => {
        if (index === 0) return false;
        const prevLesson = arr[index - 1];
        const dropRate =
          prevLesson.completions > 0
            ? ((prevLesson.completions - lesson.completions) /
                prevLesson.completions) *
              100
            : 0;
        return dropRate > 20; // Significant drop-off threshold
      })
      .map(lesson => ({
        lessonId: lesson.lessonId,
        title: lesson.title,
        sectionTitle: lesson.sectionTitle,
        completionRate: lesson.completionRate,
      }));

    // Get recent activity (Requirement 9.6)
    const recentEnrollments = await prisma.enrollment.findMany({
      where: { courseId },
      orderBy: { enrolledAt: 'desc' },
      take: 10,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    });

    // Get reviews summary
    const reviews = await prisma.review.findMany({
      where: { courseId },
      select: { rating: true },
    });

    const ratingDistribution = {
      1: reviews.filter(r => r.rating === 1).length,
      2: reviews.filter(r => r.rating === 2).length,
      3: reviews.filter(r => r.rating === 3).length,
      4: reviews.filter(r => r.rating === 4).length,
      5: reviews.filter(r => r.rating === 5).length,
    };

    // Build analytics response
    const analytics = {
      overview: {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        completionRate,
        averageRating: Number(course.averageRating),
        reviewCount: course.reviewCount,
        totalDuration: course.totalDuration,
        lessonCount: course.lessonCount,
      },
      progressDistribution,
      quizPerformance: {
        totalQuizzes: quizIds.length,
        quizStats,
        overallPassRate:
          quizAttempts.length > 0
            ? Math.round(
                (quizAttempts.filter(a => a.passed).length /
                  quizAttempts.length) *
                  100
              )
            : 0,
        overallAverageScore:
          quizAttempts.length > 0
            ? Math.round(
                quizAttempts.reduce((sum, a) => sum + a.score, 0) /
                  quizAttempts.length
              )
            : 0,
      },
      lessonEngagement,
      dropOffPoints,
      ratingDistribution,
      recentActivity: recentEnrollments.map(e => ({
        studentId: e.student.id,
        studentName:
          `${e.student.firstName || ''} ${e.student.lastName || ''}`.trim() ||
          'Anonymous',
        profilePicture: e.student.profilePicture,
        enrolledAt: e.enrolledAt,
        progress: e.progress,
        status: e.status,
      })),
    };

    return createSuccessResponse(analytics, 'Analytics retrieved successfully');
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    return createInternalErrorResponse('Failed to fetch course analytics');
  }
}

/**
 * Course Progress API Route
 * GET /api/courses/[courseId]/progress - Get course progress for current user
 *
 * Requirements covered:
 * - 5.7: Show next lesson recommendation
 * - 5.8: Lock subsequent sections until previous section is 80% complete
 * - 7.1: Display overall course progress percentage
 * - 7.2: Show completed lessons with checkmark icons
 * - 7.3: Display section-wise progress bars
 * - 7.4: Mark course as completed when all lessons and quizzes done
 * - 7.6: Display total XP earned from course
 * - 7.7: Show time spent on course
 */

import { NextRequest, NextResponse } from 'next/server';
import { progressService } from '@/lib/services/progress.service';
import { ProgressError } from '@/lib/interfaces/progress.interface';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';
import {
  createSuccessResponse,
  createErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/courses/[courseId]/progress
 * Get comprehensive course progress for current user
 * Requirements: 5.7, 5.8, 7.1-7.7
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { courseId } = await params;

    if (!courseId) {
      return createErrorResponse(
        'INVALID_COURSE_ID',
        'Course ID is required',
        undefined,
        400
      );
    }

    // Authenticate user
    const authResult = await authMiddleware(request, {
      allowMultipleRoles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN],
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

    // Get course progress
    const courseProgress = await progressService.getCourseProgress(
      dbUser.id,
      courseId
    );

    // Get next lesson recommendation
    const nextLesson = await progressService.getNextLesson(dbUser.id, courseId);

    // Get time spent on course
    const timeSpent = await progressService.getTimeSpent(dbUser.id, courseId);

    // Get XP earned from this course (sum of XP activities for lessons in this course)
    const xpEarned = await getXPEarnedForCourse(dbUser.id, courseId);

    return createSuccessResponse(
      {
        ...courseProgress,
        timeSpent,
        xpEarned,
        nextLesson: nextLesson.lesson
          ? {
              lessonId: nextLesson.lesson.id,
              lessonTitle: nextLesson.lesson.title,
              sectionId: nextLesson.section?.id,
              sectionTitle: nextLesson.section?.title,
              isNextSection: nextLesson.isNextSection,
            }
          : null,
      },
      'Course progress retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching course progress:', error);

    if (error instanceof ProgressError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to fetch course progress');
  }
}

/**
 * Helper function to get XP earned for a specific course
 */
async function getXPEarnedForCourse(
  studentId: string,
  courseId: string
): Promise<number> {
  // Get all lesson IDs for the course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      sections: {
        include: {
          lessons: {
            select: { id: true },
            include: {
              quiz: {
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    return 0;
  }

  // Collect all lesson and quiz IDs
  const lessonIds = course.sections.flatMap(s => s.lessons.map(l => l.id));
  const quizIds = course.sections
    .flatMap(s => s.lessons)
    .filter(l => l.quiz)
    .map(l => l.quiz!.id);

  // Sum XP from lesson completions
  const lessonXP = await prisma.xPActivity.aggregate({
    where: {
      userId: studentId,
      reason: 'LESSON_COMPLETE',
      sourceId: { in: lessonIds },
    },
    _sum: {
      amount: true,
    },
  });

  // Sum XP from quiz passes
  const quizXP = await prisma.xPActivity.aggregate({
    where: {
      userId: studentId,
      reason: 'QUIZ_PASS',
      sourceId: { in: quizIds },
    },
    _sum: {
      amount: true,
    },
  });

  // Sum XP from course completion
  const courseXP = await prisma.xPActivity.aggregate({
    where: {
      userId: studentId,
      reason: 'COURSE_COMPLETE',
      sourceId: courseId,
    },
    _sum: {
      amount: true,
    },
  });

  return (
    (lessonXP._sum.amount ?? 0) +
    (quizXP._sum.amount ?? 0) +
    (courseXP._sum.amount ?? 0)
  );
}

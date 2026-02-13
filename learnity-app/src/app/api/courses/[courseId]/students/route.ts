/**
 * Course Students API Route
 * GET /api/courses/[courseId]/students - Get enrolled students for a course
 *
 * Requirements covered:
 * - 9.1: Teacher analytics - enrollment data
 * - 9.2: Student progress distribution
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
 * GET /api/courses/[courseId]/students
 * Get all enrolled students for a course with their progress
 * Requirements: 9.1, 9.2
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { courseId } = await params;
    const { searchParams } = new URL(request.url);

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
      select: { id: true, teacherId: true, title: true },
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

    // Parse query parameters
    const status = searchParams.get('status') || undefined;
    const minProgress = searchParams.get('minProgress')
      ? parseInt(searchParams.get('minProgress')!, 10)
      : undefined;
    const maxProgress = searchParams.get('maxProgress')
      ? parseInt(searchParams.get('maxProgress')!, 10)
      : undefined;
    const search = searchParams.get('search') || undefined;
    const page = searchParams.get('page')
      ? parseInt(searchParams.get('page')!, 10)
      : 1;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!, 10)
      : 20;

    // Build where clause
    const where: Record<string, unknown> = {
      courseId,
    };

    if (status) {
      where.status = status;
    }

    if (minProgress !== undefined || maxProgress !== undefined) {
      where.progress = {};
      if (minProgress !== undefined) {
        (where.progress as Record<string, number>).gte = minProgress;
      }
      if (maxProgress !== undefined) {
        (where.progress as Record<string, number>).lte = maxProgress;
      }
    }

    // Get total count
    const total = await prisma.enrollment.count({ where });

    // Get enrollments with student details
    let enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Filter by search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      enrollments = enrollments.filter(e => {
        const fullName =
          `${e.student.firstName || ''} ${e.student.lastName || ''}`.toLowerCase();
        const email = (e.student.email || '').toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }

    // Get lesson progress for each student
    const studentIds = enrollments.map(e => e.studentId);
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        studentId: { in: studentIds },
        lesson: {
          section: {
            courseId,
          },
        },
      },
      select: {
        studentId: true,
        completed: true,
        lessonId: true,
      },
    });

    // Get quiz attempts for each student
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        studentId: { in: studentIds },
        quiz: {
          lesson: {
            section: {
              courseId,
            },
          },
        },
      },
      select: {
        studentId: true,
        passed: true,
        score: true,
        quizId: true,
      },
    });

    // Build student data with progress details
    const students = enrollments.map(enrollment => {
      const studentLessonProgress = lessonProgress.filter(
        p => p.studentId === enrollment.studentId
      );
      const studentQuizAttempts = quizAttempts.filter(
        a => a.studentId === enrollment.studentId
      );

      // Get unique completed lessons
      const completedLessons = new Set(
        studentLessonProgress.filter(p => p.completed).map(p => p.lessonId)
      ).size;

      // Get unique passed quizzes
      const passedQuizzes = new Set(
        studentQuizAttempts.filter(a => a.passed).map(a => a.quizId)
      ).size;

      // Calculate average quiz score
      const avgQuizScore =
        studentQuizAttempts.length > 0
          ? Math.round(
              studentQuizAttempts.reduce((sum, a) => sum + a.score, 0) /
                studentQuizAttempts.length
            )
          : null;

      return {
        id: enrollment.id,
        studentId: enrollment.studentId,
        student: {
          id: enrollment.student.id,
          name:
            `${enrollment.student.firstName || ''} ${enrollment.student.lastName || ''}`.trim() ||
            'Anonymous',
          email: enrollment.student.email,
          profilePicture: enrollment.student.profilePicture,
        },
        status: enrollment.status,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        completedAt: enrollment.completedAt,
        completedLessons,
        passedQuizzes,
        avgQuizScore,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return createSuccessResponse(
      {
        courseTitle: course.title,
        students,
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
      'Students retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching course students:', error);
    return createInternalErrorResponse('Failed to fetch course students');
  }
}

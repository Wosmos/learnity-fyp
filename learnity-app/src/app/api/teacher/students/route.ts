/**
 * Teacher Students API Route
 * GET /api/teacher/students - Get all students enrolled in teacher's courses
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

export interface TeacherStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string | null;
  enrolledCourses: {
    courseId: string;
    courseTitle: string;
    progress: number;
    enrolledAt: Date;
    lastAccessedAt: Date;
    status: string;
  }[];
  totalProgress: number;
  lastActive: Date;
  totalCoursesEnrolled: number;
}

export interface TeacherStudentsResponse {
  students: TeacherStudent[];
  total: number;
  activeCount: number;
  completedCount: number;
  averageProgress: number;
}

/**
 * GET /api/teacher/students
 * Retrieve all students enrolled in teacher's courses with their progress
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

    // Get all enrollments for teacher's courses with student details
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          teacherId: dbUser.id,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
            lastLoginAt: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    });

    // Group enrollments by student
    const studentMap = new Map<string, TeacherStudent>();

    for (const enrollment of enrollments) {
      const studentId = enrollment.student.id;
      
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          id: studentId,
          firstName: enrollment.student.firstName,
          lastName: enrollment.student.lastName,
          email: enrollment.student.email,
          profilePicture: enrollment.student.profilePicture,
          enrolledCourses: [],
          totalProgress: 0,
          lastActive: enrollment.student.lastLoginAt || enrollment.lastAccessedAt,
          totalCoursesEnrolled: 0,
        });
      }

      const student = studentMap.get(studentId)!;
      student.enrolledCourses.push({
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        status: enrollment.status,
      });
    }

    // Calculate aggregated stats for each student
    const students: TeacherStudent[] = [];
    let totalActiveCount = 0;
    let totalCompletedCount = 0;
    let totalProgressSum = 0;

    for (const student of studentMap.values()) {
      const courseCount = student.enrolledCourses.length;
      const progressSum = student.enrolledCourses.reduce((sum, c) => sum + c.progress, 0);
      student.totalProgress = courseCount > 0 ? Math.round(progressSum / courseCount) : 0;
      student.totalCoursesEnrolled = courseCount;
      
      // Find most recent activity
      const mostRecentAccess = student.enrolledCourses.reduce((latest, c) => 
        c.lastAccessedAt > latest ? c.lastAccessedAt : latest, 
        student.enrolledCourses[0]?.lastAccessedAt || new Date()
      );
      student.lastActive = mostRecentAccess;

      // Count active and completed
      const activeEnrollments = student.enrolledCourses.filter(c => c.status === 'ACTIVE').length;
      const completedEnrollments = student.enrolledCourses.filter(c => c.status === 'COMPLETED').length;
      
      if (activeEnrollments > 0) totalActiveCount++;
      totalCompletedCount += completedEnrollments;
      totalProgressSum += student.totalProgress;

      students.push(student);
    }

    // Sort by last active
    students.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());

    const response: TeacherStudentsResponse = {
      students,
      total: students.length,
      activeCount: totalActiveCount,
      completedCount: totalCompletedCount,
      averageProgress: students.length > 0 ? Math.round(totalProgressSum / students.length) : 0,
    };

    return createSuccessResponse(response, 'Teacher students retrieved successfully');
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    return createInternalErrorResponse('Failed to fetch teacher students');
  }
}

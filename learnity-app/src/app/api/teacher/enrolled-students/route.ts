/**
 * Teacher Enrolled Students API
 * GET /api/teacher/enrolled-students - Get all enrolled students for teacher
 */

import { NextRequest, NextResponse } from 'next/server';
import { teacherSessionService } from '@/lib/services/teacher-session.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/teacher/enrolled-students
 * Get all students enrolled in teacher's courses
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate teacher
    const authResult = await authMiddleware(request, {
      requiredRole: UserRole.TEACHER,
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get enrolled students
    const students = await teacherSessionService.getEnrolledStudents(dbUser.id);

    return NextResponse.json({
      success: true,
      students,
    });
  } catch (error) {
    console.error('Failed to fetch enrolled students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrolled students' },
      { status: 500 }
    );
  }
}

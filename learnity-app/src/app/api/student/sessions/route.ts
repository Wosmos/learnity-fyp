/**
 * Student Sessions API
 * GET /api/student/sessions - Get student's sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { teacherSessionService } from '@/lib/services/teacher-session.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await authMiddleware(request, {
      requiredRole: UserRole.STUDENT,
    });

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.firebaseUid },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameter for upcoming only
    const { searchParams } = new URL(request.url);
    const upcomingOnly = searchParams.get('upcoming') === 'true';

    let sessions;
    if (upcomingOnly) {
      sessions = await teacherSessionService.getUpcomingSessions(dbUser.id);
    } else {
      sessions = await teacherSessionService.getStudentSessions(dbUser.id);
    }

    return NextResponse.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error('Failed to fetch student sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

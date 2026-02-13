/**
 * Start Session API
 * POST /api/teacher/sessions/[id]/start - Start scheduled session
 */

import { NextRequest, NextResponse } from 'next/server';
import { teacherSessionService } from '@/lib/services/teacher-session.service';
import { pushNotificationService } from '@/lib/services/push-notification.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const authResult = await authMiddleware(request, {
      requiredRole: UserRole.TEACHER,
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

    // Verify ownership
    const existingSession = await prisma.videoSession.findUnique({
      where: { id },
    });

    if (!existingSession || existingSession.teacherId !== dbUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Start session
    const session = await teacherSessionService.startSession(id);

    // Notify participants
    await pushNotificationService.notifySessionLive(id);

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Failed to start session:', error);
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    );
  }
}

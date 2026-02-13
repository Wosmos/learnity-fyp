/**
 * Join Session API
 * POST /api/student/sessions/[id]/join - Get token to join session
 */

import { NextRequest, NextResponse } from 'next/server';
import { teacherSessionService } from '@/lib/services/teacher-session.service';
import { hmsVideoService } from '@/lib/services/hms-video.service';
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
      requiredRole: UserRole.STUDENT,
    });

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.firebaseUid },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get session
    const session = await teacherSessionService.getSessionById(id);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify student is participant
    const isParticipant = (session as any).participants?.some(
      (p: any) => p.studentId === dbUser.id
    );

    if (!isParticipant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check session status
    if (session.status !== 'LIVE') {
      return NextResponse.json(
        { error: 'Session is not live yet' },
        { status: 400 }
      );
    }

    // Generate 100ms token
    if (!session.hmsRoomId) {
      return NextResponse.json(
        { error: 'Video room not available' },
        { status: 500 }
      );
    }

    const token = hmsVideoService.generateAuthToken({
      roomId: session.hmsRoomId,
      userId: dbUser.id,
      role: 'guest',
      userName: `${dbUser.firstName} ${dbUser.lastName}`,
    });

    // Track attendance
    await teacherSessionService.trackAttendance(id, dbUser.id, true);

    return NextResponse.json({
      success: true,
      token,
      roomId: session.hmsRoomId,
      streamChannelId: session.streamChannelId,
    });
  } catch (error) {
    console.error('Failed to join session:', error);
    return NextResponse.json(
      { error: 'Failed to join session' },
      { status: 500 }
    );
  }
}

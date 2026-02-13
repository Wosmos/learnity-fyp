/**
 * Instant Call API
 * POST /api/teacher/sessions/instant-call - Start instant call from chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { teacherSessionService } from '@/lib/services/teacher-session.service';
import { pushNotificationService } from '@/lib/services/push-notification.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const InstantCallSchema = z.object({
  chatId: z.string(),
  title: z.string().min(1).max(200),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
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

    const body = await request.json();
    const validatedData = InstantCallSchema.parse(body);

    // Verify chat ownership
    const chat = await prisma.teacherGroupChat.findUnique({
      where: { id: validatedData.chatId },
      include: { members: true },
    });

    if (!chat || chat.teacherId !== dbUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Start instant call
    const session = await teacherSessionService.startInstantCall(
      validatedData.chatId,
      dbUser.id,
      validatedData.title
    );

    // Notify participants
    const participantIds = chat.members.map((m) => m.studentId);
    await pushNotificationService.notifyInstantCallStarted(
      session.id,
      participantIds,
      validatedData.title
    );

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to start instant call:', error);
    return NextResponse.json(
      { error: 'Failed to start instant call' },
      { status: 500 }
    );
  }
}

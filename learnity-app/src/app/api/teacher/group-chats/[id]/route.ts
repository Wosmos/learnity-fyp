/**
 * Teacher Group Chat Management API
 * DELETE /api/teacher/group-chats/[id] - Delete group chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { teacherSessionService } from '@/lib/services/teacher-session.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/teacher/group-chats/[id]
 * Delete a group chat
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
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

    // Verify ownership
    const chat = await prisma.teacherGroupChat.findUnique({
      where: { id },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    if (chat.teacherId !== dbUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete group chat
    await teacherSessionService.deleteGroupChat(id);

    return NextResponse.json({
      success: true,
      message: 'Group chat deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete group chat:', error);
    return NextResponse.json(
      { error: 'Failed to delete group chat' },
      { status: 500 }
    );
  }
}

/**
 * Group Chat Members API
 * POST   /api/teacher/group-chats/[id]/members - Add students
 * DELETE /api/teacher/group-chats/[id]/members - Remove student
 */

import { NextRequest, NextResponse } from 'next/server';
import { teacherSessionService } from '@/lib/services/teacher-session.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const AddMembersSchema = z.object({
  studentIds: z.array(z.string()).min(1),
});

const RemoveMemberSchema = z.object({
  studentId: z.string(),
});

/**
 * POST /api/teacher/group-chats/[id]/members
 * Add students to group chat
 */
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
    const chat = await prisma.teacherGroupChat.findUnique({
      where: { id },
    });

    if (!chat || chat.teacherId !== dbUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = AddMembersSchema.parse(body);

    await teacherSessionService.addStudentsToGroupChat(
      id,
      validatedData.studentIds
    );

    return NextResponse.json({
      success: true,
      message: 'Students added successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to add students:', error);
    return NextResponse.json(
      { error: 'Failed to add students' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teacher/group-chats/[id]/members
 * Remove student from group chat
 */
export async function DELETE(
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
    const chat = await prisma.teacherGroupChat.findUnique({
      where: { id },
    });

    if (!chat || chat.teacherId !== dbUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = RemoveMemberSchema.parse(body);

    await teacherSessionService.removeStudentFromGroupChat(
      id,
      validatedData.studentId
    );

    return NextResponse.json({
      success: true,
      message: 'Student removed successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to remove student:', error);
    return NextResponse.json(
      { error: 'Failed to remove student' },
      { status: 500 }
    );
  }
}

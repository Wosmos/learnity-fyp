/**
 * Teacher Group Chats API
 * GET  /api/teacher/group-chats - List teacher's group chats
 * POST /api/teacher/group-chats - Create new group chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { teacherSessionService } from '@/lib/services/teacher-session.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const CreateGroupChatSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  studentIds: z.array(z.string()).min(1),
});

/**
 * GET /api/teacher/group-chats
 * List all group chats for the authenticated teacher
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

    // Get group chats
    const groupChats = await teacherSessionService.getTeacherGroupChats(dbUser.id);

    return NextResponse.json({
      success: true,
      groupChats,
    });
  } catch (error) {
    console.error('Failed to fetch group chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group chats' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teacher/group-chats
 * Create a new group chat
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateGroupChatSchema.parse(body);

    // Create group chat
    const groupChat = await teacherSessionService.createGroupChat({
      teacherId: dbUser.id,
      name: validatedData.name,
      description: validatedData.description,
      studentIds: validatedData.studentIds,
    });

    return NextResponse.json({
      success: true,
      groupChat,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create group chat:', error);
    return NextResponse.json(
      { error: 'Failed to create group chat' },
      { status: 500 }
    );
  }
}

/**
 * Direct Messages API
 * GET /api/chat/direct - Get user's direct message channels
 * POST /api/chat/direct - Create a direct message channel with another user
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { streamChatService } from '@/lib/services/stream-chat.service';
import {
  createSuccessResponse,
  createAuthErrorResponse,
  createErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

/**
 * GET /api/chat/direct
 * Get all chat channels (DMs and Group Chats) for the authenticated user
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const authResult = await authMiddleware(request);

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

    // 1. Get all DM channels
    const dmChannels = await prisma.directMessageChannel.findMany({
      where: {
        OR: [{ user1Id: dbUser.id }, { user2Id: dbUser.id }],
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // 2. Get all Teacher Group Chats (as teacher or member)
    const teacherGroupChats = await prisma.teacherGroupChat.findMany({
      where: {
        OR: [
          { teacherId: dbUser.id },
          { members: { some: { studentId: dbUser.id } } },
        ],
      },
    });

    // Enrich DMs
    const enrichedDMs = await Promise.all(
      dmChannels.map(async channel => {
        const otherUserId =
          channel.user1Id === dbUser.id ? channel.user2Id : channel.user1Id;

        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            role: true,
          },
        });

        return {
          id: channel.id,
          streamChannelId: channel.streamChannelId,
          lastMessageAt: channel.lastMessageAt,
          createdAt: channel.createdAt,
          type: 'dm',
          otherUser: otherUser
            ? {
                id: otherUser.id,
                name: `${otherUser.firstName} ${otherUser.lastName}`,
                profilePicture: otherUser.profilePicture,
                role: otherUser.role,
              }
            : null,
        };
      })
    );

    // Map Group Chats
    const enrichedGroups = teacherGroupChats.map(chat => ({
      id: chat.id,
      streamChannelId: chat.streamChannelId,
      lastMessageAt: null, // We don't track this yet in DB for groups
      createdAt: chat.createdAt,
      type: 'group',
      name: chat.name,
      description: chat.description,
      otherUser: null,
    }));

    // Merge and sort
    const allChannels = [...enrichedDMs, ...enrichedGroups].sort((a, b) => {
      const dateA = a.lastMessageAt || a.createdAt;
      const dateB = b.lastMessageAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    return createSuccessResponse(
      {
        channels: allChannels,
        total: allChannels.length,
      },
      'Chat channels retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching chat channels:', error);
    return createInternalErrorResponse('Failed to fetch chat channels');
  }
}

/**
 * POST /api/chat/direct
 * Create a direct message channel with another user
 * Body: { userId: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const authResult = await authMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Parse body
    const body = await request.json();
    const { userId: targetUserId } = body;

    if (!targetUserId) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'userId is required',
        undefined,
        400
      );
    }

    // Get current user from database
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.firebaseUid },
      select: { id: true, firstName: true, lastName: true, role: true },
    });

    if (!dbUser) {
      return createAuthErrorResponse('User not found in database');
    }

    // Can't message yourself
    if (dbUser.id === targetUserId) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Cannot create a channel with yourself',
        undefined,
        400
      );
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        profilePicture: true,
      },
    });

    if (!targetUser) {
      return createErrorResponse('NOT_FOUND', 'User not found', undefined, 404);
    }

    // Check if channel already exists (sort IDs for consistent lookup)
    const sortedIds = [dbUser.id, targetUserId].sort();

    const existingChannel = await prisma.directMessageChannel.findFirst({
      where: {
        user1Id: sortedIds[0],
        user2Id: sortedIds[1],
      },
    });

    if (existingChannel) {
      return createSuccessResponse(
        {
          id: existingChannel.id,
          streamChannelId: existingChannel.streamChannelId,
          isNew: false,
          otherUser: {
            id: targetUser.id,
            name: `${targetUser.firstName} ${targetUser.lastName}`,
            profilePicture: targetUser.profilePicture,
            role: targetUser.role,
          },
        },
        'Direct message channel already exists'
      );
    }

    // Create GetStream channel
    let streamChannelId: string;
    try {
      streamChannelId = await streamChatService.createDirectMessageChannel(
        dbUser.id,
        targetUserId
      );
    } catch (error) {
      console.error('Failed to create GetStream DM channel:', error);
      return createInternalErrorResponse('Failed to create chat channel');
    }

    // Save to database
    const channel = await prisma.directMessageChannel.create({
      data: {
        user1Id: sortedIds[0],
        user2Id: sortedIds[1],
        streamChannelId,
      },
    });

    return createSuccessResponse(
      {
        id: channel.id,
        streamChannelId: channel.streamChannelId,
        isNew: true,
        otherUser: {
          id: targetUser.id,
          name: `${targetUser.firstName} ${targetUser.lastName}`,
          profilePicture: targetUser.profilePicture,
          role: targetUser.role,
        },
      },
      'Direct message channel created successfully'
    );
  } catch (error) {
    console.error('Error creating DM channel:', error);
    return createInternalErrorResponse(
      'Failed to create direct message channel'
    );
  }
}

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
 * Get all direct message channels for the authenticated user
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

    // Get all DM channels where user is a participant
    const channels = await prisma.directMessageChannel.findMany({
      where: {
        OR: [
          { user1Id: dbUser.id },
          { user2Id: dbUser.id },
        ],
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Enrich with other user's details
    const enrichedChannels = await Promise.all(
      channels.map(async (channel) => {
        const otherUserId = channel.user1Id === dbUser.id ? channel.user2Id : channel.user1Id;
        
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
          otherUser: otherUser ? {
            id: otherUser.id,
            name: `${otherUser.firstName} ${otherUser.lastName}`,
            profilePicture: otherUser.profilePicture,
            role: otherUser.role,
          } : null,
        };
      })
    );

    return createSuccessResponse({
      channels: enrichedChannels,
      total: enrichedChannels.length,
    }, 'Direct message channels retrieved successfully');
  } catch (error) {
    console.error('Error fetching DM channels:', error);
    return createInternalErrorResponse('Failed to fetch direct message channels');
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
      return createErrorResponse('VALIDATION_ERROR', 'userId is required', undefined, 400);
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
      return createErrorResponse('VALIDATION_ERROR', 'Cannot create a channel with yourself', undefined, 400);
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, firstName: true, lastName: true, role: true, profilePicture: true },
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
      return createSuccessResponse({
        id: existingChannel.id,
        streamChannelId: existingChannel.streamChannelId,
        isNew: false,
        otherUser: {
          id: targetUser.id,
          name: `${targetUser.firstName} ${targetUser.lastName}`,
          profilePicture: targetUser.profilePicture,
          role: targetUser.role,
        },
      }, 'Direct message channel already exists');
    }

    // Create GetStream channel
    let streamChannelId: string;
    try {
      streamChannelId = await streamChatService.createDirectMessageChannel(dbUser.id, targetUserId);
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

    return createSuccessResponse({
      id: channel.id,
      streamChannelId: channel.streamChannelId,
      isNew: true,
      otherUser: {
        id: targetUser.id,
        name: `${targetUser.firstName} ${targetUser.lastName}`,
        profilePicture: targetUser.profilePicture,
        role: targetUser.role,
      },
    }, 'Direct message channel created successfully');
  } catch (error) {
    console.error('Error creating DM channel:', error);
    return createInternalErrorResponse('Failed to create direct message channel');
  }
}

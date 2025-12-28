/**
 * GetStream Chat Token API
 * GET /api/chat/token - Generate user token for GetStream chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { streamChatService } from '@/lib/services/stream-chat.service';
import {
  createSuccessResponse,
  createAuthErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

/**
 * GET /api/chat/token
 * Generate a GetStream user token for the authenticated user
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
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        profilePicture: true,
        role: true,
      },
    });

    if (!dbUser) {
      return createAuthErrorResponse('User not found in database');
    }

    // Upsert user in GetStream
    try {
      await streamChatService.upsertUser({
        id: dbUser.id,
        name: `${dbUser.firstName} ${dbUser.lastName}`,
        image: dbUser.profilePicture || undefined,
        role: dbUser.role === 'TEACHER' ? 'teacher' : dbUser.role === 'ADMIN' ? 'admin' : 'student',
      });
    } catch (error) {
      console.error('Failed to upsert user in GetStream:', error);
      // Continue anyway - user might already exist
    }

    // Generate token
    const token = streamChatService.generateUserToken(dbUser.id);

    return createSuccessResponse({
      token,
      userId: dbUser.id,
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY,
    }, 'Chat token generated successfully');
  } catch (error) {
    console.error('Error generating chat token:', error);
    return createInternalErrorResponse('Failed to generate chat token');
  }
}

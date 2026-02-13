/**
 * Gamification Progress API Route
 * GET /api/gamification/progress - Get student's gamification progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { gamificationService } from '@/lib/services/gamification.service';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import {
  createSuccessResponse,
  createErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user - Allow unverified users to see their own gamification progress
    const authResult = await authMiddleware(request, {
      skipEmailVerification: true,
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
      return createErrorResponse(
        'USER_NOT_FOUND',
        'User not found in database',
        undefined,
        401
      );
    }

    const userId = dbUser.id;

    // Get gamification progress
    const progress = await gamificationService.getStudentProgress(userId);

    // Get badges with metadata
    const badgesWithMetadata = await gamificationService.getUserBadges(userId);

    // Get XP breakdown by reason
    const xpBreakdown = await prisma.xPActivity.groupBy({
      by: ['reason'],
      where: { userId },
      _sum: { amount: true },
      _count: true,
    });

    return createSuccessResponse({
      ...progress,
      badgesWithMetadata,
      xpBreakdown: xpBreakdown.map(item => ({
        reason: item.reason,
        totalXP: item._sum.amount || 0,
        count: item._count,
      })),
    });
  } catch (error) {
    console.error('[GET /api/gamification/progress] Error:', error);
    return createInternalErrorResponse(
      error instanceof Error
        ? error.message
        : 'Failed to fetch gamification progress'
    );
  }
}

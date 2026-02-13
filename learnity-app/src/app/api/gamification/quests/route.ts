/**
 * Quests API Route
 * GET /api/gamification/quests - Get user's active quests with progress
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

/**
 * GET /api/gamification/quests
 * Get user's active quests with progress
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
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

    // Get active quests with progress
    const quests = await gamificationService.getActiveQuests(userId);

    // Group quests by frequency
    const dailyQuests = quests.filter(q => q.quest.frequency === 'DAILY');
    const weeklyQuests = quests.filter(q => q.quest.frequency === 'WEEKLY');
    const monthlyQuests = quests.filter(q => q.quest.frequency === 'MONTHLY');
    const oneTimeQuests = quests.filter(q => q.quest.frequency === 'ONE_TIME');

    // Calculate stats
    const totalQuests = quests.length;
    const completedQuests = quests.filter(q => q.status === 'COMPLETED').length;
    const inProgressQuests = quests.filter(q => q.status === 'IN_PROGRESS').length;
    const totalAvailableXP = quests
      .filter(q => q.status !== 'COMPLETED')
      .reduce((sum, q) => sum + q.quest.xpReward, 0);

    return createSuccessResponse({
      quests,
      questsByFrequency: {
        daily: dailyQuests,
        weekly: weeklyQuests,
        monthly: monthlyQuests,
        oneTime: oneTimeQuests,
      },
      stats: {
        total: totalQuests,
        completed: completedQuests,
        inProgress: inProgressQuests,
        totalAvailableXP,
      },
    });
  } catch (error) {
    console.error('[GET /api/gamification/quests] Error:', error);
    return createInternalErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch quests'
    );
  }
}

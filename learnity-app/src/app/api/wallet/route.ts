/**
 * Wallet API Route
 * GET /api/wallet - Get user's wallet and recent transactions
 */

import { NextRequest, NextResponse } from 'next/server';
import { walletService } from '@/lib/services/wallet.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { prisma } from '@/lib/prisma';
import {
  createSuccessResponse,
  createErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;

    // Get DB user
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.firebaseUid },
      select: { id: true },
    });

    if (!dbUser) {
      return createErrorResponse(
        'USER_NOT_FOUND',
        'User not found',
        undefined,
        404
      );
    }

    const wallet = await walletService.getOrCreateWallet(dbUser.id);

    // Get recent transactions
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return createSuccessResponse(
      {
        wallet,
        transactions,
      },
      'Wallet data retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return createInternalErrorResponse();
  }
}

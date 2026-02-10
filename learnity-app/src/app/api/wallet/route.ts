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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;

    // Optimized: Single query with select to get user ID and wallet data
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.firebaseUid },
      select: { 
        id: true,
        wallet: {
          select: {
            id: true,
            balance: true,
            currency: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
    });

    if (!dbUser) {
      return createErrorResponse(
        'USER_NOT_FOUND',
        'User not found',
        undefined,
        404
      );
    }

    // Get or create wallet if it doesn't exist
    let wallet = dbUser.wallet;
    if (!wallet) {
      wallet = await walletService.getOrCreateWallet(dbUser.id);
    }

    // Optimized: Get recent transactions with specific fields only
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: dbUser.id },
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        description: true,
        referenceId: true,
        createdAt: true,
      },
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

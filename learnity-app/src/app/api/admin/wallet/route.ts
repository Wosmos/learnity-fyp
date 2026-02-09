/**
 * Admin Wallet Transactions API
 * GET /api/admin/wallet/transactions - Get all transactions (filterable)
 * PATCH /api/admin/wallet/transactions/[id] - Update status (Approve/Reject)
 */

import { NextRequest, NextResponse } from 'next/server';
import { walletService } from '@/lib/services/wallet.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { UserRole } from '@/types/auth';
import { prisma } from '@/lib/prisma';
import {
  createSuccessResponse,
  createErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, {
      requiredRole: UserRole.ADMIN,
    });
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const transactions = await prisma.walletTransaction.findMany({
      where: status ? { status: status as any } : {},
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return createSuccessResponse(transactions, 'Transactions retrieved');
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return createInternalErrorResponse();
  }
}

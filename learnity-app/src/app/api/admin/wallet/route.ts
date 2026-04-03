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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20', 10));

    const where = status ? { status: status as any } : {};

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return createSuccessResponse(
      {
        transactions,
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
      'Transactions retrieved'
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return createInternalErrorResponse();
  }
}

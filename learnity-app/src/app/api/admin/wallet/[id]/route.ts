/**
 * Admin Wallet Transaction Update API
 * PATCH /api/admin/wallet/transactions/[id] - Approve or Reject a transaction
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

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: transactionId } = await params;
    const authResult = await authMiddleware(request, {
      requiredRole: UserRole.ADMIN,
    });
    if (authResult instanceof NextResponse) return authResult;

    const { user: adminUser } = authResult;
    // Get DB user for adminId
    const dbAdmin = await prisma.user.findUnique({
      where: { firebaseUid: adminUser.firebaseUid },
      select: { id: true },
    });

    if (!dbAdmin)
      return createErrorResponse(
        'ADMIN_NOT_FOUND',
        'Admin not found',
        undefined,
        404
      );

    const body = await request.json();
    const { status, receiptUrl } = body;

    if (!['COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
      return createErrorResponse(
        'INVALID_STATUS',
        'Invalid status provided',
        undefined,
        400
      );
    }

    // Check transaction type to determine which method to use
    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      select: { type: true },
    });

    if (!transaction) {
      return createErrorResponse(
        'TRANSACTION_NOT_FOUND',
        'Transaction not found',
        undefined,
        404
      );
    }

    let updatedTransaction;
    if (transaction.type === 'WITHDRAWAL') {
      // Use withdrawal processing method
      updatedTransaction = await walletService.processWithdrawal(
        transactionId,
        status as any,
        dbAdmin.id,
        receiptUrl
      );
    } else {
      // Use regular transaction processing
      updatedTransaction = await walletService.processTransaction(
        transactionId,
        status as any,
        dbAdmin.id
      );
    }

    return createSuccessResponse(
      updatedTransaction,
      `Transaction ${status.toLowerCase()} successfully`
    );
  } catch (error) {
    console.error('Error processing transaction:', error);
    return createInternalErrorResponse();
  }
}

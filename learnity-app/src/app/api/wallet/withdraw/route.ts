/**
 * Wallet Withdrawal API Route
 * POST /api/wallet/withdraw - Create a withdrawal request (Teacher)
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
import { z } from 'zod';

const WithdrawalSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1'),
  description: z.string().min(1, 'Description is required'),
  metadata: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.firebaseUid },
      select: { id: true, role: true },
    });

    if (!dbUser)
      return createErrorResponse(
        'USER_NOT_FOUND',
        'User not found',
        undefined,
        404
      );

    // Only teachers can withdraw
    if (dbUser.role !== 'TEACHER') {
      return createErrorResponse(
        'UNAUTHORIZED',
        'Only teachers can request withdrawals',
        undefined,
        403
      );
    }

    const body = await request.json();
    const validatedData = WithdrawalSchema.parse(body);

    const withdrawalRequest = await walletService.createWithdrawalRequest(
      dbUser.id,
      validatedData.amount,
      validatedData.description,
      validatedData.metadata
    );

    return createSuccessResponse(
      withdrawalRequest,
      'Withdrawal request submitted. Admin will process your request and send payment proof.',
      undefined,
      201
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid data',
        error.errors,
        400
      );
    }
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return createErrorResponse(
        'INSUFFICIENT_FUNDS',
        error.message,
        undefined,
        400
      );
    }
    console.error('Error creating withdrawal:', error);
    return createInternalErrorResponse();
  }
}

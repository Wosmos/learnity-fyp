/**
 * Wallet Deposit API Route
 * POST /api/wallet/deposit - Create a pending deposit request
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

const DepositSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1'),
  description: z.string().min(1, 'Description/Reference is required'),
  referenceId: z.string().optional(),
  receiptUrl: z.string().min(1, 'Proof of payment is required'),
  metadata: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.firebaseUid },
      select: { id: true },
    });

    if (!dbUser)
      return createErrorResponse(
        'USER_NOT_FOUND',
        'User not found',
        undefined,
        404
      );

    const body = await request.json();
    const validatedData = DepositSchema.parse(body);

    const depositRequest = await walletService.createDepositRequest(
      dbUser.id,
      validatedData.amount,
      validatedData.description,
      validatedData.referenceId,
      validatedData.receiptUrl,
      validatedData.metadata
    );

    return createSuccessResponse(
      depositRequest,
      'Deposit request submitted. Please wait for admin approval.',
      undefined,
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid data',
        error.errors,
        400
      );
    }
    console.error('Error creating deposit:', error);
    return createInternalErrorResponse();
  }
}

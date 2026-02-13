/**
 * Wallet Service Implementation
 * Handles all wallet management and transaction operations
 */

import {
  PrismaClient,
  Wallet,
  WalletTransaction,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import {
  IWalletService,
  WalletError,
  WalletErrorCode,
} from '../interfaces/wallet.interface';
import { prisma as defaultPrisma } from '@/lib/prisma';

export class WalletService implements IWalletService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  async getOrCreateWallet(userId: string): Promise<Wallet> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (wallet) return wallet;

    return this.prisma.wallet.create({
      data: {
        userId,
        balance: 0,
      },
    });
  }

  async createDepositRequest(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
    receiptUrl?: string,
    metadata?: any
  ): Promise<WalletTransaction> {
    const wallet = await this.getOrCreateWallet(userId);

    return this.prisma.walletTransaction.create({
      data: {
        userId,
        walletId: wallet.id,
        amount,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.PENDING,
        description,
        referenceId,
        receiptUrl,
        metadata,
      },
    });
  }

  async processTransaction(
    transactionId: string,
    status: TransactionStatus,
    adminId: string
  ): Promise<WalletTransaction> {
    return this.prisma.$transaction(async tx => {
      const transaction = await tx.walletTransaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        throw new WalletError(
          'Transaction not found',
          WalletErrorCode.TRANSACTION_NOT_FOUND,
          404
        );
      }

      if (transaction.status !== TransactionStatus.PENDING) {
        throw new WalletError(
          'Transaction already processed',
          WalletErrorCode.TRANSACTION_ALREADY_PROCESSED
        );
      }

      const updatedTransaction = await tx.walletTransaction.update({
        where: { id: transactionId },
        data: { status, updatedAt: new Date() },
      });

      // If completed and it was a deposit, update balance
      if (
        status === TransactionStatus.COMPLETED &&
        transaction.type === TransactionType.DEPOSIT
      ) {
        await tx.wallet.update({
          where: { userId: transaction.userId },
          data: { balance: { increment: transaction.amount } },
        });
      }

      // If completed and it was a withdrawal (though not used yet), decrement
      if (
        status === TransactionStatus.COMPLETED &&
        transaction.type === TransactionType.WITHDRAWAL
      ) {
        await tx.wallet.update({
          where: { userId: transaction.userId },
          data: { balance: { decrement: transaction.amount } },
        });
      }

      return updatedTransaction;
    });
  }

  async hasSufficientBalance(userId: string, amount: number): Promise<boolean> {
    const wallet = await this.getOrCreateWallet(userId);
    return Number(wallet.balance) >= amount;
  }

  async executePurchase(
    userId: string,
    amount: number,
    description: string,
    metadata?: any
  ): Promise<WalletTransaction> {
    return this.prisma.$transaction(async tx => {
      const wallet = await this.getOrCreateWallet(userId);

      if (Number(wallet.balance) < amount) {
        throw new WalletError(
          'Insufficient funds',
          WalletErrorCode.INSUFFICIENT_FUNDS
        );
      }

      // Deduct balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });

      // Create transaction record
      return tx.walletTransaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount,
          type: TransactionType.PURCHASE,
          status: TransactionStatus.COMPLETED,
          description,
          metadata,
        },
      });
    });
  }

  async createWithdrawalRequest(
    userId: string,
    amount: number,
    description: string,
    metadata?: any
  ): Promise<WalletTransaction> {
    const wallet = await this.getOrCreateWallet(userId);

    if (Number(wallet.balance) < amount) {
      throw new WalletError(
        'Insufficient funds for withdrawal',
        WalletErrorCode.INSUFFICIENT_FUNDS
      );
    }

    return this.prisma.walletTransaction.create({
      data: {
        userId,
        walletId: wallet.id,
        amount,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING,
        description,
        metadata,
      },
    });
  }

  async processWithdrawal(
    transactionId: string,
    status: TransactionStatus,
    adminId: string,
    receiptUrl?: string
  ): Promise<WalletTransaction> {
    return this.prisma.$transaction(async tx => {
      const transaction = await tx.walletTransaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        throw new WalletError(
          'Transaction not found',
          WalletErrorCode.TRANSACTION_NOT_FOUND,
          404
        );
      }

      if (transaction.status !== TransactionStatus.PENDING) {
        throw new WalletError(
          'Transaction already processed',
          WalletErrorCode.TRANSACTION_ALREADY_PROCESSED
        );
      }

      if (transaction.type !== TransactionType.WITHDRAWAL) {
        throw new WalletError(
          'Invalid transaction type',
          WalletErrorCode.INVALID_TRANSACTION_TYPE
        );
      }

      const updatedTransaction = await tx.walletTransaction.update({
        where: { id: transactionId },
        data: {
          status,
          receiptUrl,
          updatedAt: new Date(),
        },
      });

      // If completed, deduct from wallet balance
      if (status === TransactionStatus.COMPLETED) {
        await tx.wallet.update({
          where: { userId: transaction.userId },
          data: { balance: { decrement: transaction.amount } },
        });
      }

      return updatedTransaction;
    });
  }
}

export const walletService = new WalletService();

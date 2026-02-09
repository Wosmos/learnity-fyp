/**
 * Wallet Service Interface
 * Defines the contract for wallet and transaction operations
 */

import {
  Wallet,
  WalletTransaction,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

export interface WalletWithTransactions extends Wallet {
  transactions: WalletTransaction[];
}

export interface IWalletService {
  /**
   * Get or create a wallet for a user
   */
  getOrCreateWallet(userId: string): Promise<Wallet>;

  /**
   * Create a deposit request (Pending admin approval)
   */
  createDepositRequest(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
    metadata?: any
  ): Promise<WalletTransaction>;

  /**
   * Process a transaction (Complete or Fail)
   * Only admins should call this
   */
  processTransaction(
    transactionId: string,
    status: TransactionStatus,
    adminId: string
  ): Promise<WalletTransaction>;

  /**
   * Check if user has enough balance
   */
  hasSufficientBalance(userId: string, amount: number): Promise<boolean>;

  /**
   * Deduct balance for a purchase
   */
  executePurchase(
    userId: string,
    amount: number,
    description: string,
    metadata?: any
  ): Promise<WalletTransaction>;
}

export enum WalletErrorCode {
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  TRANSACTION_NOT_FOUND = 'TRANSACTION_NOT_FOUND',
  TRANSACTION_ALREADY_PROCESSED = 'TRANSACTION_ALREADY_PROCESSED',
}

export class WalletError extends Error {
  constructor(
    message: string,
    public code: WalletErrorCode,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

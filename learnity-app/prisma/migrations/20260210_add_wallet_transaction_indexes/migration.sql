-- Add composite indexes for wallet transaction queries optimization
-- This migration adds indexes to improve query performance for wallet page

-- Add composite index for userId + createdAt (DESC) for recent transactions query
CREATE INDEX IF NOT EXISTS "wallet_transactions_userId_createdAt_idx" ON "wallet_transactions"("userId", "createdAt" DESC);

-- Add composite index for userId + status for filtering by status
CREATE INDEX IF NOT EXISTS "wallet_transactions_userId_status_idx" ON "wallet_transactions"("userId", "status");

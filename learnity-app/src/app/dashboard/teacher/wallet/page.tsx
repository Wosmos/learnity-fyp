import { prisma } from '@/lib/prisma';
import { requireServerUser } from '@/lib/auth/server';
import { TeacherWalletClient } from './TeacherWalletClient';

export default async function TeacherWalletPage() {
  const user = await requireServerUser();

  const [wallet, transactions] = await Promise.all([
    prisma.wallet.findUnique({
      where: { userId: user.id },
      select: { balance: true, currency: true },
    }),
    prisma.walletTransaction.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        description: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ]);

  // Compute wallet stats from transactions
  const completedEarnings = transactions.filter(
    t => t.type === 'EARNING' && t.status === 'COMPLETED'
  );
  const completedWithdrawals = transactions.filter(
    t => t.type === 'WITHDRAWAL' && t.status === 'COMPLETED'
  );
  const pendingEarnings = transactions.filter(
    t => t.type === 'EARNING' && t.status === 'PENDING'
  );

  const totalEarnings = completedEarnings.reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );
  const withdrawnAmount = completedWithdrawals.reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );
  const pendingAmount = pendingEarnings.reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );

  const walletData = wallet
    ? {
        balance: Number(wallet.balance),
        currency: wallet.currency,
        totalEarnings,
        pendingEarnings: pendingAmount,
        withdrawnAmount,
      }
    : null;

  const serializedTransactions = transactions.map(t => ({
    id: t.id,
    amount: Number(t.amount),
    type: t.type as 'EARNING' | 'WITHDRAWAL' | 'DEPOSIT' | 'PURCHASE' | 'REFUND' | 'REWARD',
    status: t.status as 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED',
    description: t.description,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <TeacherWalletClient
      walletData={walletData}
      transactions={serializedTransactions}
    />
  );
}

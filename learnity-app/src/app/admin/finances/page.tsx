import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { FinancesClient } from './FinancesClient';

export const metadata: Metadata = {
  title: 'Finances | Admin',
  description: 'Manage deposits, transactions, and revenue.',
};

export default async function FinancesPage() {
  const [pendingDeposits, recentTransactions, revenueStats] = await Promise.all([
    // Pending deposit approval queue
    prisma.walletTransaction.findMany({
      where: { type: 'DEPOSIT', status: 'PENDING' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    }),
    // Recent transactions (all types)
    prisma.walletTransaction.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    // Revenue aggregates
    prisma.walletTransaction.groupBy({
      by: ['type'],
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const totalRevenue = revenueStats.find(r => r.type === 'PURCHASE')?._sum.amount;
  const totalDeposits = revenueStats.find(r => r.type === 'DEPOSIT')?._sum.amount;
  const totalWithdrawals = revenueStats.find(r => r.type === 'WITHDRAWAL')?._sum.amount;

  const serialize = (t: any) => ({
    id: t.id,
    amount: Number(t.amount),
    type: t.type,
    status: t.status,
    description: t.description,
    referenceId: t.referenceId,
    receiptUrl: t.receiptUrl,
    createdAt: t.createdAt.toISOString(),
    user: t.user ? {
      id: t.user.id,
      name: `${t.user.firstName} ${t.user.lastName}`,
      email: t.user.email,
    } : null,
  });

  return (
    <FinancesClient
      pendingDeposits={pendingDeposits.map(serialize)}
      transactions={recentTransactions.map(serialize)}
      revenue={{
        totalRevenue: Number(totalRevenue || 0),
        totalDeposits: Number(totalDeposits || 0),
        totalWithdrawals: Number(totalWithdrawals || 0),
        pendingCount: pendingDeposits.length,
      }}
    />
  );
}

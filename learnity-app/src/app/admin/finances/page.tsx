import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { toISO } from '@/lib/cache/server-cache';
import { FinancesClient } from './FinancesClient';

export const metadata: Metadata = {
  title: 'Finances | Admin',
  description: 'Manage deposits, transactions, and revenue.',
};

const getFinanceData = unstable_cache(
  async () => {
    return Promise.all([
      prisma.walletTransaction.findMany({
        where: { type: 'DEPOSIT', status: 'PENDING' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
        take: 50,
      }),
      prisma.walletTransaction.findMany({
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.walletTransaction.groupBy({
        by: ['type'],
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);
  },
  ['admin-finances'],
  { revalidate: false, tags: ['admin-stats'] }
);

export default async function FinancesPage() {
  const [pendingDeposits, recentTransactions, revenueStats] = await getFinanceData();

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
    createdAt: toISO(t.createdAt)!,
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

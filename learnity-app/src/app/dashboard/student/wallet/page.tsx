import { prisma } from '@/lib/prisma';
import { requireServerUser } from '@/lib/auth/server';
import { StudentWalletClient } from './StudentWalletClient';

export default async function WalletPage() {
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
        referenceId: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  return (
    <StudentWalletClient
      wallet={wallet ? { balance: Number(wallet.balance), currency: wallet.currency } : null}
      transactions={transactions.map(t => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type,
        status: t.status,
        description: t.description,
        createdAt: t.createdAt.toISOString(),
        referenceId: t.referenceId,
      }))}
    />
  );
}

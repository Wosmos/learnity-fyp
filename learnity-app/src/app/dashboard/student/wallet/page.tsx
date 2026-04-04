import { requireServerUser } from '@/lib/auth/server';
import { getCachedUserWallet, toISO } from '@/lib/cache/server-cache';
import { StudentWalletClient } from './StudentWalletClient';

export default async function WalletPage() {
  const user = await requireServerUser();

  const { wallet, transactions } = await getCachedUserWallet(user.id);

  return (
    <StudentWalletClient
      wallet={wallet ? { balance: Number(wallet.balance), currency: wallet.currency } : null}
      transactions={transactions.map(t => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type as 'DEPOSIT' | 'PURCHASE' | 'WITHDRAWAL' | 'REWARD' | 'REFUND',
        status: t.status as 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED',
        description: t.description,
        referenceId: t.referenceId,
        createdAt: toISO(t.createdAt)!,
      }))}
    />
  );
}

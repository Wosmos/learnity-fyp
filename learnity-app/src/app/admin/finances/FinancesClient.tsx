'use client';

import { useState } from 'react';
import {
  ArrowDownLeft, ArrowUpRight, Clock,
  CheckCircle, XCircle, Receipt, TrendingUp, Wallet,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/stats-card';
import { DataGrid, type ColumnDef } from '@/components/ui/data-grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  referenceId: string | null;
  receiptUrl: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

interface Props {
  pendingDeposits: Transaction[];
  transactions: Transaction[];
  revenue: {
    totalRevenue: number;
    totalDeposits: number;
    totalWithdrawals: number;
    pendingCount: number;
  };
}

const statusBadge: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  FAILED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
};

const transactionColumns: ColumnDef<Transaction>[] = [
  { key: 'user', header: 'User', className: 'font-medium', render: (tx) => tx.user?.name || '—' },
  {
    key: 'type', header: 'Type',
    render: (tx) => <Badge variant='outline' className='text-xs'>{tx.type}</Badge>,
  },
  {
    key: 'amount', header: 'Amount', className: 'font-bold',
    render: (tx) => {
      const isDebit = ['PURCHASE', 'WITHDRAWAL'].includes(tx.type);
      return (
        <span className={isDebit ? 'text-red-600' : 'text-green-600'}>
          {isDebit ? '-' : '+'}Rs. {tx.amount.toLocaleString()}
        </span>
      );
    },
  },
  {
    key: 'status', header: 'Status',
    render: (tx) => <Badge className={`${statusBadge[tx.status] || ''} border-0 text-xs`}>{tx.status}</Badge>,
  },
  { key: 'description', header: 'Description', className: 'text-muted-foreground', maxWidth: 'max-w-[200px]' },
  {
    key: 'date', header: 'Date', align: 'right', className: 'text-sm text-muted-foreground',
    render: (tx) => new Date(tx.createdAt).toLocaleDateString(),
  },
];

export function FinancesClient({ pendingDeposits: initialPending, transactions, revenue }: Props) {
  const [pendingDeposits, setPendingDeposits] = useState(initialPending);
  const api = useAuthenticatedApi();
  const { toast } = useToast();

  const handleDepositAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.put(`/api/admin/wallet/${id}`, {
        status: action === 'approve' ? 'COMPLETED' : 'CANCELLED',
      });
      setPendingDeposits(prev => prev.filter(d => d.id !== id));
      toast({ title: 'Success', description: `Deposit ${action}d.` });
    } catch {
      toast({ title: 'Error', description: `Failed to ${action} deposit.`, variant: 'destructive' });
    }
  };

  const depositColumns: ColumnDef<Transaction>[] = [
    {
      key: 'user', header: 'User',
      render: (d) => (
        <div>
          <p className='font-medium'>{d.user?.name}</p>
          <p className='text-xs text-muted-foreground'>{d.user?.email}</p>
        </div>
      ),
    },
    { key: 'amount', header: 'Amount', className: 'font-bold text-green-600', render: (d) => `Rs. ${d.amount.toLocaleString()}` },
    { key: 'referenceId', header: 'Reference', className: 'text-sm text-muted-foreground font-mono', render: (d) => d.referenceId || '—' },
    {
      key: 'date', header: 'Date', className: 'text-sm text-muted-foreground',
      render: (d) => new Date(d.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions', header: 'Actions', align: 'right',
      render: (d) => (
        <div className='flex justify-end gap-2'>
          <Button size='sm' onClick={() => handleDepositAction(d.id, 'approve')} className='bg-green-600 hover:bg-green-700 h-8'>
            <CheckCircle className='h-3 w-3 mr-1' />Approve
          </Button>
          <Button size='sm' variant='outline' onClick={() => handleDepositAction(d.id, 'reject')} className='text-red-600 h-8'>
            <XCircle className='h-3 w-3 mr-1' />Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight text-foreground'>Finances</h1>
        <p className='text-muted-foreground'>Manage deposits, transactions, and platform revenue.</p>
      </div>

      {/* Revenue Stats */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <MetricCard title='Total Revenue' value={`Rs. ${revenue.totalRevenue.toLocaleString()}`} icon={TrendingUp} subtitle='Platform earnings' />
        <MetricCard title='Total Deposits' value={`Rs. ${revenue.totalDeposits.toLocaleString()}`} icon={ArrowDownLeft} subtitle='All deposits' />
        <MetricCard title='Withdrawals' value={`Rs. ${revenue.totalWithdrawals.toLocaleString()}`} icon={ArrowUpRight} subtitle='Teacher payouts' />
        <MetricCard title='Pending Deposits' value={revenue.pendingCount} icon={Clock} subtitle='Awaiting approval' />
      </div>

      <Tabs defaultValue='deposits'>
        <TabsList className='h-11'>
          <TabsTrigger value='deposits' className='gap-2'>
            <Receipt className='h-4 w-4' />Deposit Queue
            {pendingDeposits.length > 0 && (
              <Badge variant='destructive' className='h-5 px-1.5 text-[10px]'>{pendingDeposits.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value='transactions' className='gap-2'>
            <Wallet className='h-4 w-4' />All Transactions
          </TabsTrigger>
        </TabsList>

        {/* Deposits Queue */}
        <TabsContent value='deposits' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Pending Deposit Approvals</CardTitle>
              <CardDescription>Review and approve student wallet top-up requests</CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              {pendingDeposits.length === 0 ? (
                <div className='py-12 text-center text-muted-foreground'>
                  <CheckCircle className='h-10 w-10 mx-auto mb-3 text-green-500' />
                  <p>All deposits have been processed.</p>
                </div>
              ) : (
                <DataGrid columns={depositColumns} data={pendingDeposits} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Transactions */}
        <TabsContent value='transactions' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All platform financial transactions</CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              <DataGrid columns={transactionColumns} data={transactions} emptyMessage='No transactions yet.' pageSize={20} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  DollarSign, ArrowDownLeft, ArrowUpRight, Clock,
  CheckCircle, XCircle, Receipt, TrendingUp, Wallet,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
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

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight text-foreground'>Finances</h1>
        <p className='text-muted-foreground'>Manage deposits, transactions, and platform revenue.</p>
      </div>

      {/* Revenue Stats */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {[
          { label: 'Total Revenue', value: `Rs. ${revenue.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Total Deposits', value: `Rs. ${revenue.totalDeposits.toLocaleString()}`, icon: ArrowDownLeft, color: 'text-blue-600 bg-blue-50' },
          { label: 'Withdrawals', value: `Rs. ${revenue.totalWithdrawals.toLocaleString()}`, icon: ArrowUpRight, color: 'text-red-600 bg-red-50' },
          { label: 'Pending Deposits', value: String(revenue.pendingCount), icon: Clock, color: 'text-amber-600 bg-amber-50' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-2xl font-bold'>{s.value}</p>
                  <p className='text-sm text-muted-foreground'>{s.label}</p>
                </div>
                <div className={`p-2 rounded-lg ${s.color}`}>
                  <s.icon className='h-5 w-5' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='pl-6'>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className='text-right pr-6'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingDeposits.map(deposit => (
                      <TableRow key={deposit.id}>
                        <TableCell className='pl-6'>
                          <div>
                            <p className='font-medium'>{deposit.user?.name}</p>
                            <p className='text-xs text-muted-foreground'>{deposit.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className='font-bold text-green-600'>Rs. {deposit.amount.toLocaleString()}</TableCell>
                        <TableCell className='text-sm text-muted-foreground font-mono'>{deposit.referenceId || '—'}</TableCell>
                        <TableCell className='text-sm text-muted-foreground'>
                          {new Date(deposit.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className='text-right pr-6'>
                          <div className='flex justify-end gap-2'>
                            <Button size='sm' onClick={() => handleDepositAction(deposit.id, 'approve')} className='bg-green-600 hover:bg-green-700 h-8'>
                              <CheckCircle className='h-3 w-3 mr-1' />Approve
                            </Button>
                            <Button size='sm' variant='outline' onClick={() => handleDepositAction(deposit.id, 'reject')} className='text-red-600 h-8'>
                              <XCircle className='h-3 w-3 mr-1' />Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='pl-6'>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className='text-right pr-6'>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(tx => (
                    <TableRow key={tx.id}>
                      <TableCell className='pl-6 font-medium'>{tx.user?.name || '—'}</TableCell>
                      <TableCell>
                        <Badge variant='outline' className='text-xs'>{tx.type}</Badge>
                      </TableCell>
                      <TableCell className={`font-bold ${['PURCHASE', 'WITHDRAWAL'].includes(tx.type) ? 'text-red-600' : 'text-green-600'}`}>
                        {['PURCHASE', 'WITHDRAWAL'].includes(tx.type) ? '-' : '+'}Rs. {tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusBadge[tx.status] || ''} border-0 text-xs`}>{tx.status}</Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground max-w-[200px] truncate'>{tx.description}</TableCell>
                      <TableCell className='text-right pr-6 text-sm text-muted-foreground'>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

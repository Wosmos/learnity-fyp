'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCcw,
  Wallet as WalletIcon,
  User as UserIcon,
  Banknote,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  referenceId?: string;
  receiptUrl?: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AdminWalletPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const { toast } = useToast();
  const authenticatedFetch = useAuthenticatedFetch();

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await authenticatedFetch(
        `/api/admin/wallet?status=${filterStatus === 'ALL' ? '' : filterStatus}`
      );
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch transactions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterStatus]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/wallet/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: `Transaction marked as ${status.toLowerCase()}`,
        });
        fetchTransactions();
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update transaction',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge className='bg-emerald-500/10 text-emerald-500 border-emerald-500/20'>
            Completed
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className='bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'>
            Pending Review
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className='bg-rose-500/10 text-rose-500 border-rose-500/20'>
            Rejected
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  return (
    <div className='p-8 max-w-[1600px] mx-auto space-y-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent dark:from-white dark:to-slate-400'>
            Financial Management
          </h1>
          <p className='text-slate-500 mt-1'>
            Review and approve student deposit requests
          </p>
        </div>

        <div className='flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl'>
          {['PENDING', 'COMPLETED', 'ALL'].map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setFilterStatus(status)}
              className={
                filterStatus === status
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500'
              }
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        <Card className='lg:col-span-1 border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-indigo-600 text-white overflow-hidden'>
          <CardHeader className='relative z-10'>
            <CardTitle className='text-lg font-medium opacity-80 uppercase tracking-widest flex items-center gap-2'>
              <Clock className='w-4 h-4' /> Pending Requests
            </CardTitle>
            <div className='mt-4 flex items-baseline gap-2'>
              <span className='text-5xl font-black'>
                {transactions.filter(t => t.status === 'PENDING').length}
              </span>
              <span className='text-indigo-200'>items</span>
            </div>
          </CardHeader>
          <div className='absolute -bottom-10 -right-10 opacity-10'>
            <RefreshCcw className='w-48 h-48 animate-spin-slow' />
          </div>
        </Card>

        <div className='lg:col-span-3'>
          <Card className='border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden rounded-2xl'>
            <Table>
              <TableHeader className='bg-slate-50 dark:bg-slate-900/50'>
                <TableRow>
                  <TableHead className='pl-6 font-bold uppercase text-[10px] tracking-widest text-slate-400'>
                    Student
                  </TableHead>
                  <TableHead className='font-bold uppercase text-[10px] tracking-widest text-slate-400'>
                    Transaction ID
                  </TableHead>
                  <TableHead className='font-bold uppercase text-[10px] tracking-widest text-slate-400'>
                    Amount
                  </TableHead>
                  <TableHead className='font-bold uppercase text-[10px] tracking-widest text-slate-400'>
                    Status
                  </TableHead>
                  <TableHead className='font-bold uppercase text-[10px] tracking-widest text-slate-400'>
                    Receipt
                  </TableHead>
                  <TableHead className='text-right pr-6 font-bold uppercase text-[10px] tracking-widest text-slate-400'>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow
                        key={i}
                        className='animate-pulse h-20 border-b border-slate-100 dark:border-slate-800/50'
                      >
                        <TableCell
                          colSpan={5}
                          className='text-center italic opacity-20'
                        >
                          Refreshing global finances...
                        </TableCell>
                      </TableRow>
                    ))
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='h-64 text-center'>
                      <div className='flex flex-col items-center justify-center opacity-40 italic'>
                        <Banknote className='w-16 h-16 mb-4' />
                        No transactions found for this filter
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence>
                    {transactions.map(tx => (
                      <TableRow
                        key={tx.id}
                        className='group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800/50'
                      >
                        <TableCell className='pl-6 py-5'>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500'>
                              {tx.user.firstName[0]}
                              {tx.user.lastName[0]}
                            </div>
                            <div className='flex flex-col'>
                              <span className='font-bold text-slate-900 dark:text-white'>
                                {tx.user.firstName} {tx.user.lastName}
                              </span>
                              <span className='text-xs text-slate-400 font-medium'>
                                {tx.user.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-mono text-xs font-bold text-indigo-500'>
                              {tx.referenceId || 'N/A'}
                            </span>
                            <span className='text-[10px] text-slate-400'>
                              {format(new Date(tx.createdAt), 'MMM dd | HH:mm')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className='font-black text-slate-900 dark:text-white tabular-nums'>
                            <span className='text-[10px] mr-1 opacity-50 font-normal'>
                              PKR
                            </span>
                            {tx.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell>
                          {tx.receiptUrl ? (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => setSelectedReceipt(tx.receiptUrl!)}
                              className='p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-colors'
                            >
                              <Eye className='w-4 h-4' />
                            </Button>
                          ) : (
                            <span className='text-xs text-slate-400 italic'>
                              No proof
                            </span>
                          )}
                        </TableCell>
                        <TableCell className='text-right pr-6'>
                          {tx.status === 'PENDING' ? (
                            <div className='flex justify-end gap-2'>
                              <Button
                                size='sm'
                                className='bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm'
                                onClick={() =>
                                  handleUpdateStatus(tx.id, 'COMPLETED')
                                }
                              >
                                <CheckCircle2 className='w-4 h-4 mr-1' />{' '}
                                Approve
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                className='border-rose-200 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg hover:border-rose-500'
                                onClick={() =>
                                  handleUpdateStatus(tx.id, 'FAILED')
                                }
                              >
                                <XCircle className='w-4 h-4 mr-1' /> Reject
                              </Button>
                            </div>
                          ) : (
                            <span className='text-xs italic text-slate-400'>
                              Processed
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>

      <Dialog
        open={!!selectedReceipt}
        onOpenChange={open => !open && setSelectedReceipt(null)}
      >
        <DialogContent className='max-w-3xl p-0 overflow-hidden bg-white dark:bg-slate-900 border-none rounded-3xl'>
          <DialogHeader className='p-6 border-b border-slate-100 dark:border-slate-800'>
            <DialogTitle className='flex items-center gap-2'>
              <Banknote className='w-5 h-5 text-indigo-600' />
              Payment Proof Verification
            </DialogTitle>
          </DialogHeader>
          <div className='p-2 bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[400px]'>
            {selectedReceipt && (
              <img
                src={selectedReceipt}
                alt='Payment Receipt'
                className='max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-white/20'
              />
            )}
          </div>
          <div className='p-4 bg-white dark:bg-slate-900 text-center'>
            <Button
              className='w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-6 rounded-2xl'
              onClick={() => setSelectedReceipt(null)}
            >
              Close Viewer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

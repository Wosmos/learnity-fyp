'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  History,
  CreditCard,
  Banknote,
  Copy,
  Check,
  Image as ImageIcon,
  Upload,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface Wallet {
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PURCHASE' | 'REFUND' | 'REWARD';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  createdAt: string;
  referenceId?: string;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const authenticatedFetch = useAuthenticatedFetch();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Max size is 2MB',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchWalletData = async () => {
    try {
      const res = await authenticatedFetch('/api/wallet');
      const data = await res.json();
      if (data.success) {
        setWallet(data.data.wallet);
        setTransactions(data.data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleTopUp = async () => {
    if (!topUpAmount || isNaN(Number(topUpAmount))) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }

    if (!receiptUrl) {
      toast({
        title: 'Proof Required',
        description: 'Please upload a screenshot of your transaction.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authenticatedFetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(topUpAmount),
          description: 'JazzCash/EasyPaisa Deposit',
          referenceId: referenceId,
          receiptUrl: receiptUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Deposit request submitted for approval',
        });
        setIsTopUpOpen(false);
        setTopUpAmount('');
        setReferenceId('');
        setReceiptUrl('');
        setPreviewUrl(null);
        fetchWalletData();
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
        description: 'Failed to submit request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge className='bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20'>
            Completed
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className='bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20'>
            Pending
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className='bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20'>
            Failed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className='bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/20'>
            Cancelled
          </Badge>
        );
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
      case 'REWARD':
      case 'REFUND':
        return <ArrowDownLeft className='w-4 h-4 text-emerald-500' />;
      case 'PURCHASE':
      case 'WITHDRAWAL':
        return <ArrowUpRight className='w-4 h-4 text-rose-500' />;
    }
  };

  return (
    <div className='p-6 max-w-6xl mx-auto space-y-8'>
      {/* Header Section */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div className=' px-8'>
          <h1 className='text-3xl font-black text-slate-900 uppercase italic tracking-tighter'>
            My <span className='text-indigo-600'>Wallet</span>
          </h1>
          <p className='text-slate-500 text-sm font-medium'>
            Manage your balance and course purchases.
          </p>
        </div>

        <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
          <DialogTrigger asChild>
            <Button className='bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95'>
              <Plus className='w-4 h-4 mr-2' /> Top Up Balance
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[450px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-3xl'>
            <div className='max-h-[85vh] overflow-y-auto p-6 space-y-6'>
              <DialogHeader>
                <DialogTitle className='text-2xl font-bold'>
                  Top Up Wallet
                </DialogTitle>
                <DialogDescription className='text-slate-500'>
                  Follow the instructions below to add funds to your wallet.
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-6 py-4'>
                {/* Payment Instructions */}
                <div className='bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20 space-y-3'>
                  <h4 className='font-semibold text-indigo-900 dark:text-indigo-400 flex items-center'>
                    <Banknote className='w-4 h-4 mr-2' /> Payment Details
                  </h4>
                  <div className='space-y-2 text-sm text-indigo-800 dark:text-indigo-300'>
                    <div className='flex flex-col gap-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-indigo-100 dark:border-indigo-500/20'>
                      <div className='flex justify-between items-center'>
                        <span className='font-bold text-xs uppercase tracking-wider'>
                          JazzCash / EasyPaisa
                        </span>
                        <Badge className='bg-indigo-600 text-[8px]'>
                          Active 24/7
                        </Badge>
                      </div>
                      <div className='flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-inner'>
                        <span className='text-xl font-black tracking-tight text-indigo-600 dark:text-indigo-400'>
                          0306-2248224
                        </span>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 hover:bg-indigo-50 dark:hover:bg-indigo-900/50'
                          onClick={() => copyToClipboard('0306-2248224')}
                        >
                          {copied ? (
                            <Check className='h-4 w-4 text-emerald-500' />
                          ) : (
                            <Copy className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className='bg-amber-50 dark:bg-amber-500/10 p-2 rounded-lg border border-amber-100 dark:border-amber-500/20'>
                      <p className='text-[10px] text-amber-800 dark:text-amber-400 font-medium leading-tight'>
                        Steps: 1. Send amount to above number. 2. Capture
                        screenshot. 3. Upload proof & enter TID below.
                      </p>
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='amount'>Amount (PKR)</Label>
                    <Input
                      id='amount'
                      placeholder='e.g. 1000'
                      type='number'
                      value={topUpAmount}
                      onChange={e => setTopUpAmount(e.target.value)}
                      className='h-12 text-lg font-bold border-slate-200 focus:ring-indigo-500'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='ref'>Transaction ID</Label>
                    <Input
                      id='ref'
                      placeholder='e.g. 123456789'
                      value={referenceId}
                      onChange={e => setReferenceId(e.target.value)}
                      className='h-12 border-slate-200 focus:ring-indigo-500'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Upload Receipt Screenshot</Label>
                    <div
                      className={`relative border-2 border-dashed rounded-2xl p-4 transition-all ${
                        previewUrl
                          ? 'border-emerald-500/50 bg-emerald-50/30'
                          : 'border-slate-200 hover:border-indigo-500'
                      }`}
                    >
                      {previewUrl ? (
                        <div className='relative aspect-video rounded-lg overflow-hidden border border-emerald-100 shadow-sm bg-white'>
                          <img
                            src={previewUrl}
                            alt='Receipt Preview'
                            className='w-full h-full object-contain'
                          />
                          <button
                            onClick={() => {
                              setPreviewUrl(null);
                              setReceiptUrl('');
                            }}
                            className='absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors'
                          >
                            <XCircle className='w-4 h-4' />
                          </button>
                        </div>
                      ) : (
                        <div
                          className='flex flex-col items-center justify-center py-4 space-y-2 cursor-pointer'
                          onClick={() =>
                            document.getElementById('receipt-upload')?.click()
                          }
                        >
                          <div className='w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center'>
                            <Upload className='w-6 h-6 text-indigo-600' />
                          </div>
                          <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                            Click to upload screenshot
                          </p>
                          <p className='text-[10px] text-slate-400'>
                            Max 2MB (JPG, PNG)
                          </p>
                        </div>
                      )}
                      <input
                        id='receipt-upload'
                        type='file'
                        accept='image/*'
                        onChange={handleFileChange}
                        className='hidden'
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className='pb-2'>
                <Button
                  className='w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/20'
                  onClick={handleTopUp}
                  disabled={
                    isSubmitting || !topUpAmount || !referenceId || !receiptUrl
                  }
                >
                  {isSubmitting ? (
                    <span className='flex items-center gap-2'>
                      <Loader2 className='w-5 h-5 animate-spin' /> Submitting...
                    </span>
                  ) : (
                    'Complete Deposit'
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Section */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='md:col-span-2'
        >
          <div className='relative overflow-hidden rounded-3xl bg-indigo-600 p-8 text-white shadow-2xl'>
            <div className='absolute top-0 right-0 p-8 opacity-10'>
              <WalletIcon className='w-32 h-32' />
            </div>
            <div className='relative z-10 space-y-6'>
              <p className='text-indigo-100 font-medium tracking-wider uppercase text-sm'>
                Available Balance
              </p>
              <div className='flex items-baseline gap-2'>
                <span className='text-2xl font-light opacity-80'>Rs.</span>
                <h2 className='text-6xl font-bold tracking-tighter tabular-nums'>
                  {isLoading ? '---' : wallet?.balance?.toLocaleString() || '0'}
                </h2>
              </div>
              <div className='flex gap-4 pt-4'>
                <div className='bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20'>
                  <p className='text-[10px] text-white/60 uppercase font-bold tracking-widest'>
                    Currency
                  </p>
                  <p className='font-semibold'>{wallet?.currency || 'PKR'}</p>
                </div>
                <div className='bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20'>
                  <p className='text-[10px] text-white/60 uppercase font-bold tracking-widest'>
                    Account Status
                  </p>
                  <div className='flex items-center gap-1'>
                    <div className='w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' />
                    <p className='font-semibold text-xs'>Verified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Flair */}
            <div className='absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl' />
            <div className='absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl' />
          </div>
        </motion.div>

        <Card className='rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-center text-center p-8 space-y-4'>
          <div className='w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2'>
            <CreditCard className='w-8 h-8 text-emerald-500' />
          </div>
          <CardTitle className='text-xl'>Quick Info</CardTitle>
          <CardDescription className='text-sm'>
            All purchases are instantly processed once funds are in your wallet.
            Top-up approvals take up to 2-4 hours.
          </CardDescription>
          <div className='pt-4 grid grid-cols-2 gap-2 text-xs'>
            <div className='p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl'>
              <p className='font-bold text-slate-900 dark:text-white'>
                {transactions.filter(t => t.type === 'PURCHASE').length}
              </p>
              <p className='text-slate-500'>Purchases</p>
            </div>
            <div className='p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl'>
              <p className='font-bold text-emerald-500'>
                {transactions.filter(t => t.status === 'COMPLETED').length}
              </p>
              <p className='text-slate-500'>Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transactions Section */}
      <Card className='rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm'>
        <CardHeader className='flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/50 px-8 py-6'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center'>
              <History className='w-5 h-5 text-indigo-600 dark:text-indigo-400' />
            </div>
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest financial activities
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow className='hover:bg-transparent px-8'>
                <TableHead className='w-[100px] pl-8'>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right pr-8'>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell
                        colSpan={5}
                        className='h-16 text-center text-slate-400 italic'
                      >
                        <div className='flex items-center justify-center gap-2'>
                          <Clock className='w-4 h-4 animate-spin' /> Loading
                          your transactions...
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='h-32 text-center text-slate-500'
                  >
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map(tx => (
                  <TableRow
                    key={tx.id}
                    className='group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors'
                  >
                    <TableCell className='pl-8'>
                      <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors'>
                          {getTypeIcon(tx.type)}
                        </div>
                        <span className='text-xs font-bold text-slate-600 dark:text-slate-400'>
                          {tx.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col'>
                        <span className='font-medium text-slate-900 dark:text-white'>
                          {tx.description}
                        </span>
                        {tx.referenceId && (
                          <span className='text-[10px] text-slate-400 font-mono'>
                            ID: {tx.referenceId}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='text-slate-500 text-sm'>
                      {format(new Date(tx.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    <TableCell className='text-right pr-8'>
                      <span
                        className={`font-bold tabular-nums ${['PURCHASE', 'WITHDRAWAL'].includes(tx.type) ? 'text-rose-500' : 'text-emerald-500'}`}
                      >
                        {['PURCHASE', 'WITHDRAWAL'].includes(tx.type)
                          ? '-'
                          : '+'}
                        <span className='text-xs mr-1'>Rs.</span>
                        {tx.amount.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

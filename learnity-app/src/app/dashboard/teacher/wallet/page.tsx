'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// --- Types ---
interface WalletData {
  balance: number;
  currency: string;
  totalEarnings: number;
  pendingEarnings: number;
  withdrawnAmount: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'EARNING' | 'WITHDRAWAL' | 'DEPOSIT' | 'PURCHASE' | 'REFUND' | 'REWARD';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  createdAt: string;
  metadata?: any;
}

// --- Sub-Components ---
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorClass,
  bgClass,
}: any) => (
  <Card className='border shadow-sm'>
    <CardContent className='p-6'>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-slate-500 mb-1'>{title}</p>
          <h3 className='text-3xl font-bold text-slate-900 mb-1'>{value}</h3>
          {subtitle && (
            <p className='text-xs text-slate-400 flex items-center gap-1'>
              {trend && (
                <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>
                  {trend > 0 ? '+' : ''}
                  {trend}%
                </span>
              )}
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgClass}`}>
          <Icon className={`h-6 w-6 ${colorClass}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
  const getStatusBadge = (status: string) => {
    const styles = {
      COMPLETED: 'bg-emerald-100 text-emerald-700',
      PENDING: 'bg-amber-100 text-amber-700',
      FAILED: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-slate-100 text-slate-700',
    };
    return (
      <Badge
        className={`${styles[status as keyof typeof styles]} border-0 text-xs`}
      >
        {status}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EARNING':
        return <ArrowDownRight className='h-4 w-4 text-green-600' />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className='h-4 w-4 text-blue-600' />;
      case 'DEPOSIT':
        return <ArrowDownRight className='h-4 w-4 text-green-600' />;
      default:
        return <DollarSign className='h-4 w-4 text-slate-600' />;
    }
  };

  const isCredit = ['EARNING', 'DEPOSIT', 'REFUND', 'REWARD'].includes(
    transaction.type
  );

  return (
    <div className='flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-100 last:border-0'>
      <div className='flex items-center gap-4 flex-1'>
        <div className='p-2 rounded-lg bg-slate-50'>
          {getTypeIcon(transaction.type)}
        </div>
        <div className='flex-1 min-w-0'>
          <p className='font-medium text-slate-900 text-sm truncate'>
            {transaction.description}
          </p>
          <p className='text-xs text-slate-500 flex items-center gap-2 mt-0.5'>
            <Calendar className='h-3 w-3' />
            {new Date(transaction.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <div className='text-right'>
          <p
            className={`font-bold text-sm ${
              isCredit ? 'text-green-600' : 'text-slate-900'
            }`}
          >
            {isCredit ? '+' : '-'}PKR{' '}
            {Math.abs(transaction.amount).toLocaleString()}
          </p>
          {getStatusBadge(transaction.status)}
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function TeacherWalletPage() {
  const { user, loading, isAuthenticated } = useClientAuth();
  const router = useRouter();
  const authenticatedFetch = useAuthenticatedFetch();

  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    currency: 'PKR',
    totalEarnings: 0,
    pendingEarnings: 0,
    withdrawnAmount: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard/teacher/wallet');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoadingData(true);
        const [walletRes, transactionsRes] = await Promise.all([
          authenticatedFetch('/api/wallet'),
          authenticatedFetch('/api/wallet/transactions'),
        ]);

        if (walletRes.ok) {
          const data = await walletRes.json();
          setWalletData(data.data || walletData);
        }

        if (transactionsRes.ok) {
          const data = await transactionsRes.json();
          setTransactions(data.data?.transactions || []);
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (isAuthenticated) {
      fetchWalletData();
    }
  }, [isAuthenticated, authenticatedFetch]);

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  if (loading) return null;

  return (
    <div className='min-h-screen bg-slate-50/50'>
      <PageHeader
        title='Wallet & Earnings'
        subtitle='Manage your earnings and withdrawals'
        icon={Wallet}
      />

      <div className='max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6'>
        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <StatCard
            title='Available Balance'
            value={`PKR ${walletData.balance.toLocaleString()}`}
            subtitle='Ready to withdraw'
            icon={Wallet}
            colorClass='text-blue-600'
            bgClass='bg-blue-50'
          />
          <StatCard
            title='Total Earnings'
            value={`PKR ${walletData.totalEarnings.toLocaleString()}`}
            subtitle='All time'
            icon={TrendingUp}
            colorClass='text-green-600'
            bgClass='bg-green-50'
          />
          <StatCard
            title='Pending Earnings'
            value={`PKR ${walletData.pendingEarnings.toLocaleString()}`}
            subtitle='Being processed'
            icon={Clock}
            colorClass='text-amber-600'
            bgClass='bg-amber-50'
          />
          <StatCard
            title='Total Withdrawn'
            value={`PKR ${walletData.withdrawnAmount.toLocaleString()}`}
            subtitle='Lifetime'
            icon={Download}
            colorClass='text-purple-600'
            bgClass='bg-purple-50'
          />
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Transactions List */}
          <div className='lg:col-span-2'>
            <Card className='border shadow-sm'>
              <CardHeader className='border-b border-slate-100'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg font-semibold'>
                    Transaction History
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className='w-[140px] h-9'>
                        <SelectValue placeholder='Type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Types</SelectItem>
                        <SelectItem value='EARNING'>Earnings</SelectItem>
                        <SelectItem value='WITHDRAWAL'>Withdrawals</SelectItem>
                        <SelectItem value='DEPOSIT'>Deposits</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className='w-[140px] h-9'>
                        <SelectValue placeholder='Status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Status</SelectItem>
                        <SelectItem value='COMPLETED'>Completed</SelectItem>
                        <SelectItem value='PENDING'>Pending</SelectItem>
                        <SelectItem value='FAILED'>Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='p-0'>
                {isLoadingData ? (
                  <div className='p-4 space-y-3'>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Skeleton key={i} className='h-16 w-full' />
                    ))}
                  </div>
                ) : filteredTransactions.length > 0 ? (
                  <div className='max-h-[600px] overflow-y-auto'>
                    {filteredTransactions.map(transaction => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                      />
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-12'>
                    <Wallet className='h-12 w-12 text-slate-300 mx-auto mb-3' />
                    <p className='text-slate-500 text-sm'>
                      No transactions found
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className='space-y-4'>
            <Card className='border shadow-sm'>
              <CardHeader className='border-b border-slate-100'>
                <CardTitle className='text-base font-semibold'>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4 space-y-3'>
                <Button className='w-full bg-blue-600 hover:bg-blue-700 text-white'>
                  <Download className='h-4 w-4 mr-2' />
                  Request Withdrawal
                </Button>
                <Button variant='outline' className='w-full'>
                  <Download className='h-4 w-4 mr-2' />
                  Download Statement
                </Button>
              </CardContent>
            </Card>

            <Card className='border shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50'>
              <CardContent className='p-6'>
                <div className='flex items-start gap-3 mb-4'>
                  <div className='p-2 rounded-lg bg-blue-100'>
                    <TrendingUp className='h-5 w-5 text-blue-600' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-slate-900 text-sm mb-1'>
                      Earnings Info
                    </h4>
                    <p className='text-xs text-slate-600 leading-relaxed'>
                      You earn when students enroll in your paid courses.
                      Earnings are processed within 24-48 hours.
                    </p>
                  </div>
                </div>
                <div className='space-y-2 text-xs text-slate-600'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-3 w-3 text-green-600' />
                    <span>Instant balance updates</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-3 w-3 text-green-600' />
                    <span>Secure withdrawals</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-3 w-3 text-green-600' />
                    <span>Detailed transaction history</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

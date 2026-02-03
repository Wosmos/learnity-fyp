'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  GraduationCap,
  Filter,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTable } from './data-table';
import { createUnifiedColumns, UnifiedUser } from './unified-columns';
import { TeacherDetailDialog } from '../teachers/teacher-detail-dialog';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface UserManagementClientProps {
  initialData: {
    users: UnifiedUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    stats: {
      studentCount: number;
      teacherCount: number;
      pendingTeacherCount: number;
      adminCount: number;
      totalUsers: number;
    };
  };
}

export function UserManagementClient({
  initialData,
}: UserManagementClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const api = useAuthenticatedApi();
  const { toast } = useToast();

  const [selectedUser, setSelectedUser] = useState<UnifiedUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const activeRole = searchParams.get('role') || 'all';

  const handleRoleChange = (role: string) => {
    const params = new URLSearchParams(searchParams);
    if (role === 'all') {
      params.delete('role');
    } else {
      params.set('role', role);
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      if (action === 'approve' || action === 'reject') {
        await api.put('/api/admin/teachers', { teacherId: userId, action });
      } else {
        await api.put('/api/admin/users', { userId, action });
      }

      // Trigger global cache revalidation for lightning fast updates
      await fetch('/api/admin/revalidate-users', { method: 'POST' });

      toast({
        title: 'Success',
        description: `User action ${action} completed.`,
      });

      startTransition(() => {
        router.refresh(); // Revalidate current page data
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform user action.',
        variant: 'destructive',
      });
    }
  };

  const columns = createUnifiedColumns({
    activeRole,
    onViewDetails: user => {
      setSelectedUser(user);
      setDialogOpen(true);
    },
    onUserAction: handleUserAction,
  });

  const tabConfig = [
    {
      value: 'all',
      label: 'All Users',
      icon: Users,
      count: initialData.stats.totalUsers,
    },
    {
      value: 'student',
      label: 'Students',
      icon: GraduationCap,
      count: initialData.stats.studentCount,
    },
    {
      value: 'teacher',
      label: 'Teachers',
      icon: CheckCircle,
      count: initialData.stats.teacherCount,
    },
    {
      value: 'pending_teacher',
      label: 'Pending',
      icon: Clock,
      count: initialData.stats.pendingTeacherCount,
    },
    {
      value: 'admin',
      label: 'Admins',
      icon: Shield,
      count: initialData.stats.adminCount,
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Search and Filters */}
      <div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
        <div className='relative w-full md:max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search by name or email...'
            className='pl-10'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <Button
            variant='ghost'
            size='sm'
            className='absolute right-1 top-1/2 -translate-y-1/2 h-8'
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>

        <div className='flex items-center gap-2'>
          {isPending && (
            <Clock className='h-4 w-4 animate-spin text-muted-foreground' />
          )}
          <Badge variant='outline' className='px-3 py-1'>
            {initialData.pagination.total} Total Matches
          </Badge>
        </div>
      </div>

      <Tabs
        value={activeRole}
        onValueChange={handleRoleChange}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1 gap-1 bg-muted/50'>
          {tabConfig.map(({ value, label, icon: Icon, count }) => (
            <TabsTrigger
              key={value}
              value={value}
              className='flex items-center gap-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm'
            >
              <Icon className='h-4 w-4' />
              <span className='hidden sm:inline'>{label}</span>
              <Badge
                variant='secondary'
                className='ml-auto sm:ml-0 bg-muted-foreground/10'
              >
                {count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabConfig.map(({ value }) => (
          <TabsContent key={value} value={value} className='mt-6'>
            <Card className='border-none shadow-none bg-transparent'>
              <CardContent className='p-0'>
                {isPending ? (
                  <UserTableSkeleton />
                ) : (
                  <DataTable
                    columns={columns}
                    data={initialData.users}
                    searchKey='email'
                    searchPlaceholder='Filter results...'
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <TeacherDetailDialog
        teacher={selectedUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onTeacherAction={(id, action) => handleUserAction(id, action)}
      />
    </div>
  );
}

function UserTableSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='border rounded-md'>
        <div className='p-4 border-b space-y-2'>
          <Skeleton className='h-10 w-full' />
        </div>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className='p-4 border-b last:border-0 flex items-center gap-4'
          >
            <Skeleton className='h-12 w-12 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-1/4' />
              <Skeleton className='h-3 w-1/2' />
            </div>
            <Skeleton className='h-8 w-24' />
          </div>
        ))}
      </div>
    </div>
  );
}

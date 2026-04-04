'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Users, GraduationCap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UserManagementClient } from '@/components/admin/users/UserManagementClient';
import { TeacherApplicationsTab } from './TeacherApplicationsTab';

interface Props {
  activeTab: string;
  usersData: any;
  teachers: any[];
  teacherCounts: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
}

export function PeopleClient({ activeTab, usersData, teachers, teacherCounts }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/admin/people?${params.toString()}`);
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight text-foreground'>People</h1>
        <p className='text-muted-foreground'>Manage users, roles, and teacher applications.</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className='h-11'>
          <TabsTrigger value='users' className='gap-2'>
            <Users className='h-4 w-4' />
            All Users
          </TabsTrigger>
          <TabsTrigger value='applications' className='gap-2'>
            <GraduationCap className='h-4 w-4' />
            Teacher Applications
            {teacherCounts.pending > 0 && (
              <Badge variant='destructive' className='ml-1 h-5 px-1.5 text-[10px]'>
                {teacherCounts.pending}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='users' className='mt-6'>
          <UserManagementClient initialData={usersData} />
        </TabsContent>

        <TabsContent value='applications' className='mt-6'>
          <TeacherApplicationsTab
            teachers={teachers}
            counts={teacherCounts}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

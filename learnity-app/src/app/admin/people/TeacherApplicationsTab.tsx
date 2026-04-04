'use client';

import { useState } from 'react';
import {
  Clock, CheckCircle, XCircle, Users, Star, Award,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/admin/users/data-table';
import { createTeacherColumns } from '@/components/admin/teachers/columns';
import { TeacherDetailDialog } from '@/components/admin/teachers/teacher-detail-dialog';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { useToast } from '@/hooks/use-toast';

interface Teacher {
  id: string;
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PENDING_TEACHER' | 'TEACHER' | 'REJECTED_TEACHER';
  profilePicture: string | null;
  isActive: boolean;
  createdAt: string;
  teacherProfile: {
    id: string;
    applicationStatus: string;
    qualifications: string[];
    subjects: string[];
    experience: number;
    bio: string | null;
    hourlyRate: number | null;
    submittedAt: string | null;
    reviewedAt: string | null;
  } | null;
}

interface Props {
  teachers: Teacher[];
  counts: { pending: number; approved: number; rejected: number; total: number };
}

export function TeacherApplicationsTab({ teachers: initialTeachers, counts: initialCounts }: Props) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [counts, setCounts] = useState(initialCounts);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('pending');

  const api = useAuthenticatedApi();
  const { toast } = useToast();

  const handleViewDetails = (teacher: any) => {
    setSelectedTeacher(teacher);
    setDialogOpen(true);
  };

  const handleTeacherAction = async (teacherId: string, action: string) => {
    try {
      await api.put('/api/admin/teachers', { teacherId, action });

      setTeachers(prev =>
        prev.map(t =>
          t.id === teacherId
            ? { ...t, role: action === 'approve' ? 'TEACHER' : 'REJECTED_TEACHER' }
            : t
        )
      );

      if (action === 'approve') {
        setCounts(prev => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }));
      } else {
        setCounts(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }));
      }

      toast({ title: 'Success', description: `Teacher application ${action}d successfully.` });
    } catch {
      toast({ title: 'Error', description: `Failed to ${action} teacher.`, variant: 'destructive' });
    }
  };

  const columns = createTeacherColumns({
    onViewDetails: handleViewDetails,
    onTeacherAction: handleTeacherAction,
  });

  const filtered = teachers.filter(t => {
    if (activeFilter === 'pending') return t.role === 'PENDING_TEACHER';
    if (activeFilter === 'approved') return t.role === 'TEACHER';
    if (activeFilter === 'rejected') return t.role === 'REJECTED_TEACHER';
    return true;
  });

  const statCards = [
    { label: 'Pending', value: counts.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Approved', value: counts.approved, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Rejected', value: counts.rejected, icon: XCircle, color: 'text-red-600 bg-red-50' },
    { label: 'Total', value: counts.total, icon: Users, color: 'text-blue-600 bg-blue-50' },
  ];

  return (
    <div className='space-y-6'>
      {/* Stats */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {statCards.map(s => (
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

      {/* Filtered Table */}
      <Card>
        <CardHeader>
          <CardTitle>Teacher Applications</CardTitle>
          <CardDescription>Review and manage teacher applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeFilter} onValueChange={setActiveFilter}>
            <TabsList className='grid w-full grid-cols-4 mb-6'>
              <TabsTrigger value='pending' className='gap-2'>
                <Clock className='h-4 w-4' />Pending
                <Badge variant='secondary'>{counts.pending}</Badge>
              </TabsTrigger>
              <TabsTrigger value='approved' className='gap-2'>
                <CheckCircle className='h-4 w-4' />Approved
                <Badge variant='secondary'>{counts.approved}</Badge>
              </TabsTrigger>
              <TabsTrigger value='rejected' className='gap-2'>
                <XCircle className='h-4 w-4' />Rejected
                <Badge variant='secondary'>{counts.rejected}</Badge>
              </TabsTrigger>
              <TabsTrigger value='all' className='gap-2'>
                <Users className='h-4 w-4' />All
                <Badge variant='secondary'>{counts.total}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeFilter}>
              {filtered.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={filtered as any}
                  searchKey='email'
                  searchPlaceholder='Search by name or email...'
                />
              ) : (
                <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center'>
                  <Users className='h-10 w-10 text-muted-foreground mb-4' />
                  <p className='text-muted-foreground'>No applications in this category.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <TeacherDetailDialog
        teacher={selectedTeacher as any}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onTeacherAction={handleTeacherAction}
      />
    </div>
  );
}

'use client';

/**
 * Admin Teacher Management Page
 * Modern data table interface for managing teacher applications
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { DataTable } from '@/components/admin/users/data-table';
import { createTeacherColumns, Teacher } from '@/components/admin/teachers/columns';
import { TeacherDetailDialog } from '@/components/admin/teachers/teacher-detail-dialog';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { useToast } from '@/hooks/use-toast';
import {
  GraduationCap,
  Download,
  Clock,
  Star,
  Award,
  Users,
  CheckCircle,
  XCircle,
} from 'lucide-react';



interface TeacherStats {
  totalTeachers: number;
  pendingApplications: number;
  approvedTeachers: number;
  rejectedApplications: number;
  averageRating: number;
  totalSessions: number;
}

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    totalTeachers: 0,
    pendingApplications: 0,
    approvedTeachers: 0,
    rejectedApplications: 0,
    averageRating: 0,
    totalSessions: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  
  const api = useAuthenticatedApi();
  const { toast } = useToast();

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/teachers');
      const teacherData = response.teachers || [];
      setTeachers(teacherData);
      setFilteredTeachers(teacherData);
      setStats(response.stats || stats);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      toast({
        title: "Error",
        description: "Failed to load teachers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Filter teachers based on active tab
  useEffect(() => {
    let filtered = teachers;
    
    switch (activeTab) {
      case 'pending':
        filtered = teachers.filter(teacher => teacher.role === 'PENDING_TEACHER');
        break;
      case 'approved':
        filtered = teachers.filter(teacher => teacher.role === 'TEACHER');
        break;
      case 'rejected':
        filtered = teachers.filter(teacher => teacher.role === 'REJECTED_TEACHER');
        break;
      default:
        filtered = teachers;
    }
    
    setFilteredTeachers(filtered);
  }, [teachers, activeTab]);

  const handleViewDetails = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDialogOpen(true);
  };

  const handleTeacherAction = async (teacherId: string, action: string) => {
    try {
      await api.put('/api/admin/teachers', { teacherId, action });
      
      // Update local state
      setTeachers(prev => prev.map(teacher => 
        teacher.id === teacherId 
          ? { 
              ...teacher, 
              applicationStatus: action === 'approve' ? 'approved' : 'rejected',
              role: action === 'approve' ? 'TEACHER' : 'REJECTED_TEACHER',
              reviewedAt: new Date().toISOString()
            }
          : teacher
      ));

      // Update stats
      if (action === 'approve') {
        setStats(prev => ({
          ...prev,
          pendingApplications: prev.pendingApplications - 1,
          approvedTeachers: prev.approvedTeachers + 1
        }));
      } else if (action === 'reject') {
        setStats(prev => ({
          ...prev,
          pendingApplications: prev.pendingApplications - 1,
          rejectedApplications: prev.rejectedApplications + 1
        }));
      }

      toast({
        title: "Success",
        description: `Teacher application ${action}d successfully.`,
      });
    } catch (error) {
      console.error(`Failed to ${action} teacher:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} teacher application. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const columns = createTeacherColumns({
    onViewDetails: handleViewDetails,
    onTeacherAction: handleTeacherAction,
  });

  const tabConfig = [
    {
      value: 'pending',
      label: 'Pending',
      icon: Clock,
      count: stats.pendingApplications,
      emptyTitle: 'No pending applications',
      emptyDescription: 'All teacher applications have been reviewed.'
    },
    {
      value: 'approved',
      label: 'Approved',
      icon: CheckCircle,
      count: stats.approvedTeachers,
      emptyTitle: 'No approved teachers',
      emptyDescription: 'No approved teachers match the current filters.'
    },
    {
      value: 'rejected',
      label: 'Rejected',
      icon: XCircle,
      count: stats.rejectedApplications,
      emptyTitle: 'No rejected applications',
      emptyDescription: 'You have not rejected any teacher applications yet.'
    },
    {
      value: 'all',
      label: 'All',
      icon: Users,
      count: stats.totalTeachers,
      emptyTitle: 'No teachers found',
      emptyDescription: 'No teacher applications have been submitted yet.'
    }
  ];

  return (
    <AdminLayout
     
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-700">{stats.pendingApplications}</p>
                <p className="text-sm text-yellow-600">Pending Applications</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-700">{stats.approvedTeachers}</p>
                <p className="text-sm text-green-600">Approved Teachers</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-700">{stats.averageRating.toFixed(1)}</p>
                <p className="text-sm text-blue-600">Average Rating</p>
              </div>
              <Star className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-700">{stats.totalSessions}</p>
                <p className="text-sm text-purple-600">Total Sessions</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Data Table */}
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Teacher Applications</CardTitle>
              <CardDescription className="text-gray-600">
                Review and manage teacher applications with advanced filtering and approval tools
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              {tabConfig.map(({ value, label, icon: Icon, count }) => (
                <TabsTrigger key={value} value={value} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                  <Badge variant="secondary" className="ml-1">
                    {count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {tabConfig.map(({ value, emptyTitle, emptyDescription, icon: Icon }) => (
              <TabsContent key={value} value={value} className="space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
                    <p className="text-gray-500">Loading teachers...</p>
                  </div>
                ) : filteredTeachers.length > 0 ? (
                  <DataTable
                    columns={columns}
                    data={filteredTeachers}
                    searchKey="email"
                    searchPlaceholder="Search by name, email, or expertise..."
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-12 text-center">
                    <Icon className="h-10 w-10 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyTitle}</h3>
                    <p className="text-gray-500 max-w-md">{emptyDescription}</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <TeacherDetailDialog
        teacher={selectedTeacher}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onTeacherAction={handleTeacherAction}
      />
    </AdminLayout>
  );
}
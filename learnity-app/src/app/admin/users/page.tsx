'use client';

/**
 * Admin User Management Page
 * Modern data table interface with detailed user management
 */

import { useState, useEffect, useCallback } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { DataTable } from '@/components/admin/users/data-table';
import { createColumns, User } from '@/components/admin/users/columns';
import { UserDetailDialog } from '@/components/admin/users/user-detail-dialog';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Download,
  UserPlus,
  GraduationCap,
  BookOpen,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  pendingVerifications: number;
  studentCount: number;
  teacherCount: number;
  adminCount: number;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    pendingVerifications: 0,
    studentCount: 0,
    teacherCount: 0,
    adminCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const api = useAuthenticatedApi();
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/users');
      const userData = response.users || [];
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/users/stats');
      setStats((prev) => response.stats || prev);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  }, [api]);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  // Filter users based on active tab
  useEffect(() => {
    let filtered = users;
    
    switch (activeTab) {
      case 'students':
        filtered = users.filter(user => user.role === 'STUDENT');
        break;
      case 'teachers':
        filtered = users.filter(user => user.role === 'TEACHER');
        break;
      case 'admins':
        filtered = users.filter(user => user.role === 'ADMIN');
        break;
      case 'pending':
        filtered = users.filter(user => !user.emailVerified);
        break;
      default:
        filtered = users;
    }
    
    setFilteredUsers(filtered);
  }, [users, activeTab]);

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      // Handle teacher approval/rejection through teacher API
      if (action === 'approve-teacher' || action === 'reject-teacher') {
        const teacherAction = action === 'approve-teacher' ? 'approve' : 'reject';
        await api.put('/api/admin/teachers', { teacherId: userId, action: teacherAction });
        
        // Update user role in local state
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                role: teacherAction === 'approve' ? 'TEACHER' : 'REJECTED_TEACHER'
              }
            : user
        ));
        
        toast({
          title: "Success",
          description: `Teacher application ${teacherAction}d successfully.`,
        });
        return;
      }

      // Handle regular user actions
      await api.put('/api/admin/users', { userId, action });
      
      if (action === 'delete') {
        setUsers(prev => prev.filter(user => user.id !== userId));
        toast({
          title: "Success",
          description: "User deleted successfully.",
        });
      } else if (action === 'activate' || action === 'deactivate') {
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, isActive: action === 'activate' }
            : user
        ));
        toast({
          title: "Success",
          description: `User ${action}d successfully.`,
        });
      } else {
        toast({
          title: "Success",
          description: `Action ${action} completed successfully.`,
        });
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} user. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const columns = createColumns({
    onViewDetails: handleViewDetails,
    onUserAction: handleUserAction,
  });

  return (
    <>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-700">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-blue-600">Total Users</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-700">{stats.activeUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600">Active Users</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-700">{stats.newUsersThisMonth}</p>
                <p className="text-sm text-purple-600">New This Month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-700">{stats.pendingVerifications}</p>
                <p className="text-sm text-orange-600">Pending Verification</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Data Table */}
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">User Directory</CardTitle>
              <CardDescription className="text-gray-600">
                Manage all platform users with advanced filtering and actions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                All Users
                <Badge variant="secondary" className="ml-1">
                  {stats.totalUsers}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Students
                <Badge variant="secondary" className="ml-1">
                  {stats.studentCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="teachers" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Teachers
                <Badge variant="secondary" className="ml-1">
                  {stats.teacherCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="admins" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admins
                <Badge variant="secondary" className="ml-1">
                  {stats.adminCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Pending
                <Badge variant="secondary" className="ml-1">
                  {stats.pendingVerifications}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
                  <p className="text-gray-500">Loading users...</p>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={filteredUsers}
                  searchKey="email"
                  searchPlaceholder="Search by name, email, or ID..."
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <UserDetailDialog
        user={selectedUser}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUserAction={handleUserAction}
      />
    </>
  );
}
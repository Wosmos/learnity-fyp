'use client';

/**
 * Admin User Management Page
 * Comprehensive user management interface for administrators
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  GraduationCap,
  BookOpen,
  Shield,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  profilePicture?: string;
}

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  
  const api = useAuthenticatedApi();
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/users');
      setUsers(response.users || []);
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
      setStats(response.stats || stats);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  }, [api, stats]);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return Shield;
      case 'TEACHER': return GraduationCap;
      case 'STUDENT': return BookOpen;
      default: return Users;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'TEACHER': return 'bg-blue-100 text-blue-800';
      case 'STUDENT': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      await api.put('/api/admin/users', { userId, action });
      
      if (action === 'delete') {
        setUsers(prev => prev.filter(user => user.id !== userId));
      } else {
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, isActive: action === 'activate' }
            : user
        ));
      }

      toast({
        title: "Success",
        description: `User ${action}d successfully.`,
      });
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} user. Please try again.`,
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout
      title="User Management"
      description="Manage users, roles, and permissions across the platform"
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      }
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.newUsersThisMonth}</p>
                <p className="text-xs text-gray-500">New This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
                <p className="text-xs text-gray-500">Pending Verification</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-green-600" />
              <span>Students</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.studentCount}</p>
            <p className="text-xs text-gray-500">Active learners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              <span>Teachers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stats.teacherCount}</p>
            <p className="text-xs text-gray-500">Approved educators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Shield className="h-4 w-4 text-red-600" />
              <span>Administrators</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.adminCount}</p>
            <p className="text-xs text-gray-500">Platform admins</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management Interface */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>
                Manage all platform users and their permissions
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="TEACHER">Teachers</option>
                <option value="ADMIN">Administrators</option>
              </select>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading users...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                
                return (
                  <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {user.profilePicture ? (
                            <div 
                              className="w-10 h-10 rounded-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${user.profilePicture})` }}
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </h3>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {user.role}
                            </Badge>
                            {!user.emailVerified && (
                              <Badge variant="outline" className="text-orange-600 border-orange-200">
                                Unverified
                              </Badge>
                            )}
                            {!user.isActive && (
                              <Badge variant="outline" className="text-red-600 border-red-200">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{user.email}</p>
                            <div className="flex items-center space-x-4">
                              <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                              {user.lastLoginAt && (
                                <span>Last login: {new Date(user.lastLoginAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.isActive ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'deactivate')}
                          >
                            <XCircle className="h-4 w-4 text-orange-600" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'activate')}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'delete')}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-500">
                    {searchQuery || selectedRole !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No users have been registered yet.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
'use client';

/**
 * Admin Dashboard
 * Comprehensive admin panel for managing teachers, students, and platform operations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthenticatedLayout } from '@/components/layout/AppLayout';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import {
  Users, UserCheck, UserX, Clock, TrendingUp, DollarSign,
  FileText, AlertTriangle, CheckCircle, Eye, Edit, Trash2,
  Download, Filter, Search, MoreHorizontal, Shield,
  BarChart3, Calendar, Mail, Phone, MapPin, Star,
  GraduationCap, BookOpen, Video, Award, Settings
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  pendingTeachers: number;
  approvedTeachers: number;
  totalStudents: number;
  activeSessions: number;
  totalRevenue: number;
  monthlyGrowth: number;
  platformRating: number;
}

interface PendingTeacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  experience: string;
  submittedAt: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  documents: number;
  videoIntro: boolean;
  rating?: number;
  profileComplete: number;
}

interface PlatformMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
}

export default function AdminDashboard() {
  const { user, loading, isAuthenticated, claims } = useClientAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingTeachers: 0,
    approvedTeachers: 0,
    totalStudents: 0,
    activeSessions: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    platformRating: 0
  });

  const [pendingTeachers, setPendingTeachers] = useState<PendingTeacher[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  const platformMetrics: PlatformMetric[] = [
    {
      label: 'New Signups',
      value: '127',
      change: '+15%',
      trend: 'up',
      icon: Users
    },
    {
      label: 'Session Completion',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: CheckCircle
    },
    {
      label: 'Teacher Retention',
      value: '89.5%',
      change: '-1.2%',
      trend: 'down',
      icon: UserCheck
    },
    {
      label: 'Revenue Growth',
      value: '12.5%',
      change: '+3.2%',
      trend: 'up',
      icon: TrendingUp
    }
  ];

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard/admin');
    } else if (!loading && isAuthenticated && claims) {
      // Only allow admin access
      if (claims.role !== UserRole.ADMIN) {
        router.push('/dashboard');
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin dashboard.",
          variant: "destructive"
        });
      } else {
        // Load admin data
        fetchAdminStats();
        fetchPendingTeachers();
      }
    }
  }, [loading, isAuthenticated, claims, router, toast]);

  const fetchAdminStats = async () => {
    try {
      setLoadingStats(true);
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      toast({
        title: "Error",
        description: "Failed to load platform statistics.",
        variant: "destructive"
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPendingTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/teachers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingTeachers(data.teachers);
      }
    } catch (error) {
      console.error('Failed to fetch pending teachers:', error);
      toast({
        title: "Error",
        description: "Failed to load teacher applications.",
        variant: "destructive"
      });
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleTeacherAction = async (teacherId: string, action: 'approve' | 'reject' | 'review') => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/teachers', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ teacherId, action })
      });

      if (response.ok) {
        // Update local state
        setPendingTeachers(prev => 
          prev.map(teacher => 
            teacher.id === teacherId 
              ? { ...teacher, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'reviewing' }
              : teacher
          )
        );

        toast({
          title: `Teacher ${action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Under Review'}`,
          description: `Teacher application has been ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'marked for review'}.`,
          variant: action === 'reject' ? 'destructive' : 'default'
        });

        // Refresh stats
        fetchAdminStats();
      } else {
        throw new Error('Failed to update teacher status');
      }
    } catch (error) {
      console.error('Teacher action error:', error);
      toast({
        title: "Error",
        description: "Failed to update teacher status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || claims?.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Access Required</h3>
              <p className="text-gray-500">You need admin privileges to access this dashboard.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">
                    Platform management and oversight
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.pendingTeachers}</p>
                    <p className="text-xs text-gray-500">Pending Teachers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.monthlyGrowth}%</p>
                    <p className="text-xs text-gray-500">Monthly Growth</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {platformMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <p className={`text-sm ${
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {metric.change} from last month
                        </p>
                      </div>
                      <Icon className={`h-8 w-8 ${
                        metric.trend === 'up' ? 'text-green-500' : 
                        metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                      }`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="teachers" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="teachers">Teacher Applications</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Platform Settings</TabsTrigger>
            </TabsList>

            {/* Teacher Applications Tab */}
            <TabsContent value="teachers" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Pending Teacher Applications</CardTitle>
                      <CardDescription>
                        Review and approve new teacher registrations
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingTeachers.map((teacher) => (
                      <div key={teacher.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <GraduationCap className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold">{teacher.name}</h3>
                                <Badge className={getStatusColor(teacher.status)}>
                                  {teacher.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4" />
                                  <span>{teacher.email}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <BookOpen className="h-4 w-4" />
                                  <span>{teacher.subjects.join(', ')}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Award className="h-4 w-4" />
                                  <span>{teacher.experience} experience</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>Applied {new Date(teacher.submittedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">Profile Completion</span>
                                  <span className="text-sm text-gray-500">{teacher.profileComplete}%</span>
                                </div>
                                <Progress value={teacher.profileComplete} className="h-2" />
                              </div>

                              <div className="flex items-center space-x-4 mt-4">
                                <div className="flex items-center space-x-1">
                                  <FileText className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">{teacher.documents} documents</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Video className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">
                                    {teacher.videoIntro ? 'Video intro ✓' : 'No video intro'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Profile Preview",
                                  description: "Opening teacher profile preview..."
                                });
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTeacherAction(teacher.id, 'review')}
                              disabled={teacher.status === 'reviewing'}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleTeacherAction(teacher.id, 'approve')}
                              disabled={teacher.status === 'approved'}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleTeacherAction(teacher.id, 'reject')}
                              disabled={teacher.status === 'rejected'}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Management Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <GraduationCap className="h-5 w-5" />
                      <span>Teachers</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active</span>
                        <span className="font-medium">{stats.approvedTeachers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pending</span>
                        <span className="font-medium text-yellow-600">{stats.pendingTeachers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">This Month</span>
                        <span className="font-medium text-green-600">+12</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Students</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active</span>
                        <span className="font-medium">{stats.totalStudents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">New This Week</span>
                        <span className="font-medium text-green-600">47</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Retention Rate</span>
                        <span className="font-medium">87%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Sessions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active Now</span>
                        <span className="font-medium">{stats.activeSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Today</span>
                        <span className="font-medium">234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <span className="font-medium text-green-600">94.2%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>
                    Detailed insights into platform performance and user behavior
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                    <p className="text-gray-500">
                      Comprehensive analytics and reporting features coming soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>
                    Configure platform-wide settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Panel</h3>
                    <p className="text-gray-500">
                      Platform configuration and settings management coming soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
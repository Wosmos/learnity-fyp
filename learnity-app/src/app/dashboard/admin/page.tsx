'use client';

/**
 * Admin Dashboard
 * Comprehensive admin panel for managing teachers, students, and platform operations
 */

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import {
  Users, UserCheck, UserX, Clock, TrendingUp, DollarSign,
  FileText, AlertTriangle, CheckCircle, Eye, Edit, Trash2,
  Download, Filter, Search, MoreHorizontal, Shield,
  BarChart3, Calendar, Mail, Phone, MapPin, Star,
  GraduationCap, BookOpen, Video, Award, Settings,
  ArrowUpRight, ArrowDownRight, Minus
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
      if (claims.role !== UserRole.ADMIN) {
        router.push('/dashboard');
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin dashboard.",
          variant: "destructive"
        });
      } else {
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
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'reviewing': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4" />;
      case 'down': return <ArrowDownRight className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || claims?.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Access Required</h3>
              <p className="text-gray-600 mb-6">You need admin privileges to access this dashboard.</p>
              <Button onClick={() => router.push('/dashboard')} className="w-full">
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminLayout
      title="Admin Dashboard"
      description="Platform management and oversight"
    >
      <div className="space-y-6">
        {/* Primary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardContent className="p-6 ">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending Teachers</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingTeachers}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Monthly Growth</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.monthlyGrowth}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const trendColor = metric.trend === 'up' ? 'text-emerald-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600';
            const bgColor = metric.trend === 'up' ? 'bg-emerald-50' : metric.trend === 'down' ? 'bg-red-50' : 'bg-gray-50';
            
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="h-5 w-5 text-gray-500" />
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${bgColor}`}>
                      {getTrendIcon(metric.trend)}
                      <span className={`text-xs font-medium ${trendColor}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="teachers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-gray-100">
            <TabsTrigger value="teachers" className="data-[state=active]:bg-white">
              Teacher Applications
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white">
              User Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Teacher Applications Tab */}
          <TabsContent value="teachers" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Pending Teacher Applications</CardTitle>
                    <CardDescription className="mt-1">
                      Review and approve new teacher registrations
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Filter</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Search className="h-4 w-4" />
                      <span className="hidden sm:inline">Search</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {pendingTeachers.map((teacher) => (
                    <Card key={teacher.id} className="border border-gray-200 hover:border-gray-300 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                              <GraduationCap className="h-7 w-7 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                                <Badge variant="outline" className={`${getStatusColor(teacher.status)} capitalize`}>
                                  {teacher.status}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{teacher.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <BookOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{teacher.subjects.join(', ')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Award className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span>{teacher.experience} experience</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span>Applied {new Date(teacher.submittedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                                  <span className="text-sm font-semibold text-gray-900">{teacher.profileComplete}%</span>
                                </div>
                                <Progress value={teacher.profileComplete} className="h-2" />
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  <span>{teacher.documents} documents</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Video className="h-4 w-4 text-gray-400" />
                                  <span className={teacher.videoIntro ? "text-emerald-600 font-medium" : "text-gray-600"}>
                                    {teacher.videoIntro ? 'Video intro ✓' : 'No video intro'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex lg:flex-col gap-2 flex-wrap lg:flex-nowrap">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 flex-1 lg:flex-none lg:w-full"
                              onClick={() => {
                                toast({
                                  title: "Profile Preview",
                                  description: "Opening teacher profile preview..."
                                });
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 flex-1 lg:flex-none lg:w-full"
                              onClick={() => handleTeacherAction(teacher.id, 'review')}
                              disabled={teacher.status === 'reviewing'}
                            >
                              <Edit className="h-4 w-4" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              className="gap-2 bg-emerald-600 hover:bg-emerald-700 flex-1 lg:flex-none lg:w-full"
                              onClick={() => handleTeacherAction(teacher.id, 'approve')}
                              disabled={teacher.status === 'approved'}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-2 flex-1 lg:flex-none lg:w-full"
                              onClick={() => handleTeacherAction(teacher.id, 'reject')}
                              disabled={teacher.status === 'rejected'}
                            >
                              <UserX className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                    </div>
                    <span>Teachers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Active</span>
                    <span className="text-lg font-semibold text-gray-900">{stats.approvedTeachers}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="text-lg font-semibold text-amber-600">{stats.pendingTeachers}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="text-lg font-semibold text-emerald-600">+12</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <span>Students</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Active</span>
                    <span className="text-lg font-semibold text-gray-900">{stats.totalStudents}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">New This Week</span>
                    <span className="text-lg font-semibold text-emerald-600">47</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Retention Rate</span>
                    <span className="text-lg font-semibold text-gray-900">87%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span>Sessions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Active Now</span>
                    <span className="text-lg font-semibold text-gray-900">{stats.activeSessions}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Today</span>
                    <span className="text-lg font-semibold text-gray-900">234</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="text-lg font-semibold text-emerald-600">94.2%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-xl">Platform Analytics</CardTitle>
                <CardDescription className="mt-1">
                  Detailed insights into platform performance and user behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Comprehensive analytics and reporting features coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-xl">Platform Settings</CardTitle>
                <CardDescription className="mt-1">
                  Configure platform-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Settings className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings Panel</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Platform configuration and settings management coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
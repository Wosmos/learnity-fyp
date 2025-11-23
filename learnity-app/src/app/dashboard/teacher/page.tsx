'use client';

/**
 * Teacher Dashboard - Modern & Advanced UI
 * Comprehensive dashboard for teachers with session management, student progress, and analytics
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AuthenticatedLayout } from '@/components/layout/AppLayout';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/auth';
import { Users, Calendar, TrendingUp, Clock, Star, FileText, Video, DollarSign, Bell, Plus, Eye, Edit, BarChart3, CheckCircle, User, GraduationCap, Zap } from 'lucide-react';
import { MetricCard } from '@/components/ui/stats-card';

interface TeacherStats {
  totalStudents: number;
  activeSessions: number;
  completedSessions: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  upcomingSessions: number;
  contentUploads: number;
}

interface UpcomingSession {
  id: string;
  studentName: string;
  subject: string;
  time: string;
  duration: number;
  type: 'one-on-one' | 'group';
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface RecentActivity {
  id: string;
  type: 'session_completed' | 'new_student' | 'review_received' | 'content_uploaded';
  message: string;
  time: string;
  icon: React.ReactNode;
}

export default function TeacherDashboard() {
  const { user, loading, isAuthenticated, claims } = useClientAuth();
  const router = useRouter();
  const [stats] = useState<TeacherStats>({
    totalStudents: 24,
    activeSessions: 8,
    completedSessions: 156,
    totalEarnings: 2840,
    averageRating: 4.8,
    totalReviews: 89,
    upcomingSessions: 5,
    contentUploads: 12
  });

  const [upcomingSessions] = useState<UpcomingSession[]>([
    {
      id: '1',
      studentName: 'Alice Johnson',
      subject: 'Mathematics',
      time: '2:00 PM Today',
      duration: 60,
      type: 'one-on-one',
      status: 'confirmed'
    },
    {
      id: '2',
      studentName: 'Bob Smith',
      subject: 'Physics',
      time: '4:30 PM Today',
      duration: 45,
      type: 'one-on-one',
      status: 'confirmed'
    },
    {
      id: '3',
      studentName: 'Study Group A',
      subject: 'Chemistry',
      time: '10:00 AM Tomorrow',
      duration: 90,
      type: 'group',
      status: 'pending'
    }
  ]);

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'session_completed',
      message: 'Completed session with Sarah Wilson - Algebra',
      time: '2 hours ago',
      icon: <CheckCircle className="h-4 w-4 text-emerald-500" />
    },
    {
      id: '2',
      type: 'review_received',
      message: 'Received 5-star review from Mike Chen',
      time: '4 hours ago',
      icon: <Star className="h-4 w-4 text-amber-500" />
    },
    {
      id: '3',
      type: 'new_student',
      message: 'New student enrolled: Emma Davis',
      time: '1 day ago',
      icon: <User className="h-4 w-4 text-blue-500" />
    },
    {
      id: '4',
      type: 'content_uploaded',
      message: 'Uploaded new lesson: "Advanced Calculus"',
      time: '2 days ago',
      icon: <FileText className="h-4 w-4 text-indigo-500" />
    }
  ]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard/teacher');
    } else if (!loading && isAuthenticated && claims) {
      if (claims.role === UserRole.PENDING_TEACHER) {
        router.push('/dashboard/teacher/pending');
      }
    }
  }, [loading, isAuthenticated, claims, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardContent className="pt-6">
            <div className="text-center">
              <GraduationCap className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Authentication Required</h3>
              <p className="text-slate-500">Please log in to access your teacher dashboard.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
                  <p className="text-sm text-slate-500">
                    Welcome back, {user?.displayName || user?.email || 'Teacher'}!
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" className="gap-2 bg-white hover:bg-slate-50">
                  <Bell className="h-4 w-4" />
                  Notifications
                  <Badge className="ml-1 bg-red-500 hover:bg-red-600">3</Badge>
                </Button>
                <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4" />
                  New Session
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview - Enhanced Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              title="Total Students"
              value={stats.totalStudents}
              trendLabel="this month"
              trendValue="+4"
              icon={Users}
              iconColor="text-blue-600"
              bgColor="bg-blue-100"
              trendColor="text-emerald-600"
            />

            <MetricCard
              title="Active Sessions"
              value={stats.activeSessions}
              trendValue="+8"
              trendLabel="since yesterday"
              icon={Clock}
              iconColor="text-indigo-600"
              bgColor="bg-indigo-100"
              trendColor="text-emerald-600"
            />

            <MetricCard
              title="Total Earnings"
              value={`$${(stats.totalEarnings / 1000).toFixed(1)}K`}
              trendValue="+12.3%"
              trendLabel="this month"
              icon={DollarSign}
              iconColor="text-emerald-600"
              bgColor="bg-emerald-100"
              trendColor="text-emerald-600"
            />

            <MetricCard
              title="Average Rating"
              value={stats.averageRating.toFixed(1)}
              trendValue="+0.2"
              trendLabel="vs last month"
              icon={Star}
              iconColor="text-amber-500"
              bgColor="bg-amber-100"
              trendColor="text-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Sessions */}
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <span>Upcoming Sessions</span>
                    </CardTitle>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50/50 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2.5 rounded-lg ${
                            session.type === 'group' ? 'bg-purple-100' : 'bg-blue-100'
                          }`}>
                            {session.type === 'group' ? (
                              <Users className="h-5 w-5 text-purple-600" />
                            ) : (
                              <User className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{session.studentName}</p>
                            <p className="text-sm text-slate-500">{session.subject} • {session.duration} min</p>
                            <p className="text-xs text-slate-400 mt-1">{session.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${
                            session.status === 'confirmed' 
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' 
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                          }`}>
                            {session.status}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Video className="h-4 w-4 text-slate-500 hover:text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4 text-slate-500 hover:text-blue-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Analytics */}
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span>Performance Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-slate-700">Session Completion Rate</span>
                        <span className="text-sm font-bold text-slate-900">94%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-slate-700">Student Satisfaction</span>
                        <span className="text-sm font-bold text-slate-900">4.8/5.0</span>
                      </div>
                      <Progress value={96} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-slate-700">Response Time</span>
                        <span className="text-sm font-bold text-slate-900">2 hours</span>
                      </div>
                      <Progress value={88} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-slate-700">Content Quality</span>
                        <span className="text-sm font-bold text-slate-900">Excellent</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="pb-4">
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and tools for managing your teaching
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/dashboard/teacher/sessions">
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 w-full border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <Calendar className="h-6 w-6 text-slate-600" />
                        <span className="text-xs font-medium text-slate-700">Manage Sessions</span>
                      </Button>
                    </Link>
                    <Link href="/dashboard/teacher/students">
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 w-full border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <Users className="h-6 w-6 text-slate-600" />
                        <span className="text-xs font-medium text-slate-700">View Students</span>
                      </Button>
                    </Link>
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      <FileText className="h-6 w-6 text-slate-600" />
                      <span className="text-xs font-medium text-slate-700">Upload Content</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      <BarChart3 className="h-6 w-6 text-slate-600" />
                      <span className="text-xs font-medium text-slate-700">View Analytics</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Recent Activity */}
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Zap className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-0 border-slate-200">
                        <div className="p-2 rounded-lg bg-slate-100 flex-shrink-0">
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 leading-snug">{activity.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Student Progress */}
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span>Student Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          AJ
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Alice Johnson</p>
                          <p className="text-xs text-slate-500">Mathematics</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">85%</p>
                        <p className="text-xs text-slate-500">Progress</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          BS
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Bob Smith</p>
                          <p className="text-xs text-slate-500">Physics</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">92%</p>
                        <p className="text-xs text-slate-500">Progress</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          ED
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Emma Davis</p>
                          <p className="text-xs text-slate-500">Chemistry</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-amber-600">67%</p>
                        <p className="text-xs text-slate-500">Progress</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Earnings Summary */}
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-yellow-600" />
                    </div>
                    <span>Earnings Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-sm text-slate-600">This Month</span>
                      <span className="font-semibold text-slate-900">$1,240</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-sm text-slate-600">Last Month</span>
                      <span className="font-semibold text-slate-900">$1,180</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-sm text-slate-600">Pending</span>
                      <span className="font-semibold text-amber-600">$420</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-semibold text-slate-700">Total Earned</span>
                      <span className="font-bold text-lg text-emerald-600">${stats.totalEarnings}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

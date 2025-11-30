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
import { Users, Calendar, TrendingUp, Clock, Star, FileText, Video, DollarSign, Bell, Plus, Eye, Edit, BarChart3, CheckCircle, User, GraduationCap, Zap, BookOpen } from 'lucide-react';
import { MetricCard } from '@/components/ui/stats-card';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

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
  const authenticatedFetch = useAuthenticatedFetch();
  
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    activeSessions: 0,
    completedSessions: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
    upcomingSessions: 0,
    contentUploads: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [upcomingSessions] = useState<UpcomingSession[]>([]);

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Fetch teacher stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await authenticatedFetch('/api/teacher/stats');
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalStudents: data.data.activeStudents || 0,
            activeSessions: 0, // Sessions feature not implemented yet
            completedSessions: data.data.lessonsCompleted || 0,
            totalEarnings: 0, // Earnings feature not implemented yet
            averageRating: data.data.averageRating || 0,
            totalReviews: data.data.totalReviews || 0,
            upcomingSessions: 0, // Sessions feature not implemented yet
            contentUploads: data.data.totalLessons || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (!loading && isAuthenticated) {
      fetchStats();
    }
  }, [loading, isAuthenticated, authenticatedFetch]);

  // Fetch recent activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await authenticatedFetch('/api/teacher/activities');
        if (response.ok) {
          const data = await response.json();
          const activities = (data.data || []).map((activity: any) => {
            let icon = <FileText className="h-4 w-4 text-indigo-500" />;
            
            switch (activity.type) {
              case 'review_received':
                icon = <Star className="h-4 w-4 text-amber-500" />;
                break;
              case 'new_enrollment':
                icon = <User className="h-4 w-4 text-blue-500" />;
                break;
              case 'course_published':
                icon = <CheckCircle className="h-4 w-4 text-emerald-500" />;
                break;
            }

            return {
              id: activity.id,
              type: activity.type,
              message: activity.message,
              time: activity.time,
              icon
            };
          });
          setRecentActivity(activities);
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    if (!loading && isAuthenticated) {
      fetchActivities();
    }
  }, [loading, isAuthenticated, authenticatedFetch]);

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
                  {recentActivity.length > 0 && (
                    <Badge className="ml-1 bg-red-500 hover:bg-red-600">{recentActivity.length}</Badge>
                  )}
                </Button>
                <Link href="/dashboard/teacher/courses/new">
                  <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4" />
                    New Course
                  </Button>
                </Link>
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
              {/* Courses Overview */}
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <span>Your Courses</span>
                    </CardTitle>
                    <Link href="/dashboard/teacher/courses">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 mb-4">Manage your courses and lessons</p>
                    <Link href="/dashboard/teacher/courses">
                      <Button variant="outline" size="sm">
                        Go to Courses
                      </Button>
                    </Link>
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
                    <Link href="/dashboard/teacher/courses">
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 w-full border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <BookOpen className="h-6 w-6 text-slate-600" />
                        <span className="text-xs font-medium text-slate-700">My Courses</span>
                      </Button>
                    </Link>
                    <Link href="/dashboard/teacher/students">
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 w-full border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <Users className="h-6 w-6 text-slate-600" />
                        <span className="text-xs font-medium text-slate-700">View Students</span>
                      </Button>
                    </Link>
                    <Link href="/dashboard/teacher/content">
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 w-full border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <FileText className="h-6 w-6 text-slate-600" />
                        <span className="text-xs font-medium text-slate-700">Upload Content</span>
                      </Button>
                    </Link>
                    <Link href="/dashboard/teacher/profile">
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 w-full border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <User className="h-6 w-6 text-slate-600" />
                        <span className="text-xs font-medium text-slate-700">My Profile</span>
                      </Button>
                    </Link>
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
                  {activitiesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-3 pb-4 border-b border-slate-200">
                          <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse" />
                          <div className="flex-1">
                            <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse mb-2" />
                            <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentActivity.length > 0 ? (
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
                  ) : (
                    <div className="text-center py-8">
                      <Zap className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No recent activity</p>
                    </div>
                  )}
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

              {/* Teacher Guide */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <span>Need Help?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-700">
                      Learn how to make the most of Learnity's teaching platform
                    </p>
                    <div className="space-y-2">
                      <Link href="/help/teacher-guide" className="block">
                        <Button variant="outline" size="sm" className="w-full justify-start bg-white">
                          <FileText className="h-4 w-4 mr-2" />
                          Teacher's Guide
                        </Button>
                      </Link>
                      <Link href="/help/faq" className="block">
                        <Button variant="outline" size="sm" className="w-full justify-start bg-white">
                          <Star className="h-4 w-4 mr-2" />
                          FAQs
                        </Button>
                      </Link>
                      <Link href="/support" className="block">
                        <Button variant="outline" size="sm" className="w-full justify-start bg-white">
                          <Users className="h-4 w-4 mr-2" />
                          Contact Support
                        </Button>
                      </Link>
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

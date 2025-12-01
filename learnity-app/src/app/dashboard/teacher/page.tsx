'use client';

/**
 * Teacher Dashboard - Modern & Advanced UI
 * Comprehensive dashboard for teachers with course management and analytics
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/auth';
import { 
  Users, Star, FileText, Plus, Eye, 
  BarChart3, CheckCircle, User, GraduationCap, Zap, BookOpen,
  HelpCircle, MessageSquare, Video
} from 'lucide-react';
import { MetricCard } from '@/components/ui/stats-card';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Skeleton } from '@/components/ui/skeleton';

interface TeacherStats {
  totalStudents: number;
  totalCourses: number;
  publishedCourses: number;
  totalLessons: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  time: string;
  icon: React.ReactNode;
}

interface RecentCourse {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';
  enrollmentCount: number;
  lessonCount: number;
}

export default function TeacherDashboard() {
  const { user, loading, isAuthenticated, claims } = useClientAuth();
  const router = useRouter();
  const authenticatedFetch = useAuthenticatedFetch();
  
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    totalCourses: 0,
    publishedCourses: 0,
    totalLessons: 0,
    averageRating: 0,
    totalReviews: 0,
    completionRate: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);


  // Course type for stats calculation
  interface CourseData {
    id: string;
    title: string;
    status: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';
    enrollmentCount?: number;
    lessonCount?: number;
    averageRating?: number;
    reviewCount?: number;
  }

  // Fetch teacher stats
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated || loading) return;
    
    try {
      setStatsLoading(true);
      const response = await authenticatedFetch('/api/courses?teacherOnly=true');
      if (response.ok) {
        const data = await response.json();
        const courses: CourseData[] = data.data?.courses || [];
        
        // Calculate stats from courses
        const totalStudents = courses.reduce((sum: number, c: CourseData) => sum + (c.enrollmentCount || 0), 0);
        const totalLessons = courses.reduce((sum: number, c: CourseData) => sum + (c.lessonCount || 0), 0);
        const publishedCourses = courses.filter((c: CourseData) => c.status === 'PUBLISHED').length;
        const coursesWithRating = courses.filter((c: CourseData) => (c.averageRating || 0) > 0);
        const avgRating = coursesWithRating.length > 0 
          ? coursesWithRating.reduce((sum: number, c: CourseData) => sum + Number(c.averageRating || 0), 0) / coursesWithRating.length
          : 0;
        const totalReviews = courses.reduce((sum: number, c: CourseData) => sum + (c.reviewCount || 0), 0);

        setStats({
          totalStudents,
          totalCourses: courses.length,
          publishedCourses,
          totalLessons,
          averageRating: avgRating,
          totalReviews,
          completionRate: 0
        });

        // Set recent courses (last 3)
        setRecentCourses(courses.slice(0, 3).map((c: CourseData) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          enrollmentCount: c.enrollmentCount || 0,
          lessonCount: c.lessonCount || 0
        })));
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [loading, isAuthenticated, authenticatedFetch]);

  // Activity data type
  interface ActivityData {
    id: string;
    type: string;
    message: string;
    time: string;
  }

  // Fetch recent activities
  const fetchActivities = useCallback(async () => {
    if (!isAuthenticated || loading) return;
    
    try {
      setActivitiesLoading(true);
      const response = await authenticatedFetch('/api/teacher/activities');
      if (response.ok) {
        const data = await response.json();
        const activities = (data.data || []).map((activity: ActivityData) => {
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
  }, [loading, isAuthenticated, authenticatedFetch]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      fetchStats();
      fetchActivities();
    }
  }, [loading, isAuthenticated, fetchStats, fetchActivities]);

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


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge className="bg-emerald-100 text-emerald-700">Published</Badge>;
      case 'DRAFT':
        return <Badge className="bg-slate-100 text-slate-700">Draft</Badge>;
      case 'UNPUBLISHED':
        return <Badge className="bg-amber-100 text-amber-700">Unpublished</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
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
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statsLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <MetricCard
                  title="Total Students"
                  value={stats.totalStudents}
                  trendValue={String(stats.totalStudents)}
                  trendLabel="enrolled"
                  icon={Users}
                  iconColor="text-blue-600"
                  bgColor="bg-blue-100"
                />

                <MetricCard
                  title="Total Courses"
                  value={stats.totalCourses}
                  trendValue={`${stats.publishedCourses} published`}
                  trendLabel="courses"
                  icon={BookOpen}
                  iconColor="text-indigo-600"
                  bgColor="bg-indigo-100"
                />

                <MetricCard
                  title="Total Lessons"
                  value={stats.totalLessons}
                  trendValue={String(stats.totalLessons)}
                  trendLabel="created"
                  icon={FileText}
                  iconColor="text-emerald-600"
                  bgColor="bg-emerald-100"
                />

                <MetricCard
                  title="Average Rating"
                  value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                  trendValue={stats.totalReviews > 0 ? `${stats.totalReviews} reviews` : 'No reviews'}
                  trendLabel="total"
                  icon={Star}
                  iconColor="text-amber-500"
                  bgColor="bg-amber-100"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Courses */}
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
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
                  {statsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : recentCourses.length > 0 ? (
                    <div className="space-y-4">
                      {recentCourses.map((course) => (
                        <div key={course.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">{course.title}</p>
                            <p className="text-sm text-slate-500">
                              {course.lessonCount} lessons • {course.enrollmentCount} students
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(course.status)}
                            <Link href={`/dashboard/teacher/courses/${course.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600 mb-4">No courses yet. Create your first course!</p>
                      <Link href="/dashboard/teacher/courses/new">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create Course
                        </Button>
                      </Link>
                    </div>
                  )}
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
                    <Link href="/dashboard/teacher/courses/new">
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 w-full border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                        <Plus className="h-6 w-6 text-slate-600" />
                        <span className="text-xs font-medium text-slate-700">New Course</span>
                      </Button>
                    </Link>
                    <Link href="/dashboard/teacher/sessions">
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 w-full border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                        <Video className="h-6 w-6 text-slate-600" />
                        <span className="text-xs font-medium text-slate-700">Live Sessions</span>
                      </Button>
                    </Link>
                    <Link href="/dashboard/teacher/profile">
                      <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 w-full border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
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
                          <Skeleton className="w-8 h-8 rounded-lg" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-1/2" />
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

              {/* Teacher Guide */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <HelpCircle className="h-5 w-5 text-white" />
                    </div>
                    <span>Getting Started</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-700">
                      New to Learnity? Here&apos;s how to get started:
                    </p>
                    <ol className="text-sm text-slate-600 space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">1</span>
                        <span>Create your first course with sections and lessons</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">2</span>
                        <span>Add YouTube video links for each lesson</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">3</span>
                        <span>Create quizzes to test student understanding</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">4</span>
                        <span>Publish your course and share with students</span>
                      </li>
                    </ol>
                    <Link href="/dashboard/teacher/courses/new">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <Plus className="h-4 w-4" />
                        Create Your First Course
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Communication Tips */}
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    </div>
                    <span>Connect with Students</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    Add communication links to your courses so students can reach you:
                  </p>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      WhatsApp group for Q&A
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Contact email for support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Direct WhatsApp number
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { AuthenticatedLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AsyncButton } from '@/components/ui/async-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, Star, FileText, Plus, Eye, 
  BarChart3, CheckCircle, User, GraduationCap, Zap, BookOpen,
  HelpCircle, MessageSquare, Video, ArrowRight, Settings
} from 'lucide-react';
import { UserRole } from '@/types/auth';

// --- Types ---
interface TeacherStats {
  totalStudents: number;
  totalCourses: number;
  publishedCourses: number;
  totalLessons: number;
  averageRating: number;
  totalReviews: number;
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

// --- Sub-Components ---

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, bgClass, loading }: any) => (
  <Card className="border shadow-sm transition-shadow duration-200">
    <CardContent className="p-5 flex items-center justify-between">
      {loading ? (
        <div className="w-full space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ) : (
        <>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            <p className="text-xs text-slate-400 mt-1">{subtext}</p>
          </div>
          <div className={`p-3 rounded-xl ${bgClass}`}>
            <Icon className={`h-5 w-5 ${colorClass}`} />
          </div>
        </>
      )}
    </CardContent>
  </Card>
);

const QuickActionTile = ({ href, icon: Icon, title, desc, colorClass, bgClass }: any) => (
  <Link href={href} className="group">
    <div className="h-full p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400  transition-all duration-200 flex flex-col justify-between">
      <div className={`w-10 h-10 rounded-lg ${bgClass} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 text-sm">{title}</h4>
        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{desc}</p>
      </div>
    </div>
  </Link>
);

const CourseRow = ({ course }: { course: RecentCourse }) => {
  const getStatusBadge = (status: string) => {
    const styles = {
      PUBLISHED: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
      DRAFT: "bg-slate-100 text-slate-700 hover:bg-slate-100",
      UNPUBLISHED: "bg-amber-100 text-amber-700 hover:bg-amber-100"
    };
    const label = status.charAt(0) + status.slice(1).toLowerCase();
    return <Badge className={`${styles[status as keyof typeof styles] || ''} border-0`}>{label}</Badge>;
  };

  return (
    <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200">
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
          {course.title.substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-slate-900 truncate text-sm">{course.title}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.lessonCount}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.enrollmentCount}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {getStatusBadge(course.status)}
        <Link href={`/dashboard/teacher/courses/${course.id}/edit`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
            <BarChart3 className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

// --- Main Component ---

export default function TeacherDashboard() {
  const { user, loading, isAuthenticated, claims } = useClientAuth();
  const router = useRouter();
  const authenticatedFetch = useAuthenticatedFetch();
  
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0, totalCourses: 0, publishedCourses: 0, totalLessons: 0, averageRating: 0, totalReviews: 0
  });
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoadingData(true);
      const [coursesRes, activitiesRes] = await Promise.all([
        authenticatedFetch('/api/courses?teacherOnly=true'),
        authenticatedFetch('/api/teacher/activities')
      ]);

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        const courses = data.data?.courses || [];
        
        // Calculations
        const totalStudents = courses.reduce((sum: any, c: any) => sum + (c.enrollmentCount || 0), 0);
        const totalLessons = courses.reduce((sum: any, c: any) => sum + (c.lessonCount || 0), 0);
        const publishedCourses = courses.filter((c: any) => c.status === 'PUBLISHED').length;
        const ratedCourses = courses.filter((c: any) => (c.averageRating || 0) > 0);
        const avgRating = ratedCourses.length ? ratedCourses.reduce((sum: any, c: any) => sum + Number(c.averageRating || 0), 0) / ratedCourses.length : 0;

        setStats({
          totalStudents,
          totalCourses: courses.length,
          publishedCourses,
          totalLessons,
          averageRating: avgRating,
          totalReviews: courses.reduce((sum: any, c: any) => sum + (c.reviewCount || 0), 0)
        });

        setRecentCourses(courses.slice(0, 4).map((c: any) => ({
          id: c.id, title: c.title, status: c.status,
          enrollmentCount: c.enrollmentCount || 0, lessonCount: c.lessonCount || 0
        })));
      }

      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        const iconMap: Record<string, any> = {
          'review_received': { icon: <Star className="h-3.5 w-3.5" />, bg: 'bg-amber-100', text: 'text-amber-600' },
          'new_enrollment': { icon: <User className="h-3.5 w-3.5" />, bg: 'bg-blue-100', text: 'text-blue-600' },
          'course_published': { icon: <CheckCircle className="h-3.5 w-3.5" />, bg: 'bg-emerald-100', text: 'text-emerald-600' }
        };

        setRecentActivity((data.data || []).map((activity: any) => {
          const style = iconMap[activity.type] || { icon: <FileText className="h-3.5 w-3.5" />, bg: 'bg-indigo-100', text: 'text-indigo-600' };
          return {
            ...activity,
            icon: <div className={`p-1.5 rounded-md ${style.bg} ${style.text}`}>{style.icon}</div>
          };
        }));
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated, authenticatedFetch]);

  useEffect(() => {
    if (!loading && isAuthenticated) fetchData();
    if (!loading && !isAuthenticated) router.push('/auth/login?redirect=/dashboard/teacher');
    if (!loading && claims?.role === UserRole.PENDING_TEACHER) router.push('/dashboard/teacher/pending');
  }, [loading, isAuthenticated, claims, router, fetchData]);

  if (loading) return null; 

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-slate-50/50">
        <PageHeader
          title="Overview"
          subtitle={`Welcome back, ${user?.displayName?.split(' ')[0] || 'Teacher'}`}
          icon={GraduationCap}
          actions={
            <Link href="/dashboard/teacher/courses/new">
              <AsyncButton size="sm" className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
                <Plus className="h-4 w-4 mr-2" /> New Course
              </AsyncButton>
            </Link>
          }
        />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2 space-y-6">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <StatCard 
              loading={isLoadingData}
              title="Total Students" 
              value={stats.totalStudents} 
              subtext="Across all courses"
              icon={Users} 
              colorClass="text-blue-600" 
              bgClass="bg-blue-50" 
            />
            {/* <StatCard 
              loading={isLoadingData}
              title="Published Courses" 
              value={stats.publishedCourses} 
              subtext={`${stats.totalCourses} total drafted`}
              icon={BookOpen} 
              colorClass="text-indigo-600" 
              bgClass="bg-indigo-50" 
            /> */}
            <StatCard 
              loading={isLoadingData}
              title="Content Library" 
              value={stats.totalLessons} 
              subtext="Total active lessons"
              icon={FileText} 
              colorClass="text-emerald-600" 
              bgClass="bg-emerald-50" 
            />
            <StatCard 
              loading={isLoadingData}
              title="Instructor Rating" 
              value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'} 
              subtext={`${stats.totalReviews} reviews`}
              icon={Star} 
              colorClass="text-amber-500" 
              bgClass="bg-amber-50" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left Column (8 cols) - Actions & Courses */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Quick Actions Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickActionTile 
                  href="/dashboard/teacher/courses" 
                  icon={BookOpen} 
                  title="My Courses" 
                  desc="Manage content"
                  colorClass="text-blue-600"
                  bgClass="bg-blue-50"
                />
                <QuickActionTile 
                  href="/dashboard/teacher/courses/new" 
                  icon={Plus} 
                  title="Create New" 
                  desc="Start a course"
                  colorClass="text-emerald-600"
                  bgClass="bg-emerald-50"
                />
                <QuickActionTile 
                  href="/dashboard/teacher/sessions" 
                  icon={Video} 
                  title="Live Sessions" 
                  desc="Schedule calls"
                  colorClass="text-purple-600"
                  bgClass="bg-purple-50"
                />
                <QuickActionTile 
                  href="/dashboard/teacher/profile" 
                  icon={Settings} 
                  title="Profile" 
                  desc="Edit details"
                  colorClass="text-slate-600"
                  bgClass="bg-slate-100"
                />
              </div>

              {/* Courses List */}
              <Card className="border shadow-sm">
                <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900">Recent Courses</CardTitle>
                  <Link href="/dashboard/teacher/courses">
                    <Button variant="link" size="sm" className="h-auto p-0 text-blue-600 font-medium">
                      View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-3">
                  {isLoadingData ? (
                    [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full mb-2 rounded-lg" />)
                  ) : recentCourses.length > 0 ? (
                    <div className="space-y-1">
                      {recentCourses.map(course => <CourseRow key={course.id} course={course} />)}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BookOpen className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="text-slate-500 text-sm mb-4">You haven't created any courses yet.</p>
                      <Link href="/dashboard/teacher/courses/new">
                        <Button size="sm" className="bg-slate-900 text-white">Create Course</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column (4 cols) - Activity & Tips */}
            <div className="lg:col-span-4 space-y-6 w-full">
              {/* Activity Feed */}
              <Card className="border shadow-sm">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center text-left text-base font-semibold">
                    <Zap className="h-4 w-4 text-amber-500" /> Activity Feed
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[310px] overflow-y-auto custom-scrollbar">
                    {isLoadingData ? (
                      [1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3 mb-4">
                          <Skeleton className="w-8 h-8 rounded-md" />
                          <div className="flex-1 space-y-2"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-2 w-1/2" /></div>
                        </div>
                      ))
                    ) : recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex gap-3">
                            <div className="shrink-0 pt-1">{activity.icon}</div>
                            <div>
                              <p className="text-sm text-slate-800 font-medium">{activity.message}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-sm text-slate-500 py-4">No recent activity.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
            </div>
          </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               {/* Getting Started - Visual Pop */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-600 to-violet-700 text-white overflow-hidden relative">
                {/* Decor elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-5 -mb-5" />
                
                <CardHeader className="relative z-10 pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HelpCircle className="h-4 w-4 opacity-80" /> 
                    Setup Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pt-0">
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center gap-3 text-sm font-medium text-indigo-100">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">1</div>
                      <span>Draft course structure</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-indigo-100">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">2</div>
                      <span>Upload video content</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-indigo-100">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">3</div>
                      <span>Publish & Share</span>
                    </div>
                  </div>
                  <Link href="/dashboard/teacher/courses/new">
                    <Button size="sm" className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-0 font-semibold">
                      Start Creating
                    </Button>
                  </Link>
                </CardContent>
              </Card>
               {/* Support Links */}
              <Card className="border shadow-sm">
                <CardHeader className="py-3 px-5 bg-slate-50 border-b border-slate-100">
                  <CardTitle className="text-sm font-medium text-slate-600">Student Connection</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500" /> <span>WhatsApp Group active</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500" /> <span>Support Email set</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-xs mt-2 h-8">Manage Settings</Button>
                </CardContent>
              </Card>
            </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
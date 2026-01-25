'use client';

/**
 * My Courses Page
 * Student's enrolled courses with progress tracking
 * Requirements: 3.7, 4.4 - Enrolled courses with progress, continue learning section, completed courses
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Play,
  Trophy,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { cn } from '@/lib/utils';
import { EnrolledCourseCard } from '@/components/students/EnrolledCourseCard';

interface CourseEnrollment {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'UNENROLLED';
  progress: number;
  enrolledAt: string;
  lastAccessedAt: string;
  completedAt?: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    totalDuration: number;
    lessonCount: number;
    averageRating: number;
    reviewCount: number;
    teacher: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
    category: {
      id: string;
      name: string;
    };
  };
}

// Loading Skeleton
function CourseCardSkeleton() {
  return (
    <Card className='overflow-hidden'>
      <div className='flex flex-col sm:flex-row'>
        <Skeleton className='w-full sm:w-48 h-32' />
        <div className='flex-1 p-4 space-y-3'>
          <div className='flex gap-2'>
            <Skeleton className='h-5 w-20' />
            <Skeleton className='h-5 w-24' />
          </div>
          <Skeleton className='h-6 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
          <Skeleton className='h-2 w-full' />
          <div className='flex justify-between'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-8 w-24' />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function MyCoursesPage() {
  const router = useRouter();
  const api = useAuthenticatedApi();

  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'all' | 'in-progress' | 'completed'
  >('all');

  // Fetch enrollments
  const fetchEnrollments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/enrollments?limit=50');
      // API returns { success: true, data: { enrollments: ... } }
      setEnrollments(response.data?.enrollments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleContinueCourse = (courseId: string) => {
    router.push(`/dashboard/student/courses/${courseId}/learn`);
  };

  // Filter enrollments based on active tab
  const filteredEnrollments = enrollments.filter(enrollment => {
    if (activeTab === 'in-progress') {
      return enrollment.status === 'ACTIVE' && enrollment.progress < 100;
    }
    if (activeTab === 'completed') {
      return enrollment.status === 'COMPLETED';
    }
    return enrollment.status !== 'UNENROLLED';
  });

  // Get continue learning courses (in progress, sorted by last accessed)
  const continueLearningCourses = enrollments
    .filter(e => e.status === 'ACTIVE' && e.progress > 0 && e.progress < 100)
    .sort(
      (a, b) =>
        new Date(b.lastAccessedAt).getTime() -
        new Date(a.lastAccessedAt).getTime()
    )
    .slice(0, 3);

  // Stats
  const totalCourses = enrollments.filter(
    e => e.status !== 'UNENROLLED'
  ).length;
  const completedCourses = enrollments.filter(
    e => e.status === 'COMPLETED'
  ).length;
  const inProgressCourses = enrollments.filter(
    e => e.status === 'ACTIVE' && e.progress < 100
  ).length;

  return (
    <div className='flex-1 bg-slate-50'>
      {/* Header */}
      <header className='sticky top-0 z-30 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/60 transition-all'>
        {/* Subtle Top Gradient Accent */}
        <div className='absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-emerald-500 via-teal-500 to-indigo-500 opacity-60' />

        <div className='max-w-[1600px] mx-auto px-6 lg:px-10 py-7'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
            {/* Brand & Stats HUD */}
            <div className='flex items-start gap-4'>
              <div className='mt-1 p-2.5 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100 shrink-0'>
                <GraduationCap className='h-6 w-6' />
              </div>
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <span className='px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100/50'>
                    Student Dashboard
                  </span>
                  <span className='h-1 w-1 rounded-full bg-slate-300' />
                  <span className='text-[10px] font-bold text-slate-400 uppercase tracking-tight'>
                    {completedCourses} Modules Completed
                  </span>
                </div>
                <h1 className='text-3xl font-black text-slate-900 tracking-tight'>
                  My Learning{' '}
                  <span className='text-slate-400 font-light italic'>Path</span>
                </h1>
                <p className='text-sm font-medium text-slate-500 max-w-md'>
                  Continuity is key. You&apos;re currently making progress in{' '}
                  <span className='text-indigo-600 font-bold'>
                    3 active courses
                  </span>
                  .
                </p>
              </div>
            </div>

            {/* Primary Action with Micro-interaction */}
            <div className='flex items-center gap-3'>
              <Link href='/dashboard/student/public-cources'>
                <Button className='h-12 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center gap-2 group'>
                  <BookOpen className='h-4 w-4 text-indigo-400 group-hover:rotate-12 transition-transform' />
                  <span className='text-xs font-black uppercase tracking-widest'>
                    Explore Catalog
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className='px-6 lg:px-8 py-8'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10'>
          {[
            {
              label: 'Total Courses',
              value: totalCourses,
              icon: BookOpen,
              color: 'text-blue-600',
              bg: 'bg-blue-50/50',
            },
            {
              label: 'In Progress',
              value: inProgressCourses,
              icon: Play,
              color: 'text-amber-600',
              bg: 'bg-amber-50/50',
            },
            {
              label: 'Completed',
              value: completedCourses,
              icon: Trophy,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50/50',
            },
          ].map(stat => (
            <div
              key={stat.label}
              className='relative p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition-colors'
            >
              <div className='flex items-center gap-4'>
                {/* Compact Icon Square */}
                <div
                  className={cn(
                    'p-2.5 rounded-xl shrink-0',
                    stat.bg,
                    stat.color
                  )}
                >
                  <stat.icon className='h-5 w-5' />
                </div>

                {/* Text Content */}
                <div className='flex flex-col'>
                  <p className='text-[11px] font-bold text-slate-400 uppercase tracking-wider'>
                    {stat.label}
                  </p>
                  <div className='flex items-baseline gap-1'>
                    <span className='text-2xl font-black text-slate-900 tracking-tight'>
                      {stat.value}
                    </span>
                    <span className='text-[10px] font-medium text-slate-400'>
                      modules
                    </span>
                  </div>
                </div>
              </div>

              {/* Subtle bottom accent line for visual anchor */}
              <div
                className={cn('absolute bottom-0 left-6 right-6 h-px', stat.bg)}
              />
            </div>
          ))}
        </div>

        {/* Continue Learning Section */}
        {!isLoading && continueLearningCourses.length > 0 && (
          <Card className='mb-8 border-primary/20 bg-primary/5'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Play className='h-5 w-5 text-primary' />
                Continue Learning
              </CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {continueLearningCourses.map(enrollment => (
                  <Card
                    key={enrollment.id}
                    className='cursor-pointer hover:shadow-md transition-shadow'
                    onClick={() => handleContinueCourse(enrollment.course.id)}
                  >
                    <CardContent className='p-4'>
                      <h4 className='font-medium line-clamp-1 mb-2'>
                        {enrollment.course.title}
                      </h4>
                      <div className='flex items-center justify-between text-sm mb-2'>
                        <span className='text-muted-foreground'>Progress</span>
                        <span className='font-medium'>
                          {enrollment.progress}%
                        </span>
                      </div>
                      <Progress
                        value={enrollment.progress}
                        className='h-1.5 mb-3'
                      />
                      <Button size='sm' className='w-full'>
                        <Play className='h-3 w-3 mr-1' />
                        Continue
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className='mb-6 border-destructive'>
            <CardContent className='py-6 flex items-center gap-4'>
              <AlertCircle className='h-8 w-8 text-destructive' />
              <div>
                <p className='font-medium text-destructive'>
                  Failed to load courses
                </p>
                <p className='text-sm text-muted-foreground'>{error}</p>
              </div>
              <Button
                variant='outline'
                onClick={fetchEnrollments}
                className='ml-auto'
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Courses Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={v => setActiveTab(v as typeof activeTab)}
        >
          <TabsList className='relative h-12 inline-flex items-center p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/50 mb-8 overflow-hidden'>
            {[
              { id: 'all', label: 'All Courses', count: totalCourses },
              {
                id: 'in-progress',
                label: 'In Progress',
                count: inProgressCourses,
              },
              { id: 'completed', label: 'Completed', count: completedCourses },
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'relative z-10 h-9 px-5 rounded-xl text-xs font-bold transition-all duration-300 outline-none',
                  // Remove the default Shadcn background and shadow so our pill does the work
                  'data-[state=active]:bg-transparent data-[state=active]:shadow-none',
                  activeTab === tab.id
                    ? 'text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <div className='flex items-center gap-2'>
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded-md text-[10px] font-black transition-colors',
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-slate-200/50 text-slate-500'
                    )}
                  >
                    {tab.count}
                  </span>
                </div>

                {/* The Animated Background Pill */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId='activeTabIndicator'
                    className='absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/50 z-[-1]'
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.5 }}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className='space-y-4'>
            {isLoading ? (
              <>
                <CourseCardSkeleton />
                <CourseCardSkeleton />
                <CourseCardSkeleton />
              </>
            ) : filteredEnrollments.length === 0 ? (
              <Card>
                <CardContent className='py-12 text-center'>
                  <GraduationCap className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>
                    {activeTab === 'completed'
                      ? 'No completed courses yet'
                      : activeTab === 'in-progress'
                        ? 'No courses in progress'
                        : 'No enrolled courses'}
                  </h3>
                  <p className='text-muted-foreground mb-4'>
                    {activeTab === 'completed'
                      ? 'Complete your first course to see it here!'
                      : 'Start learning by enrolling in a course'}
                  </p>
                  <Link href='/dashboard/student/public-cources'>
                    <Button>
                      <BookOpen className='h-4 w-4 mr-2' />
                      Browse Courses
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredEnrollments.map(enrollment => (
                <EnrolledCourseCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  onContinue={handleContinueCourse}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

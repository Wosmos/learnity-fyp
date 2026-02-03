'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Video,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Clock,
  Zap,
  Play,
  Code2,
  Sigma,
  Beaker,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { EnrolledCourseCard } from './EnrolledCourseCard'; // Your existing Desktop Card

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
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

// ----------------------------------------------------------------------
// Helpers for Mobile Design (Icons & Gradients)
// ----------------------------------------------------------------------
const getCategoryStyles = (categoryName: string) => {
  const normalized = categoryName?.toLowerCase() || '';
  if (normalized.includes('math')) {
    return {
      gradient: 'from-indigo-500 to-violet-500',
      shadow: 'shadow-indigo-500/20',
      text: 'text-indigo-600',
      icon: Sigma,
    };
  }
  if (normalized.includes('code') || normalized.includes('programming')) {
    return {
      gradient: 'from-purple-600 to-pink-500',
      shadow: 'shadow-purple-500/20',
      text: 'text-purple-600',
      icon: Code2,
    };
  }
  if (normalized.includes('science') || normalized.includes('physic')) {
    return {
      gradient: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/20',
      text: 'text-emerald-600',
      icon: Beaker,
    };
  }
  return {
    gradient: 'from-slate-700 to-slate-600',
    shadow: 'shadow-slate-500/20',
    text: 'text-slate-600',
    icon: GraduationCap,
  };
};

// ----------------------------------------------------------------------
// Components
// ----------------------------------------------------------------------

// 1. Mobile Specific Card (The design you requested)
const MobileCourseCard = ({
  enrollment,
  onClick,
}: {
  enrollment: CourseEnrollment;
  onClick: () => void;
}) => {
  const styles = getCategoryStyles(enrollment.course.category.name);
  const Icon = styles.icon;
  const progress = enrollment.progress || 0;

  return (
    <div
      onClick={onClick}
      className='bg-white p-4 rounded-2xl border border-slate-100 flex gap-4 items-center active:bg-slate-50 active:scale-[0.98] transition-all duration-200 shadow-sm'
    >
      {/* Icon Box */}
      <div
        className={cn(
          'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg',
          styles.gradient,
          styles.shadow
        )}
      >
        <Icon className='w-7 h-7 text-white' />
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <div className='flex justify-between items-start mb-1'>
          <span className='text-[10px] font-bold tracking-wider text-slate-400 uppercase'>
            {enrollment.course.category.name}
          </span>
          <span className={cn('text-xs font-bold', styles.text)}>
            {progress}%
          </span>
        </div>

        <h3 className='font-bold text-slate-900 truncate text-sm'>
          {enrollment.course.title}
        </h3>

        <div className='flex items-center gap-2 mt-2 text-xs text-slate-400 font-medium'>
          <Clock className='w-3 h-3' />
          <span>
            {Math.floor(enrollment.course.totalDuration / 60)}h{' '}
            {enrollment.course.totalDuration % 60}m
          </span>
          <span className='w-1 h-1 bg-slate-300 rounded-full'></span>
          <Zap className='w-3 h-3' />
          <span>{enrollment.course.lessonCount} Lessons</span>
        </div>
      </div>

      {/* Play Button */}
      <button className='w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors'>
        <Play className='w-3.5 h-3.5 fill-current ml-0.5' />
      </button>
    </div>
  );
};

// 2. Loading Skeletons
const MobileSkeleton = () => (
  <div className='space-y-4'>
    <div className='flex justify-between items-center px-1'>
      <Skeleton className='h-6 w-32' />
      <Skeleton className='h-5 w-5 rounded-full' />
    </div>
    {[1, 2].map(i => (
      <div
        key={i}
        className='bg-white p-4 rounded-2xl border border-slate-100 flex gap-4 items-center'
      >
        <Skeleton className='w-14 h-14 rounded-xl' />
        <div className='flex-1 space-y-2'>
          <div className='flex justify-between'>
            <Skeleton className='h-3 w-16' />
            <Skeleton className='h-3 w-8' />
          </div>
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-3 w-1/2' />
        </div>
      </div>
    ))}
  </div>
);

const DesktopSkeleton = () => (
  <div className='grid gap-6'>
    <div className='bg-white rounded-2xl border border-slate-100 p-6 md:p-8'>
      <div className='flex gap-6'>
        <Skeleton className='w-36 h-36 rounded-2xl' />
        <div className='flex-1 space-y-4'>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-2.5 w-full rounded-full' />
        </div>
      </div>
    </div>
  </div>
);

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

const MainSection = () => {
  const router = useRouter();
  const api = useAuthenticatedApi();

  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/enrollments?limit=5&status=ACTIVE');
      setEnrollments(response.data?.enrollments || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load courses';
      // If Forbidden, treat as empty results to avoid breaking the UI for newly registered users
      if (message.includes('Forbidden')) {
        console.warn('[MainSection] Access forbidden, showing empty state');
        setEnrollments([]);
      } else {
        setError(message);
      }
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

  const activeCourses = enrollments
    .filter(e => e.status === 'ACTIVE')
    .sort(
      (a, b) =>
        new Date(b.lastAccessedAt).getTime() -
        new Date(a.lastAccessedAt).getTime()
    )
    .slice(0, 3);

  // Error State Component
  if (error) {
    return (
      <div className='lg:col-span-2 bg-white rounded-2xl border border-red-100 p-8 text-center'>
        <AlertCircle className='h-10 w-10 text-red-400 mx-auto mb-3' />
        <p className='text-sm font-bold text-slate-600 mb-2'>
          Failed to load courses
        </p>
        <Button
          variant='outline'
          size='sm'
          onClick={fetchEnrollments}
          className='text-xs'
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className='lg:col-span-2  md:space-y-10'>
      {/* ================= MOBILE VIEW (Native Design) ================= */}
      <div className='block md:hidden space-y-4 animate-in slide-in-from-bottom-4 duration-500'>
        {/* Header */}
        <div className='flex justify-between items-center px-1'>
          <h2 className='text-lg font-bold text-slate-900'>Learning Tracks</h2>
          <Link href='/dashboard/student/courses'>
            <ArrowUpRight className='w-5 h-5 text-slate-400 hover:text-slate-600' />
          </Link>
        </div>

        {/* List of Compact Cards */}
        <div className='space-y-3'>
          {isLoading ? (
            <MobileSkeleton />
          ) : activeCourses.length === 0 ? (
            <div className='text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200'>
              <BookOpen className='h-8 w-8 text-slate-300 mx-auto mb-2' />
              <p className='text-xs text-slate-500'>No active courses.</p>
              <Link
                href='/dashboard/student/public-cources'
                className='text-xs text-indigo-600 font-bold mt-2 inline-block'
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            activeCourses.map(enrollment => (
              <MobileCourseCard
                key={enrollment.id}
                enrollment={enrollment}
                onClick={() => handleContinueCourse(enrollment.course.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ================= DESKTOP VIEW (Original Design) ================= */}
      <div className='hidden md:block space-y-6'>
        <div className='flex items-end justify-between px-1'>
          <h2 className='text-2xl font-black text-slate-900 tracking-tight'>
            Active Learning Tracks
          </h2>
          <Link href='/dashboard/student/courses'>
            <Button
              variant='link'
              className='text-[11px] font-black uppercase tracking-widest text-indigo-600 p-0 h-auto group'
            >
              Full Syllabus{' '}
              <ArrowUpRight className='h-3 w-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform' />
            </Button>
          </Link>
        </div>

        <div className='grid gap-6'>
          {isLoading ? (
            <>
              <DesktopSkeleton />
              <DesktopSkeleton />
            </>
          ) : activeCourses.length === 0 ? (
            <div className='bg-white rounded-2xl border border-slate-100 p-8 text-center'>
              <BookOpen className='h-10 w-10 text-slate-300 mx-auto mb-3' />
              <p className='text-sm font-bold text-slate-600 mb-2'>
                No active courses yet
              </p>
              <Link href='/dashboard/student/public-cources'>
                <Button
                  size='sm'
                  className='bg-indigo-600 hover:bg-indigo-700 text-white text-xs'
                >
                  Browse Courses
                </Button>
              </Link>
            </div>
          ) : (
            activeCourses.map(enrollment => (
              <EnrolledCourseCard
                key={enrollment.id}
                enrollment={enrollment}
                onContinue={handleContinueCourse}
              />
            ))
          )}
        </div>
      </div>

      {/* ================= SHARED SECTION (Upcoming Sessions) ================= */}
      <section className='space-y-4 md:space-y-6 hidden md:block'>
        <div className='flex items-center gap-2 px-1'>
          <Calendar className='h-4 w-4 text-emerald-600' />
          <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'>
            Upcoming Broadcasts
          </h3>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
          {[
            {
              title: 'Math Tutoring',
              time: 'Today, 3:00 PM',
              host: 'Sarah L.',
              status: 'Live',
            },
            {
              title: 'Physics Lab',
              time: 'Tomorrow, 7:00 PM',
              host: 'Study Group',
              status: 'Waitlist',
            },
          ].map((session, i) => (
            <div
              key={i}
              className='flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 shadow-sm active:scale-[0.98] transition-all duration-200 group cursor-pointer'
            >
              <div
                className={cn(
                  'h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm',
                  session.status === 'Live'
                    ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600'
                    : 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400'
                )}
              >
                {session.status === 'Live' ? (
                  <Video className='h-5 w-5' />
                ) : (
                  <BookOpen className='h-5 w-5' />
                )}
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between mb-0.5'>
                  <h4 className='text-sm font-black text-slate-900 truncate pr-2'>
                    {session.title}
                  </h4>
                  {session.status === 'Live' && (
                    <span className='inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse md:hidden'></span>
                  )}
                </div>
                <p className='text-[11px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1.5'>
                  {session.time}
                  <span className='hidden md:inline-block w-1 h-1 rounded-full bg-slate-300'></span>
                  <span className='hidden md:inline-block font-medium normal-case text-slate-500'>
                    {session.host}
                  </span>
                </p>
              </div>

              <Button
                size='icon'
                variant='ghost'
                className='rounded-full hover:bg-indigo-50 text-slate-300 hover:text-indigo-600 -mr-2'
              >
                <ChevronRight className='h-5 w-5' />
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MainSection;

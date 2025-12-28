'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BookOpen, Calendar, ChevronRight, 
  Video, ArrowUpRight, Loader2, AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { EnrolledCourseCard } from './EnrolledCourseCard';
import Link from 'next/link';

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

// Loading skeleton for course cards
function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-6">
        <Skeleton className="w-full md:w-36 h-36 rounded-2xl" />
        <div className="flex-1 space-y-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-12 w-16" />
          </div>
          <Skeleton className="h-2.5 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-36 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

const MainSection = () => {
  const router = useRouter();
  const api = useAuthenticatedApi();
  
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch enrollments
  const fetchEnrollments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/enrollments?limit=5&status=ACTIVE');
      setEnrollments(response.data?.enrollments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
      console.error('[MainSection] Failed to fetch enrollments:', err);
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

  // Get active courses sorted by last accessed
  const activeCourses = enrollments
    .filter((e) => e.status === 'ACTIVE')
    .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
    .slice(0, 3);

  return (
    <div className="lg:col-span-2 space-y-10">
      {/* 1. ACTIVE LEARNING TRACKS SECTION */}
      <section className="space-y-6">
        <div className="flex items-end justify-between px-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Learning Tracks</h2>
          <Link href="/dashboard/student/courses">
            <Button variant="link" className="text-[11px] font-black uppercase tracking-widest text-indigo-600 p-0 h-auto group">
              Full Syllabus <ArrowUpRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          {isLoading ? (
            <>
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
              <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600 mb-2">Failed to load courses</p>
              <p className="text-xs text-slate-400 mb-4">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchEnrollments}
                className="text-xs"
              >
                Try Again
              </Button>
            </div>
          ) : activeCourses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600 mb-2">No active courses yet</p>
              <p className="text-xs text-slate-400 mb-4">Start your learning journey by enrolling in a course</p>
              <Link href="/dashboard/student/public-cources">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                  Browse Courses
                </Button>
              </Link>
            </div>
          ) : (
            activeCourses.map((enrollment) => (
              <EnrolledCourseCard
                key={enrollment.id}
                enrollment={enrollment}
                onContinue={handleContinueCourse}
              />
            ))
          )}
        </div>
      </section>

      {/* 2. UPCOMING SESSIONS - SLEEKER GRID */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-1">
          <Calendar className="h-4 w-4 text-emerald-600" />
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Upcoming Broadcasts</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Math Tutoring", time: "Today, 3:00 PM", host: "Sarah L.", status: "Live" },
            { title: "Physics Lab", time: "Tomorrow, 7:00 PM", host: "Study Group", status: "Waitlist" }
          ].map((session, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                session.status === "Live" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
              )}>
                {session.status === "Live" ? <Video className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-slate-900 truncate">{session.title}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{session.time}</p>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full hover:bg-indigo-50 hover:text-indigo-600">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MainSection;

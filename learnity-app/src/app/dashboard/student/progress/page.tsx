'use client';

/**
 * Student Progress Page
 * Comprehensive learning progress tracking with visualizations
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Play,
  CheckCircle,
  Target,
  Calendar,
  ChevronRight,
  BarChart3,
  Flame,
  GraduationCap,
  ArrowRight,
  Loader2,
  AlertCircle,
  Activity,
  MonitorPlay,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { MetricCard } from '@/components/ui/stats-card';

interface CourseProgress {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  thumbnailUrl?: string;
  difficulty: string;
  category: { id: string; name: string };
  teacher: { id: string; name: string; avatarUrl?: string };
  status: string;
  enrolledAt: string;
  lastAccessedAt: string;
  completedAt?: string;
  progress: {
    percentage: number;
    totalLessons: number;
    completedLessons: number;
    totalDuration: number;
    watchedDuration: number;
    remainingDuration: number;
  };
  sectionProgress: Array<{
    id: string;
    title: string;
    order: number;
    totalLessons: number;
    completedLessons: number;
    progress: number;
  }>;
  nextLesson?: {
    id: string;
    title: string;
    sectionTitle: string;
    type: string;
    duration: number;
    lastPosition: number;
  };
}

interface ProgressData {
  overview: {
    totalEnrolled: number;
    completedCourses: number;
    inProgressCourses: number;
    totalLessonsCompleted: number;
    totalWatchTime: number;
    averageProgress: number;
  };
  courses: CourseProgress[];
  weeklyActivity: Array<{ date: string; lessonsCompleted: number }>;
  categoryStats: Array<{
    name: string;
    enrolled: number;
    completed: number;
    averageProgress: number;
  }>;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const difficultyColors = {
  BEGINNER: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  INTERMEDIATE: 'bg-amber-50 text-amber-600 border-amber-100',
  ADVANCED: 'bg-red-50 text-red-600 border-red-100',
};

export default function ProgressPage() {
  const router = useRouter();
  const api = useAuthenticatedApi();

  const [data, setData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/student/progress');
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
      console.error('[ProgressPage] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleContinueCourse = (courseId: string) => {
    router.push(`/dashboard/student/courses/${courseId}/learn`);
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl mb-8" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to load progress</h3>
            <p className="text-sm text-slate-500 mb-4">{error}</p>
            <Button onClick={fetchProgress}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overview = data?.overview;
  const courses = data?.courses || [];
  const weeklyActivity = data?.weeklyActivity || [];
  const categoryStats = data?.categoryStats || [];

  // Get max value for chart scaling
  const maxLessons = Math.max(...weeklyActivity.map(d => d.lessonsCompleted), 1);

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Learning Progress
                </h1>
                <p className="text-sm text-slate-500">
                  Track your journey and celebrate milestones
                </p>
              </div>
            </div>
            <Link href="/dashboard/student/achievements">
              <Button variant="outline" className="rounded-xl">
                <Trophy className="h-4 w-4 mr-2" />
                View Achievements
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 space-y-10">
        {/* Overview Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: 'Courses Enrolled',
              value: overview?.totalEnrolled || 0,
              sub: `${overview?.completedCourses || 0} completed`,
              icon: BookOpen,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              label: 'Lessons Completed',
              value: overview?.totalLessonsCompleted || 0,
              sub: 'total lessons',
              icon: CheckCircle,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              label: 'Study Time',
              value: formatDuration(overview?.totalWatchTime || 0),
              sub: 'total watched',
              icon: Clock,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
            },
            {
              label: 'Average Progress',
              value: `${overview?.averageProgress || 0}%`,
              sub: 'across all courses',
              icon: TrendingUp,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
          ].map((metric, index) => (
            <MetricCard
              key={index}
              variant="secondary"
              title={metric.label}
              value={metric.value}
              trendValue={metric.sub}
              icon={metric.icon}
            />
          ))}
        </section>

        {/* Weekly Activity Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-slate-200/60 shadow-sm bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="pb-0 pt-6 px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-200">
                    <Activity />
                  </div>
                  <div>
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">
                      Activity <span className="text-slate-400 font-light italic">Monitor</span>
                    </CardTitle>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Biometric Learning Sync</p>
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">
                  Live Feed
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-8 relative">
              {/* 1. The "Ghost" Area Flow (The Background Combo) */}
              <div className="absolute inset-x-8 bottom-24 h-24 opacity-[0.08] pointer-events-none">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d={`M ${weeklyActivity.map((day, i) =>
                      `${(i * (100 / 6))},${100 - (day.lessonsCompleted / maxLessons * 80)}`
                    ).join(' L ')} L 100,100 L 0,100 Z`}
                    fill="url(#areaGradient)"
                  />
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* 2. Tactical Pins */}
              <div className="relative z-10 flex items-end justify-between gap-1 h-36">
                {weeklyActivity.map((day, i) => {
                  const height = day.lessonsCompleted > 0
                    ? Math.max(15, (day.lessonsCompleted / maxLessons) * 100)
                    : 4;
                  const isToday = i === weeklyActivity.length - 1;

                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center group">
                      <div className="relative w-full h-24 flex items-end justify-center mb-6">
                        {/* Background Rail */}
                        <div className="absolute inset-y-0 w-[1px] bg-slate-100 group-hover:bg-slate-200 transition-colors" />

                        {/* Data Pin */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 0.6 + i * 0.05, type: "spring", stiffness: 80 }}
                          className={cn(
                            'w-1 rounded-full relative z-10 transition-all duration-500',
                            day.lessonsCompleted > 0
                              ? isToday
                                ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.6)] scale-x-125'
                                : 'bg-slate-900'
                              : 'bg-slate-200'
                          )}
                        />

                        {/* Floating Value Node */}
                        {day.lessonsCompleted > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={cn(
                              "absolute w-1.5 h-1.5 rounded-full border border-white z-20 shadow-sm",
                              "bottom-[calc(" + height + "%-3px)]",
                              isToday ? "bg-indigo-600" : "bg-slate-900"
                            )}
                          />
                        )}
                      </div>

                      {/* Label HUD */}
                      <div className="space-y-1">
                        <p className={cn(
                          'text-[9px] font-black uppercase tracking-tighter',
                          isToday ? 'text-indigo-600' : 'text-slate-400'
                        )}>
                          {formatDate(day.date).substring(0, 3)}
                        </p>
                        <div className={cn(
                          "h-0.5 w-3 mx-auto rounded-full transition-all",
                          isToday ? "bg-indigo-600" : "bg-transparent"
                        )} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Category Breakdown */}
        {categoryStats.length > 0 && (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
  >
    <Card className="border-slate-200/60 shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardHeader className="pb-2 pt-8 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-100">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
                Category <span className="text-slate-400 font-light italic">Analysis</span>
              </CardTitle>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Domain Mastery Distribution</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {categoryStats.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.05 }}
              className="group relative p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300"
            >
              {/* Header: Title & Count */}
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-tight group-hover:text-purple-600 transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {cat.enrolled} Active Protocols
                  </p>
                </div>
                <div className="h-8 w-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                   <span className="text-[10px] font-black text-slate-900">{cat.completed}</span>
                </div>
              </div>

              {/* The "Power Bar" UI */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                   <span className="text-2xl font-black text-slate-900 tracking-tighter italic">
                     {cat.averageProgress}%
                   </span>
                   <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-1">
                     Avg Load
                   </span>
                </div>
                
                {/* Tactical Progress Rail */}
                <div className="relative h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.averageProgress}%` }}
                    transition={{ duration: 1.2, ease: "circOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full shadow-[0_0_8px_rgba(147,51,234,0.3)]"
                  />
                </div>
              </div>

              {/* Bottom Decorative Element */}
              <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Telemetry Online</span>
                <ChevronRight className="h-3 w-3 text-purple-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  </motion.section>
)}

        {/* Course Progress List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50">
                <GraduationCap className="h-4 w-4 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Course Progress</h2>
            </div>
            <Link href="/dashboard/student/courses">
              <Button variant="ghost" size="sm" className="text-indigo-600">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6">
            {courses.map((course, i) => (
              <motion.div
                key={course.courseId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="relative group bg-white rounded-2xl border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-500"
              >
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row gap-10">

                    {/* Section A: Intelligence & Identity */}
                    <div className="flex-1 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-slate-900/5 text-slate-500 border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5">
                              {course.category.name}
                            </Badge>
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full animate-pulse",
                              course.status === 'COMPLETED' ? "bg-emerald-500" : "bg-amber-400"
                            )} />
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight group-hover:text-indigo-600 transition-colors">
                            {course.courseTitle}
                          </h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                            Instructor // <span className="text-slate-600">{course.teacher.name}</span>
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">
                            {course.progress.percentage}%
                          </span>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Mastery</p>
                        </div>
                      </div>

                      {/* Tactical Progress Bar */}
                      <div className="space-y-4">
                        <div className="relative h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress.percentage}%` }}
                            className={cn(
                              "absolute inset-y-0 left-0 rounded-full",
                              course.status === 'COMPLETED' ? "bg-emerald-500" : "bg-slate-900"
                            )}
                          />
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase">
                            <MonitorPlay className="h-3 w-3 text-indigo-500" />
                            {course.progress.completedLessons}/{course.progress.totalLessons} Segments
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {formatDuration(course.progress.watchedDuration)} Runtime
                          </div>
                        </div>
                      </div>

                      {/* Section HUD Nodes */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {course.sectionProgress.slice(0, 3).map((section) => (
                          <div key={section.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50/50 border border-slate-100 group/node hover:bg-white hover:border-indigo-100 transition-all">
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full shadow-sm",
                              section.progress === 100 ? "bg-emerald-500" : "bg-slate-300"
                            )} />
                            <span className="text-[10px] font-black text-slate-500 group-hover/node:text-slate-900 transition-colors">
                              {section.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section B: Action Terminal (Sidebar) */}
                    <div className="lg:w-80 shrink-0">
                      {course.status === 'COMPLETED' ? (
                        <div className="h-full rounded-3xl bg-emerald-50/50 border border-emerald-100 p-6 flex flex-col items-center justify-center text-center space-y-4">
                          <div className="p-4 bg-white rounded-2xl shadow-sm border border-emerald-100">
                            <Trophy className="h-8 w-8 text-emerald-500" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Protocol Complete</h4>
                            <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">Achievement Unlocked</p>
                          </div>
                          <Button variant="outline" className="w-full rounded-xl border-emerald-200 text-emerald-700 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100">
                            Review Syllabus
                          </Button>
                        </div>
                      ) : (
                        <div className="h-full rounded-[2rem] bg-slate-900 p-6 flex flex-col justify-between shadow-2xl shadow-slate-200 border border-slate-800">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Next Objective</p>
                            </div>
                            <h4 className="text-white font-black text-sm tracking-tight line-clamp-2">
                              {course.nextLesson?.title || "Initialize Next Module"}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                              {course.nextLesson?.sectionTitle}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleContinueCourse(course.courseId)}
                            className="w-full bg-white hover:bg-indigo-50 text-slate-900 rounded-xl h-11 font-black text-[10px] uppercase tracking-[0.2em] transition-all group-hover:scale-[1.02]"
                          >
                            Resume Terminal
                          </Button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div >
  );
}

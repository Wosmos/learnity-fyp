'use client';

/**
 * Course Analytics Page
 * Displays comprehensive analytics for a specific course
 * Requirements: 9.1-9.7 - Teacher Analytics Dashboard
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AuthenticatedLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Users,
  Star,
  Clock,
  BookOpen,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  overview: {
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    completionRate: number;
    averageRating: number;
    reviewCount: number;
    totalDuration: number;
    lessonCount: number;
  };
  progressDistribution: {
    '0-25': number;
    '25-50': number;
    '50-75': number;
    '75-100': number;
  };
  quizPerformance: {
    totalQuizzes: number;
    quizStats: Array<{
      quizId: string;
      title: string;
      lessonTitle: string;
      totalAttempts: number;
      passRate: number;
      averageScore: number;
    }>;
    overallPassRate: number;
    overallAverageScore: number;
  };
  lessonEngagement: Array<{
    lessonId: string;
    title: string;
    sectionTitle: string;
    totalViews: number;
    completions: number;
    completionRate: number;
    averageWatchTime: number;
    duration: number;
  }>;
  dropOffPoints: Array<{
    lessonId: string;
    title: string;
    sectionTitle: string;
    completionRate: number;
  }>;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentActivity: Array<{
    studentId: string;
    studentName: string;
    profilePicture: string | null;
    enrolledAt: string;
    progress: number;
    status: string;
  }>;
}

export default function CourseAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const courseId = params.courseId as string;

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/courses/${courseId}/analytics`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      toast({
        title: 'Error',
        description: 'Failed to load course analytics. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [courseId, toast]);

  useEffect(() => {
    if (courseId) {
      fetchAnalytics();
    }
  }, [courseId, fetchAnalytics]);

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !analytics) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-slate-100 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-600 mb-4">{error || 'Failed to load analytics'}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.back()}>
                  Go Back
                </Button>
                <Button onClick={fetchAnalytics}>Retry</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  const { overview, progressDistribution, quizPerformance, lessonEngagement, dropOffPoints, ratingDistribution, recentActivity } = analytics;

  // Calculate max for progress distribution chart
  const maxProgress = Math.max(
    progressDistribution['0-25'],
    progressDistribution['25-50'],
    progressDistribution['50-75'],
    progressDistribution['75-100']
  );

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard/teacher/courses">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Courses
                  </Button>
                </Link>
                <div className="h-6 w-px bg-slate-300" />
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-linear-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">Course Analytics</h1>
                    <p className="text-sm text-slate-500">
                      Track performance and student engagement
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Enrollments</p>
                    <p className="text-2xl font-bold text-slate-900">{overview.totalEnrollments}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {overview.activeEnrollments} active
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Completion Rate</p>
                    <p className="text-2xl font-bold text-emerald-600">{overview.completionRate}%</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {overview.completedEnrollments} completed
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Average Rating</p>
                    <p className="text-2xl font-bold text-amber-600">{overview.averageRating.toFixed(1)}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {overview.reviewCount} reviews
                    </p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Course Content</p>
                    <p className="text-2xl font-bold text-slate-900">{overview.lessonCount}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDuration(overview.totalDuration)} total
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Progress Distribution */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-indigo-600" />
                  Progress Distribution
                </CardTitle>
                <CardDescription>
                  How students are progressing through the course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(progressDistribution).map(([range, count]) => (
                    <div key={range}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">{range}%</span>
                        <span className="font-medium text-slate-900">{count} students</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-indigo-500 to-indigo-600 rounded-full transition-all"
                          style={{ width: maxProgress > 0 ? `${(count / maxProgress) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rating Distribution */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Rating Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of student ratings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingDistribution[rating as keyof typeof ratingDistribution];
                    const total = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-12">
                          <span className="text-sm font-medium">{rating}</span>
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        </div>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-500 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quiz Performance */}
          {quizPerformance.totalQuizzes > 0 && (
            <Card className="border-0 shadow-md mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Quiz Performance
                </CardTitle>
                <CardDescription>
                  Overall pass rate: {quizPerformance.overallPassRate}% | Average score: {quizPerformance.overallAverageScore}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Quiz</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Lesson</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Attempts</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Pass Rate</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Avg Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizPerformance.quizStats.map((quiz) => (
                        <tr key={quiz.quizId} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm font-medium text-slate-900">{quiz.title}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{quiz.lessonTitle}</td>
                          <td className="py-3 px-4 text-sm text-center text-slate-600">{quiz.totalAttempts}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={quiz.passRate >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                              {quiz.passRate}%
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-center font-medium text-slate-900">{quiz.averageScore}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lesson Engagement */}
            <Card className="border-0 shadow-md lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Lesson Engagement
                </CardTitle>
                <CardDescription>
                  Completion rates for each lesson
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {lessonEngagement.map((lesson, index) => (
                    <div key={lesson.lessonId} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50">
                      <span className="text-sm text-slate-400 w-6">{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{lesson.title}</p>
                        <p className="text-xs text-slate-500">{lesson.sectionTitle}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">{lesson.completionRate}%</p>
                          <p className="text-xs text-slate-500">{lesson.completions} completed</p>
                        </div>
                        <div className="w-24">
                          <Progress value={lesson.completionRate} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Drop-off Points & Recent Activity */}
            <div className="space-y-8">
              {/* Drop-off Points */}
              {dropOffPoints.length > 0 && (
                <Card className="border-0 shadow-md border-l-4 border-l-amber-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-700">
                      <TrendingDown className="h-5 w-5" />
                      Drop-off Points
                    </CardTitle>
                    <CardDescription>
                      Lessons where students tend to stop
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dropOffPoints.map((point) => (
                        <div key={point.lessonId} className="flex items-center gap-3 p-2 rounded-lg bg-amber-50">
                          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{point.title}</p>
                            <p className="text-xs text-slate-500">{point.completionRate}% completion</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Recent Enrollments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.studentId} className="flex items-center gap-3">
                        {activity.profilePicture ? (
                          <Image
                            src={activity.profilePicture}
                            alt={activity.studentName}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                            {activity.studentName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {activity.studentName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(activity.enrolledAt)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.progress}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {recentActivity.length > 5 && (
                    <Link href={`/dashboard/teacher/courses/${courseId}/students`}>
                      <Button variant="ghost" size="sm" className="w-full mt-4">
                        View All Students
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

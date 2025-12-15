'use client';

/**
 * Course Students Page
 * Lists enrolled students with their progress for a specific course
 * Requirements: 9.1, 9.2 - Teacher Analytics Dashboard
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AuthenticatedLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Users,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  XCircle,
  BarChart3,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useClientAuth } from '@/hooks/useClientAuth';
import { PageHeader } from '@/components/layout/PageHeader';

interface Student {
  id: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    email: string;
    profilePicture: string | null;
  };
  status: 'ACTIVE' | 'COMPLETED' | 'UNENROLLED';
  progress: number;
  enrolledAt: string;
  lastAccessedAt: string;
  completedAt: string | null;
  completedLessons: number;
  passedQuizzes: number;
  avgQuizScore: number | null;
}

interface StudentsData {
  courseTitle: string;
  students: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}


// Status badge configuration
const statusConfig = {
  ACTIVE: {
    label: 'Active',
    icon: Clock,
    className: 'bg-blue-100 text-blue-700',
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'bg-emerald-100 text-emerald-700',
  },
  UNENROLLED: {
    label: 'Unenrolled',
    icon: XCircle,
    className: 'bg-slate-100 text-slate-700',
  },
};

// Progress range options for filtering
const progressRanges = [
  { value: 'all', label: 'All Progress' },
  { value: '0-25', label: '0-25%' },
  { value: '25-50', label: '25-50%' },
  { value: '50-75', label: '50-75%' },
  { value: '75-100', label: '75-100%' },
];

// Status filter options
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'UNENROLLED', label: 'Unenrolled' },
];

export default function CourseStudentsPage() {
  const params = useParams();
  const { toast } = useToast();
  const { user, loading: authLoading } = useClientAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const courseId = params.courseId as string;

  const [data, setData] = useState<StudentsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [progressFilter, setProgressFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, progressFilter]);


  // Fetch students data
  const fetchStudents = useCallback(async () => {
    if (!user || authLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      // Build query params
      const queryParams = new URLSearchParams();
      queryParams.set('page', currentPage.toString());
      queryParams.set('limit', '20');

      if (statusFilter !== 'all') {
        queryParams.set('status', statusFilter);
      }

      if (progressFilter !== 'all') {
        const [min, max] = progressFilter.split('-').map(Number);
        queryParams.set('minProgress', min.toString());
        queryParams.set('maxProgress', max.toString());
      }

      if (debouncedSearch) {
        queryParams.set('search', debouncedSearch);
      }

      const response = await authenticatedFetch(`/api/courses/${courseId}/students?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.message || 'Failed to fetch students');
      }

      const responseData = await response.json();
      setData(responseData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students');
      toast({
        title: 'Error',
        description: 'Failed to load students. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [courseId, currentPage, statusFilter, progressFilter, debouncedSearch, toast, user, authLoading, authenticatedFetch]);

  useEffect(() => {
    if (courseId && user && !authLoading) {
      fetchStudents();
    }
  }, [courseId, fetchStudents, user, authLoading]);

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  // Get progress color
  const getProgressColor = (progress: number): string => {
    if (progress >= 75) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-amber-500';
    return 'bg-slate-400';
  };


  // Loading state
  if (isLoading && !data) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-slate-100">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="flex gap-4 mb-6">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
            <Card className="border-0 shadow-md">
              <CardContent className="p-0">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-2 w-24" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-slate-100 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <div className="flex gap-2">
                <Link href="/dashboard/teacher/courses">
                  <Button variant="outline">Go Back</Button>
                </Link>
                <Button onClick={fetchStudents}>Retry</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }


  // Calculate summary stats
  const stats = data ? {
    total: data.total,
    active: data.students.filter(s => s.status === 'ACTIVE').length,
    completed: data.students.filter(s => s.status === 'COMPLETED').length,
    avgProgress: data.students.length > 0
      ? Math.round(data.students.reduce((sum, s) => sum + s.progress, 0) / data.students.length)
      : 0,
  } : { total: 0, active: 0, completed: 0, avgProgress: 0 };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-slate-100">
        {/* Header */}
        <PageHeader
          title="Course Students"
          subtitle={data?.courseTitle || 'Loading...'}
          icon={Users}
          actions={
            <>
              <Link href="/dashboard/teacher/courses">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Courses
                </Button>
              </Link>
              <Link href={`/dashboard/teacher/courses/${courseId}/analytics`}>
                <Button variant="outline" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
            </>
          }
        />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Students</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
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
                    <p className="text-sm text-slate-500">Active</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Completed</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
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
                    <p className="text-sm text-slate-500">Avg. Progress</p>
                    <p className="text-2xl font-bold text-indigo-600">{stats.avgProgress}%</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Award className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Filters */}
          <Card className="border-0 shadow-md mb-6">
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Progress Filter */}
                <Select value={progressFilter} onValueChange={setProgressFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Progress" />
                  </SelectTrigger>
                  <SelectContent>
                    {progressRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-slate-600" />
                Enrolled Students
                {data && (
                  <Badge variant="secondary" className="ml-2">
                    {data.total} total
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-sm font-medium text-slate-500">
                <div className="col-span-4">Student</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-center">Progress</div>
                <div className="col-span-2 text-center">Lessons</div>
                <div className="col-span-2 text-center">Last Active</div>
              </div>


              {/* Empty State */}
              {data?.students.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 bg-slate-100 rounded-full mb-4">
                    <Users className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No students found
                  </h3>
                  <p className="text-slate-500 text-center max-w-md">
                    {debouncedSearch || statusFilter !== 'all' || progressFilter !== 'all'
                      ? 'Try adjusting your filters to see more results.'
                      : 'No students have enrolled in this course yet.'}
                  </p>
                </div>
              )}

              {/* Student Rows */}
              {data?.students.map((student) => {
                const status = statusConfig[student.status];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={student.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    {/* Student Info */}
                    <div className="col-span-4 flex items-center gap-3">
                      {student.student.profilePicture ? (
                        <Image
                          src={student.student.profilePicture}
                          alt={student.student.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                          {student.student.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {student.student.name}
                        </p>
                        <p className="text-sm text-slate-500 truncate">
                          {student.student.email}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex items-center justify-center md:justify-center">
                      <Badge className={`${status.className} gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="col-span-2 flex flex-col items-center justify-center gap-1">
                      <div className="flex items-center gap-2 w-full max-w-[120px]">
                        <Progress
                          value={student.progress}
                          className={`h-2 flex-1 ${getProgressColor(student.progress)}`}
                        />
                        <span className="text-sm font-medium text-slate-700 w-10 text-right">
                          {student.progress}%
                        </span>
                      </div>
                    </div>

                    {/* Lessons & Quizzes */}
                    <div className="col-span-2 flex items-center justify-center gap-3">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <BookOpen className="h-4 w-4" />
                        <span>{student.completedLessons}</span>
                      </div>
                      {student.avgQuizScore !== null && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Award className="h-4 w-4" />
                          <span>{student.avgQuizScore}%</span>
                        </div>
                      )}
                    </div>

                    {/* Last Active */}
                    <div className="col-span-2 flex items-center justify-center text-sm text-slate-500">
                      {formatRelativeTime(student.lastAccessedAt)}
                    </div>
                  </div>
                );
              })}


              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    Showing {((currentPage - 1) * data.limit) + 1} to{' '}
                    {Math.min(currentPage * data.limit, data.total)} of {data.total} students
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (data.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= data.totalPages - 2) {
                          pageNum = data.totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={isLoading}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(data.totalPages, p + 1))}
                      disabled={currentPage === data.totalPages || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

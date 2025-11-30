'use client';

/**
 * Teacher Courses Page
 * Lists all courses created by the teacher with status badges and quick actions
 * Requirements: 2.2, 2.3 - Course publishing and management
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthenticatedLayout } from '@/components/layout/AppLayout';
import { useClientAuth } from '@/hooks/useClientAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  BookOpen,
  MoreVertical,
  Edit,
  Eye,
  BarChart3,
  Globe,
  GlobeLock,
  Trash2,
  Users,
  Star,
  Clock,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

interface TeacherCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  lessonCount: number;
  totalDuration: number;
  createdAt: string;
  publishedAt: string | null;
  category: {
    id: string;
    name: string;
  };
}

// Status badge configuration
const statusConfig = {
  DRAFT: {
    label: 'Draft',
    variant: 'secondary' as const,
    icon: FileText,
    className: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
  },
  PUBLISHED: {
    label: 'Published',
    variant: 'default' as const,
    icon: Globe,
    className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  },
  UNPUBLISHED: {
    label: 'Unpublished',
    variant: 'outline' as const,
    icon: GlobeLock,
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  },
};

// Difficulty badge colors
const difficultyColors = {
  BEGINNER: 'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED: 'bg-red-100 text-red-700',
};

export default function TeacherCoursesPage() {
  const { user, loading: authLoading } = useClientAuth();
  const router = useRouter();
  const { toast } = useToast();
  const authenticatedFetch = useAuthenticatedFetch();
  
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch teacher's courses
  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authenticatedFetch('/api/courses?teacherOnly=true');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch courses');
      }

      const data = await response.json();
      setCourses(data.data?.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
      toast({
        title: 'Error',
        description: 'Failed to load your courses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [authenticatedFetch, toast]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchCourses();
    }
  }, [authLoading, user, fetchCourses]);

  // Handle publish course
  const handlePublish = async (courseId: string) => {
    try {
      setActionLoading(courseId);
      const response = await authenticatedFetch(`/api/courses/${courseId}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || data.message || 'Failed to publish course');
      }

      toast({
        title: 'Success',
        description: 'Course published successfully!',
      });
      
      fetchCourses();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to publish course',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle unpublish course
  const handleUnpublish = async (courseId: string) => {
    try {
      setActionLoading(courseId);
      const response = await authenticatedFetch(`/api/courses/${courseId}/unpublish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || data.message || 'Failed to unpublish course');
      }

      toast({
        title: 'Success',
        description: 'Course unpublished successfully!',
      });
      
      fetchCourses();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to unpublish course',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete course
  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(courseId);
      const response = await authenticatedFetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || data.message || 'Failed to delete course');
      }

      toast({
        title: 'Success',
        description: 'Course deleted successfully!',
      });
      
      fetchCourses();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete course',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (authLoading || isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="p-2.5 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
                  <p className="text-sm text-slate-500">
                    Manage and track your course content
                  </p>
                </div>
              </div>
              <Link href="/dashboard/teacher/courses/new">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4" />
                  Create Course
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Courses</p>
                    <p className="text-2xl font-bold text-slate-900">{courses.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Published</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {courses.filter(c => c.status === 'PUBLISHED').length}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <Globe className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total Students</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {courses.reduce((sum, c) => sum + c.enrollmentCount, 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Avg. Rating</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {courses.length > 0
                        ? (courses.reduce((sum, c) => sum + c.averageRating, 0) / courses.length).toFixed(1)
                        : '0.0'}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50 mb-8">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchCourses}
                  className="ml-auto"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!error && courses.length === 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 bg-slate-100 rounded-full mb-4">
                  <BookOpen className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No courses yet
                </h3>
                <p className="text-slate-500 text-center mb-6 max-w-md">
                  Start creating your first course to share your knowledge with students around the world.
                </p>
                <Link href="/dashboard/teacher/courses/new">
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Create Your First Course
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Courses Grid */}
          {courses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isLoading={actionLoading === course.id}
                  onPublish={() => handlePublish(course.id)}
                  onUnpublish={() => handleUnpublish(course.id)}
                  onDelete={() => handleDelete(course.id)}
                  formatDuration={formatDuration}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

// Course Card Component
interface CourseCardProps {
  course: TeacherCourse;
  isLoading: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
  formatDuration: (seconds: number) => string;
}

function CourseCard({
  course,
  isLoading,
  onPublish,
  onUnpublish,
  onDelete,
  formatDuration,
}: CourseCardProps) {
  
  const status = statusConfig[course.status];
  const StatusIcon = status.icon;

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-100">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-blue-100 to-blue-50">
            <BookOpen className="h-12 w-12 text-blue-300" />
          </div>
        )}
        
        {/* Status Badge */}
        <Badge className={`absolute top-3 left-3 ${status.className}`}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>

        {/* Difficulty Badge */}
        <Badge className={`absolute top-3 right-3 ${difficultyColors[course.difficulty]}`}>
          {course.difficulty.charAt(0) + course.difficulty.slice(1).toLowerCase()}
        </Badge>
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg text-slate-900 line-clamp-2 mb-2">
          {course.title}
        </h3>

        {/* Category */}
        <p className="text-sm text-slate-500 mb-3">{course.category?.name || 'Uncategorized'}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.enrollmentCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500" />
            <span>{course.averageRating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(course.totalDuration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.lessonCount}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/teacher/courses/${course.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          
          <Link href={`/dashboard/teacher/courses/${course.id}/analytics`}>
            <Button variant="outline" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/courses/${course.id}`} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/teacher/courses/${course.id}/students`} className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  View Students
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {course.status === 'DRAFT' && (
                <DropdownMenuItem onClick={onPublish} className="text-emerald-600">
                  <Globe className="h-4 w-4 mr-2" />
                  Publish
                </DropdownMenuItem>
              )}
              {course.status === 'PUBLISHED' && (
                <DropdownMenuItem onClick={onUnpublish} className="text-amber-600">
                  <GlobeLock className="h-4 w-4 mr-2" />
                  Unpublish
                </DropdownMenuItem>
              )}
              {course.status === 'UNPUBLISHED' && (
                <DropdownMenuItem onClick={onPublish} className="text-emerald-600">
                  <Globe className="h-4 w-4 mr-2" />
                  Republish
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600"
                disabled={course.status === 'PUBLISHED' && course.enrollmentCount > 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton Component
function CourseCardSkeleton() {
  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-3" />
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </CardContent>
    </Card>
  );
}

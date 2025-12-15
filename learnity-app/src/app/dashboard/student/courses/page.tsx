'use client';

/**
 * My Courses Page
 * Student's enrolled courses with progress tracking
 * Requirements: 3.7, 4.4 - Enrolled courses with progress, continue learning section, completed courses
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Clock,
  Play,
  CheckCircle,
  Trophy,
  GraduationCap,
  Calendar,
  Star,
  AlertCircle,
} from 'lucide-react';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { cn } from '@/lib/utils';

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

interface EnrollmentsResponse {
  enrollments: CourseEnrollment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

const difficultyColors = {
  BEGINNER: 'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED: 'bg-red-100 text-red-700',
};

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Course Card Component
function EnrolledCourseCard({
  enrollment,
  onContinue,
}: {
  enrollment: CourseEnrollment;
  onContinue: (courseId: string) => void;
}) {
  const { course, progress, status, lastAccessedAt, completedAt } = enrollment;
  const isCompleted = status === 'COMPLETED';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="relative w-full sm:w-48 h-32 sm:h-auto shrink-0 bg-slate-100">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
              <BookOpen className="h-12 w-12 text-primary/40" />
            </div>
          )}
          {isCompleted && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <div className="bg-green-500 text-white rounded-full p-2">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn('text-xs', difficultyColors[course.difficulty])}>
                  {course.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {course.category.name}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                by {course.teacher.name}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(course.totalDuration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{course.lessonCount} lessons</span>
              </div>
              {course.averageRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{Number(course.averageRating).toFixed(1)}</span>
                </div>
              )}
            </div>

            <Button
              size="sm"
              onClick={() => onContinue(course.id)}
              className={isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isCompleted ? (
                <>
                  <Trophy className="h-4 w-4 mr-1" />
                  Review
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Continue
                </>
              )}
            </Button>
          </div>

          {/* Last accessed / Completed date */}
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            {isCompleted ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Completed on {formatDate(completedAt!)}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Last accessed {formatDate(lastAccessedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Loading Skeleton
function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <Skeleton className="w-full sm:w-48 h-32" />
        <div className="flex-1 p-4 space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24" />
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
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed'>('all');

  // Fetch enrollments
  const fetchEnrollments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get('/api/enrollments?limit=50') as EnrollmentsResponse;
      setEnrollments(data.enrollments || []);
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
  const filteredEnrollments = enrollments.filter((enrollment) => {
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
    .filter((e) => e.status === 'ACTIVE' && e.progress > 0 && e.progress < 100)
    .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
    .slice(0, 3);

  // Stats
  const totalCourses = enrollments.filter((e) => e.status !== 'UNENROLLED').length;
  const completedCourses = enrollments.filter((e) => e.status === 'COMPLETED').length;
  const inProgressCourses = enrollments.filter(
    (e) => e.status === 'ACTIVE' && e.progress < 100
  ).length;

  return (
    <div className="flex-1 bg-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
        <div className="px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <GraduationCap className="h-7 w-7 text-primary" />
                My Courses
              </h1>
              <p className="text-slate-600 mt-1">
                Track your learning progress and continue where you left off
              </p>
            </div>
            <Link href="/courses">
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalCourses}</p>
                    <p className="text-sm text-muted-foreground">Total Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Play className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{inProgressCourses}</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{completedCourses}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Continue Learning Section */}
          {!isLoading && continueLearningCourses.length > 0 && (
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Continue Learning
                </CardTitle>
                <CardDescription>
                  Pick up where you left off
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {continueLearningCourses.map((enrollment) => (
                    <Card
                      key={enrollment.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleContinueCourse(enrollment.course.id)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-medium line-clamp-1 mb-2">
                          {enrollment.course.title}
                        </h4>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-1.5 mb-3" />
                        <Button size="sm" className="w-full">
                          <Play className="h-3 w-3 mr-1" />
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
            <Card className="mb-6 border-destructive">
              <CardContent className="py-6 flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Failed to load courses</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <Button variant="outline" onClick={fetchEnrollments} className="ml-auto">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Courses Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                All Courses ({totalCourses})
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress ({inProgressCourses})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedCourses})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {isLoading ? (
                <>
                  <CourseCardSkeleton />
                  <CourseCardSkeleton />
                  <CourseCardSkeleton />
                </>
              ) : filteredEnrollments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {activeTab === 'completed'
                        ? 'No completed courses yet'
                        : activeTab === 'in-progress'
                        ? 'No courses in progress'
                        : 'No enrolled courses'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {activeTab === 'completed'
                        ? 'Complete your first course to see it here!'
                        : 'Start learning by enrolling in a course'}
                    </p>
                    <Link href="/courses">
                      <Button>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse Courses
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                filteredEnrollments.map((enrollment) => (
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

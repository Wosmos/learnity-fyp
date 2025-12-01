'use client';

/**
 * Course Detail Page
 * Public page showing course details, sections, lessons, teacher profile, and reviews
 * Requirements: 3.5, 3.6, 4.1 - Course info, syllabus, teacher profile, reviews, enroll button
 * Uses YouTube thumbnail from first lesson or default image
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AuthenticatedLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Star,
  Video,
  CheckCircle,
  Play,
  Loader2,
  AlertCircle,
  GraduationCap,
  BarChart3,
  Globe,
  Lock,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useToast } from '@/hooks/use-toast';
import { StarRating } from '@/components/courses';
import { ReviewForm } from '@/components/courses/ReviewForm';
import { ReviewsList } from '@/components/courses/ReviewsList';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  type: 'VIDEO' | 'QUIZ';
  youtubeUrl?: string;
  youtubeId?: string;
  duration: number;
  order: number;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}


interface Teacher {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

interface ReviewsData {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  rating: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  };
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status: string;
  isFree: boolean;
  price?: number;
  totalDuration: number;
  lessonCount: number;
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  estimatedDuration: string;
  whatsappGroupLink?: string;
  contactEmail?: string;
  teacher: Teacher;
  category: Category;
  sections: Section[];
  reviewsSummary: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  };
}

// Helper to extract YouTube video ID from URL
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Get YouTube thumbnail URL
function getYouTubeThumbnail(youtubeId: string | null): string | null {
  if (!youtubeId) return null;
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
}

// Get course thumbnail - prioritize first lesson's YouTube thumbnail
function getCourseThumbnail(course: CourseData): string | null {
  // First, try to get thumbnail from first lesson
  if (course.sections?.length > 0) {
    for (const section of course.sections) {
      if (section.lessons?.length > 0) {
        for (const lesson of section.lessons) {
          if (lesson.youtubeUrl || lesson.youtubeId) {
            const videoId = lesson.youtubeId || extractYouTubeId(lesson.youtubeUrl || '');
            if (videoId) {
              return getYouTubeThumbnail(videoId);
            }
          }
        }
      }
    }
  }
  // Fallback to course thumbnail or null for gradient placeholder
  return course.thumbnailUrl || null;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

const difficultyColors = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
  ADVANCED: 'bg-red-100 text-red-800',
};


export default function CoursePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const courseId = params.courseId as string;
  const { user, loading: authLoading } = useClientAuth();
  const authenticatedFetch = useAuthenticatedFetch();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [reviews, setReviews] = useState<ReviewsData | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState<{ id: string; rating: number; comment: string | null } | null>(null);

  // Fetch course data
  const fetchCourse = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch course');
      }

      const responseData = await response.json();
      const data = responseData.data || responseData;
      setCourse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  // Check enrollment status
  const checkEnrollment = useCallback(async () => {
    if (!user) return;
    try {
      const response = await authenticatedFetch(`/api/courses/${courseId}/enroll`);
      if (response.ok) {
        const data = await response.json();
        setIsEnrolled(data.data?.isEnrolled || false);
      }
    } catch (err) {
      console.error('Failed to check enrollment:', err);
    }
  }, [courseId, user, authenticatedFetch]);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      setIsLoadingReviews(true);
      const response = await fetch(`/api/courses/${courseId}/reviews?limit=5`);
      if (response.ok) {
        const responseData = await response.json();
        setReviews(responseData.data || null);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [courseId]);

  // Check if user can review
  const checkReviewEligibility = useCallback(async () => {
    if (!user) return;
    try {
      const response = await authenticatedFetch(`/api/courses/${courseId}/reviews/eligibility`);
      if (response.ok) {
        const data = await response.json();
        setCanReview(data.data?.canReview || false);
        if (data.data?.existingReview) {
          setExistingReview({
            id: data.data.existingReview.id,
            rating: data.data.existingReview.rating,
            comment: data.data.existingReview.comment ?? null,
          });
        }
      }
    } catch (err) {
      console.error('Failed to check review eligibility:', err);
    }
  }, [courseId, user, authenticatedFetch]);

  useEffect(() => {
    fetchCourse();
    fetchReviews();
  }, [fetchCourse, fetchReviews]);

  useEffect(() => {
    if (!authLoading && user) {
      checkEnrollment();
      checkReviewEligibility();
    }
  }, [authLoading, user, checkEnrollment, checkReviewEligibility]);

  const handleEnroll = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      setIsEnrolling(true);
      const response = await authenticatedFetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to enroll');
      }

      setIsEnrolled(true);
      toast({ title: 'Success', description: 'You have been enrolled in this course!' });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to enroll',
        variant: 'destructive',
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    router.push(`/dashboard/student/courses/${courseId}/learn`);
  };


  // Loading state
  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-64 w-full mb-4 rounded-lg" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div>
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  const thumbnailUrl = thumbnailError ? null : getCourseThumbnail(course);
  const totalLessons = course.sections?.reduce((sum, s) => sum + (s.lessons?.length || 0), 0) || 0;

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-4 py-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Badge variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                  {course.status}
                </Badge>
                {course.isFree && (
                  <Badge className="bg-green-100 text-green-800">Free</Badge>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Thumbnail */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-linear-to-br from-blue-500 to-purple-600">
                {thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                    onError={() => setThumbnailError(true)}
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-24 w-24 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className={difficultyColors[course.difficulty]}>
                    {course.difficulty}
                  </Badge>
                </div>
              </div>


              {/* Course Title & Info */}
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{course.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>{course.averageRating || '0.0'}</span>
                    <span className="text-slate-400">({course.reviewCount || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.enrollmentCount || 0} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.estimatedDuration || formatDuration(course.totalDuration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    <span>{totalLessons} lessons</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About this course</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 whitespace-pre-wrap">{course.description}</p>
                </CardContent>
              </Card>

              {/* Course Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Course Content
                  </CardTitle>
                  <CardDescription>
                    {course.sections?.length || 0} sections • {totalLessons} lessons • {course.estimatedDuration || formatDuration(course.totalDuration)} total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {course.sections?.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No content available yet</p>
                  ) : (
                    <Accordion type="multiple" className="space-y-2">
                      {course.sections?.map((section, sectionIndex) => (
                        <AccordionItem 
                          key={section.id} 
                          value={`section-${sectionIndex}`}
                          className="border rounded-lg px-4"
                        >
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="font-medium">{section.title}</span>
                              <Badge variant="secondary" className="ml-2">
                                {section.lessons?.length || 0} lessons
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4">
                            <div className="space-y-2">
                              {section.lessons?.map((lesson, lessonIndex) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    {lesson.type === 'VIDEO' ? (
                                      <Video className="h-4 w-4 text-blue-500" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                    <span className="text-sm">{lesson.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    {lesson.duration > 0 && (
                                      <span>{formatDuration(lesson.duration)}</span>
                                    )}
                                    {!isEnrolled && lessonIndex > 0 && (
                                      <Lock className="h-3 w-3" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Student Reviews
                      </CardTitle>
                      <CardDescription>
                        {reviews?.rating?.totalReviews || course.reviewCount || 0} reviews
                      </CardDescription>
                    </div>
                    {user && isEnrolled && !existingReview && canReview && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReviewForm(!showReviewForm)}
                      >
                        {showReviewForm ? 'Cancel' : 'Write a Review'}
                      </Button>
                    )}
                    {user && existingReview && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReviewForm(!showReviewForm)}
                      >
                        {showReviewForm ? 'Cancel' : 'Edit Your Review'}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Review Form */}
                  {showReviewForm && user && (
                    <div className="mb-6">
                      <ReviewForm
                        courseId={courseId}
                        courseName={course.title}
                        existingReview={existingReview}
                        onSuccess={() => {
                          setShowReviewForm(false);
                          fetchReviews();
                          checkReviewEligibility();
                        }}
                        onCancel={() => setShowReviewForm(false)}
                      />
                    </div>
                  )}

                  {/* Rating Summary */}
                  {reviews?.rating && reviews.rating.totalReviews > 0 && (
                    <div className="flex items-start gap-8 mb-6 pb-6 border-b">
                      {/* Average Rating */}
                      <div className="text-center">
                        <div className="text-4xl font-bold text-slate-900">
                          {Number(reviews.rating.averageRating).toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center mt-1">
                          <StarRating value={Number(reviews.rating.averageRating)} size="sm" readonly />
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {reviews.rating.totalReviews} reviews
                        </p>
                      </div>

                      {/* Rating Distribution */}
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviews.rating.ratingDistribution[star] || 0;
                          const percentage = reviews.rating.totalReviews > 0
                            ? (count / reviews.rating.totalReviews) * 100
                            : 0;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-sm text-slate-600 w-12">{star} stars</span>
                              <Progress value={percentage} className="h-2 flex-1" />
                              <span className="text-sm text-slate-500 w-8">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Reviews List */}
                  {isLoadingReviews ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : reviews?.reviews && reviews.reviews.length > 0 ? (
                    <>
                      <ReviewsList
                        reviews={reviews.reviews.map(r => ({
                          ...r,
                          comment: r.comment ?? null,
                          student: {
                            id: r.student.id || '',
                            firstName: r.student.name?.split(' ')[0] || 'Student',
                            lastName: r.student.name?.split(' ').slice(1).join(' ') || '',
                            profilePicture: r.student.avatarUrl || null,
                          },
                        }))}
                        emptyMessage="No reviews yet. Be the first to review!"
                      />

                      {/* Show More Reviews */}
                      {reviews.totalPages > 1 && (
                        <div className="text-center pt-4">
                          <Button variant="outline" size="sm">
                            View all {reviews.total} reviews
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <ThumbsUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No reviews yet</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Be the first to review this course!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>


            {/* Sidebar */}
            <div className="space-y-6">
              {/* Enrollment Card */}
              <Card className="sticky top-4">
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    {course.isFree ? (
                      <div className="text-3xl font-bold text-green-600">Free</div>
                    ) : (
                      <div className="text-3xl font-bold text-slate-900">
                        ${course.price?.toFixed(2) || '0.00'}
                      </div>
                    )}
                  </div>

                  {isEnrolled ? (
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700" 
                      size="lg"
                      onClick={handleStartLearning}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Enroll Now
                        </>
                      )}
                    </Button>
                  )}

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Video className="h-4 w-4" />
                      <span>{totalLessons} video lessons</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>{course.estimatedDuration || formatDuration(course.totalDuration)} of content</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Globe className="h-4 w-4" />
                      <span>Full lifetime access</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <BarChart3 className="h-4 w-4" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Teacher Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      {course.teacher?.avatarUrl ? (
                        <Image
                          src={course.teacher.avatarUrl}
                          alt={course.teacher.name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-blue-600 font-semibold text-lg">
                          {course.teacher?.name?.charAt(0) || 'T'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{course.teacher?.name || 'Unknown'}</p>
                      <p className="text-sm text-slate-500">{course.category?.name || 'Instructor'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BookOpen className="h-4 w-4" />
                    <span>Category:</span>
                    <Badge variant="outline">{course.category?.name || 'Uncategorized'}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}

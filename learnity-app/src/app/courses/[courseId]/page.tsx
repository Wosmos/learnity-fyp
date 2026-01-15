'use client';

/**
 * Course Detail Page - Onyx Light Design Redesign
 * Keeps all original logic/APIs but applies premium UI/UX
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
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
  Globe,
  Lock,
  MessageSquare,
  ThumbsUp,
  Share2,
  MoreVertical
} from 'lucide-react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useToast } from '@/hooks/use-toast';
import { StarRating } from '@/components/courses';
import { ReviewForm } from '@/components/courses/ReviewForm';
import { ReviewsList } from '@/components/courses/ReviewsList';
import { cn } from '@/lib/utils';

// --- Types (Kept exactly as original) ---
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
  tags: string[];
  updatedAt: string;
  reviewsSummary: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  };
}

// --- Helpers (Kept exactly as original) ---
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

function getYouTubeThumbnail(youtubeId: string | null): string | null {
  if (!youtubeId) return null;
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
}

function getCourseThumbnail(course: CourseData): string | null {
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
  return course.thumbnailUrl || null;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// --- Constants ---
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'reviews', label: 'Reviews' },
];

export default function CoursePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const courseId = params.courseId as string;
  const { user, loading: authLoading } = useClientAuth();
  const authenticatedFetch = useAuthenticatedFetch();

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [course, setCourse] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<ReviewsData | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState<{ id: string; rating: number; comment: string | null } | null>(null);

  // Function to copy the current URL to clipboard
  const handleCopyToClipboard = () => {
    const currentUrl = window.location.href; // Get the current page URL
    navigator.clipboard.writeText(currentUrl).then(() => {
      // Optionally, show a success message using toast or alert
      toast({ title: 'Success', description: 'URL copied to clipboard!' });
    }).catch(err => {
      // Handle error if clipboard operation fails
      toast({ title: 'Error', description: 'Failed to copy URL: ' + err, variant: 'destructive' });
    });
  };
  // --- API Calls (Kept as original) ---
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
      setCourse(responseData.data || responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

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

  // --- Loading Skeleton ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-video w-full rounded-3xl" />
              <Skeleton className="h-10 w-3/4" />
              <div className="flex gap-4"><Skeleton className="h-6 w-24" /><Skeleton className="h-6 w-24" /></div>
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
            <div className="hidden lg:block">
              <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error || !course) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-zinc-200 shadow-xl rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Something went wrong</h2>
            <p className="text-zinc-500 mb-6">{error || 'Course not found'}</p>
            <Button onClick={() => router.back()} className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const thumbnailUrl = thumbnailError ? null : getCourseThumbnail(course);
  const totalLessons = course.sections?.reduce((sum, s) => sum + (s.lessons?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 lg:pb-12">

      {/* Mobile Sticky Nav / Header */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-4 py-3 flex items-center justify-between lg:hidden">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-700" />
        </button>
        <span className="font-semibold text-zinc-900 truncate max-w-[200px]">{course.title}</span>
        <button className="p-2 -mr-2 rounded-full hover:bg-zinc-100 transition-colors">
          <Share2 className="w-5 h-5 text-zinc-700" onClick={handleCopyToClipboard} />
        </button>
      </nav>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full px-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full"><Share2 className="w-4 h-4" onClick={handleCopyToClipboard} /></Button>
            <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">

          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Hero Section */}
            <div className="space-y-6">
              {/* Video Player / Thumbnail */}
              <div className="relative w-full aspect-video bg-zinc-900 rounded-none md:rounded-3xl overflow-hidden shadow-2xl group border border-zinc-200/50">
                {thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                    onError={() => setThumbnailError(true)}
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  {/* <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-lg group-hover:scale-110 transition-transform">
                     <Play className="w-6 h-6 fill-current ml-1" />
                   </div> */}
                </div>
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-white/90 text-zinc-900 hover:bg-white backdrop-blur-sm border-0 shadow-sm font-medium">
                    {course.category?.name || 'Course'}
                  </Badge>
                  <Badge variant="outline" className="bg-black/40 text-white border-white/20 backdrop-blur-md">
                    {course.difficulty}
                  </Badge>
                </div>
              </div>

              {/* Title & Meta */}
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-zinc-900 leading-tight tracking-tight mb-3">
                  {course.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500 font-medium">
                  <div className="flex items-center gap-1.5 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-bold">{course.averageRating || '0.0'}</span>
                    <span className="text-yellow-600/70">({course.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{course.enrollmentCount || 0} enrolled</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{course.estimatedDuration || formatDuration(course.totalDuration)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    <span>Multiple Languages</span>
                  </div>
                  {course.updatedAt && (
                    <div className="flex items-center gap-1.5 border-l border-zinc-200 pl-4">
                      <span>Last updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructor Pill */}
              <div className="flex items-center gap-3 p-2 pr-4 rounded-full bg-white border border-zinc-200 shadow-xs w-max">
                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-100">
                  {course.teacher?.avatarUrl ? (
                    <Image src={course.teacher.avatarUrl} alt={course.teacher.name} width={40} height={40} />
                  ) : (
                    <span className="text-zinc-500 font-bold text-sm">{course.teacher?.name?.charAt(0) || 'T'}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Instructor</span>
                  <span className="text-sm font-bold text-zinc-900 leading-none">{course.teacher?.name || 'Unknown'}</span>
                </div>
              </div>
            </div>

            {/* Sticky Tabs Navigation */}
            <div className="sticky top-[60px] lg:top-0 z-30 bg-zinc-50/95 backdrop-blur-md border-b border-zinc-200 -mx-4 lg:-mx-0 px-4 lg:px-0 pt-2">
              <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap",
                      activeTab === tab.id
                        ? "text-zinc-900 border-zinc-900"
                        : "text-zinc-500 border-transparent hover:text-zinc-700"
                    )}
                  >
                    {tab.label} {tab.id === 'curriculum' && <span className="ml-1 opacity-50 text-xs">({totalLessons})</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Areas */}
            <div className="min-h-[400px]">
              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="prose prose-zinc max-w-none text-zinc-600 leading-relaxed">
                    <h3 className="text-zinc-900 font-bold text-lg mb-2">About this course</h3>
                    <p className="whitespace-pre-wrap">{course.description}</p>
                  </div>

                  {course.tags && course.tags.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-zinc-900 font-bold text-sm uppercase tracking-wider">Course Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-0 rounded-full px-3">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Card className="bg-white border-zinc-100 shadow-sm rounded-2xl overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-zinc-900 font-bold mb-4">What you'll learn</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Mock data for now as API doesn't return 'learning points' separate from description */}
                        {[
                          "Comprehensive understanding of core concepts",
                          "Practical hands-on experience through projects",
                          "Industry best practices and advanced techniques",
                          "Direct interaction with expert instructors"
                        ].map((point, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <CheckCircle className="w-5 h-5 text-zinc-900 shrink-0 mt-0.5" />
                            <span className="text-sm text-zinc-600">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {isEnrolled && (course.whatsappGroupLink || course.contactEmail) && (
                    <Card className="bg-emerald-50 border-emerald-100 shadow-sm rounded-2xl overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-emerald-900 font-bold">Community & Support</h3>
                            <p className="text-sm text-emerald-700">Get help and connect with peers</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {course.whatsappGroupLink && (
                            <Button
                              variant="outline"
                              className="w-full justify-start gap-2 border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800"
                              onClick={() => window.open(course.whatsappGroupLink, '_blank')}
                            >
                              <Users className="w-4 h-4" />
                              Join WhatsApp Group
                            </Button>
                          )}
                          {course.contactEmail && (
                            <Button
                              variant="outline"
                              className="w-full justify-start gap-2 border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800"
                              onClick={() => window.location.href = `mailto:${course.contactEmail}`}
                            >
                              <Globe className="w-4 h-4" />
                              Contact Instructor
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* CURRICULUM */}
              {activeTab === 'curriculum' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {course.sections?.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl">
                      <BookOpen className="mx-auto h-12 w-12 text-zinc-300 mb-2" />
                      <p className="text-zinc-500 font-medium">No content available yet</p>
                    </div>
                  ) : (
                    <Accordion type="multiple" className="space-y-4">
                      {course.sections?.map((section, sectionIndex) => (
                        <AccordionItem
                          key={section.id}
                          value={`section-${sectionIndex}`}
                          className="border border-zinc-200 bg-white rounded-2xl px-2 overflow-hidden shadow-sm"
                        >
                          <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-zinc-50/50 rounded-xl transition-colors">
                            <div className="flex flex-col items-start text-left gap-1">
                              <span className="font-bold text-zinc-900 text-base">{section.title}</span>
                              <span className="text-xs text-zinc-500 font-medium">{section.lessons?.length || 0} lessons</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4 px-2">
                            <div className="space-y-1">
                              {section.lessons?.map((lesson, lessonIndex) => (
                                <div
                                  key={lesson.id}
                                  className="group flex items-center justify-between p-3 hover:bg-zinc-50 rounded-xl transition-colors cursor-default"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                      {lesson.type === 'VIDEO' ? <Play className="w-3 h-3 fill-current" /> : <Clock className="w-3 h-3" />}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">{lesson.title}</span>
                                      <span className="text-xs text-zinc-400 group-hover:text-zinc-500">Video • {formatDuration(lesson.duration)}</span>
                                    </div>
                                  </div>
                                  {!isEnrolled && lessonIndex > 0 && (
                                    <Lock className="w-4 h-4 text-zinc-300" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </div>
              )}

              {/* REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Card className="bg-white border-zinc-100 shadow-sm rounded-2xl">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                        {/* Big Rating */}
                        <div className="text-center md:text-left min-w-[140px]">
                          <div className="text-6xl font-black text-zinc-900 tracking-tighter">
                            {Number(reviews?.rating?.averageRating || course.averageRating).toFixed(1)}
                          </div>
                          <div className="flex justify-center md:justify-start my-2">
                            <StarRating value={Number(reviews?.rating?.averageRating || course.averageRating)} size="sm" readonly />
                          </div>
                          <p className="text-sm text-zinc-500 font-medium">Course Rating</p>
                        </div>

                        {/* Bars */}
                        <div className="flex-1 w-full space-y-2">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = reviews?.rating?.ratingDistribution?.[star] || 0;
                            const total = reviews?.rating?.totalReviews || 0;
                            const percentage = total > 0 ? (count / total) * 100 : 0;
                            return (
                              <div key={star} className="flex items-center gap-3">
                                <div className="w-12 text-xs font-bold text-zinc-700">{star} stars</div>
                                <Progress value={percentage} className="h-2 bg-zinc-100" indicatorClassName="bg-zinc-900" />
                                <div className="w-8 text-xs text-zinc-400 text-right">{percentage.toFixed(0)}%</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="mt-8 flex justify-center md:justify-start">
                        {user && isEnrolled && !existingReview && canReview && (
                          <Button onClick={() => setShowReviewForm(!showReviewForm)} variant="outline" className="rounded-full border-zinc-300">
                            Write a Review
                          </Button>
                        )}
                        {user && existingReview && (
                          <Button onClick={() => setShowReviewForm(!showReviewForm)} variant="outline" className="rounded-full border-zinc-300">
                            Edit Your Review
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {showReviewForm && user && (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6">
                      <ReviewForm
                        courseId={courseId}
                        courseName={course.title}
                        existingReview={existingReview}
                        onSuccess={() => { setShowReviewForm(false); fetchReviews(); checkReviewEligibility(); }}
                        onCancel={() => setShowReviewForm(false)}
                      />
                    </div>
                  )}

                  {/* Reviews List Component */}
                  <div className="space-y-4">
                    {isLoadingReviews ? (
                      <div className="flex justify-center py-8"><Loader2 className="animate-spin text-zinc-400" /></div>
                    ) : reviews?.reviews && reviews.reviews.length > 0 ? (
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
                        emptyMessage=""
                      />
                    ) : (
                      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-zinc-200">
                        <MessageSquare className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                        <p className="text-zinc-500">No reviews yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Sidebar (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-0 shadow-2xl shadow-zinc-200/50 rounded-[2rem] overflow-hidden bg-white ring-1 ring-zinc-100">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <p className="text-zinc-500 text-sm font-medium mb-1">Total Price</p>
                    {course.isFree ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-zinc-900">Free</span>
                        <span className="text-sm text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">100% OFF</span>
                      </div>
                    ) : (
                      <div className="text-4xl font-black text-zinc-900">${course.price?.toFixed(2)}</div>
                    )}
                  </div>

                  {isEnrolled ? (
                    <Button
                      className="w-full bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl h-14 text-base font-bold shadow-lg shadow-zinc-900/20 transition-all active:scale-95"
                      onClick={handleStartLearning}
                    >
                      <Play className="w-5 h-5 mr-2 fill-current" />
                      Continue Learning
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl h-14 text-base font-bold shadow-lg shadow-zinc-900/20 transition-all active:scale-95"
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Enroll Now
                        </>
                      )}
                    </Button>
                  )}

                  <div className="mt-8 space-y-4">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Course Includes</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-zinc-600">
                        <Video className="w-5 h-5 text-zinc-400" />
                        <span>{totalLessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-zinc-600">
                        <Clock className="w-5 h-5 text-zinc-400" />
                        <span>{course.estimatedDuration || formatDuration(course.totalDuration)} content</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-zinc-600">
                        <Lock className="w-5 h-5 text-zinc-400" />
                        <span>Full lifetime access</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-zinc-600">
                        <GraduationCap className="w-5 h-5 text-zinc-400" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE: Fixed Bottom Bar Action */}
      <div className="fixed lg:hidden bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-100 z-50 pb-8 safe-area-pb">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-zinc-500">Total Price</p>
            <p className="text-xl font-bold text-zinc-900">
              {course.isFree ? 'Free' : `$${course.price?.toFixed(2)}`}
            </p>
          </div>
          <Button
            className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl h-12 font-bold shadow-lg"
            onClick={isEnrolled ? handleStartLearning : handleEnroll}
            disabled={isEnrolling}
          >
            {isEnrolling ? <Loader2 className="animate-spin" /> : isEnrolled ? 'Continue' : 'Enroll Now'}
          </Button>
        </div>
      </div>
    </div>
  );
}
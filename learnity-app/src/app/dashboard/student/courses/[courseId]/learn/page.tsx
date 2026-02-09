'use client';

/**
 * Course Player Page
 * Students watch videos, track progress, and take quizzes
 * Requirements: 5.1-5.8, 6.3-6.9, 7.1-7.7
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Play,
  CheckCircle,
  HelpCircle,
  Trophy,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useToast } from '@/hooks/use-toast';
import {
  CoursePlayerLayout,
  YouTubePlayer,
  LessonSidebar,
  LessonCompleteDialog,
  XPCelebration,
  extractYouTubeId,
} from '@/components/course-player';
import type { SectionItem } from '@/components/course-player';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  passingScore: number;
  questions: QuizQuestion[];
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  type: 'VIDEO' | 'QUIZ';
  youtubeUrl?: string;
  youtubeId?: string;
  duration: number;
  order: number;
  quiz?: Quiz;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  requireSequentialProgress?: boolean;
  sections: Section[];
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

interface LessonProgressData {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  lastPosition: number;
}

interface CourseProgress {
  progressPercentage: number;
  completedLessons: number;
  completedLessonIds: string[];
  lessonProgress: LessonProgressData[];
}

interface GamificationProgress {
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  nextLevelXP: number;
  progressToNextLevel: number;
}

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const courseId = params.courseId as string;
  const { user, loading: authLoading } = useClientAuth();
  const authenticatedFetch = useAuthenticatedFetch();

  // States
  const [course, setCourse] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [gamification, setGamification] = useState<GamificationProgress | null>(
    null
  );

  // Current lesson state
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  // Status states
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    passed: boolean;
    xpAwarded?: number;
    answerResults: Array<{
      questionId: string;
      isCorrect: boolean;
      correctOptionIndex: number;
      explanation?: string;
    }>;
  } | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Completion dialog state
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completionData, setCompletionData] = useState<{
    xpEarned: number;
    currentStreak?: number;
    streakIncreased?: boolean;
    courseCompleted?: boolean;
  } | null>(null);

  // XP celebration state
  const [showXPCelebration, setShowXPCelebration] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  // Fetch course data
  const fetchCourse = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setError('Please log in to access this course');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await authenticatedFetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch course');
      }

      const responseData = await response.json();
      const data = responseData.data || responseData;
      setCourse(data);

      // Set first lesson as current
      if (data.sections?.length > 0 && data.sections[0].lessons?.length > 0) {
        setCurrentLesson(data.sections[0].lessons[0]);
        setCurrentSectionIndex(0);
        setCurrentLessonIndex(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, user, authLoading, authenticatedFetch]);

  // Fetch progress
  const fetchProgress = useCallback(async () => {
    if (!user) return;
    try {
      const response = await authenticatedFetch(
        `/api/courses/${courseId}/progress`
      );
      if (response.ok) {
        const data = await response.json();
        setProgress(data.data || data);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  }, [courseId, user, authenticatedFetch]);

  // Fetch gamification progress
  const fetchGamification = useCallback(async () => {
    if (!user) return;
    try {
      const response = await authenticatedFetch('/api/gamification/progress');
      if (response.ok) {
        const data = await response.json();
        setGamification(data.data || data);
      }
    } catch (err) {
      console.error('Failed to fetch gamification:', err);
    }
  }, [user, authenticatedFetch]);

  useEffect(() => {
    if (!authLoading) {
      fetchCourse();
      fetchProgress();
      fetchGamification();
    }
  }, [authLoading, fetchCourse, fetchProgress, fetchGamification]);

  // Gating Logic - Determine which lessons are locked
  const lockedLessonIds = useMemo(() => {
    if (!course || !progress) return new Set<string>();

    const locked = new Set<string>();
    let foundIncomplete = false;

    // Enforce sequential progress by default for better UX
    const requireSequential = course.requireSequentialProgress !== false;

    if (!requireSequential) return locked;

    // Sort sections and lessons to ensure order
    const orderedLessons = (course.sections || [])
      .sort((a, b) => a.order - b.order)
      .flatMap(section =>
        Array.isArray(section.lessons)
          ? [...section.lessons].sort((a, b) => a.order - b.order)
          : []
      );

    for (const lesson of orderedLessons) {
      if (foundIncomplete) {
        locked.add(lesson.id);
      } else {
        const isComplete = (progress.completedLessonIds || []).includes(
          lesson.id
        );
        if (!isComplete) {
          foundIncomplete = true;
        }
      }
    }

    return locked;
  }, [course, progress]);

  // Update video progress
  const handleProgressUpdate = useCallback(
    async (watchedSeconds: number, lastPosition: number) => {
      if (!currentLesson) return;

      try {
        await authenticatedFetch(`/api/lessons/${currentLesson.id}/progress`, {
          method: 'POST',
          body: JSON.stringify({ watchedSeconds, lastPosition }),
        });
      } catch (err) {
        console.error('Failed to update progress:', err);
      }
    },
    [currentLesson, authenticatedFetch]
  );

  // Check if lesson is completed
  const isLessonCompleted = useCallback(
    (lessonId: string) => {
      return (progress?.completedLessonIds || []).includes(lessonId);
    },
    [progress]
  );

  // Handle auto-complete from video player
  const handleAutoComplete = useCallback(async () => {
    if (!currentLesson || isLessonCompleted(currentLesson.id)) return;
    await markLessonComplete(currentLesson.id);
  }, [currentLesson, isLessonCompleted]);

  // Mark lesson complete
  const markLessonComplete = async (lessonId: string) => {
    if (isMarkingComplete) return;

    setIsMarkingComplete(true);
    try {
      // Optimistic celebration if already completed just show the dialog
      if (isLessonCompleted(lessonId)) {
        setCompletionData({
          xpEarned: 0,
          currentStreak: gamification?.currentStreak,
          streakIncreased: false,
          courseCompleted: progress?.progressPercentage === 100,
        });
        setShowCompleteDialog(true);
        setIsMarkingComplete(false);
        return;
      }

      const response = await authenticatedFetch(
        `/api/lessons/${lessonId}/complete`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        const data = await response.json();
        const result = data.data || data;

        // Show XP celebration
        if (result.xpAwarded) {
          setXpEarned(result.xpAwarded);
          setShowXPCelebration(true);
        }

        // Set completion data for dialog
        setCompletionData({
          xpEarned: result.xpAwarded || 10,
          currentStreak: result.newStreak,
          streakIncreased:
            result.newStreak > (gamification?.currentStreak || 0),
          courseCompleted: result.courseCompleted,
        });

        // Show completion dialog immediately
        setShowCompleteDialog(true);

        // Refresh data
        fetchProgress();
        fetchGamification();

        toast({
          title: 'Mission Accomplished!',
          description: `You've earned ${result.xpAwarded || 10} XP. Keep going!`,
        });
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
      toast({
        title: 'Sync Error',
        description: "We couldn't save your progress. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsMarkingComplete(false);
    }
  };

  // Navigate to lesson
  const goToLesson = (sectionIndex: number, lessonIndex: number) => {
    if (!course) return;
    const lesson = course.sections[sectionIndex]?.lessons[lessonIndex];

    if (lesson) {
      // Check if locked
      if (lockedLessonIds.has(lesson.id)) {
        toast({
          title: 'Lesson Locked',
          description:
            'Please complete the previous lessons first to unlock this content.',
          variant: 'default',
        });
        return;
      }

      setCurrentLesson(lesson);
      setCurrentSectionIndex(sectionIndex);
      setCurrentLessonIndex(lessonIndex);
      setShowQuiz(false);
      setQuizSubmitted(false);
      setQuizResult(null);
      setQuizAnswers({});

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navigate to next lesson
  const goToNextLesson = () => {
    if (!course) return;
    const currentSection = course.sections[currentSectionIndex];

    if (currentLessonIndex < currentSection.lessons.length - 1) {
      goToLesson(currentSectionIndex, currentLessonIndex + 1);
    } else if (currentSectionIndex < course.sections.length - 1) {
      goToLesson(currentSectionIndex + 1, 0);
    }

    setShowCompleteDialog(false);
  };

  // Navigate to previous lesson
  const goToPrevLesson = () => {
    if (currentLessonIndex > 0) {
      goToLesson(currentSectionIndex, currentLessonIndex - 1);
    } else if (currentSectionIndex > 0 && course) {
      const prevSection = course.sections[currentSectionIndex - 1];
      goToLesson(currentSectionIndex - 1, prevSection.lessons.length - 1);
    }
  };

  // Get lesson progress data
  const getLessonProgress = (
    lessonId: string
  ): LessonProgressData | undefined => {
    return progress?.lessonProgress?.find(p => p.lessonId === lessonId);
  };

  // Submit quiz
  const submitQuiz = async () => {
    if (!currentLesson?.quiz) return;

    const quiz = currentLesson.quiz;
    const answers = quiz.questions.map(q => ({
      questionId: q.id,
      selectedOptionIndex: quizAnswers[q.id] ?? -1,
    }));

    // Check if all questions answered
    if (answers.some(a => a.selectedOptionIndex === -1)) {
      toast({ title: 'Please answer all questions', variant: 'destructive' });
      return;
    }

    try {
      setIsSubmittingQuiz(true);
      const response = await authenticatedFetch(
        `/api/quizzes/${quiz.id}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ answers, timeTaken: 0 }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to submit quiz');
      }

      const data = await response.json();
      const result = data.data || data;

      setQuizResult({
        score: result.score,
        passed: result.passed,
        xpAwarded: result.xpAwarded,
        answerResults: result.answerResults,
      });
      setQuizSubmitted(true);

      if (result.xpAwarded) {
        setXpEarned(result.xpAwarded);
        setShowXPCelebration(true);
      }

      fetchProgress();
      fetchGamification();
    } catch (err) {
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Failed to submit quiz',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Retry quiz
  const retryQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
  };

  // Get next lesson title
  const getNextLessonTitle = (): string | undefined => {
    if (!course) return undefined;
    const currentSection = course.sections[currentSectionIndex];

    if (currentLessonIndex < currentSection.lessons.length - 1) {
      return currentSection.lessons[currentLessonIndex + 1].title;
    } else if (currentSectionIndex < course.sections.length - 1) {
      return course.sections[currentSectionIndex + 1].lessons[0]?.title;
    }
    return undefined;
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className='min-h-screen bg-slate-950 flex'>
        <div className='flex-1 p-8 flex flex-col gap-6'>
          <Skeleton className='aspect-video w-full bg-slate-900 rounded-3xl' />
          <div className='space-y-4'>
            <Skeleton className='h-10 w-2/3 bg-slate-900' />
            <Skeleton className='h-20 w-full bg-slate-900' />
          </div>
        </div>
        <div className='w-80 bg-slate-900/50 border-l border-slate-800 p-6 hidden lg:block'>
          <Skeleton className='h-8 w-full mb-8 bg-slate-800' />
          <div className='space-y-4'>
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton
                key={i}
                className='h-16 w-full bg-slate-800 rounded-xl'
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className='min-h-screen bg-slate-950 flex items-center justify-center p-4'>
        <Card className='w-full max-w-md bg-slate-900 border-slate-800'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <div className='bg-red-500/10 p-4 rounded-full mb-6'>
              <AlertCircle className='h-12 w-12 text-red-500' />
            </div>
            <h2 className='text-xl font-bold text-white mb-2'>Access Denied</h2>
            <p className='text-slate-400 text-center mb-8'>
              {error || "We couldn't load the course materials."}
            </p>
            <Button
              variant='outline'
              onClick={() => router.back()}
              className='border-slate-700 text-slate-300'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Catalog
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare data for components
  const videoId = currentLesson?.youtubeUrl
    ? extractYouTubeId(currentLesson.youtubeUrl)
    : currentLesson?.youtubeId;
  const totalLessons = course.sections.reduce(
    (sum, s) => sum + s.lessons.length,
    0
  );
  const completedCount = progress?.completedLessons || 0;
  const progressPercent = progress?.progressPercentage || 0;

  // Convert sections for LessonSidebar
  const sidebarSections: SectionItem[] = (course.sections || []).map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    order: s.order,
    lessons: Array.isArray(s.lessons)
      ? s.lessons.map(l => ({
          id: l.id,
          title: l.title,
          type: l.type,
          duration: l.duration,
          order: l.order,
        }))
      : [],
  }));

  const completedLessonIds = new Set(progress?.completedLessonIds || []);
  const currentLessonProgress = currentLesson
    ? getLessonProgress(currentLesson.id)
    : undefined;

  // Check if at first/last lesson
  const isFirstLesson = currentSectionIndex === 0 && currentLessonIndex === 0;
  const isLastLesson =
    currentSectionIndex === course.sections.length - 1 &&
    currentLessonIndex ===
      course.sections[currentSectionIndex].lessons.length - 1;

  const isCompleted = currentLesson
    ? isLessonCompleted(currentLesson.id)
    : false;

  return (
    <>
      {/* XP Celebration Animation */}
      <XPCelebration
        show={showXPCelebration}
        xpAmount={xpEarned}
        onComplete={() => setShowXPCelebration(false)}
      />

      {/* Lesson Complete Dialog */}
      <LessonCompleteDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        xpEarned={completionData?.xpEarned || 0}
        currentStreak={completionData?.currentStreak}
        streakIncreased={completionData?.streakIncreased}
        nextLessonTitle={getNextLessonTitle()}
        courseCompleted={completionData?.courseCompleted}
        onNextLesson={goToNextLesson}
        onReplay={() => setShowCompleteDialog(false)}
        onViewCertificate={() => {
          // No longer using dialog for certificate as requested
        }}
      />

      <CoursePlayerLayout
        courseId={courseId}
        courseTitle={course.title}
        teacherName={
          course.teacher
            ? `${course.teacher.firstName} ${course.teacher.lastName}`
            : 'Unknown Instructor'
        }
        progressPercent={progressPercent}
        currentLessonTitle={currentLesson?.title}
        currentLessonDescription={currentLesson?.description}
        prevDisabled={isFirstLesson}
        nextDisabled={
          isLastLesson ||
          (() => {
            const currentSection = course.sections[currentSectionIndex];
            let nextLessonId = '';

            if (currentLessonIndex < currentSection.lessons.length - 1) {
              nextLessonId = currentSection.lessons[currentLessonIndex + 1].id;
            } else if (currentSectionIndex < course.sections.length - 1) {
              nextLessonId =
                course.sections[currentSectionIndex + 1].lessons[0]?.id || '';
            }

            return nextLessonId ? lockedLessonIds.has(nextLessonId) : true;
          })()
        }
        onPrevious={goToPrevLesson}
        onNext={goToNextLesson}
        gamificationProgress={
          gamification
            ? {
                totalXP: gamification.totalXP,
                currentLevel: gamification.currentLevel,
                currentStreak: gamification.currentStreak,
              }
            : undefined
        }
        controls={
          currentLesson && currentLesson.type === 'VIDEO' ? (
            <Button
              onClick={() => markLessonComplete(currentLesson.id)}
              disabled={isMarkingComplete || isCompleted}
              className={cn(
                'transition-all duration-300',
                isCompleted
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                  : 'bg-green-600 hover:bg-green-700'
              )}
            >
              {isMarkingComplete ? (
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              ) : isCompleted ? (
                <Sparkles className='h-4 w-4 mr-2 fill-emerald-500' />
              ) : (
                <CheckCircle className='h-4 w-4 mr-2' />
              )}
              <span className='hidden sm:inline'>
                {isCompleted ? 'Completed - Nice!' : 'Mark Complete'}
              </span>
            </Button>
          ) : null
        }
        sidebar={
          <LessonSidebar
            sections={sidebarSections}
            currentLessonId={currentLesson?.id}
            completedLessonIds={completedLessonIds}
            lockedLessonIds={lockedLessonIds}
            totalLessons={totalLessons}
            completedCount={completedCount}
            onLessonSelect={goToLesson}
            courseId={courseId}
          />
        }
      >
        {/* Main Content - Video or Quiz */}
        {currentLesson?.type === 'QUIZ' ? (
          <QuizContent
            lesson={currentLesson}
            showQuiz={showQuiz}
            quizAnswers={quizAnswers}
            quizSubmitted={quizSubmitted}
            quizResult={quizResult}
            isSubmitting={isSubmittingQuiz}
            onStartQuiz={() => setShowQuiz(true)}
            onAnswerSelect={(questionId, optionIndex) =>
              setQuizAnswers({ ...quizAnswers, [questionId]: optionIndex })
            }
            onSubmit={submitQuiz}
            onRetry={retryQuiz}
            onNextLesson={goToNextLesson}
          />
        ) : videoId ? (
          <YouTubePlayer
            videoId={videoId}
            lessonId={currentLesson?.id || ''}
            duration={currentLesson?.duration || 0}
            lastPosition={currentLessonProgress?.lastPosition}
            onProgressUpdate={handleProgressUpdate}
            onAutoComplete={handleAutoComplete}
            className='w-full h-full'
          />
        ) : (
          <div className='text-center text-slate-400'>
            <AlertCircle className='h-16 w-16 mx-auto mb-4 opacity-50 text-red-500' />
            <h3 className='text-xl font-bold text-white mb-2'>
              Media Link Broken
            </h3>
            <p className='max-w-xs mx-auto'>
              This lesson's content couldn't be loaded. Please notify the
              instructor.
            </p>
          </div>
        )}
      </CoursePlayerLayout>
    </>
  );
}

// Quiz Content Component
interface QuizContentProps {
  lesson: Lesson;
  showQuiz: boolean;
  quizAnswers: Record<string, number>;
  quizSubmitted: boolean;
  quizResult: {
    score: number;
    passed: boolean;
    xpAwarded?: number;
    answerResults: Array<{
      questionId: string;
      isCorrect: boolean;
      correctOptionIndex: number;
      explanation?: string;
    }>;
  } | null;
  isSubmitting: boolean;
  onStartQuiz: () => void;
  onAnswerSelect: (questionId: string, optionIndex: number) => void;
  onSubmit: () => void;
  onRetry: () => void;
  onNextLesson: () => void;
}

function QuizContent({
  lesson,
  showQuiz,
  quizAnswers,
  quizSubmitted,
  quizResult,
  isSubmitting,
  onStartQuiz,
  onAnswerSelect,
  onSubmit,
  onRetry,
  onNextLesson,
}: QuizContentProps) {
  if (!showQuiz) {
    return (
      <div className='w-full max-w-3xl p-6'>
        <Card className='bg-slate-900 border-slate-800 shadow-2xl rounded-3xl overflow-hidden'>
          <div className='h-2 bg-gradient-to-r from-purple-500 to-indigo-500' />
          <CardContent className='flex flex-col items-center justify-center py-12 px-8 text-center'>
            <div className='bg-purple-500/10 p-6 rounded-full mb-6'>
              <HelpCircle className='h-16 w-16 text-purple-400' />
            </div>
            <h2 className='text-3xl font-bold text-white mb-3'>
              {lesson.title} Challenge
            </h2>
            <p className='text-slate-400 mb-8 max-w-sm'>
              Test your knowledge! You need to score at least{' '}
              {lesson.quiz?.passingScore || 70}% to pass and earn XP.
            </p>
            <div className='flex items-center gap-6 mb-10'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-white'>
                  {lesson.quiz?.questions.length || 0}
                </p>
                <p className='text-[10px] text-slate-500 uppercase font-black'>
                  Questions
                </p>
              </div>
              <div className='w-px h-10 bg-slate-800' />
              <div className='text-center'>
                <p className='text-2xl font-bold text-white'>
                  {lesson.quiz?.passingScore || 70}%
                </p>
                <p className='text-[10px] text-slate-500 uppercase font-black'>
                  Passing Score
                </p>
              </div>
            </div>
            <Button
              onClick={onStartQuiz}
              size='lg'
              className='bg-purple-600 hover:bg-purple-700 px-10 rounded-full h-14 text-lg font-bold shadow-lg shadow-purple-900/20'
            >
              <Play className='h-6 w-6 mr-2 fill-white' />
              Begin Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizSubmitted && quizResult) {
    return (
      <div className='w-full max-w-3xl p-6 h-full overflow-y-auto custom-scrollbar pb-20'>
        <Card className='bg-slate-900 border-slate-800 rounded-3xl overflow-hidden'>
          <CardContent className='py-10 px-8'>
            <div className='text-center mb-10'>
              {quizResult.passed ? (
                <div className='inline-flex flex-col items-center'>
                  <div className='bg-yellow-500/10 p-5 rounded-full mb-4 border border-yellow-500/20'>
                    <Trophy className='h-16 w-16 text-yellow-400' />
                  </div>
                  <h2 className='text-4xl font-black text-white italic tracking-tighter'>
                    VICTORY!
                  </h2>
                </div>
              ) : (
                <div className='inline-flex flex-col items-center'>
                  <div className='bg-red-500/10 p-5 rounded-full mb-4 border border-red-500/20'>
                    <AlertCircle className='h-16 w-16 text-red-400' />
                  </div>
                  <h2 className='text-4xl font-black text-white italic tracking-tighter'>
                    DEFEATED
                  </h2>
                </div>
              )}
              <div className='mt-6 space-y-2'>
                <p className='text-5xl font-black text-white'>
                  {quizResult.score}%
                </p>
                {quizResult.xpAwarded && (
                  <Badge className='bg-yellow-500 text-slate-950 font-black px-4 py-1'>
                    +{quizResult.xpAwarded} XP AWARDED
                  </Badge>
                )}
              </div>
            </div>

            {/* Answer Review */}
            <div className='space-y-6 mt-10'>
              <h3 className='text-xl font-bold text-white border-b border-slate-800 pb-3'>
                Strategic Review
              </h3>
              {lesson.quiz?.questions.map((q, idx) => {
                const result = quizResult.answerResults.find(
                  r => r.questionId === q.id
                );
                return (
                  <div
                    key={q.id}
                    className={`p-6 rounded-2xl border ${result?.isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}
                  >
                    <div className='flex gap-4'>
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold',
                          result?.isCorrect
                            ? 'bg-emerald-500 text-white'
                            : 'bg-red-500 text-white'
                        )}
                      >
                        {idx + 1}
                      </div>
                      <div className='flex-1'>
                        <p className='text-white font-bold text-lg mb-3'>
                          {q.question}
                        </p>
                        <div className='grid gap-2'>
                          <p
                            className={cn(
                              'text-sm font-medium p-2 rounded-lg',
                              result?.isCorrect
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            )}
                          >
                            Your answer: {q.options[quizAnswers[q.id]]}
                          </p>
                          {!result?.isCorrect && (
                            <p className='text-sm bg-emerald-500/10 text-emerald-400 p-2 rounded-lg font-medium'>
                              Correct:{' '}
                              {q.options[result?.correctOptionIndex || 0]}
                            </p>
                          )}
                        </div>
                        {result?.explanation && (
                          <p className='text-sm text-slate-400 mt-4 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800'>
                            <span className='font-bold text-slate-300 block mb-1'>
                              Explanation:
                            </span>
                            {result.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className='flex flex-col sm:flex-row gap-4 mt-12 justify-center'>
              {!quizResult.passed && (
                <Button
                  onClick={onRetry}
                  variant='outline'
                  className='h-12 border-slate-700 text-slate-300 hover:bg-slate-800'
                >
                  Retry Challenge
                </Button>
              )}
              <Button
                onClick={onNextLesson}
                className='h-12 bg-indigo-600 hover:bg-indigo-500 px-8'
              >
                Continue Journey
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='w-full max-w-3xl p-6 h-full flex flex-col'>
      <Card className='bg-slate-900 border-slate-800 flex-1 flex flex-col min-h-0 rounded-3xl overflow-hidden shadow-2xl'>
        <CardHeader className='shrink-0 bg-slate-900/50 backdrop-blur border-b border-slate-800'>
          <div className='flex justify-between items-center'>
            <div>
              <CardTitle className='text-2xl font-bold text-white'>
                {lesson.title}
              </CardTitle>
              <CardDescription className='text-slate-500 font-medium'>
                Multiple Choice Assessment
              </CardDescription>
            </div>
            <div className='text-right'>
              <p className='text-xs font-black text-slate-600 uppercase tracking-widest'>
                Progress
              </p>
              <p className='text-lg font-bold text-indigo-400'>
                {Object.keys(quizAnswers).length} /{' '}
                {lesson.quiz?.questions.length}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className='flex-1 overflow-y-auto custom-scrollbar py-8 px-8 space-y-10'>
          {lesson.quiz?.questions.map((q, idx) => (
            <div key={q.id} className='space-y-4'>
              <div className='flex gap-4'>
                <span className='w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-sm font-bold text-slate-400 shrink-0'>
                  {idx + 1}
                </span>
                <p className='text-xl font-bold text-white'>{q.question}</p>
              </div>
              <div className='grid gap-3 ml-12'>
                {q.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => onAnswerSelect(q.id, optIdx)}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden',
                      quizAnswers[q.id] === optIdx
                        ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    )}
                  >
                    {quizAnswers[q.id] === optIdx && (
                      <div className='absolute left-0 top-0 bottom-0 w-1 bg-indigo-500' />
                    )}
                    <div className='flex items-center'>
                      <span
                        className={cn(
                          'w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black mr-3 border',
                          quizAnswers[q.id] === optIdx
                            ? 'bg-indigo-500 border-indigo-500 text-white'
                            : 'border-slate-700 text-slate-600 group-hover:border-slate-500'
                        )}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className='font-medium'>{opt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className='py-6'>
            <Button
              onClick={onSubmit}
              disabled={
                isSubmitting ||
                Object.keys(quizAnswers).length <
                  (lesson.quiz?.questions.length || 0)
              }
              className='w-full bg-indigo-600 hover:bg-indigo-500 h-14 text-lg font-bold rounded-2xl shadow-xl shadow-indigo-900/20 disabled:bg-slate-800 disabled:text-slate-600'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='h-6 w-6 mr-2 animate-spin' />
                  Evaluating Answers...
                </>
              ) : (
                'Finalize Submission'
              )}
            </Button>
            {Object.keys(quizAnswers).length <
              (lesson.quiz?.questions.length || 0) && (
              <p className='text-center text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-widest'>
                Please answer all questions to unlock submission
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

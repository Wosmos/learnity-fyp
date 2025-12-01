'use client';

/**
 * Course Player Page
 * Students watch videos, track progress, and take quizzes
 * Requirements: 5.1-5.8, 6.3-6.9, 7.1-7.7
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthenticatedLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Play,
  CheckCircle,
  HelpCircle,
  Trophy,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
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
  teacher: { name: string };
}

interface LessonProgressData {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  lastPosition: number;
}

interface CourseProgress {
  progress: number;
  completedLessons: string[];
  lessonProgress: LessonProgressData[];
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
  
  // Current lesson state
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  
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
      const response = await authenticatedFetch(`/api/courses/${courseId}/progress`);
      if (response.ok) {
        const data = await response.json();
        setProgress(data.data || data);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  }, [courseId, user, authenticatedFetch]);

  useEffect(() => {
    if (!authLoading) {
      fetchCourse();
      fetchProgress();
    }
  }, [authLoading, fetchCourse, fetchProgress]);


  // Update video progress
  const handleProgressUpdate = useCallback(async (watchedSeconds: number, lastPosition: number) => {
    if (!currentLesson) return;
    
    try {
      await authenticatedFetch(`/api/lessons/${currentLesson.id}/progress`, {
        method: 'POST',
        body: JSON.stringify({ watchedSeconds, lastPosition }),
      });
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  }, [currentLesson, authenticatedFetch]);

  // Check if lesson is completed
  const isLessonCompleted = useCallback((lessonId: string) => {
    return progress?.completedLessons?.includes(lessonId) || false;
  }, [progress]);

  // Handle auto-complete from video player
  const handleAutoComplete = useCallback(async () => {
    if (!currentLesson || isLessonCompleted(currentLesson.id)) return;
    await markLessonComplete(currentLesson.id);
  }, [currentLesson, isLessonCompleted]);

  // Mark lesson complete
  const markLessonComplete = async (lessonId: string) => {
    try {
      const response = await authenticatedFetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
      });

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
          streakIncreased: result.newStreak > 1,
          courseCompleted: result.courseCompleted,
        });
        
        // Show completion dialog
        setShowCompleteDialog(true);
        
        // Refresh progress
        fetchProgress();
        
        toast({ title: 'Lesson Complete!', description: `+${result.xpAwarded || 10} XP earned` });
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to mark lesson complete', 
        variant: 'destructive' 
      });
    }
  };

  // Navigate to lesson
  const goToLesson = (sectionIndex: number, lessonIndex: number) => {
    if (!course) return;
    const lesson = course.sections[sectionIndex]?.lessons[lessonIndex];
    if (lesson) {
      setCurrentLesson(lesson);
      setCurrentSectionIndex(sectionIndex);
      setCurrentLessonIndex(lessonIndex);
      setShowQuiz(false);
      setQuizSubmitted(false);
      setQuizResult(null);
      setQuizAnswers({});
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
  const getLessonProgress = (lessonId: string): LessonProgressData | undefined => {
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
      const response = await authenticatedFetch(`/api/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers, timeTaken: 0 }),
      });

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
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to submit quiz',
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
      <AuthenticatedLayout>
        <div className="min-h-screen bg-slate-900">
          <div className="flex">
            <div className="flex-1 p-4">
              <Skeleton className="aspect-video w-full bg-slate-800" />
            </div>
            <div className="w-80 bg-slate-800 p-4">
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-32 w-full" />
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

  // Prepare data for components
  const videoId = currentLesson?.youtubeUrl 
    ? extractYouTubeId(currentLesson.youtubeUrl) 
    : currentLesson?.youtubeId;
  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const completedCount = progress?.completedLessons?.length || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  
  // Convert sections for LessonSidebar
  const sidebarSections: SectionItem[] = course.sections.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    order: s.order,
    lessons: s.lessons.map(l => ({
      id: l.id,
      title: l.title,
      type: l.type,
      duration: l.duration,
      order: l.order,
    })),
  }));
  
  const completedLessonIds = new Set(progress?.completedLessons || []);
  const currentLessonProgress = currentLesson ? getLessonProgress(currentLesson.id) : undefined;

  // Check if at first/last lesson
  const isFirstLesson = currentSectionIndex === 0 && currentLessonIndex === 0;
  const isLastLesson = currentSectionIndex === course.sections.length - 1 &&
    currentLessonIndex === course.sections[currentSectionIndex].lessons.length - 1;

  return (
    <AuthenticatedLayout>
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
          router.push(`/dashboard/student/courses/${courseId}/certificate`);
        }}
      />

      <CoursePlayerLayout
        courseId={courseId}
        courseTitle={course.title}
        teacherName={course.teacher?.name || 'Unknown'}
        progressPercent={progressPercent}
        currentLessonTitle={currentLesson?.title}
        currentLessonDescription={currentLesson?.description}
        prevDisabled={isFirstLesson}
        nextDisabled={isLastLesson}
        onPrevious={goToPrevLesson}
        onNext={goToNextLesson}
        controls={
          currentLesson && !isLessonCompleted(currentLesson.id) && currentLesson.type === 'VIDEO' ? (
            <Button
              onClick={() => currentLesson && markLessonComplete(currentLesson.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Mark Complete</span>
            </Button>
          ) : null
        }
        sidebar={
          <LessonSidebar
            sections={sidebarSections}
            currentLessonId={currentLesson?.id}
            completedLessonIds={completedLessonIds}
            totalLessons={totalLessons}
            completedCount={completedCount}
            onLessonSelect={goToLesson}
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
            className="w-full h-full"
          />
        ) : (
          <div className="text-center text-slate-400">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No video available for this lesson</p>
          </div>
        )}
      </CoursePlayerLayout>
    </AuthenticatedLayout>
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
      <div className="w-full max-w-3xl p-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircle className="h-16 w-16 text-purple-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">{lesson.title}</h2>
            <p className="text-slate-400 mb-6">
              {lesson.quiz?.questions.length || 0} questions • Pass: {lesson.quiz?.passingScore || 70}%
            </p>
            <Button onClick={onStartQuiz} size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Play className="h-5 w-5 mr-2" />
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizSubmitted && quizResult) {
    return (
      <div className="w-full max-w-3xl p-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-8">
            <div className="text-center mb-6">
              {quizResult.passed ? (
                <>
                  <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-400">Quiz Passed!</h2>
                </>
              ) : (
                <>
                  <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-red-400">Quiz Failed</h2>
                </>
              )}
              <p className="text-4xl font-bold text-white mt-4">{quizResult.score}%</p>
              {quizResult.xpAwarded && (
                <Badge className="mt-2 bg-yellow-500">+{quizResult.xpAwarded} XP</Badge>
              )}
            </div>

            {/* Answer Review */}
            <div className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold text-white">Review Answers</h3>
              {lesson.quiz?.questions.map((q, idx) => {
                const result = quizResult.answerResults.find(r => r.questionId === q.id);
                return (
                  <div key={q.id} className={`p-4 rounded-lg ${result?.isCorrect ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                    <p className="text-white font-medium mb-2">{idx + 1}. {q.question}</p>
                    <p className="text-sm text-slate-300">
                      Your answer: {q.options[quizAnswers[q.id]]}
                      {!result?.isCorrect && (
                        <span className="text-green-400 ml-2">
                          (Correct: {q.options[result?.correctOptionIndex || 0]})
                        </span>
                      )}
                    </p>
                    {result?.explanation && (
                      <p className="text-sm text-slate-400 mt-2 italic">{result.explanation}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 mt-6 justify-center">
              {!quizResult.passed && (
                <Button onClick={onRetry} variant="outline">
                  Try Again
                </Button>
              )}
              <Button onClick={onNextLesson}>
                Next Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl p-6">
      <Card className="bg-slate-800 border-slate-700 max-h-[70vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-white">{lesson.title}</CardTitle>
          <CardDescription className="text-slate-400">
            Answer all questions to complete the quiz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {lesson.quiz?.questions.map((q, idx) => (
            <div key={q.id} className="space-y-3">
              <p className="text-white font-medium">{idx + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => onAnswerSelect(q.id, optIdx)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      quizAnswers[q.id] === optIdx
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-slate-600 hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button 
            onClick={onSubmit} 
            disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Quiz'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

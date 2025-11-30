'use client';

/**
 * Course Player Page
 * Students watch videos, track progress, and take quizzes
 * Requirements: 5.1-5.8, 6.3-6.9, 7.1-7.7
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthenticatedLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Circle,
  Video,
  HelpCircle,
  Lock,
  Trophy,
  Flame,
  Star,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  PartyPopper,
  X,
} from 'lucide-react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useToast } from '@/hooks/use-toast';


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
  sections: Section[];
  teacher: { name: string };
}

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
}

interface CourseProgress {
  progress: number;
  completedLessons: string[];
  lessonProgress: LessonProgress[];
}

// Extract YouTube video ID
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
  
  // XP celebration
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


  // Mark lesson complete
  const markLessonComplete = async (lessonId: string) => {
    try {
      const response = await authenticatedFetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.xpAwarded) {
          setXpEarned(data.data.xpAwarded);
          setShowXPCelebration(true);
          setTimeout(() => setShowXPCelebration(false), 3000);
        }
        fetchProgress();
        toast({ title: 'Lesson Complete!', description: '+10 XP earned' });
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
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

  // Check if lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    return progress?.completedLessons?.includes(lessonId) || false;
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
        setTimeout(() => setShowXPCelebration(false), 3000);
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

  const videoId = currentLesson?.youtubeUrl ? extractYouTubeId(currentLesson.youtubeUrl) : currentLesson?.youtubeId;
  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const completedCount = progress?.completedLessons?.length || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-slate-900 text-white">
        {/* XP Celebration */}
        {showXPCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-2xl shadow-2xl animate-bounce">
              <div className="flex items-center gap-3">
                <PartyPopper className="h-8 w-8" />
                <span className="text-2xl font-bold">+{xpEarned} XP!</span>
                <Flame className="h-8 w-8" />
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <Link href={`/courses/${courseId}`}>
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Exit
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">{course.title}</h1>
                <p className="text-sm text-slate-400">by {course.teacher?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Progress value={progressPercent} className="w-32 h-2" />
                <span className="text-sm text-slate-400">{progressPercent}%</span>
              </div>
            </div>
          </div>
        </header>


        <div className="flex h-[calc(100vh-64px)]">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Video/Quiz Player */}
            <div className="flex-1 bg-black flex items-center justify-center">
              {currentLesson?.type === 'QUIZ' ? (
                <div className="w-full max-w-3xl p-6">
                  {!showQuiz ? (
                    <Card className="bg-slate-800 border-slate-700">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <HelpCircle className="h-16 w-16 text-purple-400 mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">{currentLesson.title}</h2>
                        <p className="text-slate-400 mb-6">
                          {currentLesson.quiz?.questions.length || 0} questions • Pass: {currentLesson.quiz?.passingScore || 70}%
                        </p>
                        <Button onClick={() => setShowQuiz(true)} size="lg" className="bg-purple-600 hover:bg-purple-700">
                          <Play className="h-5 w-5 mr-2" />
                          Start Quiz
                        </Button>
                      </CardContent>
                    </Card>
                  ) : quizSubmitted && quizResult ? (
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
                          {currentLesson.quiz?.questions.map((q, idx) => {
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
                            <Button onClick={retryQuiz} variant="outline">
                              Try Again
                            </Button>
                          )}
                          <Button onClick={goToNextLesson}>
                            Next Lesson
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-slate-800 border-slate-700 max-h-[70vh] overflow-y-auto">
                      <CardHeader>
                        <CardTitle className="text-white">{currentLesson.title}</CardTitle>
                        <CardDescription className="text-slate-400">
                          Answer all questions to complete the quiz
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {currentLesson.quiz?.questions.map((q, idx) => (
                          <div key={q.id} className="space-y-3">
                            <p className="text-white font-medium">{idx + 1}. {q.question}</p>
                            <div className="space-y-2">
                              {q.options.map((opt, optIdx) => (
                                <button
                                  key={optIdx}
                                  onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
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
                          onClick={submitQuiz} 
                          disabled={isSubmittingQuiz}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          {isSubmittingQuiz ? (
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
                  )}
                </div>
              ) : videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="text-center text-slate-400">
                  <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No video available for this lesson</p>
                </div>
              )}
            </div>


            {/* Lesson Controls */}
            <div className="bg-slate-800 border-t border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{currentLesson?.title}</h2>
                  <p className="text-sm text-slate-400">{currentLesson?.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevLesson}
                    disabled={currentSectionIndex === 0 && currentLessonIndex === 0}
                    className="border-slate-600"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  {currentLesson && !isLessonCompleted(currentLesson.id) && currentLesson.type === 'VIDEO' && (
                    <Button
                      onClick={() => currentLesson && markLessonComplete(currentLesson.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextLesson}
                    disabled={
                      currentSectionIndex === course.sections.length - 1 &&
                      currentLessonIndex === course.sections[currentSectionIndex].lessons.length - 1
                    }
                    className="border-slate-600"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Course Content */}
          <div className="w-80 bg-slate-800 border-l border-slate-700 overflow-y-auto">
            <div className="p-4 border-b border-slate-700">
              <h3 className="font-semibold text-white">Course Content</h3>
              <p className="text-sm text-slate-400 mt-1">
                {completedCount} of {totalLessons} lessons completed
              </p>
            </div>

            <Accordion type="multiple" defaultValue={[`section-0`]} className="px-2">
              {course.sections.map((section, sectionIndex) => (
                <AccordionItem 
                  key={section.id} 
                  value={`section-${sectionIndex}`}
                  className="border-b border-slate-700"
                >
                  <AccordionTrigger className="text-white hover:no-underline py-3 px-2">
                    <div className="flex items-center gap-2 text-left">
                      <span className="text-sm font-medium">{section.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {section.lessons.filter(l => isLessonCompleted(l.id)).length}/{section.lessons.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <div className="space-y-1">
                      {section.lessons.map((lesson, lessonIndex) => {
                        const isActive = currentLesson?.id === lesson.id;
                        const completed = isLessonCompleted(lesson.id);
                        
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => goToLesson(sectionIndex, lessonIndex)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            {completed ? (
                              <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                            ) : lesson.type === 'QUIZ' ? (
                              <HelpCircle className="h-4 w-4 text-purple-400 flex-shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-slate-500 flex-shrink-0" />
                            )}
                            <span className="text-sm truncate flex-1">{lesson.title}</span>
                            {lesson.type === 'QUIZ' && (
                              <Badge variant="outline" className="text-xs">Quiz</Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

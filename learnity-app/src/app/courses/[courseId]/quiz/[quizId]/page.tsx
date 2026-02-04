'use client';

/**
 * Quiz Taking Page
 * Full quiz experience with question navigation, submission, and results
 * Requirements: 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, PlayCircle } from 'lucide-react';
import { QuizPageLayout } from '@/components/quiz/QuizPageLayout';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import {
  QuizResultsPage,
  AnswerResult,
} from '@/components/quiz/QuizResultsPage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  order: number;
}

interface QuizData {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  passingScore: number;
  questions: QuizQuestion[];
  totalQuestions: number;
}

interface QuizSubmissionResult {
  attemptId: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  passingScore: number;
  answerResults: Array<{
    questionId: string;
    selectedOptionIndex: number;
    correctOptionIndex: number;
    isCorrect: boolean;
    explanation?: string | null;
  }>;
  xpAwarded?: number;
  createdAt: string;
}

interface QuizStats {
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
  passed: boolean;
}

type QuizState =
  | 'loading'
  | 'ready'
  | 'taking'
  | 'submitting'
  | 'results'
  | 'error';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const courseId = params.courseId as string;
  const quizId = params.quizId as string;

  // State
  const [quizState, setQuizState] = useState<QuizState>('loading');
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [startTime, setStartTime] = useState<number>(0);
  const [results, setResults] = useState<QuizSubmissionResult | null>(null);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch quiz data
  const fetchQuiz = useCallback(async () => {
    try {
      setQuizState('loading');
      setError(null);

      const response = await fetch(`/api/quizzes/${quizId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to load quiz');
      }

      setQuiz(data.data);
      setQuizState('ready');
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
      setQuizState('error');
    }
  }, [quizId]);

  // Fetch quiz stats
  const fetchQuizStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}/attempts`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const attempts = data.data;
          const scores = attempts.map((a: { score: number }) => a.score);
          setQuizStats({
            totalAttempts: attempts.length,
            bestScore: Math.max(...scores),
            averageScore: Math.round(
              scores.reduce((a: number, b: number) => a + b, 0) / scores.length
            ),
            passed: attempts.some((a: { passed: boolean }) => a.passed),
          });
        }
      }
    } catch (err) {
      console.error('Error fetching quiz stats:', err);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuiz();
    fetchQuizStats();
  }, [fetchQuiz, fetchQuizStats]);

  // Start quiz
  const handleStartQuiz = () => {
    setQuizState('taking');
    setStartTime(Date.now());
    setCurrentQuestionIndex(0);
    setAnswers(new Map());
    setResults(null);
  };

  // Select answer
  const handleSelectOption = (optionIndex: number) => {
    if (!quiz) return;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    setAnswers(new Map(answers.set(currentQuestion.id, optionIndex)));
  };

  // Go to next question or submit
  const handleNext = async () => {
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit quiz
      await submitQuiz();
    }
  };

  // Submit quiz
  const submitQuiz = async () => {
    if (!quiz) return;

    try {
      setQuizState('submitting');

      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const answersArray = Array.from(answers.entries()).map(
        ([questionId, selectedOptionIndex]) => ({
          questionId,
          selectedOptionIndex,
        })
      );

      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answersArray,
          timeTaken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to submit quiz');
      }

      setResults(data.data);
      setQuizState('results');

      // Show toast notification
      if (data.data.passed) {
        toast({
          title: 'Congratulations! 🎉',
          description: `You passed with ${data.data.score}%${data.data.xpAwarded ? ` and earned ${data.data.xpAwarded} XP!` : ''}`,
        });
      } else {
        toast({
          title: 'Quiz Completed',
          description: `You scored ${data.data.score}%. Keep practicing!`,
          variant: 'destructive',
        });
      }

      // Refresh stats
      fetchQuizStats();
    } catch (err) {
      console.error('Error submitting quiz:', err);
      toast({
        title: 'Submission Failed',
        description:
          err instanceof Error ? err.message : 'Failed to submit quiz',
        variant: 'destructive',
      });
      setQuizState('taking');
    }
  };

  // Retake quiz
  const handleRetake = () => {
    handleStartQuiz();
  };

  // Loading state
  if (quizState === 'loading') {
    return (
      <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8'>
        <div className='max-w-4xl mx-auto px-4'>
          <Card className='bg-white dark:bg-slate-800'>
            <CardContent className='p-8'>
              <Skeleton className='h-8 w-64 mb-4' />
              <Skeleton className='h-4 w-full mb-2' />
              <Skeleton className='h-4 w-3/4 mb-6' />
              <Skeleton className='h-12 w-32' />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (quizState === 'error') {
    return (
      <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8'>
        <div className='max-w-4xl mx-auto px-4'>
          <Card className='bg-white dark:bg-slate-800 border-red-200 dark:border-red-800'>
            <CardContent className='p-8 text-center'>
              <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
              <h2 className='text-xl font-semibold text-slate-900 dark:text-white mb-2'>
                Failed to Load Quiz
              </h2>
              <p className='text-slate-600 dark:text-slate-400 mb-6'>
                {error || 'An unexpected error occurred'}
              </p>
              <div className='flex gap-3 justify-center'>
                <Button variant='outline' onClick={() => router.back()}>
                  Go Back
                </Button>
                <Button onClick={fetchQuiz}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Results state
  if (quizState === 'results' && results && quiz) {
    const answerResultsWithText: AnswerResult[] = results.answerResults.map(
      ar => {
        const question = quiz.questions.find(q => q.id === ar.questionId);
        return {
          questionId: ar.questionId,
          questionText: question?.question || '',
          options: question?.options || [],
          selectedOptionIndex: ar.selectedOptionIndex,
          correctOptionIndex: ar.correctOptionIndex,
          isCorrect: ar.isCorrect,
          explanation: ar.explanation,
        };
      }
    );

    return (
      <QuizResultsPage
        quizId={quizId}
        quizTitle={quiz.title}
        score={results.score}
        passed={results.passed}
        passingScore={results.passingScore}
        totalQuestions={results.totalQuestions}
        correctAnswers={results.correctAnswers}
        timeTaken={Math.round((Date.now() - startTime) / 1000)}
        xpAwarded={results.xpAwarded}
        answerResults={answerResultsWithText}
        courseId={courseId}
        lessonId={quiz.lessonId}
        bestScore={quizStats?.bestScore}
        totalAttempts={quizStats?.totalAttempts}
        onRetake={handleRetake}
      />
    );
  }

  // Ready state (quiz intro)
  if (quizState === 'ready' && quiz) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8'>
        <div className='max-w-4xl mx-auto px-4'>
          <Card className='bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'>
            <CardContent className='p-8 text-center'>
              <div className='w-16 h-16 bg-slate-100 dark:bg-slate-900/30 rounded-full flex items-center justify-center mx-auto mb-6'>
                <PlayCircle className='h-8 w-8 text-blue-600 dark:text-blue-400' />
              </div>

              <h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
                {quiz.title}
              </h1>

              {quiz.description && (
                <p className='text-slate-600 dark:text-slate-400 mb-6'>
                  {quiz.description}
                </p>
              )}

              <div className='grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8'>
                <div className='p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg'>
                  <div className='text-2xl font-bold text-slate-900 dark:text-white'>
                    {quiz.totalQuestions}
                  </div>
                  <div className='text-xs text-slate-500 dark:text-slate-400'>
                    Questions
                  </div>
                </div>
                <div className='p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg'>
                  <div className='text-2xl font-bold text-slate-900 dark:text-white'>
                    {quiz.passingScore}%
                  </div>
                  <div className='text-xs text-slate-500 dark:text-slate-400'>
                    To Pass
                  </div>
                </div>
              </div>

              {quizStats && (
                <div className='mb-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg'>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    Previous attempts: {quizStats.totalAttempts} | Best score:{' '}
                    {quizStats.bestScore}%
                  </p>
                </div>
              )}

              <Button size='lg' onClick={handleStartQuiz}>
                <PlayCircle className='h-5 w-5 mr-2' />
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Taking quiz state
  if ((quizState === 'taking' || quizState === 'submitting') && quiz) {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedOption = answers.get(currentQuestion.id) ?? null;

    return (
      <QuizPageLayout
        quizId={quizId}
        title={quiz.title}
        description={quiz.description}
        totalQuestions={quiz.totalQuestions}
        currentQuestionIndex={currentQuestionIndex}
        passingScore={quiz.passingScore}
        courseId={courseId}
        lessonId={quiz.lessonId}
      >
        <QuestionCard
          questionId={currentQuestion.id}
          questionNumber={currentQuestionIndex + 1}
          question={currentQuestion.question}
          options={currentQuestion.options}
          selectedOption={selectedOption}
          showFeedback={false}
          isLoading={quizState === 'submitting'}
          isLastQuestion={currentQuestionIndex === quiz.questions.length - 1}
          onSelectOption={handleSelectOption}
          onNext={handleNext}
        />
      </QuizPageLayout>
    );
  }

  return null;
}

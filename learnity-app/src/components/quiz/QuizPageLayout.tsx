'use client';

/**
 * QuizPageLayout Component
 * Main layout for quiz taking with question display, progress indicator, and optional timer
 * Requirements: 6.3 - Display one question at a time with progress indicator
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  order: number;
}

export interface QuizPageLayoutProps {
  /** Quiz ID */
  quizId: string;
  /** Quiz title */
  title: string;
  /** Quiz description */
  description?: string;
  /** Total number of questions */
  totalQuestions: number;
  /** Current question index (0-based) */
  currentQuestionIndex: number;
  /** Passing score percentage */
  passingScore: number;
  /** Course ID for navigation */
  courseId: string;
  /** Lesson ID for navigation */
  lessonId: string;
  /** Whether timer is enabled */
  timerEnabled?: boolean;
  /** Time limit in seconds (optional) */
  timeLimit?: number;
  /** Callback when time runs out */
  onTimeUp?: () => void;
  /** Main content (question card) */
  children: React.ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * Format seconds to MM:SS display
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * QuizPageLayout - Main layout component for quiz taking
 * Provides consistent structure with header, progress, timer, and question area
 */
export function QuizPageLayout({
  quizId,
  title,
  description,
  totalQuestions,
  currentQuestionIndex,
  passingScore,
  courseId,
  lessonId,
  timerEnabled = false,
  timeLimit,
  onTimeUp,
  children,
  className,
}: QuizPageLayoutProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(timeLimit || 0);

  // Progress percentage
  const progressPercent = totalQuestions > 0
    ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)
    : 0;

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);

      if (timerEnabled && timeLimit) {
        setRemainingTime((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(interval);
            onTimeUp?.();
            return 0;
          }
          return newTime;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerEnabled, timeLimit, onTimeUp]);

  // Determine if time is running low (less than 20% remaining)
  const isTimeLow = timerEnabled && timeLimit && remainingTime < timeLimit * 0.2;

  return (
    <div className={cn('min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800', className)}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href={`/courses/${courseId}/learn/${lessonId}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Exit Quiz
                </Button>
              </Link>
            </div>

            {/* Timer Display */}
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                timerEnabled && timeLimit
                  ? isTimeLow
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-slate-100 text-blue-700 dark:bg-slate-900/30 dark:text-blue-400"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
              )}>
                <Clock className="h-4 w-4" />
                {timerEnabled && timeLimit ? (
                  <span>{formatTime(remainingTime)}</span>
                ) : (
                  <span>{formatTime(elapsedTime)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Quiz Info Card */}
        <Card className="mb-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {description}
              </p>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            {/* Progress Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {progressPercent}% Complete
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />

              {/* Passing Score Info */}
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Passing score: {passingScore}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Content */}
        {children}
      </main>
    </div>
  );
}

export default QuizPageLayout;

'use client';

/**
 * QuizResultsPage Component
 * Displays quiz results with score, pass/fail indicator, answer review, XP earned, and retake option
 * Requirements: 6.5, 6.7, 6.8 - Score display, pass/fail, answer review, XP earned, retake button
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  XCircle, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  Sparkles,
  Clock,
  Target,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface AnswerResult {
  questionId: string;
  questionText: string;
  options: string[];
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation?: string | null;
}

export interface QuizResultsPageProps {
  /** Quiz ID */
  quizId: string;
  /** Quiz title */
  quizTitle: string;
  /** Score percentage (0-100) */
  score: number;
  /** Whether the quiz was passed */
  passed: boolean;
  /** Passing score percentage */
  passingScore: number;
  /** Total number of questions */
  totalQuestions: number;
  /** Number of correct answers */
  correctAnswers: number;
  /** Time taken in seconds */
  timeTaken?: number;
  /** XP awarded (only if passed for first time) */
  xpAwarded?: number;
  /** Detailed answer results for review */
  answerResults: AnswerResult[];
  /** Course ID for navigation */
  courseId: string;
  /** Lesson ID for navigation */
  lessonId: string;
  /** Best score from previous attempts */
  bestScore?: number;
  /** Total number of attempts */
  totalAttempts?: number;
  /** Callback for retaking the quiz */
  onRetake: () => void;
  /** Additional class name */
  className?: string;
}

/**
 * Format seconds to human-readable time
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

/**
 * QuizResultsPage - Displays comprehensive quiz results
 * Shows score, pass/fail status, XP earned, and detailed answer review
 */
export function QuizResultsPage({
  quizId,
  quizTitle,
  score,
  passed,
  passingScore,
  totalQuestions,
  correctAnswers,
  timeTaken,
  xpAwarded,
  answerResults,
  courseId,
  lessonId,
  bestScore,
  totalAttempts,
  onRetake,
  className,
}: QuizResultsPageProps) {
  const isNewBestScore = bestScore !== undefined && score > bestScore;

  return (
    <div className={cn('min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8', className)}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Results Header Card */}
        <Card className={cn(
          'mb-6 overflow-hidden',
          passed 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
            : 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800'
        )}>
          <CardContent className="pt-8 pb-6">
            <div className="text-center">
              {/* Pass/Fail Icon */}
              <div className={cn(
                'w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center',
                passed 
                  ? 'bg-green-100 dark:bg-green-900/40'
                  : 'bg-red-100 dark:bg-red-900/40'
              )}>
                {passed ? (
                  <Trophy className="h-10 w-10 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                )}
              </div>

              {/* Result Title */}
              <h1 className={cn(
                'text-2xl font-bold mb-2',
                passed 
                  ? 'text-green-800 dark:text-green-300'
                  : 'text-red-800 dark:text-red-300'
              )}>
                {passed ? 'Congratulations! You Passed!' : 'Keep Practicing!'}
              </h1>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {quizTitle}
              </p>

              {/* Score Display */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className={cn(
                  'text-6xl font-bold',
                  passed 
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}>
                  {score}%
                </span>
                {isNewBestScore && (
                  <Badge className="bg-yellow-500 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    New Best!
                  </Badge>
                )}
              </div>

              {/* Progress Bar */}
              <div className="max-w-xs mx-auto mb-6">
                <Progress 
                  value={score} 
                  className={cn(
                    'h-3',
                    passed ? '[&>div]:bg-green-500' : '[&>div]:bg-red-500'
                  )} 
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>0%</span>
                  <span className="font-medium">Pass: {passingScore}%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto">
                <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                  <Target className="h-5 w-5 mx-auto mb-1 text-slate-500" />
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {correctAnswers}/{totalQuestions}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Correct</div>
                </div>
                
                {timeTaken !== undefined && (
                  <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-slate-500" />
                    <div className="text-lg font-semibold text-slate-900 dark:text-white">
                      {formatDuration(timeTaken)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Time</div>
                  </div>
                )}
                
                {totalAttempts !== undefined && (
                  <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <RotateCcw className="h-5 w-5 mx-auto mb-1 text-slate-500" />
                    <div className="text-lg font-semibold text-slate-900 dark:text-white">
                      {totalAttempts}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Attempts</div>
                  </div>
                )}
                
                {xpAwarded !== undefined && xpAwarded > 0 && (
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <Award className="h-5 w-5 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
                    <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
                      +{xpAwarded} XP
                    </div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400">Earned</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button
            variant="outline"
            onClick={onRetake}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Quiz
          </Button>
          <Link href={`/courses/${courseId}/learn/${lessonId}`} className="flex-1">
            <Button className="w-full">
              {passed ? 'Continue Learning' : 'Back to Lesson'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Answer Review Section */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Answer Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {answerResults.map((result, index) => (
              <AnswerReviewCard
                key={result.questionId}
                questionNumber={index + 1}
                result={result}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * AnswerReviewCard - Displays a single answer review item
 */
interface AnswerReviewCardProps {
  questionNumber: number;
  result: AnswerResult;
}

function AnswerReviewCard({ questionNumber, result }: AnswerReviewCardProps) {
  return (
    <div className={cn(
      'p-4 rounded-lg border',
      result.isCorrect
        ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
        : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
    )}>
      {/* Question Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
          result.isCorrect
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        )}>
          {result.isCorrect ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              Q{questionNumber}
            </Badge>
            <span className={cn(
              'text-xs font-medium',
              result.isCorrect
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            )}>
              {result.isCorrect ? 'Correct' : 'Incorrect'}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {result.questionText}
          </p>
        </div>
      </div>

      {/* Answer Details */}
      <div className="ml-9 space-y-2">
        {/* Your Answer */}
        <div className="flex items-start gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 min-w-[80px]">
            Your answer:
          </span>
          <span className={cn(
            'text-sm',
            result.isCorrect
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          )}>
            {String.fromCharCode(65 + result.selectedOptionIndex)}. {result.options[result.selectedOptionIndex]}
          </span>
        </div>

        {/* Correct Answer (if wrong) */}
        {!result.isCorrect && (
          <div className="flex items-start gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 min-w-[80px]">
              Correct:
            </span>
            <span className="text-sm text-green-700 dark:text-green-300">
              {String.fromCharCode(65 + result.correctOptionIndex)}. {result.options[result.correctOptionIndex]}
            </span>
          </div>
        )}

        {/* Explanation */}
        {result.explanation && (
          <div className="mt-2 p-2 bg-white/50 dark:bg-slate-800/50 rounded text-xs text-slate-600 dark:text-slate-400">
            <span className="font-medium">Explanation:</span> {result.explanation}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizResultsPage;

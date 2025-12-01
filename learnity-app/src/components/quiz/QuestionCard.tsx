'use client';

/**
 * QuestionCard Component
 * Displays a quiz question with options and immediate feedback
 * Requirements: 6.3, 6.4 - Question text, option buttons, immediate feedback
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuestionOption {
  index: number;
  text: string;
}

export interface QuestionCardProps {
  /** Question ID */
  questionId: string;
  /** Question number (1-based) */
  questionNumber: number;
  /** Question text */
  question: string;
  /** Array of options */
  options: string[];
  /** Currently selected option index (null if none selected) */
  selectedOption: number | null;
  /** Whether feedback should be shown */
  showFeedback?: boolean;
  /** Correct option index (only used when showFeedback is true) */
  correctOptionIndex?: number;
  /** Explanation for the correct answer */
  explanation?: string | null;
  /** Whether the question is in loading state */
  isLoading?: boolean;
  /** Whether this is the last question */
  isLastQuestion?: boolean;
  /** Callback when an option is selected */
  onSelectOption: (optionIndex: number) => void;
  /** Callback when user clicks next/submit */
  onNext: () => void;
  /** Additional class name */
  className?: string;
}

/**
 * QuestionCard - Displays a single quiz question with options
 * Supports immediate feedback mode showing correct/incorrect answers
 */
export function QuestionCard({
  questionId,
  questionNumber,
  question,
  options,
  selectedOption,
  showFeedback = false,
  correctOptionIndex,
  explanation,
  isLoading = false,
  isLastQuestion = false,
  onSelectOption,
  onNext,
  className,
}: QuestionCardProps) {
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleOptionClick = (index: number) => {
    if (showFeedback && hasAnswered) return; // Prevent changing answer after feedback
    onSelectOption(index);
    if (showFeedback) {
      setHasAnswered(true);
    }
  };

  const getOptionState = (index: number): 'default' | 'selected' | 'correct' | 'incorrect' => {
    if (!showFeedback || !hasAnswered) {
      return selectedOption === index ? 'selected' : 'default';
    }
    
    // Show feedback
    if (index === correctOptionIndex) {
      return 'correct';
    }
    if (selectedOption === index && index !== correctOptionIndex) {
      return 'incorrect';
    }
    return 'default';
  };

  const optionStyles = {
    default: 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    selected: 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500/20',
    correct: 'border-green-500 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-500/20',
    incorrect: 'border-red-500 bg-red-50 dark:bg-red-900/30 ring-2 ring-red-500/20',
  };

  const isCorrectAnswer = showFeedback && hasAnswered && selectedOption === correctOptionIndex;

  return (
    <Card className={cn('bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700', className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Badge variant="outline" className="mb-3 text-xs">
              Question {questionNumber}
            </Badge>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
              {question}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Options */}
        <div className="space-y-3">
          {options.map((option, index) => {
            const state = getOptionState(index);
            const isSelected = selectedOption === index;
            const isCorrect = showFeedback && hasAnswered && index === correctOptionIndex;
            const isWrong = showFeedback && hasAnswered && isSelected && index !== correctOptionIndex;

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={isLoading || (showFeedback && hasAnswered)}
                className={cn(
                  'w-full p-4 rounded-lg border-2 text-left transition-all duration-200',
                  'flex items-center gap-3',
                  optionStyles[state],
                  (isLoading || (showFeedback && hasAnswered)) && 'cursor-not-allowed opacity-75'
                )}
              >
                {/* Option Letter */}
                <span className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  state === 'default' && 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
                  state === 'selected' && 'bg-blue-500 text-white',
                  state === 'correct' && 'bg-green-500 text-white',
                  state === 'incorrect' && 'bg-red-500 text-white',
                )}>
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isWrong ? (
                    <XCircle className="h-5 w-5" />
                  ) : (
                    String.fromCharCode(65 + index) // A, B, C, D
                  )}
                </span>
                
                {/* Option Text */}
                <span className={cn(
                  'flex-1 text-sm',
                  state === 'default' && 'text-slate-700 dark:text-slate-300',
                  state === 'selected' && 'text-blue-900 dark:text-blue-100 font-medium',
                  state === 'correct' && 'text-green-900 dark:text-green-100 font-medium',
                  state === 'incorrect' && 'text-red-900 dark:text-red-100 font-medium',
                )}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback Section */}
        {showFeedback && hasAnswered && (
          <div className={cn(
            'p-4 rounded-lg mt-4',
            isCorrectAnswer 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          )}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrectAnswer ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-green-800 dark:text-green-300">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <span className="font-semibold text-red-800 dark:text-red-300">Incorrect</span>
                </>
              )}
            </div>
            {explanation && (
              <p className={cn(
                'text-sm',
                isCorrectAnswer 
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              )}>
                {explanation}
              </p>
            )}
          </div>
        )}

        {/* Next/Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={onNext}
            disabled={selectedOption === null || isLoading}
            className="min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isLastQuestion ? 'Submitting...' : 'Loading...'}
              </>
            ) : (
              <>
                {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuestionCard;

'use client';

/**
 * LessonCompleteDialog Component
 * Dialog shown when a lesson is completed, displaying XP earned and next lesson option
 * Requirements: 5.4, 5.7 - XP earned display, next lesson button
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PartyPopper,
  Trophy,
  Flame,
  ChevronRight,
  RotateCcw,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LessonCompleteDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onOpenChange: (open: boolean) => void;
  /** XP amount earned */
  xpEarned: number;
  /** Current streak count */
  currentStreak?: number;
  /** Whether this was a streak increase */
  streakIncreased?: boolean;
  /** Title of the next lesson (if available) */
  nextLessonTitle?: string;
  /** Whether the course is now complete */
  courseCompleted?: boolean;
  /** Callback for going to next lesson */
  onNextLesson?: () => void;
  /** Callback for replaying current lesson */
  onReplay?: () => void;
  /** Callback for viewing certificate (when course is complete) */
  onViewCertificate?: () => void;
}

/**
 * LessonCompleteDialog - Celebration dialog for lesson completion
 * Shows XP earned, streak info, and navigation options
 */
export function LessonCompleteDialog({
  open,
  onOpenChange,
  xpEarned,
  currentStreak,
  streakIncreased,
  nextLessonTitle,
  courseCompleted = false,
  onNextLesson,
  onReplay,
  onViewCertificate,
}: LessonCompleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          {/* Celebration Icon */}
          <div className="mx-auto mb-4">
            {courseCompleted ? (
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-pulse">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-8 w-8 text-yellow-400 animate-bounce" />
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <PartyPopper className="h-10 w-10 text-white" />
              </div>
            )}
          </div>

          <DialogTitle className="text-2xl">
            {courseCompleted ? 'Course Completed!' : 'Lesson Complete!'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {courseCompleted
              ? 'Congratulations! You have completed the entire course.'
              : 'Great job! Keep up the momentum.'}
          </DialogDescription>
        </DialogHeader>

        {/* Stats Section */}
        <div className="py-4 space-y-4">
          {/* XP Earned */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 px-4 py-2 rounded-full">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span className="text-xl font-bold text-orange-600">+{xpEarned} XP</span>
            </div>
          </div>

          {/* Streak Info */}
          {currentStreak !== undefined && currentStreak > 0 && (
            <div className="flex items-center justify-center gap-2">
              <div className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full',
                streakIncreased 
                  ? 'bg-gradient-to-r from-red-400/20 to-orange-400/20' 
                  : 'bg-slate-100 dark:bg-slate-800'
              )}>
                <Flame className={cn(
                  'h-5 w-5',
                  streakIncreased ? 'text-orange-500 animate-pulse' : 'text-slate-500'
                )} />
                <span className={cn(
                  'font-semibold',
                  streakIncreased ? 'text-orange-600' : 'text-slate-600 dark:text-slate-400'
                )}>
                  {currentStreak} day streak
                  {streakIncreased && ' 🔥'}
                </span>
              </div>
            </div>
          )}

          {/* Course Completion Badge */}
          {courseCompleted && (
            <div className="flex items-center justify-center">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 text-sm">
                <Trophy className="h-4 w-4 mr-2" />
                Certificate Earned!
              </Badge>
            </div>
          )}

          {/* Next Lesson Preview */}
          {!courseCompleted && nextLessonTitle && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Up next:</p>
              <p className="font-medium text-slate-900 dark:text-white truncate">
                {nextLessonTitle}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {courseCompleted ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              {onViewCertificate && (
                <Button
                  onClick={onViewCertificate}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  View Certificate
                </Button>
              )}
            </>
          ) : (
            <>
              {onReplay && (
                <Button
                  variant="outline"
                  onClick={onReplay}
                  className="w-full sm:w-auto"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Replay
                </Button>
              )}
              {onNextLesson && nextLessonTitle && (
                <Button
                  onClick={onNextLesson}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  Next Lesson
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              {!nextLessonTitle && (
                <Button
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto"
                >
                  Continue
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * XPCelebration - Floating XP celebration animation
 * Shows a brief animation when XP is earned
 */
export interface XPCelebrationProps {
  /** Whether to show the celebration */
  show: boolean;
  /** XP amount earned */
  xpAmount: number;
  /** Duration in milliseconds before auto-hide */
  duration?: number;
  /** Callback when celebration ends */
  onComplete?: () => void;
}

export function XPCelebration({
  show,
  xpAmount,
  duration = 3000,
  onComplete,
}: XPCelebrationProps) {
  React.useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-2xl shadow-2xl animate-bounce">
        <div className="flex items-center gap-3">
          <PartyPopper className="h-8 w-8" />
          <span className="text-2xl font-bold">+{xpAmount} XP!</span>
          <Flame className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

export default LessonCompleteDialog;

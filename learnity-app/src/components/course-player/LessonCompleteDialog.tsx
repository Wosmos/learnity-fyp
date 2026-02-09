'use client';

/**
 * LessonCompleteDialog Component
 * Dialog shown when a lesson is completed, displaying XP earned and next lesson option
 * Requirements: 5.4, 5.7 - XP earned display, next lesson button
 */

import React from 'react';
import {
  PartyPopper,
  Trophy,
  Flame,
  ChevronRight,
  RotateCcw,
  GraduationCap,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <DialogContent className='sm:max-w-md overflow-hidden border-slate-800 bg-slate-900/95 backdrop-blur-xl'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/10 pointer-events-none' />

        <DialogHeader className='text-center relative z-10'>
          {/* Celebration Icon with Animation */}
          <div className='mx-auto mb-6'>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                  className='relative'
                >
                  {courseCompleted ? (
                    <div className='relative'>
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 0px rgba(234, 179, 8, 0)',
                            '0 0 30px rgba(234, 179, 8, 0.5)',
                            '0 0 0px rgba(234, 179, 8, 0)',
                          ],
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className='w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center'
                      >
                        <GraduationCap className='h-12 w-12 text-white' />
                      </motion.div>
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className='absolute -top-3 -right-3'
                      >
                        <Sparkles className='h-10 w-10 text-yellow-400' />
                      </motion.div>
                    </div>
                  ) : (
                    <div className='relative'>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className='w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20'
                      >
                        <PartyPopper className='h-12 w-12 text-white' />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className='absolute -bottom-2 -right-2'
                      >
                        <Badge className='bg-yellow-500 border-none text-slate-900 font-bold px-2'>
                          EXCELLENT!
                        </Badge>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogTitle className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400'>
            {courseCompleted ? 'Course Conquered!' : 'Lesson Complete!'}
          </DialogTitle>
          <DialogDescription className='text-slate-400 text-lg mt-2'>
            {courseCompleted
              ? 'You have reached the finish line. Every lesson mastered!'
              : 'Knowledge gained! You are one step closer to mastery.'}
          </DialogDescription>
        </DialogHeader>

        {/* Stats Section with Framer Motion */}
        <div className='py-6 space-y-6 relative z-10'>
          {/* XP Earned */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='flex flex-col items-center gap-2'
          >
            <span className='text-xs font-semibold text-slate-500 uppercase tracking-widest'>
              XP Earned
            </span>
            <div className='flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl'>
              <Zap className='h-6 w-6 text-yellow-400 fill-yellow-400' />
              <span className='text-3xl font-black text-white'>
                +{xpEarned}
              </span>
              <span className='text-yellow-500 font-bold'>XP</span>
            </div>
          </motion.div>

          <div className='grid grid-cols-2 gap-4'>
            {/* Streak Info */}
            {currentStreak !== undefined && currentStreak > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-2xl border',
                  streakIncreased
                    ? 'bg-orange-500/5 border-orange-500/20'
                    : 'bg-slate-800/50 border-slate-800'
                )}
              >
                <div className='flex items-center gap-2'>
                  <Flame
                    className={cn(
                      'h-5 w-5',
                      streakIncreased
                        ? 'text-orange-500 animate-pulse'
                        : 'text-slate-500'
                    )}
                  />
                  <span className='text-sm font-semibold text-slate-400'>
                    Streak
                  </span>
                </div>
                <span className='text-xl font-bold text-white'>
                  {currentStreak} Days
                </span>
              </motion.div>
            )}

            {/* Progress Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className='flex flex-col items-center gap-2 p-4 rounded-2xl border bg-indigo-500/5 border-indigo-500/20'
            >
              <div className='flex items-center gap-2'>
                <Trophy className='h-5 w-5 text-indigo-400' />
                <span className='text-sm font-semibold text-slate-400'>
                  Quest
                </span>
              </div>
              <span className='text-lg font-bold text-white'>
                {courseCompleted ? 'Mastered' : 'On Track'}
              </span>
            </motion.div>
          </div>

          {/* Next Lesson Preview */}
          {!courseCompleted && nextLessonTitle && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className='bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 overflow-hidden relative'
            >
              <div className='absolute top-0 right-0 p-2 opacity-5'>
                <Sparkles className='h-12 w-12' />
              </div>
              <p className='text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1'>
                Up next:
              </p>
              <p className='font-bold text-white truncate text-lg'>
                {nextLessonTitle}
              </p>
            </motion.div>
          )}
        </div>

        <DialogFooter className='flex-col sm:flex-row gap-3 relative z-10'>
          {courseCompleted ? (
            <>
              <Button
                variant='ghost'
                onClick={() => onOpenChange(false)}
                className='w-full sm:w-auto text-slate-400 hover:text-white hover:bg-white/5 order-2 sm:order-1'
              >
                Return to Dashboard
              </Button>
              {onViewCertificate && (
                <Button
                  onClick={onViewCertificate}
                  className='w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/20 border-none order-1 sm:order-2'
                >
                  <GraduationCap className='h-5 w-5 mr-2' />
                  Claim Certificate
                </Button>
              )}
            </>
          ) : (
            <>
              <div className='flex gap-2 w-full sm:w-auto order-2 sm:order-1'>
                {onReplay && (
                  <Button
                    variant='outline'
                    onClick={onReplay}
                    className='flex-1 sm:flex-initial border-slate-700 text-slate-300 hover:bg-slate-800'
                  >
                    <RotateCcw className='h-4 w-4 mr-2' />
                    Replay
                  </Button>
                )}
                {(!nextLessonTitle || !onNextLesson) && (
                  <Button
                    variant='outline'
                    onClick={() => onOpenChange(false)}
                    className='flex-1 sm:flex-initial border-slate-700 text-slate-300 hover:bg-slate-800'
                  >
                    Close
                  </Button>
                )}
              </div>

              {onNextLesson && nextLessonTitle && (
                <Button
                  onClick={onNextLesson}
                  className='w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20 border-none'
                >
                  Continue Journey
                  <ChevronRight className='h-5 w-5 ml-2' />
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

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
          className='fixed inset-0 z-[100] flex items-center justify-center pointer-events-none'
        >
          <div className='bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 text-slate-900 px-10 py-5 rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.4)] relative flex flex-col items-center overflow-hidden'>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className='absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl'
            />

            <div className='flex items-center gap-4 relative z-10'>
              <div className='bg-slate-900 rounded-full p-2'>
                <Zap className='h-8 w-8 text-yellow-400 fill-yellow-400' />
              </div>
              <div className='flex flex-col'>
                <span className='text-4xl font-black italic tracking-tighter'>
                  +{xpAmount} XP
                </span>
                <span className='text-xs font-bold uppercase tracking-widest opacity-80'>
                  New Achievement unlocked
                </span>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Sparkles className='h-8 w-8 text-white' />
              </motion.div>
            </div>

            {/* Tiny stars animation inside banner */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 100 - 50,
                  scale: Math.random() * 0.5 + 0.5,
                }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                className='absolute'
              >
                <Sparkles className='h-4 w-4 text-white/40' />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LessonCompleteDialog;

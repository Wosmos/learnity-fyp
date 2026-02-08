'use client';

/**
 * XPToast Component
 * Animated XP gain notification with level-up and badge unlock celebrations
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Award, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPToastProps {
  /** XP amount earned */
  xpAmount: number;
  /** Whether to show the toast */
  show: boolean;
  /** Callback when toast should close */
  onClose: () => void;
  /** Whether user leveled up */
  leveledUp?: boolean;
  /** New level (if leveled up) */
  newLevel?: number;
  /** Badge unlocked (if any) */
  badgeUnlocked?: {
    name: string;
    icon: string;
  };
  /** Auto-hide duration in ms (default: 3000) */
  duration?: number;
  /** Position of the toast */
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function XPToast({
  xpAmount,
  show,
  onClose,
  leveledUp = false,
  newLevel,
  badgeUnlocked,
  duration = 3000,
  position = 'top-right',
}: XPToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const hasLevelUp = leveledUp && newLevel;
  const hasBadge = !!badgeUnlocked;
  const isSpecial = hasLevelUp || hasBadge;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={cn(
            'fixed z-50',
            positionClasses[position]
          )}
        >
          <div
            className={cn(
              'relative overflow-hidden rounded-2xl shadow-2xl',
              isSpecial
                ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500'
                : 'bg-gradient-to-br from-indigo-600 to-purple-700',
              'p-[2px]'
            )}
          >
            {/* Inner content */}
            <div
              className={cn(
                'relative rounded-[14px] px-5 py-4',
                isSpecial ? 'bg-slate-950' : 'bg-white'
              )}
            >
              {/* Sparkles animation for special events */}
              {isSpecial && (
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-amber-400"
                      initial={{
                        opacity: 0,
                        scale: 0,
                        x: Math.random() * 100,
                        y: Math.random() * 60,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        y: [0, -20],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    >
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Close button */}
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className={cn(
                  'absolute top-2 right-2 p-1 rounded-full transition-colors',
                  isSpecial
                    ? 'text-slate-400 hover:text-white hover:bg-white/10'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                )}
              >
                <X className="h-4 w-4" />
              </button>

              {/* Content */}
              <div className="flex items-center gap-4">
                {/* XP Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    damping: 10,
                    stiffness: 200,
                    delay: 0.1,
                  }}
                  className={cn(
                    'p-3 rounded-xl',
                    isSpecial
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  )}
                >
                  <Zap className="h-6 w-6 text-white fill-white/20" />
                </motion.div>

                {/* Text content */}
                <div className="pr-6">
                  {/* XP amount with animation */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-baseline gap-1"
                  >
                    <motion.span
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: 'spring',
                        damping: 10,
                        delay: 0.3,
                      }}
                      className={cn(
                        'text-2xl font-black',
                        isSpecial ? 'text-amber-400' : 'text-indigo-600'
                      )}
                    >
                      +{xpAmount}
                    </motion.span>
                    <span
                      className={cn(
                        'text-sm font-bold uppercase tracking-wider',
                        isSpecial ? 'text-amber-500/60' : 'text-indigo-400'
                      )}
                    >
                      XP
                    </span>
                  </motion.div>

                  {/* Level up message */}
                  {hasLevelUp && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-2 mt-1"
                    >
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-400">
                        Level Up! Now Level {newLevel}
                      </span>
                    </motion.div>
                  )}

                  {/* Badge unlocked message */}
                  {hasBadge && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: hasLevelUp ? 0.5 : 0.4 }}
                      className="flex items-center gap-2 mt-1"
                    >
                      <Award className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-bold text-amber-400">
                        {badgeUnlocked.icon} {badgeUnlocked.name} Unlocked!
                      </span>
                    </motion.div>
                  )}

                  {/* Simple message for regular XP */}
                  {!isSpecial && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-xs text-slate-500"
                    >
                      Keep up the great work!
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Progress bar animation */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className={cn(
                  'absolute bottom-0 left-0 h-1',
                  isSpecial
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                )}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook for managing XP toast state
 */
export function useXPToast() {
  const [toastState, setToastState] = useState<{
    show: boolean;
    xpAmount: number;
    leveledUp: boolean;
    newLevel?: number;
    badgeUnlocked?: { name: string; icon: string };
  }>({
    show: false,
    xpAmount: 0,
    leveledUp: false,
  });

  const showXPToast = (
    xpAmount: number,
    options?: {
      leveledUp?: boolean;
      newLevel?: number;
      badgeUnlocked?: { name: string; icon: string };
    }
  ) => {
    setToastState({
      show: true,
      xpAmount,
      leveledUp: options?.leveledUp || false,
      newLevel: options?.newLevel,
      badgeUnlocked: options?.badgeUnlocked,
    });
  };

  const hideXPToast = () => {
    setToastState(prev => ({ ...prev, show: false }));
  };

  return {
    toastState,
    showXPToast,
    hideXPToast,
  };
}

export default XPToast;

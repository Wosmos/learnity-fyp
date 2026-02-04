'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const progressBarVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-secondary',
  {
    variants: {
      size: {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const progressIndicatorVariants = cva(
  'h-full transition-all duration-500 ease-out rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        danger: 'bg-red-500',
        gradient: 'bg-gradient-to-r from-primary to-primary/60',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ProgressBarProps
  extends
    VariantProps<typeof progressBarVariants>,
    VariantProps<typeof progressIndicatorVariants> {
  value: number; // 0-100
  showPercentage?: boolean;
  percentagePosition?: 'inside' | 'right' | 'top';
  animated?: boolean;
  className?: string;
  indicatorClassName?: string;
  label?: string;
}

/**
 * ProgressBar Component
 * Animated progress bar with percentage display
 * Requirements: 7.1, 7.3 - Animated progress bar, percentage display
 */
export function ProgressBar({
  value,
  size = 'md',
  variant = 'default',
  showPercentage = false,
  percentagePosition = 'right',
  animated = true,
  className,
  indicatorClassName,
  label,
}: ProgressBarProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const clampedValue = Math.min(100, Math.max(0, value));

  // Animate the progress value
  React.useEffect(() => {
    if (animated) {
      // Animate from current to target value
      const duration = 500; // ms
      const startValue = displayValue;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (clampedValue - startValue) * easeOut;

        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setDisplayValue(clampedValue);
    }
  }, [clampedValue, animated]);

  const percentageText = `${Math.round(displayValue)}%`;

  // Determine variant based on progress if using auto-color
  const getAutoVariant = () => {
    if (variant !== 'default') return variant;
    if (clampedValue >= 100) return 'success';
    if (clampedValue >= 75) return 'default';
    if (clampedValue >= 50) return 'warning';
    return 'default';
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Label and Top Percentage */}
      {(label || (showPercentage && percentagePosition === 'top')) && (
        <div className='flex items-center justify-between mb-1.5'>
          {label && (
            <span className='text-sm font-medium text-foreground'>{label}</span>
          )}
          {showPercentage && percentagePosition === 'top' && (
            <span className='text-sm font-medium text-muted-foreground'>
              {percentageText}
            </span>
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div className='flex items-center gap-2'>
        <div
          className={cn(progressBarVariants({ size }))}
          role='progressbar'
          aria-valuenow={Math.round(displayValue)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label ?? 'Progress'}
        >
          {/* Progress Indicator */}
          <div
            className={cn(
              progressIndicatorVariants({ variant: getAutoVariant() }),
              indicatorClassName
            )}
            style={{ width: `${displayValue}%` }}
          >
            {/* Inside Percentage */}
            {showPercentage &&
              percentagePosition === 'inside' &&
              size === 'lg' && (
                <span className='absolute inset-0 flex items-center justify-center text-xs font-medium text-white'>
                  {percentageText}
                </span>
              )}
          </div>
        </div>

        {/* Right Percentage */}
        {showPercentage && percentagePosition === 'right' && (
          <span className='text-sm font-medium text-muted-foreground min-w-12 text-right'>
            {percentageText}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * CourseProgressBar - Specialized progress bar for course progress
 */
export function CourseProgressBar({
  completedLessons,
  totalLessons,
  className,
  showLabel = true,
}: {
  completedLessons: number;
  totalLessons: number;
  className?: string;
  showLabel?: boolean;
}) {
  const progress =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className='flex items-center justify-between text-sm'>
          <span className='text-muted-foreground'>
            {completedLessons} of {totalLessons} lessons
          </span>
          <span className='font-medium'>{Math.round(progress)}%</span>
        </div>
      )}
      <ProgressBar
        value={progress}
        size='sm'
        variant={progress >= 100 ? 'success' : 'default'}
        animated
      />
    </div>
  );
}

/**
 * SectionProgressBar - Progress bar for section completion
 */
export function SectionProgressBar({
  progress,
  isUnlocked = true,
  className,
}: {
  progress: number;
  isUnlocked?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ProgressBar
        value={isUnlocked ? progress : 0}
        size='sm'
        variant={
          !isUnlocked ? 'default' : progress >= 80 ? 'success' : 'default'
        }
        className='flex-1'
        animated
      />
      <span className='text-xs text-muted-foreground min-w-10 text-right'>
        {isUnlocked ? `${Math.round(progress)}%` : 'Locked'}
      </span>
    </div>
  );
}

export default ProgressBar;

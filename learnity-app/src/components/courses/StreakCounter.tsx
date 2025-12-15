"use client";

import * as React from "react";
import { Flame, Calendar, Trophy } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const streakCounterVariants = cva(
  "inline-flex items-center gap-1.5 font-medium rounded-full transition-all",
  {
    variants: {
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-1.5",
      },
      variant: {
        default: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        fire: "bg-gradient-to-r from-orange-400/20 to-red-400/20 text-orange-600 dark:text-orange-400",
        solid: "bg-orange-500 text-white",
        outline: "border border-orange-400/50 text-orange-600 dark:text-orange-400",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export interface StreakCounterProps extends VariantProps<typeof streakCounterVariants> {
  streak: number;
  showIcon?: boolean;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

/**
 * StreakCounter Component
 * Displays streak count with fire emoji/icon
 * Requirements: 7.5 - Display streak count
 */
export function StreakCounter({
  streak,
  size = "md",
  variant = "default",
  showIcon = true,
  showLabel = false,
  animated = false,
  className,
}: StreakCounterProps) {
  const isHotStreak = streak >= 7;
  const isBurningStreak = streak >= 30;

  return (
    <span
      className={cn(
        streakCounterVariants({ size, variant }),
        animated && isHotStreak && "animate-pulse",
        className
      )}
    >
      {showIcon && (
        <Flame
          className={cn(
            iconSizes[size ?? "md"],
            isBurningStreak
              ? "text-red-500 fill-red-500"
              : isHotStreak
              ? "text-orange-500 fill-orange-500"
              : "text-orange-400"
          )}
        />
      )}
      <span>{streak}</span>
      {showLabel && <span className="text-muted-foreground">day{streak !== 1 ? "s" : ""}</span>}
    </span>
  );
}

export interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityAt?: Date | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * StreakDisplay Component
 * Displays current and longest streak with additional info
 * Requirements: 7.5, 7.6 - Display streak information
 */
export function StreakDisplay({
  currentStreak,
  longestStreak,
  lastActivityAt,
  size = "md",
  className,
}: StreakDisplayProps) {
  const isActiveToday = lastActivityAt
    ? isToday(new Date(lastActivityAt))
    : false;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Current Streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame
            className={cn(
              "text-orange-500",
              currentStreak >= 7 && "fill-orange-500",
              size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"
            )}
          />
          <span className={cn(
            "font-semibold",
            size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base"
          )}>
            {currentStreak} day streak
          </span>
        </div>
        {isActiveToday && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            ✓ Active today
          </span>
        )}
      </div>

      {/* Longest Streak */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Trophy className={cn(
          "text-yellow-500",
          size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
        )} />
        <span className={cn(
          size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-xs"
        )}>
          Longest: {longestStreak} days
        </span>
      </div>

      {/* Last Activity */}
      {lastActivityAt && !isActiveToday && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className={cn(
            size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
          )} />
          <span className={cn(
            size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-xs"
          )}>
            Last active: {formatRelativeDate(new Date(lastActivityAt))}
          </span>
        </div>
      )}
    </div>
  );
}

export interface StreakMilestoneProps {
  streak: number;
  milestone: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * StreakMilestone Component
 * Shows progress towards next streak milestone
 */
export function StreakMilestone({
  streak,
  milestone,
  size = "md",
  className,
}: StreakMilestoneProps) {
  const progress = Math.min(100, (streak / milestone) * 100);
  const daysRemaining = Math.max(0, milestone - streak);
  const isComplete = streak >= milestone;

  const barHeight = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Flame
            className={cn(
              isComplete ? "text-orange-500 fill-orange-500" : "text-muted-foreground",
              size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
            )}
          />
          <span className={cn(
            "font-medium",
            size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-xs"
          )}>
            {milestone}-day streak
          </span>
        </div>
        <span className={cn(
          "text-muted-foreground",
          size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-xs"
        )}>
          {isComplete ? "Complete!" : `${daysRemaining} days to go`}
        </span>
      </div>
      <div className={cn("w-full bg-secondary rounded-full overflow-hidden", barHeight[size])}>
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            isComplete
              ? "bg-gradient-to-r from-orange-400 to-red-500"
              : "bg-orange-400"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Helper functions
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

export default StreakCounter;

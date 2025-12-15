"use client";

import * as React from "react";
import { Sparkles, TrendingUp, Award } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LEVEL_THRESHOLDS } from "@/lib/interfaces/gamification.interface";

const xpBadgeVariants = cva(
  "inline-flex items-center gap-1.5 font-medium rounded-full transition-all",
  {
    variants: {
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-1.5",
      },
      variant: {
        default: "bg-primary/10 text-primary",
        gradient: "bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-orange-600 dark:text-orange-400",
        solid: "bg-primary text-primary-foreground",
        outline: "border border-primary/30 text-primary",
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

export interface XPBadgeProps extends VariantProps<typeof xpBadgeVariants> {
  xp: number;
  showIcon?: boolean;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

/**
 * XPBadge Component
 * Displays XP amount with icon
 * Requirements: 7.6 - Display total XP earned
 */
export function XPBadge({
  xp,
  size = "md",
  variant = "default",
  showIcon = true,
  showLabel = false,
  animated = false,
  className,
}: XPBadgeProps) {
  const formattedXP = formatXP(xp);

  return (
    <span
      className={cn(
        xpBadgeVariants({ size, variant }),
        animated && "animate-pulse",
        className
      )}
    >
      {showIcon && (
        <Sparkles
          className={cn(
            iconSizes[size ?? "md"],
            "text-yellow-500"
          )}
        />
      )}
      <span>{formattedXP}</span>
      {showLabel && <span className="text-muted-foreground">XP</span>}
    </span>
  );
}

export interface XPGainProps {
  amount: number;
  reason?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * XPGain Component
 * Displays XP gained notification (e.g., "+10 XP")
 */
export function XPGain({
  amount,
  reason,
  size = "md",
  className,
}: XPGainProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-base",
        className
      )}
    >
      <TrendingUp className={iconSizes[size]} />
      <span>+{amount} XP</span>
      {reason && (
        <span className="text-muted-foreground font-normal">({reason})</span>
      )}
    </div>
  );
}

export interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

/**
 * LevelBadge Component
 * Displays user level with icon
 * Requirements: 7.6 - Display level
 */
export function LevelBadge({
  level,
  size = "md",
  showLabel = true,
  className,
}: LevelBadgeProps) {
  const levelColor = getLevelColor(level);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full",
        size === "sm" && "text-xs px-2 py-0.5",
        size === "md" && "text-sm px-3 py-1",
        size === "lg" && "text-base px-4 py-1.5",
        levelColor,
        className
      )}
    >
      <Award className={iconSizes[size]} />
      {showLabel && <span>Level</span>}
      <span>{level}</span>
    </span>
  );
}

export interface XPProgressProps {
  currentXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  className?: string;
}

/**
 * XPProgress Component
 * Displays XP progress towards next level
 * Requirements: 7.6 - Display XP progress
 */
export function XPProgress({
  currentXP,
  currentLevel,
  xpToNextLevel,
  size = "md",
  showLabels = true,
  className,
}: XPProgressProps) {
  const currentLevelThreshold = LEVEL_THRESHOLDS[Math.min(currentLevel - 1, LEVEL_THRESHOLDS.length - 1)] ?? 0;
  const nextLevelThreshold = currentLevelThreshold + xpToNextLevel;
  const xpInCurrentLevel = currentXP - currentLevelThreshold;
  const progress = xpToNextLevel > 0 ? (xpInCurrentLevel / xpToNextLevel) * 100 : 100;

  const barHeight = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabels && (
        <div className="flex items-center justify-between mb-1.5">
          <LevelBadge level={currentLevel} size="sm" />
          <span className="text-xs text-muted-foreground">
            {formatXP(xpInCurrentLevel)} / {formatXP(xpToNextLevel)} XP
          </span>
        </div>
      )}
      <div className={cn("w-full bg-secondary rounded-full overflow-hidden", barHeight[size])}>
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      {showLabels && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            Level {currentLevel}
          </span>
          <span className="text-xs text-muted-foreground">
            Level {currentLevel + 1}
          </span>
        </div>
      )}
    </div>
  );
}

// Helper functions
function formatXP(xp: number): string {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toLocaleString();
}

function getLevelColor(level: number): string {
  if (level >= 10) return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  if (level >= 7) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  if (level >= 4) return "bg-slate-100 text-blue-700 dark:bg-slate-900/30 dark:text-blue-400";
  return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
}

export default XPBadge;

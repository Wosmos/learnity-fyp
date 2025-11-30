"use client";

import * as React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StarRatingProps {
  value: number; // 0-5, supports decimals for half stars
  onChange?: (value: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  className?: string;
  allowHalf?: boolean;
  allowClear?: boolean;
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const gapClasses = {
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-1.5",
};

/**
 * StarRating Component
 * Display and input modes with half-star support
 * Requirements: 8.2, 8.3 - Display and input modes, half-star support
 */
export function StarRating({
  value,
  onChange,
  max = 5,
  size = "md",
  readonly = false,
  showValue = false,
  showCount = false,
  count = 0,
  className,
  allowHalf = true,
  allowClear = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const isInteractive = !readonly && onChange;
  const displayValue = hoverValue ?? value;

  const handleMouseMove = (
    e: React.MouseEvent<HTMLButtonElement>,
    starIndex: number
  ) => {
    if (!isInteractive) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;

    if (allowHalf && isLeftHalf) {
      setHoverValue(starIndex + 0.5);
    } else {
      setHoverValue(starIndex + 1);
    }
  };

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    starIndex: number
  ) => {
    if (!isInteractive) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;

    let newValue: number;
    if (allowHalf && isLeftHalf) {
      newValue = starIndex + 0.5;
    } else {
      newValue = starIndex + 1;
    }

    // Allow clearing if clicking the same value
    if (allowClear && newValue === value) {
      onChange?.(0);
    } else {
      onChange?.(newValue);
    }
  };

  const handleMouseLeave = () => {
    if (isInteractive) {
      setHoverValue(null);
    }
  };

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const fillPercentage = Math.min(1, Math.max(0, displayValue - index));
    
    const isFull = fillPercentage >= 1;
    const isHalf = fillPercentage >= 0.5 && fillPercentage < 1;
    const isEmpty = fillPercentage < 0.5;

    const starContent = (
      <span className="relative inline-flex">
        {/* Empty star (background) */}
        <Star
          className={cn(
            sizeClasses[size],
            "text-muted-foreground/30",
            isInteractive && "transition-colors"
          )}
        />
        
        {/* Filled star (overlay) */}
        {isFull && (
          <Star
            className={cn(
              sizeClasses[size],
              "absolute inset-0 fill-yellow-400 text-yellow-400",
              isInteractive && "transition-colors"
            )}
          />
        )}
        
        {/* Half star */}
        {isHalf && (
          <StarHalf
            className={cn(
              sizeClasses[size],
              "absolute inset-0 fill-yellow-400 text-yellow-400",
              isInteractive && "transition-colors"
            )}
          />
        )}
      </span>
    );

    if (isInteractive) {
      return (
        <button
          key={index}
          type="button"
          className={cn(
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm",
            "cursor-pointer hover:scale-110 transition-transform"
          )}
          onMouseMove={(e) => handleMouseMove(e, index)}
          onClick={(e) => handleClick(e, index)}
          aria-label={`Rate ${starValue} out of ${max} stars`}
        >
          {starContent}
        </button>
      );
    }

    return <span key={index}>{starContent}</span>;
  };

  return (
    <div
      className={cn("inline-flex items-center", gapClasses[size], className)}
      onMouseLeave={handleMouseLeave}
      role={isInteractive ? "radiogroup" : "img"}
      aria-label={`Rating: ${value} out of ${max} stars`}
    >
      {/* Stars */}
      <div className={cn("flex items-center", gapClasses[size])}>
        {Array.from({ length: max }, (_, i) => renderStar(i))}
      </div>

      {/* Value Display */}
      {showValue && (
        <span className="text-sm font-medium ml-1">
          {value.toFixed(1)}
        </span>
      )}

      {/* Review Count */}
      {showCount && (
        <span className="text-sm text-muted-foreground ml-1">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}

/**
 * RatingInput - Simplified rating input for forms
 */
export function RatingInput({
  value,
  onChange,
  label,
  error,
  required = false,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <StarRating
        value={value}
        onChange={onChange}
        size="lg"
        showValue
        allowHalf={false}
        allowClear
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

/**
 * RatingDisplay - Compact rating display for cards
 */
export function RatingDisplay({
  rating,
  reviewCount,
  size = "sm",
  className,
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Star
        className={cn(
          "fill-yellow-400 text-yellow-400",
          size === "sm" ? "h-4 w-4" : "h-5 w-5"
        )}
      />
      <span className={cn("font-medium", size === "sm" ? "text-sm" : "text-base")}>
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className={cn("text-muted-foreground", size === "sm" ? "text-sm" : "text-base")}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}

export default StarRating;

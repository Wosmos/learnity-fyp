"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Star, Users, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Course card variants for different display modes
const courseCardVariants = cva("group cursor-pointer overflow-hidden", {
  variants: {
    size: {
      grid: "flex flex-col",
      list: "flex flex-row gap-4",
    },
  },
  defaultVariants: {
    size: "grid",
  },
});

// Difficulty badge color mapping
const difficultyColors: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  INTERMEDIATE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  ADVANCED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export interface CourseCardProps extends VariantProps<typeof courseCardVariants> {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string | null;
  teacherName: string;
  teacherAvatarUrl?: string | null;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  totalDuration?: number; // in seconds
  lessonCount?: number;
  isFree?: boolean;
  price?: number | null;
  className?: string;
  href?: string;
}

/**
 * CourseCard Component
 * Displays course information in either grid or list layout
 * Requirements: 3.1 - Display thumbnail, title, teacher name, rating, enrollment count
 */
export function CourseCard({
  id,
  title,
  description,
  thumbnailUrl,
  teacherName,
  teacherAvatarUrl,
  rating,
  reviewCount,
  enrollmentCount,
  difficulty,
  totalDuration,
  lessonCount,
  isFree = true,
  price,
  size = "grid",
  className,
  href,
}: CourseCardProps) {
  const formattedRating = Number(rating || 0).toFixed(1);
  const formattedDuration = totalDuration ? formatDuration(totalDuration) : null;
  const courseHref = href ?? `/courses/${id}`;

  const content = (
    <Card
      variant="default"
      padding="none"
      className={cn(
        courseCardVariants({ size }),
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      {/* Thumbnail Section */}
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          size === "grid" ? "aspect-video w-full" : "w-48 h-32 shrink-0"
        )}
      >
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={size === "grid" ? "(max-width: 768px) 100vw, 33vw" : "192px"}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
            <BookOpen className="h-12 w-12 text-primary/40" />
          </div>
        )}
        
        {/* Difficulty Badge */}
        <Badge
          className={cn(
            "absolute top-2 left-2 text-xs font-medium",
            difficultyColors[difficulty]
          )}
        >
          {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
        </Badge>

        {/* Price Badge */}
        {!isFree && price && (
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
            ${price}
          </Badge>
        )}
        {isFree && (
          <Badge className="absolute top-2 right-2 bg-green-500 text-white">
            Free
          </Badge>
        )}
      </div>

      {/* Content Section */}
      <div className={cn("flex flex-col gap-2 p-4", size === "list" && "flex-1")}>
        {/* Title */}
        <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Description (list mode only) */}
        {size === "list" && description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}

        {/* Teacher Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {teacherAvatarUrl ? (
            <Image
              src={teacherAvatarUrl}
              alt={teacherName}
              width={20}
              height={20}
              className="rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
              {teacherName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="truncate">{teacherName}</span>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3 text-sm">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{formattedRating}</span>
            <span className="text-muted-foreground">({reviewCount})</span>
          </div>

          {/* Enrollment Count */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{formatCount(enrollmentCount)}</span>
          </div>
        </div>

        {/* Duration and Lessons (if available) */}
        {(formattedDuration || lessonCount) && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            {formattedDuration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formattedDuration}</span>
              </div>
            )}
            {lessonCount && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{lessonCount} lessons</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <Link href={courseHref} className="block">
      {content}
    </Link>
  );
}

/**
 * CourseCardSkeleton - Loading state for CourseCard
 */
export function CourseCardSkeleton({
  size = "grid",
  className,
}: {
  size?: "grid" | "list";
  className?: string;
}) {
  return (
    <Card
      variant="default"
      padding="none"
      className={cn(courseCardVariants({ size }), className)}
    >
      <Skeleton
        className={cn(
          size === "grid" ? "aspect-video w-full" : "w-48 h-32 shrink-0"
        )}
      />
      <div className={cn("flex flex-col gap-2 p-4", size === "list" && "flex-1")}>
        <Skeleton className="h-5 w-3/4" />
        {size === "list" && <Skeleton className="h-4 w-full" />}
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </Card>
  );
}

// Helper functions
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export default CourseCard;

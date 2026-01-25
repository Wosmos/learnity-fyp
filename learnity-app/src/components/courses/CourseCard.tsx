"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Star,
  Users,
  Clock,
  BookOpen,
  ShieldCheck,
  Zap,
  Tag,
  Calendar,
} from "lucide-react";
import { cn, formatCount, formatDuration } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PLACEHOLDER_IMAGES } from "@/lib/constants/place-holder-images";

export const courseCardVariants = cva("group relative overflow-hidden", {
  variants: {
    size: {
      grid: "flex flex-col",
      list: "flex flex-col md:flex-row gap-6",
    },
  },
  defaultVariants: {
    size: "grid",
  },
});

const difficultyStyles: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  BEGINNER: {
    label: "INITIATE",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  INTERMEDIATE: {
    label: "OPERATIVE",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  ADVANCED: {
    label: "ELITE",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
};

export interface CourseCardProps extends VariantProps<
  typeof courseCardVariants
> {
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
  createdAt?: string;
  updatedAt?: string;
  category?: {
    id: string;
    name: string;
  };
}

const getPlaceholder = (id: string) => {
  const index =
    id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    PLACEHOLDER_IMAGES.length;
  return PLACEHOLDER_IMAGES[index];
};

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
  createdAt,
  updatedAt,
  category,
}: CourseCardProps) {
  const diff = difficultyStyles[difficulty] || difficultyStyles.BEGINNER;
  const courseHref = href ?? `/courses/${id}`;
  const displayThumbnail = thumbnailUrl || getPlaceholder(id);

  return (
    <Link href={courseHref} className="block group/card">
      <Card
        className={cn(
          courseCardVariants({ size }),
          "bg-white border-slate-100 rounded-[2rem] p-3 transition-all duration-500",
          "hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:border-indigo-200",
          className,
        )}
      >
        {/* THUMBNAIL TERMINAL */}
        <div
          className={cn(
            "relative rounded-[1.5rem] overflow-hidden bg-slate-100",
            size === "grid"
              ? "aspect-[16/10] w-full"
              : "w-full md:w-64 h-48 shrink-0",
          )}
        >
          <Image
            src={displayThumbnail}
            alt={title}
            fill
            className="object-cover transition-all duration-700 group-hover/card:scale-105"
            unoptimized={displayThumbnail.includes("unsplash")}
          />

          {/* HUD OVERLAYS */}
          <div className="absolute top-3 left-3 flex gap-2">
            <div
              className={cn(
                "px-3 py-1 rounded-lg border backdrop-blur-md text-[9px] font-black uppercase tracking-widest",
                diff.bg,
                diff.color,
              )}
            >
              {diff.label}
            </div>
          </div>

          <div className="absolute top-3 right-3">
            <div className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-black text-white uppercase tracking-tight">
              {isFree ? "FREE" : `$${price}`}
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />
        </div>

        {/* DATA READOUT */}
        <div
          className={cn(
            "flex flex-col gap-3 p-4",
            size === "list" && "flex-1 justify-center",
          )}
        >
          <div className="space-y-2">
            {category && (
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">
                <Tag className="h-3 w-3" />
                <span>{category.name}</span>
              </div>
            )}

            <h3 className="text-lg font-black text-slate-900 leading-tight tracking-tight group-hover/card:text-indigo-600 transition-colors line-clamp-2">
              {title}
            </h3>

            {description && (
              <p
                className={cn(
                  "text-sm font-medium text-slate-500 leading-relaxed",
                  size === "list" ? "line-clamp-2" : "line-clamp-2",
                )}
              >
                {description}
              </p>
            )}

            {(updatedAt || createdAt) && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium pt-1">
                <Calendar className="h-3 w-3" />
                <span suppressHydrationWarning>
                  {updatedAt
                    ? `Updated ${new Date(updatedAt).toLocaleDateString()}`
                    : `Added ${new Date(createdAt!).toLocaleDateString()}`}
                </span>
              </div>
            )}
          </div>

          {/* INSTRUCTOR PROFILE */}
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 shrink-0">
              <div className="absolute inset-0 bg-indigo-500/10 rounded-full scale-110 animate-pulse group-hover/card:bg-indigo-500/20 transition-colors" />
              {teacherAvatarUrl ? (
                <Image
                  src={teacherAvatarUrl}
                  alt={teacherName}
                  fill
                  className="relative object-cover rounded-full border-2 border-white shadow-sm"
                />
              ) : (
                <div className="relative h-full w-full rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border-2 border-white shadow-sm">
                  {teacherName?.[0]?.toUpperCase() || "T"}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-extrabold text-slate-800 line-clamp-1 leading-none mb-0.5">
                {teacherName || "Instructor"}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                Instructor
              </span>
            </div>
          </div>

          {/* TELEMETRY BAR */}
          <div className="pt-4 mt-2 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-black text-slate-900 italic">
                  {Number(rating).toFixed(1)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400">
                <Users className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                  {formatCount(enrollmentCount)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              {totalDuration && (
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(totalDuration)}</span>
                </div>
              )}
              {lessonCount && (
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  <BookOpen className="h-3 w-3" />
                  <span>{lessonCount}u</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function CourseCardSkeleton({
  size = "grid",
}: {
  size?: "grid" | "list";
}) {
  return (
    <Card
      className={cn(
        courseCardVariants({ size }),
        "bg-white border-slate-100 rounded-[2rem] p-3 shadow-none",
      )}
    >
      {/* Thumbnail skeleton */}
      <div
        className={cn(
          "relative rounded-[1.5rem] overflow-hidden bg-slate-100 animate-pulse",
          size === "grid"
            ? "aspect-[16/10] w-full"
            : "w-full md:w-64 h-48 shrink-0",
        )}
      />

      {/* Content skeleton */}
      <div
        className={cn(
          "flex flex-col gap-3 p-4",
          size === "list" && "flex-1 justify-center",
        )}
      >
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4 bg-slate-100" />
          {size === "list" && (
            <>
              <Skeleton className="h-4 w-full bg-slate-100" />
              <Skeleton className="h-4 w-2/3 bg-slate-100" />
            </>
          )}
        </div>

        {/* Instructor skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full bg-slate-100" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-20 bg-slate-100" />
            <Skeleton className="h-2 w-12 bg-slate-50" />
          </div>
        </div>

        {/* Telemetry skeleton */}
        <div className="pt-4 mt-2 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-8 bg-slate-50" />
            <Skeleton className="h-3 w-10 bg-slate-50" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-12 bg-slate-50" />
            <Skeleton className="h-3 w-8 bg-slate-50" />
          </div>
        </div>
      </div>
    </Card>
  );
}

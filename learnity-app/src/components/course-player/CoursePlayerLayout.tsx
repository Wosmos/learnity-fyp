'use client';

/**
 * CoursePlayerLayout Component
 * Main layout for the course player with video area, lesson sidebar, and progress tracking
 * Requirements: 5.1, 5.2 - Video player area, lesson sidebar, progress tracking
 */

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CoursePlayerLayoutProps {
  /** Course ID for navigation */
  courseId: string;
  /** Course title */
  courseTitle: string;
  /** Teacher name */
  teacherName: string;
  /** Overall progress percentage (0-100) */
  progressPercent: number;
  /** Current lesson title */
  currentLessonTitle?: string;
  /** Current lesson description */
  currentLessonDescription?: string;
  /** Main content area (video player or quiz) */
  children: ReactNode;
  /** Sidebar content (lesson list) */
  sidebar: ReactNode;
  /** Controls area content */
  controls?: ReactNode;
  /** Whether previous navigation is disabled */
  prevDisabled?: boolean;
  /** Whether next navigation is disabled */
  nextDisabled?: boolean;
  /** Callback for previous navigation */
  onPrevious?: () => void;
  /** Callback for next navigation */
  onNext?: () => void;
  /** Additional class name */
  className?: string;
}

/**
 * CoursePlayerLayout - Main layout component for course player
 * Provides consistent structure with header, main content, sidebar, and controls
 */
export function CoursePlayerLayout({
  courseId,
  courseTitle,
  teacherName,
  progressPercent,
  currentLessonTitle,
  currentLessonDescription,
  children,
  sidebar,
  controls,
  prevDisabled = false,
  nextDisabled = false,
  onPrevious,
  onNext,
  className,
}: CoursePlayerLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-slate-900 text-white', className)}>
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href={`/courses/${courseId}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit
              </Button>
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold truncate max-w-md">{courseTitle}</h1>
              <p className="text-sm text-slate-400">by {teacherName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Progress value={progressPercent} className="w-24 sm:w-32 h-2" />
              <span className="text-sm text-slate-400 min-w-[3rem]">{progressPercent}%</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Video/Quiz Player Area */}
          <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
            {children}
          </div>

          {/* Lesson Controls */}
          <div className="bg-slate-800 border-t border-slate-700 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                {currentLessonTitle && (
                  <h2 className="text-lg font-semibold truncate">{currentLessonTitle}</h2>
                )}
                {currentLessonDescription && (
                  <p className="text-sm text-slate-400 truncate">{currentLessonDescription}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrevious}
                  disabled={prevDisabled}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                
                {controls}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNext}
                  disabled={nextDisabled}
                  className="border-slate-600 hover:bg-slate-700"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-80 bg-slate-800 border-l border-slate-700 overflow-y-auto hidden lg:block">
          {sidebar}
        </aside>
      </div>
    </div>
  );
}

export default CoursePlayerLayout;

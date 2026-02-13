'use client';

/**
 * CoursePlayerLayout Component
 * Modernized layout with responsive mobile drawer, collapsible desktop sidebar, and immersive styling
 */

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LayoutList,
  PanelRightClose,
  PanelRightOpen,
  Zap,
  Award,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface CoursePlayerLayoutProps {
  courseId: string;
  courseTitle: string;
  teacherName: string;
  progressPercent: number;
  currentLessonTitle?: string;
  currentLessonDescription?: string;
  children: ReactNode;
  sidebar: ReactNode;
  controls?: ReactNode;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  className?: string;
  /** Optional gamification progress */
  gamificationProgress?: {
    totalXP: number;
    currentLevel: number;
    currentStreak: number;
  };
}

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
  gamificationProgress,
}: CoursePlayerLayoutProps) {
  // State for mobile drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // State for desktop sidebar collapse
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'flex flex-col h-screen bg-slate-950 text-white overflow-hidden',
          className
        )}
      >
        {/* --- Header --- */}
        <header className='shrink-0 h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md z-30 flex items-center justify-between px-4'>
          {/* Left: Back & Title */}
          <div className='flex items-center gap-3 md:gap-4 overflow-hidden'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href='/dashboard/student/courses' className='shrink-0'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='text-slate-400 hover:text-white hover:bg-slate-800 rounded-full w-9 h-9'
                  >
                    <ArrowLeft className='h-5 w-5' />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side='bottom'>Back to Dashboard</TooltipContent>
            </Tooltip>

            <div className='flex flex-col overflow-hidden'>
              <h1 className='text-sm md:text-base font-semibold text-white truncate max-w-[120px] sm:max-w-md'>
                {courseTitle}
              </h1>
              <p className='text-[10px] md:text-xs text-slate-400 truncate hidden sm:block'>
                {teacherName}
              </p>
            </div>
          </div>

          {/* Center: Gamification (Desktop) */}
          <div className='hidden lg:flex items-center gap-6'>
            {gamificationProgress && (
              <>
                <div className='flex items-center gap-2 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20'>
                  <Zap className='h-3.5 w-3.5 text-yellow-500 fill-yellow-500' />
                  <span className='text-xs font-black text-yellow-500 tracking-tighter'>
                    STREAK: {gamificationProgress.currentStreak}
                  </span>
                </div>
                <div className='flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20'>
                  <Award className='h-3.5 w-3.5 text-indigo-400' />
                  <span className='text-xs font-black text-indigo-400 tracking-tighter uppercase'>
                    Level {gamificationProgress.currentLevel}
                  </span>
                </div>
              </>
            )}

            {/* Community Hub Link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/dashboard/student/courses/${courseId}/community`}
                  className='shrink-0'
                >
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-slate-400 hover:text-white hover:bg-slate-800 rounded-full gap-2 px-4'
                  >
                    <Users className='h-4 w-4 text-indigo-400' />
                    <span className='text-xs font-bold uppercase tracking-wider'>
                      Community Hub
                    </span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side='bottom'>
                Connect with fellow learners
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Right: Progress, Desktop Toggle, Mobile Menu */}
          <div className='flex items-center gap-3 shrink-0'>
            <div className='flex flex-col items-end mr-2 hidden sm:flex'>
              <div className='flex items-center gap-2 text-xs font-medium text-emerald-400 mb-1'>
                <span>{Math.round(progressPercent)}% Mastered</span>
              </div>
              <Progress
                value={progressPercent}
                className='w-24 sm:w-32 h-1.5 bg-slate-800'
                indicatorClassName='bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
              />
            </div>

            {/* Desktop Sidebar Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='hidden lg:flex text-slate-400 hover:text-white hover:bg-slate-800'
                  onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                >
                  {isDesktopSidebarOpen ? (
                    <PanelRightClose className='h-5 w-5' />
                  ) : (
                    <PanelRightOpen className='h-5 w-5' />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side='bottom'>
                {isDesktopSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
              </TooltipContent>
            </Tooltip>

            {/* Mobile Menu Toggle */}
            <Button
              variant='ghost'
              size='icon'
              className='lg:hidden text-slate-400 hover:text-white hover:bg-slate-800'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className='h-6 w-6' />
              ) : (
                <Menu className='h-6 w-6' />
              )}
            </Button>
          </div>
        </header>

        {/* --- Main Workspace --- */}
        <div className='flex flex-1 min-h-0 relative overflow-hidden'>
          {/* Center: Player & Controls */}
          <main
            className={cn(
              'flex-1 flex flex-col min-w-0 bg-black relative z-10 transition-all duration-300 ease-in-out'
              // If desktop sidebar is closed, this main area grows. Not needed with flex-1 but good for animation context
            )}
          >
            {/* Player Stage */}
            <div className='flex-1 w-full bg-black relative flex flex-col justify-center overflow-hidden'>
              {children}
            </div>

            {/* Bottom Control Bar */}
            <div className='shrink-0 bg-slate-900 border-t border-slate-800 px-4 py-4 md:px-6 md:py-5 safe-area-pb z-20'>
              <div className='max-w-5xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                {/* Lesson Meta */}
                <div className='min-w-0 flex-1 space-y-1'>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant='outline'
                      className='text-[10px] py-0 h-5 border-slate-700 text-slate-400 uppercase tracking-wider shrink-0'
                    >
                      On Scene
                    </Badge>
                  </div>
                  <h2 className='text-base sm:text-lg font-semibold text-white truncate pr-4'>
                    {currentLessonTitle || 'Loading Lesson...'}
                  </h2>
                </div>

                {/* Navigation Actions */}
                <div className='flex items-center gap-3 shrink-0 justify-between sm:justify-end w-full sm:w-auto'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='outline'
                          onClick={onPrevious}
                          disabled={prevDisabled}
                          className='border-slate-700 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700 px-4 min-w-[100px]'
                        >
                          <ChevronLeft className='h-4 w-4 mr-2' />
                          Previous
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Go to previous lesson</TooltipContent>
                    </Tooltip>

                    <div className='flex items-center gap-3'>
                      {controls}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={onNext}
                            disabled={nextDisabled}
                            className='bg-indigo-600 hover:bg-indigo-500 text-white border-none px-6 min-w-[100px] shadow-lg shadow-indigo-900/20'
                          >
                            Next
                            <ChevronRight className='h-4 w-4 ml-2' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Go to next lesson</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar: Desktop Collapsible */}
          <aside
            className={cn(
              'hidden lg:flex flex-col bg-slate-900 border-l border-slate-800 transition-all duration-300 ease-in-out overflow-hidden',
              isDesktopSidebarOpen
                ? 'w-80 border-l'
                : 'w-0 border-l-0 opacity-0'
            )}
          >
            <div className='flex-1 w-80 overflow-y-auto custom-scrollbar flex flex-col'>
              {/* Sidebar Content */}
              <div className='flex-1'>{sidebar}</div>

              {/* Gamification Sidebar Footer (Optional) */}
              {gamificationProgress && (
                <div className='p-4 border-t border-slate-800 bg-slate-900/80 mt-auto'>
                  <div className='flex items-center justify-between mb-2 text-xs text-slate-400'>
                    <span>
                      Level {gamificationProgress.currentLevel} Progress
                    </span>
                    <span>{gamificationProgress.totalXP} XP</span>
                  </div>
                  <Progress
                    value={45}
                    className='h-1.5'
                    indicatorClassName='bg-indigo-500'
                  />
                </div>
              )}
            </div>
          </aside>

          {/* Sidebar: Mobile Overlay */}
          <div
            className={cn(
              'absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity duration-300',
              isMobileMenuOpen
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none'
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sidebar: Mobile Drawer */}
          <aside
            className={cn(
              'absolute lg:hidden top-0 right-0 z-50 h-full w-[85%] sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col',
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            )}
          >
            {/* Mobile Sidebar Header */}
            <div className='h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0'>
              <span className='font-semibold flex items-center gap-2 text-slate-200 uppercase text-xs tracking-widest font-black'>
                <LayoutList className='h-4 w-4 text-indigo-400' />
                Intelligence Hub
              </span>
              <Button
                variant='ghost'
                size='icon'
                className='hover:bg-slate-800 rounded-full'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className='h-5 w-5 text-slate-400' />
              </Button>
            </div>

            {/* Sidebar Content (Scrollable) */}
            <div className='flex-1 overflow-y-auto custom-scrollbar'>
              {sidebar}
            </div>
          </aside>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default CoursePlayerLayout;

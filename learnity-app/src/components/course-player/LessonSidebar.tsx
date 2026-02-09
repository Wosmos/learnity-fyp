'use client';

/**
 * LessonSidebar Component
 * Displays course sections with lessons, completion status, and locked indicators
 * Requirements: 5.2, 5.8, 7.2 - Sections with lessons, completion checkmarks, locked section indicators
 */

import React from 'react';
import {
  CheckCircle,
  Circle,
  Video,
  HelpCircle,
  Lock,
  Clock,
  PlayCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { SectionProgressBar } from '@/components/courses/ProgressBar';

export interface LessonItem {
  id: string;
  title: string;
  type: 'VIDEO' | 'QUIZ';
  duration: number;
  order: number;
}

export interface SectionItem {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: LessonItem[];
}

export interface LessonSidebarProps {
  /** Course sections with lessons */
  sections: SectionItem[];
  /** Currently active lesson ID */
  currentLessonId?: string;
  /** Set of completed lesson IDs */
  completedLessonIds: Set<string>;
  /** Set of locked section IDs */
  lockedSectionIds?: Set<string>;
  /** Set of locked lesson IDs */
  lockedLessonIds?: Set<string>;
  /** Section progress percentages (sectionId -> percentage) */
  sectionProgress?: Map<string, number>;
  /** Total lessons count */
  totalLessons: number;
  /** Completed lessons count */
  completedCount: number;
  /** Callback when a lesson is selected */
  onLessonSelect: (sectionIndex: number, lessonIndex: number) => void;
  /** Additional class name */
  className?: string;
}

/**
 * Format duration in seconds to human readable string
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * LessonSidebar - Displays course content navigation
 * Shows sections with lessons, completion status, and locked indicators
 */
export function LessonSidebar({
  sections,
  currentLessonId,
  completedLessonIds,
  lockedSectionIds = new Set(),
  lockedLessonIds = new Set(),
  sectionProgress = new Map(),
  totalLessons,
  completedCount,
  onLessonSelect,
  className,
}: LessonSidebarProps) {
  // Find the section containing the current lesson for default expansion
  const currentSectionIndex = sections.findIndex(section =>
    section.lessons.some(lesson => lesson.id === currentLessonId)
  );

  const defaultExpandedSections =
    currentSectionIndex >= 0
      ? [`section-${currentSectionIndex}`]
      : ['section-0'];

  return (
    <div className={cn('flex flex-col h-full bg-slate-900', className)}>
      {/* Header */}
      <div className='p-6 border-b border-slate-800 bg-slate-900/50'>
        <h3 className='font-bold text-white text-lg'>Course Content</h3>
        <div className='mt-3 space-y-2'>
          <div className='flex justify-between text-xs text-slate-400 mb-1'>
            <span>Progress</span>
            <span>
              {Math.round((completedCount / totalLessons) * 100 || 0)}%
            </span>
          </div>
          <div className='h-1.5 w-full bg-slate-800 rounded-full overflow-hidden'>
            <div
              className='h-full bg-indigo-500 rounded-full transition-all duration-500'
              style={{
                width: `${(completedCount / totalLessons) * 100 || 0}%`,
              }}
            />
          </div>
          <p className='text-[10px] text-slate-500 font-medium uppercase tracking-tight'>
            {completedCount} of {totalLessons} lessons completed
          </p>
        </div>
      </div>

      {/* Sections List */}
      <div className='flex-1 overflow-y-auto custom-scrollbar px-2 py-4'>
        <Accordion
          type='multiple'
          defaultValue={defaultExpandedSections}
          className='space-y-2'
        >
          {sections.map((section, sectionIndex) => {
            const isSectionLocked = lockedSectionIds.has(section.id);
            const progress = sectionProgress.get(section.id) ?? 0;
            const sectionCompletedCount = section.lessons.filter(l =>
              completedLessonIds.has(l.id)
            ).length;

            return (
              <AccordionItem
                key={section.id}
                value={`section-${sectionIndex}`}
                className='border-none bg-slate-800/30 rounded-xl overflow-hidden'
              >
                <AccordionTrigger
                  className={cn(
                    'text-white hover:no-underline py-4 px-4 hover:bg-slate-800/50 transition-colors',
                    isSectionLocked && 'opacity-60 grayscale'
                  )}
                  disabled={isSectionLocked}
                >
                  <div className='flex items-center gap-3 text-left flex-1 min-w-0'>
                    {isSectionLocked && (
                      <Lock className='h-4 w-4 text-slate-500 shrink-0' />
                    )}
                    <div className='flex-1 min-w-0'>
                      <span className='text-sm font-bold truncate block'>
                        {sectionIndex + 1}. {section.title}
                      </span>
                      <div className='flex items-center gap-2 mt-1'>
                        <span className='text-[10px] text-slate-500 font-bold uppercase'>
                          {section.lessons.length} Lessons
                        </span>
                        <span className='w-1 h-1 bg-slate-700 rounded-full' />
                        <span className='text-[10px] text-emerald-500 font-bold'>
                          {sectionCompletedCount}/{section.lessons.length} Done
                        </span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='pb-2 pt-0'>
                  {/* Section Progress Bar */}
                  {!isSectionLocked &&
                    section.lessons.length > 0 &&
                    progress > 0 && (
                      <div className='px-4 mb-4'>
                        <SectionProgressBar
                          progress={progress}
                          isUnlocked={!isSectionLocked}
                        />
                      </div>
                    )}

                  {/* Locked Section Message */}
                  {isSectionLocked && (
                    <div className='px-4 py-6 text-center bg-slate-900/50 mx-2 mb-2 rounded-lg'>
                      <Lock className='h-8 w-8 text-slate-600 mx-auto mb-2' />
                      <p className='text-xs text-slate-500 font-medium'>
                        This section is locked until you complete previous
                        requirements.
                      </p>
                    </div>
                  )}

                  {/* Lessons List */}
                  {!isSectionLocked && (
                    <div className='space-y-1 px-1'>
                      {section.lessons.map((lesson, lessonIndex) => {
                        const isActive = currentLessonId === lesson.id;
                        const isCompleted = completedLessonIds.has(lesson.id);
                        const isLocked = lockedLessonIds.has(lesson.id);

                        return (
                          <LessonListItem
                            key={lesson.id}
                            lesson={lesson}
                            isActive={isActive}
                            isCompleted={isCompleted}
                            isLocked={isLocked}
                            onClick={() =>
                              !isLocked &&
                              onLessonSelect(sectionIndex, lessonIndex)
                            }
                          />
                        );
                      })}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}

/**
 * LessonListItem - Individual lesson item in the sidebar
 */
interface LessonListItemProps {
  lesson: LessonItem;
  isActive: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  onClick: () => void;
}

function LessonListItem({
  lesson,
  isActive,
  isCompleted,
  isLocked,
  onClick,
}: LessonListItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all relative group',
        isActive
          ? 'bg-indigo-600 shadow-lg shadow-indigo-900/20 text-white'
          : isLocked
            ? 'opacity-40 cursor-not-allowed text-slate-500'
            : 'hover:bg-slate-700/50 text-slate-300'
      )}
    >
      {/* Active Indicator */}
      {isActive && (
        <div className='absolute left-1 top-3 bottom-3 w-1 bg-white rounded-full' />
      )}

      {/* Status Icon */}
      <div className='shrink-0 flex items-center justify-center w-6'>
        {isLocked ? (
          <Lock className='h-3.5 w-3.5' />
        ) : isCompleted ? (
          <div className='bg-emerald-500/10 rounded-full p-1'>
            <CheckCircle className='h-4 w-4 text-emerald-500' />
          </div>
        ) : isActive ? (
          <PlayCircle className='h-5 w-5 animate-pulse' />
        ) : lesson.type === 'QUIZ' ? (
          <HelpCircle className='h-4 w-4 text-purple-400' />
        ) : (
          <Circle className='h-4 w-4 text-slate-600' />
        )}
      </div>

      {/* Lesson Info */}
      <div className='flex-1 min-w-0'>
        <span
          className={cn(
            'text-sm truncate block font-medium',
            isActive && 'font-bold'
          )}
        >
          {lesson.title}
        </span>
        <div className='flex items-center gap-2 mt-0.5'>
          {lesson.type === 'QUIZ' && (
            <span className='text-[10px] font-black uppercase text-purple-400'>
              Quiz
            </span>
          )}
          {lesson.duration > 0 && (
            <span className='text-[10px] text-slate-500 flex items-center gap-1 font-bold'>
              <Clock className='h-2.5 w-2.5' />
              {formatDuration(lesson.duration)}
            </span>
          )}
        </div>
      </div>

      {/* Type Icon (Right side) */}
      {!isLocked && !isActive && (
        <div className='opacity-40 group-hover:opacity-100 transition-opacity'>
          {lesson.type === 'VIDEO' ? (
            <Video className='h-3.5 w-3.5' />
          ) : (
            <HelpCircle className='h-3.5 w-3.5' />
          )}
        </div>
      )}
    </button>
  );
}

export default LessonSidebar;

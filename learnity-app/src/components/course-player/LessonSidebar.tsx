'use client';

/**
 * LessonSidebar Component
 * Displays course sections with lessons, completion status, and locked indicators
 * Requirements: 5.2, 5.8, 7.2 - Sections with lessons, completion checkmarks, locked section indicators
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  CheckCircle,
  Circle,
  Video,
  HelpCircle,
  Lock,
  Clock,
} from 'lucide-react';
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
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
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

  const defaultExpandedSections = currentSectionIndex >= 0 
    ? [`section-${currentSectionIndex}`] 
    : ['section-0'];

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="font-semibold text-white">Course Content</h3>
        <p className="text-sm text-slate-400 mt-1">
          {completedCount} of {totalLessons} lessons completed
        </p>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto">
        <Accordion 
          type="multiple" 
          defaultValue={defaultExpandedSections} 
          className="px-2"
        >
          {sections.map((section, sectionIndex) => {
            const isLocked = lockedSectionIds.has(section.id);
            const progress = sectionProgress.get(section.id) ?? 0;
            const sectionCompletedCount = section.lessons.filter(
              l => completedLessonIds.has(l.id)
            ).length;

            return (
              <AccordionItem
                key={section.id}
                value={`section-${sectionIndex}`}
                className="border-b border-slate-700"
              >
                <AccordionTrigger 
                  className={cn(
                    'text-white hover:no-underline py-3 px-2',
                    isLocked && 'opacity-60'
                  )}
                  disabled={isLocked}
                >
                  <div className="flex items-center gap-2 text-left flex-1 min-w-0">
                    {isLocked && (
                      <Lock className="h-4 w-4 text-slate-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">
                        {section.title}
                      </span>
                      {section.description && (
                        <span className="text-xs text-slate-400 truncate block">
                          {section.description}
                        </span>
                      )}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        'text-xs shrink-0',
                        sectionCompletedCount === section.lessons.length && 'bg-green-600 text-white'
                      )}
                    >
                      {sectionCompletedCount}/{section.lessons.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  {/* Section Progress Bar */}
                  {!isLocked && section.lessons.length > 0 && (
                    <div className="px-2 mb-2">
                      <SectionProgressBar 
                        progress={progress} 
                        isUnlocked={!isLocked}
                      />
                    </div>
                  )}

                  {/* Locked Section Message */}
                  {isLocked && (
                    <div className="px-2 py-3 text-center">
                      <Lock className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">
                        Complete 80% of the previous section to unlock
                      </p>
                    </div>
                  )}

                  {/* Lessons List */}
                  {!isLocked && (
                    <div className="space-y-1">
                      {section.lessons.map((lesson, lessonIndex) => {
                        const isActive = currentLessonId === lesson.id;
                        const isCompleted = completedLessonIds.has(lesson.id);

                        return (
                          <LessonListItem
                            key={lesson.id}
                            lesson={lesson}
                            isActive={isActive}
                            isCompleted={isCompleted}
                            onClick={() => onLessonSelect(sectionIndex, lessonIndex)}
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
  onClick: () => void;
}

function LessonListItem({ lesson, isActive, isCompleted, onClick }: LessonListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
        isActive
          ? 'bg-blue-600 text-white'
          : 'hover:bg-slate-700 text-slate-300'
      )}
    >
      {/* Status Icon */}
      <div className="shrink-0">
        {isCompleted ? (
          <CheckCircle className="h-4 w-4 text-green-400" />
        ) : lesson.type === 'QUIZ' ? (
          <HelpCircle className="h-4 w-4 text-purple-400" />
        ) : (
          <Circle className="h-4 w-4 text-slate-500" />
        )}
      </div>

      {/* Lesson Info */}
      <div className="flex-1 min-w-0">
        <span className="text-sm truncate block">{lesson.title}</span>
        {lesson.duration > 0 && lesson.type === 'VIDEO' && (
          <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3" />
            {formatDuration(lesson.duration)}
          </span>
        )}
      </div>

      {/* Type Badge */}
      {lesson.type === 'QUIZ' && (
        <Badge variant="outline" className="text-xs shrink-0 border-purple-400 text-purple-400">
          Quiz
        </Badge>
      )}
      {lesson.type === 'VIDEO' && (
        <Video className="h-4 w-4 text-slate-500 shrink-0" />
      )}
    </button>
  );
}

export default LessonSidebar;

/**
 * Course Player Components
 * Components for the course learning experience
 * Requirements: 5.1-5.8, 7.1-7.7
 */

export { YouTubePlayer, extractYouTubeId } from './YouTubePlayer';
export type { YouTubePlayerProps } from './YouTubePlayer';

export { LessonSidebar } from './LessonSidebar';
export type {
  LessonSidebarProps,
  LessonItem,
  SectionItem,
} from './LessonSidebar';

export { LessonCompleteDialog, XPCelebration } from './LessonCompleteDialog';
export type {
  LessonCompleteDialogProps,
  XPCelebrationProps,
} from './LessonCompleteDialog';

export { CoursePlayerLayout } from './CoursePlayerLayout';
export type { CoursePlayerLayoutProps } from './CoursePlayerLayout';

/**
 * Course Components
 * Reusable UI components for course management system
 */

export { CourseCard, CourseCardSkeleton, type CourseCardProps } from "./CourseCard";
export { 
  CourseFilters, 
  CourseFiltersCompact, 
  type CourseFiltersProps, 
  type CourseFiltersState,
  type Category,
  type DifficultyLevel,
  type SortOption 
} from "./CourseFilters";
export { SearchInput, SearchInputWithButton, type SearchInputProps } from "./SearchInput";
export { 
  ProgressBar, 
  CourseProgressBar, 
  SectionProgressBar, 
  type ProgressBarProps 
} from "./ProgressBar";
export { 
  StarRating, 
  RatingInput, 
  RatingDisplay, 
  type StarRatingProps 
} from "./StarRating";
export {
  XPBadge,
  XPGain,
  LevelBadge,
  XPProgress,
  type XPBadgeProps,
  type XPGainProps,
  type LevelBadgeProps,
  type XPProgressProps,
} from "./XPBadge";
export {
  StreakCounter,
  StreakDisplay,
  StreakMilestone,
  type StreakCounterProps,
  type StreakDisplayProps,
  type StreakMilestoneProps,
} from "./StreakCounter";
export {
  CertificatePage,
  type CertificatePageProps,
} from "./CertificatePage";

/**
 * Progress Service Interface
 * Defines the contract for progress tracking operations
 * 
 * Requirements covered:
 * - 5.3: Track video watch progress and mark lesson complete when 90% watched
 * - 5.4: Award XP points when lesson is completed
 * - 5.5: Allow manual lesson completion
 * - 5.6: Remember last watched position and resume
 * - 5.7: Show next lesson recommendation
 * - 5.8: Lock subsequent sections until previous section is 80% complete
 * - 7.1: Display overall course progress percentage
 * - 7.2: Show completed lessons with checkmark icons
 * - 7.3: Display section-wise progress bars
 * - 7.4: Mark course as completed when all lessons and quizzes done
 * - 7.5: Update student's daily streak
 * - 7.6: Display total XP earned from course
 * - 7.7: Show time spent on course
 */

import { LessonProgress, Lesson, Section } from '@prisma/client';

// ============================================
// PROGRESS DTOs AND TYPES
// ============================================

/**
 * Course progress summary for a student
 */
export interface CourseProgress {
  courseId: string;
  studentId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  totalDuration: number; // Total course duration in seconds
  watchedDuration: number; // Total watched time in seconds
  sections: SectionProgress[];
  isCompleted: boolean;
  completedAt?: Date | null;
}

/**
 * Section progress summary
 */
export interface SectionProgress {
  sectionId: string;
  sectionTitle: string;
  order: number;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  isUnlocked: boolean;
  lessons: LessonProgressSummary[];
}

/**
 * Lesson progress summary
 */
export interface LessonProgressSummary {
  lessonId: string;
  lessonTitle: string;
  order: number;
  type: string;
  duration: number;
  watchedSeconds: number;
  lastPosition: number;
  completed: boolean;
  completedAt?: Date | null;
}

/**
 * Result of marking a lesson complete
 */
export interface MarkCompleteResult {
  lessonProgress: LessonProgress;
  xpAwarded: number;
  newStreak?: number;
  enrollmentProgress: number;
  courseCompleted: boolean;
}

/**
 * Result of updating video progress
 */
export interface UpdateProgressResult {
  lessonProgress: LessonProgress;
  autoCompleted: boolean;
  xpAwarded?: number;
}

/**
 * Next lesson recommendation
 */
export interface NextLessonRecommendation {
  lesson: Lesson | null;
  section: Section | null;
  isNextSection: boolean;
  courseCompleted: boolean;
}

// ============================================
// PROGRESS SERVICE INTERFACE
// ============================================

/**
 * IProgressService - Progress tracking operations interface
 * Implements all progress-related business logic
 */
export interface IProgressService {
  /**
   * Update video watch progress
   * @param studentId - The student ID
   * @param lessonId - The lesson ID
   * @param watchedSeconds - Total seconds watched
   * @param lastPosition - Current playback position for resume
   * @returns Updated progress with auto-complete status
   * Requirements: 5.3, 5.6
   */
  updateVideoProgress(
    studentId: string,
    lessonId: string,
    watchedSeconds: number,
    lastPosition?: number
  ): Promise<UpdateProgressResult>;

  /**
   * Mark a lesson as complete
   * @param studentId - The student ID
   * @param lessonId - The lesson ID
   * @returns Result with XP awarded and updated progress
   * Requirements: 5.4, 5.5, 7.5
   */
  markLessonComplete(studentId: string, lessonId: string): Promise<MarkCompleteResult>;

  /**
   * Get lesson progress for a student
   * @param studentId - The student ID
   * @param lessonId - The lesson ID
   * @returns The lesson progress or null
   */
  getLessonProgress(studentId: string, lessonId: string): Promise<LessonProgress | null>;

  /**
   * Get overall course progress for a student
   * @param studentId - The student ID
   * @param courseId - The course ID
   * @returns Course progress summary
   * Requirements: 7.1
   */
  getCourseProgress(studentId: string, courseId: string): Promise<CourseProgress>;

  /**
   * Get section progress percentage
   * @param studentId - The student ID
   * @param sectionId - The section ID
   * @returns Progress percentage (0-100)
   * Requirements: 7.3
   */
  getSectionProgress(studentId: string, sectionId: string): Promise<number>;

  /**
   * Check if a section is unlocked for a student
   * @param studentId - The student ID
   * @param sectionId - The section ID
   * @returns True if section is unlocked
   * Requirements: 5.8
   */
  isSectionUnlocked(studentId: string, sectionId: string): Promise<boolean>;

  /**
   * Get the next lesson recommendation
   * @param studentId - The student ID
   * @param courseId - The course ID
   * @returns Next lesson to watch
   * Requirements: 5.7
   */
  getNextLesson(studentId: string, courseId: string): Promise<NextLessonRecommendation>;

  /**
   * Get total time spent on a course
   * @param studentId - The student ID
   * @param courseId - The course ID
   * @returns Total watched seconds
   * Requirements: 7.7
   */
  getTimeSpent(studentId: string, courseId: string): Promise<number>;
}

// ============================================
// PROGRESS ERROR TYPES
// ============================================

/**
 * Progress error codes for specific error handling
 */
export enum ProgressErrorCode {
  // Business logic errors
  LESSON_NOT_FOUND = 'LESSON_NOT_FOUND',
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  SECTION_NOT_FOUND = 'SECTION_NOT_FOUND',
  NOT_ENROLLED = 'NOT_ENROLLED',
  SECTION_LOCKED = 'SECTION_LOCKED',
  ALREADY_COMPLETED = 'ALREADY_COMPLETED',
  INVALID_PROGRESS = 'INVALID_PROGRESS',
  
  // Authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

/**
 * Custom error class for progress-related errors
 */
export class ProgressError extends Error {
  constructor(
    message: string,
    public code: ProgressErrorCode,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ProgressError';
  }
}

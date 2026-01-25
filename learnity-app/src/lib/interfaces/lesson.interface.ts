/**
 * Lesson Service Interface
 * Defines the contract for lesson management operations
 * Requirements: 1.7, 1.8, 1.9
 */

import { Lesson, Quiz, LessonType } from '@prisma/client';
import {
  CreateLessonData,
  UpdateLessonData,
  ReorderLessonsData,
} from '@/lib/validators/lesson';
import { YouTubeMetadata } from '@/lib/utils/youtube';

// ============================================
// LESSON DTOs AND TYPES
// ============================================

/**
 * Lesson with its quiz (if any)
 */
export interface LessonWithQuiz extends Lesson {
  quiz: Quiz | null;
}

/**
 * Lesson creation result with metadata
 */
export interface CreateLessonResult {
  lesson: Lesson;
  youtubeMetadata?: YouTubeMetadata | null;
}

/**
 * YouTube validation result
 */
export interface YouTubeValidationResult {
  isValid: boolean;
  videoId: string | null;
  metadata: YouTubeMetadata | null;
  error?: string;
}

// ============================================
// LESSON SERVICE INTERFACE
// ============================================

/**
 * ILessonService - Lesson management operations interface
 * Implements all lesson-related business logic
 */
export interface ILessonService {
  /**
   * Create a new lesson
   * @param data - Lesson creation data
   * @returns The created lesson with optional YouTube metadata
   * Requirements: 1.7
   */
  createLesson(data: CreateLessonData): Promise<CreateLessonResult>;

  /**
   * Update an existing lesson
   * @param lessonId - The lesson ID
   * @param data - Lesson update data
   * @returns The updated lesson
   * Requirements: 1.7
   */
  updateLesson(lessonId: string, data: UpdateLessonData): Promise<Lesson>;

  /**
   * Delete a lesson
   * @param lessonId - The lesson ID
   * Requirements: 1.7
   */
  deleteLesson(lessonId: string): Promise<void>;

  /**
   * Get a lesson by ID
   * @param lessonId - The lesson ID
   * @returns The lesson or null if not found
   */
  getLessonById(lessonId: string): Promise<Lesson | null>;

  /**
   * Get a lesson by ID with its quiz
   * @param lessonId - The lesson ID
   * @returns The lesson with quiz or null if not found
   */
  getLessonWithQuiz(lessonId: string): Promise<LessonWithQuiz | null>;

  /**
   * Get all lessons for a section
   * @param sectionId - The section ID
   * @returns Array of lessons ordered by order field
   */
  getLessonsBySection(sectionId: string): Promise<Lesson[]>;

  /**
   * Reorder lessons within a section
   * @param data - Reorder data with sectionId and lessonIds in new order
   * Requirements: 1.9
   */
  reorderLessons(data: ReorderLessonsData): Promise<void>;

  /**
   * Validate a YouTube URL and fetch metadata
   * @param url - The YouTube URL to validate
   * @returns Validation result with metadata
   * Requirements: 1.8
   */
  validateYouTubeUrl(url: string): Promise<YouTubeValidationResult>;

  /**
   * Get the next order number for a new lesson in a section
   * @param sectionId - The section ID
   * @returns The next order number
   */
  getNextOrder(sectionId: string): Promise<number>;

  /**
   * Validate that a lesson belongs to a course owned by a teacher
   * @param lessonId - The lesson ID
   * @param teacherId - The teacher ID
   * @returns True if the teacher owns the course containing this lesson
   */
  validateOwnership(lessonId: string, teacherId: string): Promise<boolean>;

  /**
   * Get the section ID for a lesson
   * @param lessonId - The lesson ID
   * @returns The section ID or null if lesson not found
   */
  getSectionIdForLesson(lessonId: string): Promise<string | null>;

  /**
   * Get the course ID for a lesson
   * @param lessonId - The lesson ID
   * @returns The course ID or null if lesson not found
   */
  getCourseIdForLesson(lessonId: string): Promise<string | null>;

  /**
   * Update course cached fields after lesson changes
   * @param courseId - The course ID
   */
  updateCourseCachedFields(courseId: string): Promise<void>;
}

// ============================================
// LESSON ERROR TYPES
// ============================================

/**
 * Lesson error codes for specific error handling
 */
export enum LessonErrorCode {
  // Validation errors
  INVALID_TITLE = 'INVALID_TITLE',
  INVALID_ORDER = 'INVALID_ORDER',
  INVALID_YOUTUBE_URL = 'INVALID_YOUTUBE_URL',
  YOUTUBE_URL_REQUIRED = 'YOUTUBE_URL_REQUIRED',

  // Business logic errors
  LESSON_NOT_FOUND = 'LESSON_NOT_FOUND',
  SECTION_NOT_FOUND = 'SECTION_NOT_FOUND',
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  NOT_COURSE_OWNER = 'NOT_COURSE_OWNER',
  INVALID_LESSON_IDS = 'INVALID_LESSON_IDS',
  CANNOT_FETCH_METADATA = 'CANNOT_FETCH_METADATA',

  // Authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

/**
 * Custom error class for lesson-related errors
 */
export class LessonError extends Error {
  constructor(
    message: string,
    public code: LessonErrorCode,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'LessonError';
  }
}

/**
 * Course Service Interface
 * Defines the contract for course management operations
 */

import {
  Course,
  Section,
  Lesson,
  Category,
  User,
  Difficulty,
  CourseStatus,
} from '@prisma/client';
import {
  CreateCourseData,
  UpdateCourseData,
  CourseFiltersData,
} from '@/lib/validators/course';

// ============================================
// COURSE DTOs AND TYPES
// ============================================

/**
 * Course with all related data for detailed view
 */
export interface CourseWithDetails extends Course {
  teacher: Pick<User, 'id' | 'firstName' | 'lastName' | 'profilePicture'>;
  category: Category;
  sections: SectionWithLessons[];
}

/**
 * Section with its lessons
 */
export interface SectionWithLessons extends Section {
  lessons: Lesson[];
}

/**
 * Paginated courses response
 */
export interface PaginatedCourses {
  courses: CourseWithTeacher[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Course with teacher info for listing
 */
export interface CourseWithTeacher extends Course {
  teacher: Pick<User, 'id' | 'firstName' | 'lastName' | 'profilePicture'>;
  category: Category;
}

/**
 * Course creation result
 */
export interface CreateCourseResult {
  course: Course;
  slug: string;
}

/**
 * Course publish validation result
 */
export interface PublishValidationResult {
  isValid: boolean;
  errors: string[];
  sectionCount: number;
  lessonCount: number;
}

// ============================================
// COURSE SERVICE INTERFACE
// ============================================

/**
 * ICourseService - Course management operations interface
 * Implements all course-related business logic
 */
export interface ICourseService {
  /**
   * Create a new course
   * @param teacherId - The ID of the teacher creating the course
   * @param data - Course creation data
   * @returns The created course
   * Requirements: 1.1, 1.10
   */
  createCourse(teacherId: string, data: CreateCourseData): Promise<Course>;

  /**
   * Update an existing course
   * @param courseId - The course ID
   * @param teacherId - The teacher ID (for ownership validation)
   * @param data - Course update data
   * @returns The updated course
   * Requirements: 2.4
   */
  updateCourse(
    courseId: string,
    teacherId: string,
    data: UpdateCourseData
  ): Promise<Course>;

  /**
   * Publish a course (change status from DRAFT to PUBLISHED)
   * @param courseId - The course ID
   * @param teacherId - The teacher ID (for ownership validation)
   * @returns The published course
   * Requirements: 2.1, 2.2
   */
  publishCourse(courseId: string, teacherId: string): Promise<Course>;

  /**
   * Unpublish a course (change status to UNPUBLISHED)
   * @param courseId - The course ID
   * @param teacherId - The teacher ID (for ownership validation)
   * @returns The unpublished course
   * Requirements: 2.3
   */
  unpublishCourse(courseId: string, teacherId: string): Promise<Course>;

  /**
   * Delete a course (only DRAFT courses or courses with no enrollments)
   * @param courseId - The course ID
   * @param teacherId - The teacher ID (for ownership validation)
   * Requirements: 2.5, 2.6
   */
  deleteCourse(courseId: string, teacherId: string): Promise<void>;

  /**
   * Get a course by ID with all details
   * @param courseId - The course ID
   * @returns The course with details or null if not found
   * Requirements: 3.5, 5.1
   */
  getCourseById(courseId: string): Promise<CourseWithDetails | null>;

  /**
   * Get a course by slug
   * @param slug - The course slug
   * @returns The course with details or null if not found
   */
  getCourseBySlug(slug: string): Promise<CourseWithDetails | null>;

  /**
   * Get all courses by a teacher
   * @param teacherId - The teacher ID
   * @returns Array of courses
   * Requirements: 3.5, 5.1
   */
  getCoursesByTeacher(teacherId: string): Promise<CourseWithTeacher[]>;

  /**
   * Get published courses with filtering and pagination
   * @param filters - Filter and pagination options
   * @returns Paginated courses
   * Requirements: 3.1, 3.2, 3.4
   */
  getPublishedCourses(filters: CourseFiltersData): Promise<PaginatedCourses>;

  /**
   * Search courses by title, description, and tags
   * @param query - Search query
   * @param filters - Additional filters
   * @returns Paginated search results
   * Requirements: 3.3
   */
  searchCourses(
    query: string,
    filters: CourseFiltersData
  ): Promise<PaginatedCourses>;

  /**
   * Validate if a course can be published
   * @param courseId - The course ID
   * @returns Validation result
   */
  validateForPublish(courseId: string): Promise<PublishValidationResult>;

  /**
   * Check if a user is the owner of a course
   * @param courseId - The course ID
   * @param teacherId - The teacher ID
   * @returns True if the teacher owns the course
   */
  isOwner(courseId: string, teacherId: string): Promise<boolean>;

  /**
   * Generate a unique slug from a title
   * @param title - The course title
   * @returns A unique slug
   */
  generateSlug(title: string): Promise<string>;

  /**
   * Update cached fields (totalDuration, lessonCount, etc.)
   * @param courseId - The course ID
   */
  updateCachedFields(courseId: string): Promise<void>;
}

// ============================================
// COURSE ERROR TYPES
// ============================================

/**
 * Course error codes for specific error handling
 */
export enum CourseErrorCode {
  // Validation errors
  INVALID_TITLE = 'INVALID_TITLE',
  INVALID_DESCRIPTION = 'INVALID_DESCRIPTION',
  INVALID_YOUTUBE_URL = 'INVALID_YOUTUBE_URL',
  TOO_MANY_TAGS = 'TOO_MANY_TAGS',

  // Business logic errors
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  NOT_COURSE_OWNER = 'NOT_COURSE_OWNER',
  CANNOT_PUBLISH_EMPTY = 'CANNOT_PUBLISH_EMPTY',
  CANNOT_DELETE_WITH_ENROLLMENTS = 'CANNOT_DELETE_WITH_ENROLLMENTS',
  ALREADY_PUBLISHED = 'ALREADY_PUBLISHED',
  NOT_PUBLISHED = 'NOT_PUBLISHED',
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',

  // Authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

/**
 * Custom error class for course-related errors
 */
export class CourseError extends Error {
  constructor(
    message: string,
    public code: CourseErrorCode,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'CourseError';
  }
}

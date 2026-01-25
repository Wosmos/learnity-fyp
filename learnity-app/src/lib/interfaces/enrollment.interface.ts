/**
 * Enrollment Service Interface
 * Defines the contract for enrollment management operations
 *
 * Requirements covered:
 * - 4.1: Course enrollment
 * - 4.2: Enrollment record creation with initial state
 * - 4.3: Duplicate enrollment prevention
 * - 4.4: Student's enrolled courses display
 * - 4.5: Unenrollment with history preservation
 * - 9.1: Teacher analytics - enrollment data
 * - 11.3: Communication link visibility for enrolled students
 */

import {
  Enrollment,
  Course,
  User,
  Category,
  EnrollmentStatus,
} from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';
import { EnrollmentFiltersData } from '@/lib/validators/enrollment';

// ============================================
// ENROLLMENT DTOs AND TYPES
// ============================================

/**
 * Enrollment with course details for student view
 */
export interface EnrollmentWithCourse extends Enrollment {
  course: CourseBasicInfo;
}

/**
 * Enrollment with student details for teacher view
 */
export interface EnrollmentWithStudent extends Enrollment {
  student: StudentBasicInfo;
}

/**
 * Basic course info for enrollment listing
 */
export interface CourseBasicInfo {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  difficulty: string;
  totalDuration: number;
  lessonCount: number;
  averageRating: Decimal;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
  category: Category;
}

/**
 * Basic student info for enrollment listing
 */
export interface StudentBasicInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string | null;
}

/**
 * Paginated enrollments response
 */
export interface PaginatedEnrollments<T> {
  enrollments: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Enrollment creation result
 */
export interface EnrollmentResult {
  enrollment: Enrollment;
  isNewEnrollment: boolean;
}

// ============================================
// ENROLLMENT SERVICE INTERFACE
// ============================================

/**
 * IEnrollmentService - Enrollment management operations interface
 * Implements all enrollment-related business logic
 */
export interface IEnrollmentService {
  /**
   * Enroll a student in a course
   * @param studentId - The ID of the student enrolling
   * @param courseId - The ID of the course to enroll in
   * @returns The created enrollment
   * Requirements: 4.1, 4.2, 4.3
   */
  enrollStudent(studentId: string, courseId: string): Promise<Enrollment>;

  /**
   * Unenroll a student from a course
   * @param studentId - The ID of the student
   * @param courseId - The ID of the course
   * Requirements: 4.5
   */
  unenrollStudent(studentId: string, courseId: string): Promise<void>;

  /**
   * Get a specific enrollment
   * @param studentId - The student ID
   * @param courseId - The course ID
   * @returns The enrollment or null if not found
   */
  getEnrollment(
    studentId: string,
    courseId: string
  ): Promise<Enrollment | null>;

  /**
   * Get all enrollments for a student
   * @param studentId - The student ID
   * @param filters - Optional filters (status, pagination)
   * @returns Paginated enrollments with course details
   * Requirements: 4.4
   */
  getStudentEnrollments(
    studentId: string,
    filters?: EnrollmentFiltersData
  ): Promise<PaginatedEnrollments<EnrollmentWithCourse>>;

  /**
   * Get all enrollments for a course (teacher view)
   * @param courseId - The course ID
   * @param filters - Optional filters (status, pagination)
   * @returns Paginated enrollments with student details
   * Requirements: 9.1
   */
  getCourseEnrollments(
    courseId: string,
    filters?: EnrollmentFiltersData
  ): Promise<PaginatedEnrollments<EnrollmentWithStudent>>;

  /**
   * Check if a student is actively enrolled in a course
   * @param studentId - The student ID
   * @param courseId - The course ID
   * @returns True if the student has an active enrollment
   * Requirements: 11.3
   */
  isEnrolled(studentId: string, courseId: string): Promise<boolean>;

  /**
   * Update enrollment progress
   * @param studentId - The student ID
   * @param courseId - The course ID
   * @param progress - The new progress percentage (0-100)
   * @returns The updated enrollment
   */
  updateProgress(
    studentId: string,
    courseId: string,
    progress: number
  ): Promise<Enrollment>;

  /**
   * Mark enrollment as completed
   * @param studentId - The student ID
   * @param courseId - The course ID
   * @returns The updated enrollment
   */
  markCompleted(studentId: string, courseId: string): Promise<Enrollment>;

  /**
   * Update last accessed timestamp
   * @param studentId - The student ID
   * @param courseId - The course ID
   */
  updateLastAccessed(studentId: string, courseId: string): Promise<void>;

  /**
   * Get enrollment count for a course
   * @param courseId - The course ID
   * @returns The number of active enrollments
   */
  getEnrollmentCount(courseId: string): Promise<number>;
}

// ============================================
// ENROLLMENT ERROR TYPES
// ============================================

/**
 * Enrollment error codes for specific error handling
 */
export enum EnrollmentErrorCode {
  // Business logic errors
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  COURSE_NOT_PUBLISHED = 'COURSE_NOT_PUBLISHED',
  ALREADY_ENROLLED = 'ALREADY_ENROLLED',
  NOT_ENROLLED = 'NOT_ENROLLED',
  ENROLLMENT_NOT_FOUND = 'ENROLLMENT_NOT_FOUND',
  INVALID_PROGRESS = 'INVALID_PROGRESS',

  // Authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

/**
 * Custom error class for enrollment-related errors
 */
export class EnrollmentError extends Error {
  constructor(
    message: string,
    public code: EnrollmentErrorCode,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'EnrollmentError';
  }
}

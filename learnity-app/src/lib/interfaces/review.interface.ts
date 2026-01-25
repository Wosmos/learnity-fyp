/**
 * Review Service Interface
 * Defines the contract for review management operations
 *
 * Requirements covered:
 * - 8.1: Review eligibility (50% progress required)
 * - 8.2: Rating 1-5 with optional comment (10-500 chars)
 * - 8.3: Average rating calculation
 * - 8.4: Course reviews display
 * - 8.5: Review edit/delete with ownership validation
 * - 8.6: One review per student per course
 * - 8.7: Teacher notification on new review
 */

import { Review, User } from '@prisma/client';
import {
  CreateReviewData,
  UpdateReviewData,
  ReviewFiltersData,
} from '@/lib/validators/review';

// ============================================
// REVIEW DTOs AND TYPES
// ============================================

/**
 * Review with student details for display
 */
export interface ReviewWithStudent extends Review {
  student: StudentReviewInfo;
}

/**
 * Basic student info for review display
 */
export interface StudentReviewInfo {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
}

/**
 * Paginated reviews response
 */
export interface PaginatedReviews {
  reviews: ReviewWithStudent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Course rating summary
 */
export interface CourseRating {
  averageRating: number;
  reviewCount: number;
  ratingDistribution: RatingDistribution;
}

/**
 * Rating distribution (count per star)
 */
export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

/**
 * Review eligibility check result
 */
export interface ReviewEligibility {
  canReview: boolean;
  reason?: string;
  enrollmentProgress?: number;
  hasExistingReview?: boolean;
}

// ============================================
// REVIEW SERVICE INTERFACE
// ============================================

/**
 * IReviewService - Review management operations interface
 * Implements all review-related business logic
 */
export interface IReviewService {
  /**
   * Check if a student can review a course
   * @param studentId - The student ID
   * @param courseId - The course ID
   * @returns Eligibility result with reason if not eligible
   * Requirements: 8.1
   */
  canReview(studentId: string, courseId: string): Promise<ReviewEligibility>;

  /**
   * Create a new review
   * @param studentId - The student ID
   * @param data - Review creation data (courseId, rating, comment)
   * @returns The created review
   * Requirements: 8.2, 8.3, 8.6
   */
  createReview(studentId: string, data: CreateReviewData): Promise<Review>;

  /**
   * Update an existing review
   * @param reviewId - The review ID
   * @param studentId - The student ID (for ownership validation)
   * @param data - Review update data
   * @returns The updated review
   * Requirements: 8.5
   */
  updateReview(
    reviewId: string,
    studentId: string,
    data: UpdateReviewData
  ): Promise<Review>;

  /**
   * Delete a review
   * @param reviewId - The review ID
   * @param studentId - The student ID (for ownership validation)
   * Requirements: 8.5
   */
  deleteReview(reviewId: string, studentId: string): Promise<void>;

  /**
   * Get all reviews for a course
   * @param courseId - The course ID
   * @param filters - Optional filters (pagination)
   * @returns Paginated reviews with student info
   * Requirements: 8.4
   */
  getCourseReviews(
    courseId: string,
    filters?: ReviewFiltersData
  ): Promise<PaginatedReviews>;

  /**
   * Get a student's review for a specific course
   * @param studentId - The student ID
   * @param courseId - The course ID
   * @returns The review or null if not found
   */
  getStudentReview(studentId: string, courseId: string): Promise<Review | null>;

  /**
   * Get course rating summary
   * @param courseId - The course ID
   * @returns Rating summary with distribution
   * Requirements: 8.3
   */
  getCourseRating(courseId: string): Promise<CourseRating>;

  /**
   * Recalculate and update course average rating
   * @param courseId - The course ID
   * Requirements: 8.3
   */
  updateCourseRating(courseId: string): Promise<void>;
}

// ============================================
// REVIEW ERROR TYPES
// ============================================

/**
 * Review error codes for specific error handling
 */
export enum ReviewErrorCode {
  // Validation errors
  INVALID_RATING = 'INVALID_RATING',
  INVALID_COMMENT = 'INVALID_COMMENT',

  // Business logic errors
  REVIEW_NOT_FOUND = 'REVIEW_NOT_FOUND',
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  NOT_ENROLLED = 'NOT_ENROLLED',
  INSUFFICIENT_PROGRESS = 'INSUFFICIENT_PROGRESS',
  ALREADY_REVIEWED = 'ALREADY_REVIEWED',
  NOT_REVIEW_OWNER = 'NOT_REVIEW_OWNER',

  // Authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

/**
 * Custom error class for review-related errors
 */
export class ReviewError extends Error {
  constructor(
    message: string,
    public code: ReviewErrorCode,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ReviewError';
  }
}

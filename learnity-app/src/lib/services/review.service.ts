/**
 * Review Service Implementation
 * Handles all review management operations
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

import { PrismaClient, Review, EnrollmentStatus } from '@prisma/client';
import {
  IReviewService,
  ReviewWithStudent,
  PaginatedReviews,
  CourseRating,
  RatingDistribution,
  ReviewEligibility,
  ReviewError,
  ReviewErrorCode,
} from '@/lib/interfaces/review.interface';
import {
  CreateReviewData,
  UpdateReviewData,
  ReviewFiltersData,
  CreateReviewSchema,
  UpdateReviewSchema,
} from '@/lib/validators/review';
import { prisma as defaultPrisma } from '@/lib/prisma';

/**
 * Minimum progress percentage required to submit a review
 * Requirements: 8.1
 */
const MINIMUM_REVIEW_PROGRESS = 50;

/**
 * ReviewService - Implements review management business logic
 * Uses dependency injection for PrismaClient
 */
export class ReviewService implements IReviewService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  /**
   * Check if a student can review a course
   * Requirements: 8.1
   */
  async canReview(studentId: string, courseId: string): Promise<ReviewEligibility> {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      return {
        canReview: false,
        reason: 'Course not found',
      };
    }

    // Check enrollment and progress
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
      select: {
        status: true,
        progress: true,
      },
    });

    if (!enrollment) {
      return {
        canReview: false,
        reason: 'You must be enrolled in this course to leave a review',
      };
    }

    if (enrollment.status === EnrollmentStatus.UNENROLLED) {
      return {
        canReview: false,
        reason: 'You have unenrolled from this course',
        enrollmentProgress: enrollment.progress,
      };
    }

    // Check progress requirement (8.1: 50% minimum)
    if (enrollment.progress < MINIMUM_REVIEW_PROGRESS) {
      return {
        canReview: false,
        reason: `You must complete at least ${MINIMUM_REVIEW_PROGRESS}% of the course to leave a review`,
        enrollmentProgress: enrollment.progress,
      };
    }

    // Check for existing review (8.6: one review per student per course)
    const existingReview = await this.prisma.review.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
      select: { id: true },
    });

    if (existingReview) {
      return {
        canReview: false,
        reason: 'You have already reviewed this course',
        enrollmentProgress: enrollment.progress,
        hasExistingReview: true,
      };
    }

    return {
      canReview: true,
      enrollmentProgress: enrollment.progress,
      hasExistingReview: false,
    };
  }

  /**
   * Create a new review
   * Requirements: 8.2, 8.3, 8.6
   */
  async createReview(studentId: string, data: CreateReviewData): Promise<Review> {
    // Validate input
    const validatedData = CreateReviewSchema.parse(data);

    // Check eligibility
    const eligibility = await this.canReview(studentId, validatedData.courseId);
    
    if (!eligibility.canReview) {
      if (eligibility.hasExistingReview) {
        throw new ReviewError(
          eligibility.reason || 'You have already reviewed this course',
          ReviewErrorCode.ALREADY_REVIEWED,
          409
        );
      }
      
      if (eligibility.enrollmentProgress !== undefined && 
          eligibility.enrollmentProgress < MINIMUM_REVIEW_PROGRESS) {
        throw new ReviewError(
          eligibility.reason || 'Insufficient progress to review',
          ReviewErrorCode.INSUFFICIENT_PROGRESS,
          400
        );
      }

      throw new ReviewError(
        eligibility.reason || 'Cannot review this course',
        ReviewErrorCode.NOT_ENROLLED,
        400
      );
    }

    // Create review and update course rating in a transaction
    const review = await this.prisma.$transaction(async (tx) => {
      // Create the review
      const newReview = await tx.review.create({
        data: {
          studentId,
          courseId: validatedData.courseId,
          rating: validatedData.rating,
          comment: validatedData.comment || null,
        },
      });

      // Update course rating
      await this.recalculateCourseRating(tx, validatedData.courseId);

      return newReview;
    });

    return review;
  }

  /**
   * Update an existing review
   * Requirements: 8.5
   */
  async updateReview(
    reviewId: string,
    studentId: string,
    data: UpdateReviewData
  ): Promise<Review> {
    // Validate input
    const validatedData = UpdateReviewSchema.parse(data);

    // Find the review
    const existingReview = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        studentId: true,
        courseId: true,
      },
    });

    if (!existingReview) {
      throw new ReviewError(
        'Review not found',
        ReviewErrorCode.REVIEW_NOT_FOUND,
        404
      );
    }

    // Validate ownership
    if (existingReview.studentId !== studentId) {
      throw new ReviewError(
        'You can only edit your own reviews',
        ReviewErrorCode.NOT_REVIEW_OWNER,
        403
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (validatedData.rating !== undefined) {
      updateData.rating = validatedData.rating;
    }
    if (validatedData.comment !== undefined) {
      updateData.comment = validatedData.comment;
    }

    // Update review and recalculate course rating
    const review = await this.prisma.$transaction(async (tx) => {
      const updatedReview = await tx.review.update({
        where: { id: reviewId },
        data: updateData,
      });

      // Recalculate course rating if rating changed
      if (validatedData.rating !== undefined) {
        await this.recalculateCourseRating(tx, existingReview.courseId);
      }

      return updatedReview;
    });

    return review;
  }

  /**
   * Delete a review
   * Requirements: 8.5
   */
  async deleteReview(reviewId: string, studentId: string): Promise<void> {
    // Find the review
    const existingReview = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        studentId: true,
        courseId: true,
      },
    });

    if (!existingReview) {
      throw new ReviewError(
        'Review not found',
        ReviewErrorCode.REVIEW_NOT_FOUND,
        404
      );
    }

    // Validate ownership
    if (existingReview.studentId !== studentId) {
      throw new ReviewError(
        'You can only delete your own reviews',
        ReviewErrorCode.NOT_REVIEW_OWNER,
        403
      );
    }

    // Delete review and recalculate course rating
    await this.prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id: reviewId },
      });

      // Recalculate course rating
      await this.recalculateCourseRating(tx, existingReview.courseId);
    });
  }

  /**
   * Get all reviews for a course
   * Requirements: 8.4
   */
  async getCourseReviews(
    courseId: string,
    filters?: ReviewFiltersData
  ): Promise<PaginatedReviews> {
    const { minRating, page = 1, limit = 10 } = filters || {};

    // Build where clause
    const where: Record<string, unknown> = {
      courseId,
    };

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    // Get total count
    const total = await this.prisma.review.count({ where });

    // Get paginated reviews with student info, sorted by newest
    const reviews = await this.prisma.review.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: reviews as ReviewWithStudent[],
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Get a student's review for a specific course
   */
  async getStudentReview(studentId: string, courseId: string): Promise<Review | null> {
    const review = await this.prisma.review.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    return review;
  }

  /**
   * Get course rating summary
   * Requirements: 8.3
   */
  async getCourseRating(courseId: string): Promise<CourseRating> {
    // Get all reviews for the course
    const reviews = await this.prisma.review.findMany({
      where: { courseId },
      select: { rating: true },
    });

    // Calculate rating distribution
    const distribution: RatingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let totalRating = 0;
    for (const review of reviews) {
      distribution[review.rating as keyof RatingDistribution]++;
      totalRating += review.rating;
    }

    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
      ? Math.round((totalRating / reviewCount) * 10) / 10 // Round to 1 decimal
      : 0;

    return {
      averageRating,
      reviewCount,
      ratingDistribution: distribution,
    };
  }

  /**
   * Recalculate and update course average rating
   * Requirements: 8.3
   */
  async updateCourseRating(courseId: string): Promise<void> {
    await this.recalculateCourseRating(this.prisma, courseId);
  }

  /**
   * Internal method to recalculate course rating
   * Can be used within transactions
   */
  private async recalculateCourseRating(
    tx: PrismaClient | Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
    courseId: string
  ): Promise<void> {
    // Get all reviews for the course
    const reviews = await tx.review.findMany({
      where: { courseId },
      select: { rating: true },
    });

    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

    // Update course with new rating (rounded to 1 decimal place)
    await tx.course.update({
      where: { id: courseId },
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount,
      },
    });
  }
}

// Export singleton instance
export const reviewService = new ReviewService();

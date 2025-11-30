import { z } from 'zod';

// ============================================
// REVIEW VALIDATION SCHEMAS
// Requirements: 8.1, 8.2, 8.5, 8.6
// ============================================

/**
 * Schema for creating a course review
 * Requirements: 8.2 - rating 1-5, comment 10-500 chars optional
 */
export const CreateReviewSchema = z.object({
  courseId: z.string()
    .min(1, 'Course ID is required')
    .cuid('Invalid course ID'),
  
  rating: z.number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment must be less than 500 characters')
    .trim()
    .optional(),
});

export type CreateReviewData = z.infer<typeof CreateReviewSchema>;

/**
 * Schema for updating an existing review
 */
export const UpdateReviewSchema = z.object({
  rating: z.number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars')
    .optional(),
  
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment must be less than 500 characters')
    .trim()
    .nullable()
    .optional(),
});

export type UpdateReviewData = z.infer<typeof UpdateReviewSchema>;

/**
 * Schema for review ID parameter validation
 */
export const ReviewIdSchema = z.object({
  reviewId: z.string()
    .min(1, 'Review ID is required')
    .cuid('Invalid review ID'),
});

export type ReviewIdData = z.infer<typeof ReviewIdSchema>;

/**
 * Schema for review filters
 */
export const ReviewFiltersSchema = z.object({
  courseId: z.string()
    .cuid('Invalid course ID')
    .optional(),
  
  minRating: z.number()
    .int('Minimum rating must be an integer')
    .min(1, 'Minimum rating must be at least 1')
    .max(5, 'Minimum rating cannot exceed 5')
    .optional(),
  
  page: z.number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),
  
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
});

export type ReviewFiltersData = z.infer<typeof ReviewFiltersSchema>;

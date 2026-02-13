import { z } from 'zod';

// ============================================
// ENROLLMENT VALIDATION SCHEMAS
// Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
// ============================================

/**
 * Enrollment status enum
 */
export const EnrollmentStatusEnum = z.enum([
  'ACTIVE',
  'COMPLETED',
  'UNENROLLED',
]);
export type EnrollmentStatus = z.infer<typeof EnrollmentStatusEnum>;

/**
 * Schema for enrolling in a course
 */
export const EnrollCourseSchema = z.object({
  courseId: z
    .string()
    .min(1, 'Course ID is required')
    .cuid('Invalid course ID'),
});

export type EnrollCourseData = z.infer<typeof EnrollCourseSchema>;

/**
 * Schema for unenrolling from a course
 */
export const UnenrollCourseSchema = z.object({
  courseId: z
    .string()
    .min(1, 'Course ID is required')
    .cuid('Invalid course ID'),
});

export type UnenrollCourseData = z.infer<typeof UnenrollCourseSchema>;

/**
 * Schema for enrollment filters
 */
export const EnrollmentFiltersSchema = z.object({
  status: EnrollmentStatusEnum.optional(),

  page: z
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),

  limit: z
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(12),
});

export type EnrollmentFiltersData = z.infer<typeof EnrollmentFiltersSchema>;

/**
 * Schema for enrollment ID parameter validation
 */
export const EnrollmentIdSchema = z.object({
  enrollmentId: z
    .string()
    .min(1, 'Enrollment ID is required')
    .cuid('Invalid enrollment ID'),
});

export type EnrollmentIdData = z.infer<typeof EnrollmentIdSchema>;

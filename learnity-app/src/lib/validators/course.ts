import { z } from 'zod';

// ============================================
// COURSE VALIDATION SCHEMAS
// ============================================

/**
 * Difficulty level enum for courses
 */
export const DifficultyEnum = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
export type Difficulty = z.infer<typeof DifficultyEnum>;

/**
 * Course status enum
 */
export const CourseStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED']);
export type CourseStatus = z.infer<typeof CourseStatusEnum>;

/**
 * Schema for creating a new course
 * Requirements: 1.1, 1.4
 */
export const CreateCourseSchema = z.object({
  title: z
    .string()
    .min(3, 'Course title must be at least 3 characters')
    .max(100, 'Course title must be less than 100 characters')
    .trim(),

  description: z
    .string()
    .min(10, 'Course description must be at least 10 characters')
    .max(2000, 'Course description must be less than 2000 characters')
    .trim(),

  categoryId: z
    .string()
    .min(1, 'Category is required')
    .cuid('Invalid category ID'),

  difficulty: DifficultyEnum.default('BEGINNER'),

  tags: z
    .array(z.string().min(1).max(50))
    .max(5, 'Maximum 5 tags allowed')
    .default([]),

  thumbnailUrl: z.string().url('Thumbnail must be a valid URL').optional(),

  isFree: z.boolean().default(true),

  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(9999.99, 'Price cannot exceed $9999.99')
    .optional(),

  requireSequentialProgress: z.boolean().default(false),
});

export type CreateCourseData = z.infer<typeof CreateCourseSchema>;

/**
 * Schema for updating an existing course
 * All fields are optional for partial updates
 */
export const UpdateCourseSchema = z.object({
  title: z
    .string()
    .min(3, 'Course title must be at least 3 characters')
    .max(100, 'Course title must be less than 100 characters')
    .trim()
    .optional(),

  description: z
    .string()
    .min(10, 'Course description must be at least 10 characters')
    .max(2000, 'Course description must be less than 2000 characters')
    .trim()
    .optional(),

  categoryId: z.string().cuid('Invalid category ID').optional(),

  difficulty: DifficultyEnum.optional(),

  tags: z
    .array(z.string().min(1).max(50))
    .max(5, 'Maximum 5 tags allowed')
    .optional(),

  thumbnailUrl: z
    .string()
    .url('Thumbnail must be a valid URL')
    .nullable()
    .optional(),

  isFree: z.boolean().optional(),

  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(9999.99, 'Price cannot exceed $9999.99')
    .nullable()
    .optional(),

  requireSequentialProgress: z.boolean().optional(),

  // Communication fields
  whatsappGroupLink: z
    .string()
    .url('WhatsApp group link must be a valid URL')
    .nullable()
    .optional(),

  contactEmail: z
    .string()
    .email('Contact email must be a valid email address')
    .nullable()
    .optional(),

  contactWhatsapp: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Contact WhatsApp must be a valid phone number'
    )
    .nullable()
    .optional(),
});

export type UpdateCourseData = z.infer<typeof UpdateCourseSchema>;

/**
 * Sort options for course listing
 */
export const CourseSortByEnum = z.enum(['popular', 'rating', 'newest']);
export type CourseSortBy = z.infer<typeof CourseSortByEnum>;

/**
 * Schema for course filters (search/filter)
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
export const CourseFiltersSchema = z.object({
  categoryId: z.string().cuid('Invalid category ID').optional(),

  difficulty: DifficultyEnum.optional(),

  minRating: z
    .number()
    .min(0, 'Minimum rating cannot be negative')
    .max(5, 'Maximum rating is 5')
    .optional(),

  isFree: z.boolean().optional(),

  search: z.string().max(100, 'Search query too long').optional(),

  sortBy: CourseSortByEnum.default('popular'),

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

export type CourseFiltersData = z.infer<typeof CourseFiltersSchema>;

/**
 * Schema for course ID parameter validation
 */
export const CourseIdSchema = z.object({
  courseId: z
    .string()
    .min(1, 'Course ID is required')
    .cuid('Invalid course ID'),
});

export type CourseIdData = z.infer<typeof CourseIdSchema>;

// ============================================
// VALIDATION HELPER FUNCTIONS
// ============================================

/**
 * Validates course title
 * @param title - The title to validate
 * @returns Validation result with isValid flag and optional error message
 */
export function validateCourseTitle(title: string): {
  isValid: boolean;
  error?: string;
} {
  const result = z
    .string()
    .min(3, 'Course title must be at least 3 characters')
    .max(100, 'Course title must be less than 100 characters')
    .safeParse(title);

  return {
    isValid: result.success,
    error: result.success ? undefined : result.error.errors[0]?.message,
  };
}

/**
 * Validates course tags array
 * @param tags - The tags array to validate
 * @returns Validation result with isValid flag and optional error message
 */
export function validateCourseTags(tags: string[]): {
  isValid: boolean;
  error?: string;
} {
  const result = z
    .array(z.string().min(1).max(50))
    .max(5, 'Maximum 5 tags allowed')
    .safeParse(tags);

  return {
    isValid: result.success,
    error: result.success ? undefined : result.error.errors[0]?.message,
  };
}

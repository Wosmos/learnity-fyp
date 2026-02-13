import { z } from 'zod';

// ============================================
// SECTION VALIDATION SCHEMAS
// Requirements: 1.6
// ============================================

/**
 * Schema for creating a new section
 */
export const CreateSectionSchema = z.object({
  courseId: z
    .string()
    .min(1, 'Course ID is required')
    .cuid('Invalid course ID'),

  title: z
    .string()
    .min(1, 'Section title is required')
    .max(200, 'Section title must be less than 200 characters')
    .trim(),

  description: z
    .string()
    .max(1000, 'Section description must be less than 1000 characters')
    .trim()
    .optional(),

  order: z
    .number()
    .int('Order must be an integer')
    .min(0, 'Order cannot be negative'),
});

export type CreateSectionData = z.infer<typeof CreateSectionSchema>;

/**
 * Schema for updating an existing section
 */
export const UpdateSectionSchema = z.object({
  title: z
    .string()
    .min(1, 'Section title is required')
    .max(200, 'Section title must be less than 200 characters')
    .trim()
    .optional(),

  description: z
    .string()
    .max(1000, 'Section description must be less than 1000 characters')
    .trim()
    .nullable()
    .optional(),

  order: z
    .number()
    .int('Order must be an integer')
    .min(0, 'Order cannot be negative')
    .optional(),
});

export type UpdateSectionData = z.infer<typeof UpdateSectionSchema>;

/**
 * Schema for reordering sections
 */
export const ReorderSectionsSchema = z.object({
  courseId: z
    .string()
    .min(1, 'Course ID is required')
    .cuid('Invalid course ID'),

  sectionIds: z
    .array(z.string().cuid('Invalid section ID'))
    .min(1, 'At least one section ID is required'),
});

export type ReorderSectionsData = z.infer<typeof ReorderSectionsSchema>;

/**
 * Schema for section ID parameter validation
 */
export const SectionIdSchema = z.object({
  sectionId: z
    .string()
    .min(1, 'Section ID is required')
    .cuid('Invalid section ID'),
});

export type SectionIdData = z.infer<typeof SectionIdSchema>;

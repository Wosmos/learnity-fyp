import { z } from 'zod';
import { isValidYouTubeUrl } from '@/lib/utils/youtube';

// ============================================
// LESSON VALIDATION SCHEMAS
// Requirements: 1.7, 1.8
// ============================================

/**
 * Lesson type enum
 */
export const LessonTypeEnum = z.enum(['VIDEO', 'QUIZ']);
export type LessonType = z.infer<typeof LessonTypeEnum>;

/**
 * Schema for creating a new lesson
 */
export const CreateLessonSchema = z.object({
  sectionId: z.string()
    .min(1, 'Section ID is required')
    .cuid('Invalid section ID'),
  
  title: z.string()
    .min(1, 'Lesson title is required')
    .max(200, 'Lesson title must be less than 200 characters')
    .trim(),
  
  description: z.string()
    .max(2000, 'Lesson description must be less than 2000 characters')
    .trim()
    .optional(),
  
  type: LessonTypeEnum
    .default('VIDEO'),
  
  youtubeUrl: z.string()
    .refine(
      (url) => !url || isValidYouTubeUrl(url),
      'Invalid YouTube URL. Please use youtube.com/watch or youtu.be format'
    )
    .optional(),
  
  duration: z.number()
    .int('Duration must be an integer')
    .min(0, 'Duration cannot be negative')
    .default(0),
  
  order: z.number()
    .int('Order must be an integer')
    .min(0, 'Order cannot be negative'),
}).refine(
  (data) => {
    // If type is VIDEO, youtubeUrl should be provided
    if (data.type === 'VIDEO' && !data.youtubeUrl) {
      return false;
    }
    return true;
  },
  {
    message: 'YouTube URL is required for video lessons',
    path: ['youtubeUrl'],
  }
);

export type CreateLessonData = z.infer<typeof CreateLessonSchema>;

/**
 * Schema for updating an existing lesson
 */
export const UpdateLessonSchema = z.object({
  title: z.string()
    .min(1, 'Lesson title is required')
    .max(200, 'Lesson title must be less than 200 characters')
    .trim()
    .optional(),
  
  description: z.string()
    .max(2000, 'Lesson description must be less than 2000 characters')
    .trim()
    .nullable()
    .optional(),
  
  type: LessonTypeEnum
    .optional(),
  
  youtubeUrl: z.string()
    .refine(
      (url) => !url || isValidYouTubeUrl(url),
      'Invalid YouTube URL. Please use youtube.com/watch or youtu.be format'
    )
    .nullable()
    .optional(),
  
  duration: z.number()
    .int('Duration must be an integer')
    .min(0, 'Duration cannot be negative')
    .optional(),
  
  order: z.number()
    .int('Order must be an integer')
    .min(0, 'Order cannot be negative')
    .optional(),
});

export type UpdateLessonData = z.infer<typeof UpdateLessonSchema>;

/**
 * Schema for reordering lessons within a section
 */
export const ReorderLessonsSchema = z.object({
  sectionId: z.string()
    .min(1, 'Section ID is required')
    .cuid('Invalid section ID'),
  
  lessonIds: z.array(
    z.string().cuid('Invalid lesson ID')
  ).min(1, 'At least one lesson ID is required'),
});

export type ReorderLessonsData = z.infer<typeof ReorderLessonsSchema>;

/**
 * Schema for lesson ID parameter validation
 */
export const LessonIdSchema = z.object({
  lessonId: z.string()
    .min(1, 'Lesson ID is required')
    .cuid('Invalid lesson ID'),
});

export type LessonIdData = z.infer<typeof LessonIdSchema>;

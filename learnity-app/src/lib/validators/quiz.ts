import { z } from 'zod';

// ============================================
// QUIZ VALIDATION SCHEMAS
// Requirements: 6.1, 6.2
// ============================================

/**
 * Schema for creating a quiz question
 */
export const CreateQuestionSchema = z.object({
  question: z.string()
    .min(5, 'Question must be at least 5 characters')
    .max(500, 'Question must be less than 500 characters')
    .trim(),
  
  options: z.array(
    z.string()
      .min(1, 'Option cannot be empty')
      .max(200, 'Option must be less than 200 characters')
      .trim()
  )
    .min(2, 'At least 2 options are required')
    .max(4, 'Maximum 4 options allowed'),
  
  correctOptionIndex: z.number()
    .int('Correct option index must be an integer')
    .min(0, 'Correct option index cannot be negative'),
  
  explanation: z.string()
    .max(1000, 'Explanation must be less than 1000 characters')
    .trim()
    .optional(),
  
  order: z.number()
    .int('Order must be an integer')
    .min(0, 'Order cannot be negative'),
}).refine(
  (data) => data.correctOptionIndex < data.options.length,
  {
    message: 'Correct option index must be within the options array bounds',
    path: ['correctOptionIndex'],
  }
);

export type CreateQuestionData = z.infer<typeof CreateQuestionSchema>;

/**
 * Schema for updating a quiz question
 */
export const UpdateQuestionSchema = z.object({
  question: z.string()
    .min(5, 'Question must be at least 5 characters')
    .max(500, 'Question must be less than 500 characters')
    .trim()
    .optional(),
  
  options: z.array(
    z.string()
      .min(1, 'Option cannot be empty')
      .max(200, 'Option must be less than 200 characters')
      .trim()
  )
    .min(2, 'At least 2 options are required')
    .max(4, 'Maximum 4 options allowed')
    .optional(),
  
  correctOptionIndex: z.number()
    .int('Correct option index must be an integer')
    .min(0, 'Correct option index cannot be negative')
    .optional(),
  
  explanation: z.string()
    .max(1000, 'Explanation must be less than 1000 characters')
    .trim()
    .nullable()
    .optional(),
  
  order: z.number()
    .int('Order must be an integer')
    .min(0, 'Order cannot be negative')
    .optional(),
});

export type UpdateQuestionData = z.infer<typeof UpdateQuestionSchema>;

/**
 * Schema for creating a new quiz
 */
export const CreateQuizSchema = z.object({
  lessonId: z.string()
    .min(1, 'Lesson ID is required')
    .cuid('Invalid lesson ID'),
  
  title: z.string()
    .min(1, 'Quiz title is required')
    .max(200, 'Quiz title must be less than 200 characters')
    .trim(),
  
  description: z.string()
    .max(1000, 'Quiz description must be less than 1000 characters')
    .trim()
    .optional(),
  
  passingScore: z.number()
    .int('Passing score must be an integer')
    .min(1, 'Passing score must be at least 1%')
    .max(100, 'Passing score cannot exceed 100%')
    .default(70),
  
  questions: z.array(CreateQuestionSchema)
    .min(1, 'At least one question is required')
    .max(50, 'Maximum 50 questions allowed'),
});

export type CreateQuizData = z.infer<typeof CreateQuizSchema>;

/**
 * Schema for updating an existing quiz
 */
export const UpdateQuizSchema = z.object({
  title: z.string()
    .min(1, 'Quiz title is required')
    .max(200, 'Quiz title must be less than 200 characters')
    .trim()
    .optional(),
  
  description: z.string()
    .max(1000, 'Quiz description must be less than 1000 characters')
    .trim()
    .nullable()
    .optional(),
  
  passingScore: z.number()
    .int('Passing score must be an integer')
    .min(1, 'Passing score must be at least 1%')
    .max(100, 'Passing score cannot exceed 100%')
    .optional(),
});

export type UpdateQuizData = z.infer<typeof UpdateQuizSchema>;

/**
 * Schema for quiz ID parameter validation
 */
export const QuizIdSchema = z.object({
  quizId: z.string()
    .min(1, 'Quiz ID is required')
    .cuid('Invalid quiz ID'),
});

export type QuizIdData = z.infer<typeof QuizIdSchema>;

/**
 * Schema for quiz answer submission
 */
export const QuizAnswerSchema = z.object({
  questionId: z.string()
    .min(1, 'Question ID is required')
    .cuid('Invalid question ID'),
  
  selectedOptionIndex: z.number()
    .int('Selected option index must be an integer')
    .min(0, 'Selected option index cannot be negative'),
});

export type QuizAnswerData = z.infer<typeof QuizAnswerSchema>;

/**
 * Schema for submitting quiz attempt
 */
export const SubmitQuizAttemptSchema = z.object({
  quizId: z.string()
    .min(1, 'Quiz ID is required')
    .cuid('Invalid quiz ID'),
  
  answers: z.array(QuizAnswerSchema)
    .min(1, 'At least one answer is required'),
  
  timeTaken: z.number()
    .int('Time taken must be an integer')
    .min(0, 'Time taken cannot be negative')
    .optional(),
});

export type SubmitQuizAttemptData = z.infer<typeof SubmitQuizAttemptSchema>;

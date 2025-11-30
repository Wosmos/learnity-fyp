/**
 * Course Management System Validators
 * 
 * This file re-exports all course management related validation schemas
 * for convenient importing throughout the application.
 */

// Course validators
export {
  DifficultyEnum,
  CourseStatusEnum,
  CreateCourseSchema,
  UpdateCourseSchema,
  CourseSortByEnum,
  CourseFiltersSchema,
  CourseIdSchema,
  validateCourseTitle,
  validateCourseTags,
  type Difficulty,
  type CourseStatus,
  type CreateCourseData,
  type UpdateCourseData,
  type CourseSortBy,
  type CourseFiltersData,
  type CourseIdData,
} from './course';

// Section validators
export {
  CreateSectionSchema,
  UpdateSectionSchema,
  ReorderSectionsSchema,
  SectionIdSchema,
  type CreateSectionData,
  type UpdateSectionData,
  type ReorderSectionsData,
  type SectionIdData,
} from './section';

// Lesson validators
export {
  LessonTypeEnum,
  CreateLessonSchema,
  UpdateLessonSchema,
  ReorderLessonsSchema,
  LessonIdSchema,
  type LessonType,
  type CreateLessonData,
  type UpdateLessonData,
  type ReorderLessonsData,
  type LessonIdData,
} from './lesson';

// Quiz validators
export {
  CreateQuestionSchema,
  UpdateQuestionSchema,
  CreateQuizSchema,
  UpdateQuizSchema,
  QuizIdSchema,
  QuizAnswerSchema,
  SubmitQuizAttemptSchema,
  type CreateQuestionData,
  type UpdateQuestionData,
  type CreateQuizData,
  type UpdateQuizData,
  type QuizIdData,
  type QuizAnswerData,
  type SubmitQuizAttemptData,
} from './quiz';

// Enrollment validators
export {
  EnrollmentStatusEnum,
  EnrollCourseSchema,
  UnenrollCourseSchema,
  EnrollmentFiltersSchema,
  EnrollmentIdSchema,
  type EnrollmentStatus,
  type EnrollCourseData,
  type UnenrollCourseData,
  type EnrollmentFiltersData,
  type EnrollmentIdData,
} from './enrollment';

// Review validators
export {
  CreateReviewSchema,
  UpdateReviewSchema,
  ReviewIdSchema,
  ReviewFiltersSchema,
  type CreateReviewData,
  type UpdateReviewData,
  type ReviewIdData,
  type ReviewFiltersData,
} from './review';

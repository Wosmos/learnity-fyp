/**
 * Course Builder Types
 * Type definitions for the course builder components
 */

import { Difficulty, LessonType } from '@/lib/validators/course-management';

// Course builder step types
export type CourseBuilderStep = 'basic-info' | 'sections' | 'preview';

// Course form data structure
export interface CourseFormData {
  id?: string;
  title: string;
  description: string;
  categoryId: string;
  difficulty: Difficulty;
  tags: string[];
  thumbnailUrl?: string;
  isFree: boolean;
  price?: number;
  requireSequentialProgress: boolean;
  whatsappGroupLink?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';
}

// Section form data
export interface SectionFormData {
  id?: string;
  title: string;
  description?: string;
  order: number;
  lessons: LessonFormData[];
}

// Lesson form data
export interface LessonFormData {
  id?: string;
  title: string;
  description?: string;
  type: LessonType;
  youtubeUrl?: string;
  youtubeId?: string;
  duration: number;
  order: number;
  quiz?: QuizFormData;
}

// Quiz form data
export interface QuizFormData {
  id?: string;
  title: string;
  description?: string;
  passingScore: number;
  questions: QuestionFormData[];
}

// Question form data
export interface QuestionFormData {
  id?: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  order: number;
}

// Category type
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

// YouTube metadata response
export interface YouTubeMetadata {
  title: string;
  duration: number;
  thumbnailUrl?: string;
  videoId: string;
}

// Course builder context
export interface CourseBuilderContextType {
  courseData: CourseFormData;
  sections: SectionFormData[];
  currentStep: CourseBuilderStep;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  errors: Record<string, string>;

  // Actions
  setCourseData: (data: Partial<CourseFormData>) => void;
  setSections: (sections: SectionFormData[]) => void;
  setCurrentStep: (step: CourseBuilderStep) => void;
  addSection: (section: Omit<SectionFormData, 'order'>) => void;
  updateSection: (index: number, section: Partial<SectionFormData>) => void;
  deleteSection: (index: number) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  addLesson: (
    sectionIndex: number,
    lesson: Omit<LessonFormData, 'order'>
  ) => void;
  updateLesson: (
    sectionIndex: number,
    lessonIndex: number,
    lesson: Partial<LessonFormData>
  ) => void;
  deleteLesson: (sectionIndex: number, lessonIndex: number) => void;
  reorderLessons: (
    sectionIndex: number,
    fromIndex: number,
    toIndex: number
  ) => void;
  saveDraft: () => Promise<void>;
  publishCourse: () => Promise<void>;
  validateCourse: () => boolean;
}

// Publish validation result
export interface PublishValidationResult {
  isValid: boolean;
  errors: string[];
  sectionCount: number;
  lessonCount: number;
}

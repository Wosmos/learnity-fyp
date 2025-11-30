/**
 * Section Service Interface
 * Defines the contract for section management operations
 * Requirements: 1.6, 1.9
 */

import { Section, Lesson } from '@prisma/client';
import { CreateSectionData, UpdateSectionData, ReorderSectionsData } from '@/lib/validators/section';

// ============================================
// SECTION DTOs AND TYPES
// ============================================

/**
 * Section with its lessons
 */
export interface SectionWithLessons extends Section {
  lessons: Lesson[];
}

/**
 * Section with lesson count
 */
export interface SectionWithCount extends Section {
  _count: {
    lessons: number;
  };
}

// ============================================
// SECTION SERVICE INTERFACE
// ============================================

/**
 * ISectionService - Section management operations interface
 * Implements all section-related business logic
 */
export interface ISectionService {
  /**
   * Create a new section
   * @param data - Section creation data
   * @returns The created section
   * Requirements: 1.6
   */
  createSection(data: CreateSectionData): Promise<Section>;

  /**
   * Update an existing section
   * @param sectionId - The section ID
   * @param data - Section update data
   * @returns The updated section
   * Requirements: 1.6
   */
  updateSection(sectionId: string, data: UpdateSectionData): Promise<Section>;

  /**
   * Delete a section
   * @param sectionId - The section ID
   * Requirements: 1.6
   */
  deleteSection(sectionId: string): Promise<void>;

  /**
   * Get a section by ID
   * @param sectionId - The section ID
   * @returns The section or null if not found
   */
  getSectionById(sectionId: string): Promise<Section | null>;

  /**
   * Get a section by ID with its lessons
   * @param sectionId - The section ID
   * @returns The section with lessons or null if not found
   */
  getSectionWithLessons(sectionId: string): Promise<SectionWithLessons | null>;

  /**
   * Get all sections for a course
   * @param courseId - The course ID
   * @returns Array of sections ordered by order field
   */
  getSectionsByCourse(courseId: string): Promise<Section[]>;

  /**
   * Reorder sections within a course
   * @param data - Reorder data with courseId and sectionIds in new order
   * Requirements: 1.9
   */
  reorderSections(data: ReorderSectionsData): Promise<void>;

  /**
   * Get the next order number for a new section in a course
   * @param courseId - The course ID
   * @returns The next order number
   */
  getNextOrder(courseId: string): Promise<number>;

  /**
   * Validate that a section belongs to a course owned by a teacher
   * @param sectionId - The section ID
   * @param teacherId - The teacher ID
   * @returns True if the teacher owns the course containing this section
   */
  validateOwnership(sectionId: string, teacherId: string): Promise<boolean>;

  /**
   * Get the course ID for a section
   * @param sectionId - The section ID
   * @returns The course ID or null if section not found
   */
  getCourseIdForSection(sectionId: string): Promise<string | null>;
}

// ============================================
// SECTION ERROR TYPES
// ============================================

/**
 * Section error codes for specific error handling
 */
export enum SectionErrorCode {
  // Validation errors
  INVALID_TITLE = 'INVALID_TITLE',
  INVALID_ORDER = 'INVALID_ORDER',
  
  // Business logic errors
  SECTION_NOT_FOUND = 'SECTION_NOT_FOUND',
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  NOT_COURSE_OWNER = 'NOT_COURSE_OWNER',
  SECTION_HAS_LESSONS = 'SECTION_HAS_LESSONS',
  INVALID_SECTION_IDS = 'INVALID_SECTION_IDS',
  
  // Authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

/**
 * Custom error class for section-related errors
 */
export class SectionError extends Error {
  constructor(
    message: string,
    public code: SectionErrorCode,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'SectionError';
  }
}

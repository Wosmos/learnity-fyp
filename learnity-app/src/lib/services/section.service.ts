/**
 * Section Service Implementation
 * Handles all section management operations
 * 
 * Requirements covered:
 * - 1.6: Section creation, naming, and ordering
 * - 1.9: Reordering sections via drag-and-drop
 */

import { PrismaClient, Section } from '@prisma/client';
import {
  ISectionService,
  SectionWithLessons,
  SectionError,
  SectionErrorCode,
} from '@/lib/interfaces/section.interface';
import {
  CreateSectionData,
  UpdateSectionData,
  ReorderSectionsData,
  CreateSectionSchema,
  UpdateSectionSchema,
  ReorderSectionsSchema,
} from '@/lib/validators/section';
import { prisma as defaultPrisma } from '@/lib/prisma';

/**
 * SectionService - Implements section management business logic
 * Uses dependency injection for PrismaClient
 */
export class SectionService implements ISectionService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  /**
   * Create a new section
   * Requirements: 1.6
   */
  async createSection(data: CreateSectionData): Promise<Section> {
    // Validate input with Zod schema
    const validatedData = CreateSectionSchema.parse(data);

    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: validatedData.courseId },
      select: { id: true },
    });

    if (!course) {
      throw new SectionError(
        'Course not found',
        SectionErrorCode.COURSE_NOT_FOUND,
        404
      );
    }

    // Create section
    const section = await this.prisma.section.create({
      data: {
        courseId: validatedData.courseId,
        title: validatedData.title,
        description: validatedData.description,
        order: validatedData.order,
      },
    });

    return section;
  }

  /**
   * Update an existing section
   * Requirements: 1.6
   */
  async updateSection(sectionId: string, data: UpdateSectionData): Promise<Section> {
    // Validate input
    const validatedData = UpdateSectionSchema.parse(data);

    // Verify section exists
    const existingSection = await this.prisma.section.findUnique({
      where: { id: sectionId },
    });

    if (!existingSection) {
      throw new SectionError(
        'Section not found',
        SectionErrorCode.SECTION_NOT_FOUND,
        404
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.order !== undefined) updateData.order = validatedData.order;

    // Update section
    const section = await this.prisma.section.update({
      where: { id: sectionId },
      data: updateData,
    });

    return section;
  }

  /**
   * Delete a section
   * Requirements: 1.6
   */
  async deleteSection(sectionId: string): Promise<void> {
    // Verify section exists
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: { id: true, courseId: true },
    });

    if (!section) {
      throw new SectionError(
        'Section not found',
        SectionErrorCode.SECTION_NOT_FOUND,
        404
      );
    }

    // Delete section (cascades to lessons due to onDelete: Cascade)
    await this.prisma.section.delete({
      where: { id: sectionId },
    });

    // Reorder remaining sections to maintain sequential order
    const remainingSections = await this.prisma.section.findMany({
      where: { courseId: section.courseId },
      orderBy: { order: 'asc' },
      select: { id: true },
    });

    // Update order for remaining sections
    await Promise.all(
      remainingSections.map((s, index) =>
        this.prisma.section.update({
          where: { id: s.id },
          data: { order: index },
        })
      )
    );
  }

  /**
   * Get a section by ID
   */
  async getSectionById(sectionId: string): Promise<Section | null> {
    return this.prisma.section.findUnique({
      where: { id: sectionId },
    });
  }

  /**
   * Get a section by ID with its lessons
   */
  async getSectionWithLessons(sectionId: string): Promise<SectionWithLessons | null> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return section as SectionWithLessons | null;
  }

  /**
   * Get all sections for a course
   */
  async getSectionsByCourse(courseId: string): Promise<Section[]> {
    return this.prisma.section.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Reorder sections within a course
   * Requirements: 1.9
   */
  async reorderSections(data: ReorderSectionsData): Promise<void> {
    // Validate input
    const validatedData = ReorderSectionsSchema.parse(data);

    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: validatedData.courseId },
      select: { id: true },
    });

    if (!course) {
      throw new SectionError(
        'Course not found',
        SectionErrorCode.COURSE_NOT_FOUND,
        404
      );
    }

    // Verify all section IDs belong to this course
    const sections = await this.prisma.section.findMany({
      where: {
        courseId: validatedData.courseId,
        id: { in: validatedData.sectionIds },
      },
      select: { id: true },
    });

    if (sections.length !== validatedData.sectionIds.length) {
      throw new SectionError(
        'One or more section IDs are invalid or do not belong to this course',
        SectionErrorCode.INVALID_SECTION_IDS,
        400
      );
    }

    // Update order for each section in a transaction
    await this.prisma.$transaction(
      validatedData.sectionIds.map((sectionId, index) =>
        this.prisma.section.update({
          where: { id: sectionId },
          data: { order: index },
        })
      )
    );
  }

  /**
   * Get the next order number for a new section in a course
   */
  async getNextOrder(courseId: string): Promise<number> {
    const lastSection = await this.prisma.section.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return lastSection ? lastSection.order + 1 : 0;
  }

  /**
   * Validate that a section belongs to a course owned by a teacher
   */
  async validateOwnership(sectionId: string, teacherId: string): Promise<boolean> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        course: {
          select: { teacherId: true },
        },
      },
    });

    if (!section) {
      throw new SectionError(
        'Section not found',
        SectionErrorCode.SECTION_NOT_FOUND,
        404
      );
    }

    return section.course.teacherId === teacherId;
  }

  /**
   * Get the course ID for a section
   */
  async getCourseIdForSection(sectionId: string): Promise<string | null> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: { courseId: true },
    });

    return section?.courseId ?? null;
  }
}

// Export singleton instance
export const sectionService = new SectionService();

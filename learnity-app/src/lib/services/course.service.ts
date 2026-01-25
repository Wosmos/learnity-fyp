/**
 * Course Service Implementation
 * Handles all course management operations
 *
 * Requirements covered:
 * - 1.1: Course creation with title, description, category
 * - 1.4: Tag management (max 5 tags)
 * - 1.10: Draft status on creation
 * - 2.1-2.6: Course publishing and management
 * - 3.1-3.5: Course discovery and browsing
 */

import { PrismaClient, Course, CourseStatus, Difficulty } from "@prisma/client";
import {
  ICourseService,
  CourseWithDetails,
  CourseWithTeacher,
  PaginatedCourses,
  PublishValidationResult,
  CourseError,
  CourseErrorCode,
} from "@/lib/interfaces/course.interface";
import {
  CreateCourseData,
  UpdateCourseData,
  CourseFiltersData,
  CreateCourseSchema,
  UpdateCourseSchema,
} from "@/lib/validators/course";
import { prisma as defaultPrisma } from "@/lib/prisma";

/**
 * CourseService - Implements course management business logic
 * Uses dependency injection for PrismaClient
 */
export class CourseService implements ICourseService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  /**
   * Create a new course
   * Requirements: 1.1, 1.10
   */
  async createCourse(
    teacherId: string,
    data: CreateCourseData,
  ): Promise<Course> {
    // Validate input with Zod schema
    const validatedData = CreateCourseSchema.parse(data);

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      throw new CourseError(
        "Category not found",
        CourseErrorCode.CATEGORY_NOT_FOUND,
        404,
      );
    }

    // Generate unique slug from title
    const slug = await this.generateSlug(validatedData.title);

    // Create course with DRAFT status (Requirement 1.10)
    const course = await this.prisma.course.create({
      data: {
        title: validatedData.title,
        slug,
        description: validatedData.description,
        teacherId,
        categoryId: validatedData.categoryId,
        difficulty: validatedData.difficulty as Difficulty,
        tags: validatedData.tags,
        thumbnailUrl: validatedData.thumbnailUrl,
        isFree: validatedData.isFree,
        price: validatedData.price,
        requireSequentialProgress: validatedData.requireSequentialProgress,
        status: CourseStatus.DRAFT, // Always DRAFT on creation
      },
    });

    return course;
  }

  /**
   * Update an existing course
   * Requirements: 2.4
   */
  async updateCourse(
    courseId: string,
    teacherId: string,
    data: UpdateCourseData,
  ): Promise<Course> {
    // Validate ownership
    const isOwner = await this.isOwner(courseId, teacherId);
    if (!isOwner) {
      throw new CourseError(
        "You do not have permission to update this course",
        CourseErrorCode.NOT_COURSE_OWNER,
        403,
      );
    }

    // Validate input
    const validatedData = UpdateCourseSchema.parse(data);

    // If categoryId is being updated, verify it exists
    if (validatedData.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });

      if (!category) {
        throw new CourseError(
          "Category not found",
          CourseErrorCode.CATEGORY_NOT_FOUND,
          404,
        );
      }
    }

    // Build update data, handling null values properly
    const updateData: Record<string, unknown> = {};

    if (validatedData.title !== undefined) {
      updateData.title = validatedData.title;
      // Regenerate slug if title changes
      updateData.slug = await this.generateSlug(validatedData.title);
    }
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.categoryId !== undefined)
      updateData.categoryId = validatedData.categoryId;
    if (validatedData.difficulty !== undefined)
      updateData.difficulty = validatedData.difficulty;
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags;
    if (validatedData.thumbnailUrl !== undefined)
      updateData.thumbnailUrl = validatedData.thumbnailUrl;
    if (validatedData.isFree !== undefined)
      updateData.isFree = validatedData.isFree;
    if (validatedData.price !== undefined)
      updateData.price = validatedData.price;
    if (validatedData.requireSequentialProgress !== undefined) {
      updateData.requireSequentialProgress =
        validatedData.requireSequentialProgress;
    }
    if (validatedData.whatsappGroupLink !== undefined) {
      updateData.whatsappGroupLink = validatedData.whatsappGroupLink;
    }
    if (validatedData.contactEmail !== undefined)
      updateData.contactEmail = validatedData.contactEmail;
    if (validatedData.contactWhatsapp !== undefined)
      updateData.contactWhatsapp = validatedData.contactWhatsapp;

    const course = await this.prisma.course.update({
      where: { id: courseId },
      data: updateData,
    });

    return course;
  }

  /**
   * Publish a course
   * Requirements: 2.1, 2.2
   */
  async publishCourse(courseId: string, teacherId: string): Promise<Course> {
    // Validate ownership
    const isOwner = await this.isOwner(courseId, teacherId);
    if (!isOwner) {
      throw new CourseError(
        "You do not have permission to publish this course",
        CourseErrorCode.NOT_COURSE_OWNER,
        403,
      );
    }

    // Validate course can be published (at least one section with one lesson)
    const validation = await this.validateForPublish(courseId);
    if (!validation.isValid) {
      throw new CourseError(
        validation.errors.join(", "),
        CourseErrorCode.CANNOT_PUBLISH_EMPTY,
        400,
      );
    }

    // Update cached fields before publishing
    await this.updateCachedFields(courseId);

    // Change status to PUBLISHED
    const course = await this.prisma.course.update({
      where: { id: courseId },
      data: {
        status: CourseStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    return course;
  }

  /**
   * Unpublish a course
   * Requirements: 2.3
   */
  async unpublishCourse(courseId: string, teacherId: string): Promise<Course> {
    // Validate ownership
    const isOwner = await this.isOwner(courseId, teacherId);
    if (!isOwner) {
      throw new CourseError(
        "You do not have permission to unpublish this course",
        CourseErrorCode.NOT_COURSE_OWNER,
        403,
      );
    }

    const course = await this.prisma.course.update({
      where: { id: courseId },
      data: {
        status: CourseStatus.UNPUBLISHED,
      },
    });

    return course;
  }

  /**
   * Delete a course
   * Requirements: 2.5, 2.6
   */
  async deleteCourse(courseId: string, teacherId: string): Promise<void> {
    // Validate ownership
    const isOwner = await this.isOwner(courseId, teacherId);
    if (!isOwner) {
      throw new CourseError(
        "You do not have permission to delete this course",
        CourseErrorCode.NOT_COURSE_OWNER,
        403,
      );
    }

    // Get course with enrollment count
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      throw new CourseError(
        "Course not found",
        CourseErrorCode.COURSE_NOT_FOUND,
        404,
      );
    }

    // Only allow deletion of DRAFT courses or courses with no enrollments
    if (course.status !== CourseStatus.DRAFT && course._count.enrollments > 0) {
      throw new CourseError(
        "Cannot delete a published course with enrolled students. Please unpublish instead.",
        CourseErrorCode.CANNOT_DELETE_WITH_ENROLLMENTS,
        400,
      );
    }

    // Delete the course (cascades to sections, lessons, etc.)
    await this.prisma.course.delete({
      where: { id: courseId },
    });
  }

  /**
   * Get course by ID with all details
   * Requirements: 3.5, 5.1
   */
  async getCourseById(courseId: string): Promise<CourseWithDetails | null> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        category: true,
        sections: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    return course as CourseWithDetails | null;
  }

  /**
   * Get course by slug
   */
  async getCourseBySlug(slug: string): Promise<CourseWithDetails | null> {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        category: true,
        sections: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: {
                quiz: {
                  include: {
                    questions: {
                      orderBy: { order: "asc" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return course as CourseWithDetails | null;
  }

  /**
   * Get all courses by a teacher
   * Requirements: 3.5, 5.1
   */
  async getCoursesByTeacher(teacherId: string): Promise<CourseWithTeacher[]> {
    const courses = await this.prisma.course.findMany({
      where: { teacherId },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return courses as CourseWithTeacher[];
  }

  /**
   * Get published courses with filtering and pagination
   * Requirements: 3.1, 3.2, 3.4
   */
  async getPublishedCourses(
    filters: CourseFiltersData,
  ): Promise<PaginatedCourses> {
    const { categoryId, difficulty, minRating, isFree, sortBy, page, limit } =
      filters;

    // Build where clause
    const where: Record<string, unknown> = {
      status: CourseStatus.PUBLISHED,
    };

    if (categoryId) where.categoryId = categoryId;
    if (difficulty) where.difficulty = difficulty;
    if (minRating !== undefined) where.averageRating = { gte: minRating };
    if (isFree !== undefined) where.isFree = isFree;

    // Build orderBy clause
    let orderBy: Record<string, string> = {};
    switch (sortBy) {
      case "popular":
        orderBy = { enrollmentCount: "desc" };
        break;
      case "rating":
        orderBy = { averageRating: "desc" };
        break;
      case "newest":
        orderBy = { publishedAt: "desc" };
        break;
      default:
        orderBy = { enrollmentCount: "desc" };
    }

    // Get total count
    const total = await this.prisma.course.count({ where });

    // Get paginated courses
    const courses = await this.prisma.course.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      courses: courses as any,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Search courses by title, description, and tags
   * Requirements: 3.3
   */
  async searchCourses(
    query: string,
    filters: CourseFiltersData,
  ): Promise<PaginatedCourses> {
    const { categoryId, difficulty, minRating, isFree, sortBy, page, limit } =
      filters;

    // Build where clause with search
    const where: Record<string, unknown> = {
      status: CourseStatus.PUBLISHED,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
      ],
    };

    if (categoryId) where.categoryId = categoryId;
    if (difficulty) where.difficulty = difficulty;
    if (minRating !== undefined) where.averageRating = { gte: minRating };
    if (isFree !== undefined) where.isFree = isFree;

    // Build orderBy clause
    let orderBy: Record<string, string> = {};
    switch (sortBy) {
      case "popular":
        orderBy = { enrollmentCount: "desc" };
        break;
      case "rating":
        orderBy = { averageRating: "desc" };
        break;
      case "newest":
        orderBy = { publishedAt: "desc" };
        break;
      default:
        orderBy = { enrollmentCount: "desc" };
    }

    // Get total count
    const total = await this.prisma.course.count({ where });

    // Get paginated courses
    const courses = await this.prisma.course.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
        category: {
          select: { id: true, name: true, slug: true }
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      courses: courses as any,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Validate if a course can be published
   */
  async validateForPublish(courseId: string): Promise<PublishValidationResult> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      return {
        isValid: false,
        errors: ["Course not found"],
        sectionCount: 0,
        lessonCount: 0,
      };
    }

    const errors: string[] = [];
    const sectionCount = course.sections.length;
    const lessonCount = course.sections.reduce(
      (total, section) => total + section.lessons.length,
      0,
    );

    // Requirement 2.1: At least one section with one lesson
    if (sectionCount === 0) {
      errors.push("Course must have at least one section");
    }

    if (lessonCount === 0) {
      errors.push("Course must have at least one lesson");
    }

    // Check if any section has lessons
    const sectionsWithLessons = course.sections.filter(
      (section) => section.lessons.length > 0,
    );
    if (sectionCount > 0 && sectionsWithLessons.length === 0) {
      errors.push("At least one section must contain a lesson");
    }

    return {
      isValid: errors.length === 0,
      errors,
      sectionCount,
      lessonCount,
    };
  }

  /**
   * Check if a user is the owner of a course
   */
  async isOwner(courseId: string, teacherId: string): Promise<boolean> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true },
    });

    if (!course) {
      throw new CourseError(
        "Course not found",
        CourseErrorCode.COURSE_NOT_FOUND,
        404,
      );
    }

    return course.teacherId === teacherId;
  }

  /**
   * Generate a unique slug from a title
   */
  async generateSlug(title: string): Promise<string> {
    // Convert to lowercase, replace spaces with hyphens, remove special chars
    let baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug exists
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.course.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existing) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Update cached fields (totalDuration, lessonCount, etc.)
   */
  async updateCachedFields(courseId: string): Promise<void> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            lessons: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    if (!course) return;

    // Calculate totals
    let totalDuration = 0;
    let lessonCount = 0;

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        lessonCount++;
        totalDuration += lesson.duration;
      }
    }

    // Calculate average rating
    const reviews = await this.prisma.review.findMany({
      where: { courseId },
      select: { rating: true },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    // Pick a thumbnail if missing
    let thumbnailUrl = course.thumbnailUrl;
    if (!thumbnailUrl) {
      // Find the first video lesson with a youtubeId
      for (const section of course.sections) {
        const firstVideo = section.lessons.find(
          (l) => l.type === "VIDEO" && l.youtubeId,
        );
        if (firstVideo) {
          thumbnailUrl = `https://img.youtube.com/vi/${firstVideo.youtubeId}/mqdefault.jpg`;
          break;
        }
      }
    }

    // Update course
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        totalDuration,
        lessonCount,
        thumbnailUrl,
        enrollmentCount: course._count.enrollments,
        reviewCount: course._count.reviews,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      },
    });
  }
}

// Export singleton instance
export const courseService = new CourseService();

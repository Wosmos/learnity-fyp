/**
 * Lesson Service Implementation
 * Handles all lesson management operations
 *
 * Requirements covered:
 * - 1.7: Adding YouTube video links as lessons with title and duration
 * - 1.8: Validating YouTube URLs and extracting video metadata
 * - 1.9: Reordering lessons via drag-and-drop
 */

import { PrismaClient, Lesson, LessonType } from '@prisma/client';
import {
  ILessonService,
  LessonWithQuiz,
  CreateLessonResult,
  YouTubeValidationResult,
  LessonError,
  LessonErrorCode,
} from '@/lib/interfaces/lesson.interface';
import {
  CreateLessonData,
  UpdateLessonData,
  ReorderLessonsData,
  CreateLessonSchema,
  UpdateLessonSchema,
  ReorderLessonsSchema,
} from '@/lib/validators/lesson';
import {
  extractYouTubeVideoId,
  isValidYouTubeUrl,
  fetchYouTubeMetadata,
  YouTubeMetadata,
} from '@/lib/utils/youtube';
import { prisma as defaultPrisma } from '@/lib/prisma';

/**
 * LessonService - Implements lesson management business logic
 * Uses dependency injection for PrismaClient
 */
export class LessonService implements ILessonService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  /**
   * Create a new lesson
   * Requirements: 1.7
   */
  async createLesson(data: CreateLessonData): Promise<CreateLessonResult> {
    // Validate input with Zod schema
    const validatedData = CreateLessonSchema.parse(data);

    // Verify section exists and get course ID
    const section = await this.prisma.section.findUnique({
      where: { id: validatedData.sectionId },
      select: { id: true, courseId: true },
    });

    if (!section) {
      throw new LessonError(
        'Section not found',
        LessonErrorCode.SECTION_NOT_FOUND,
        404
      );
    }

    // Extract YouTube video ID and fetch metadata if it's a video lesson
    let youtubeId: string | null = null;
    let youtubeMetadata: YouTubeMetadata | null = null;
    const duration = validatedData.duration;

    if (validatedData.type === 'VIDEO' && validatedData.youtubeUrl) {
      youtubeId = extractYouTubeVideoId(validatedData.youtubeUrl);

      if (!youtubeId) {
        throw new LessonError(
          'Invalid YouTube URL. Please use youtube.com/watch or youtu.be format',
          LessonErrorCode.INVALID_YOUTUBE_URL,
          400
        );
      }

      // Fetch metadata (optional - don't fail if it doesn't work)
      youtubeMetadata = await fetchYouTubeMetadata(youtubeId);
    }

    // Create lesson
    const lesson = await this.prisma.lesson.create({
      data: {
        sectionId: validatedData.sectionId,
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type as LessonType,
        youtubeUrl: validatedData.youtubeUrl,
        youtubeId,
        duration,
        order: validatedData.order,
      },
    });

    // Update course cached fields
    await this.updateCourseCachedFields(section.courseId);

    return {
      lesson,
      youtubeMetadata,
    };
  }

  /**
   * Update an existing lesson
   * Requirements: 1.7
   */
  async updateLesson(
    lessonId: string,
    data: UpdateLessonData
  ): Promise<Lesson> {
    // Validate input
    const validatedData = UpdateLessonSchema.parse(data);

    // Verify lesson exists
    const existingLesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          select: { courseId: true },
        },
      },
    });

    if (!existingLesson) {
      throw new LessonError(
        'Lesson not found',
        LessonErrorCode.LESSON_NOT_FOUND,
        404
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (validatedData.title !== undefined)
      updateData.title = validatedData.title;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    if (validatedData.duration !== undefined)
      updateData.duration = validatedData.duration;
    if (validatedData.order !== undefined)
      updateData.order = validatedData.order;

    // Handle YouTube URL update
    if (validatedData.youtubeUrl !== undefined) {
      if (validatedData.youtubeUrl) {
        const youtubeId = extractYouTubeVideoId(validatedData.youtubeUrl);

        if (!youtubeId) {
          throw new LessonError(
            'Invalid YouTube URL. Please use youtube.com/watch or youtu.be format',
            LessonErrorCode.INVALID_YOUTUBE_URL,
            400
          );
        }

        updateData.youtubeUrl = validatedData.youtubeUrl;
        updateData.youtubeId = youtubeId;
      } else {
        updateData.youtubeUrl = null;
        updateData.youtubeId = null;
      }
    }

    // Update lesson
    const lesson = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
    });

    // Update course cached fields if duration changed
    if (validatedData.duration !== undefined) {
      await this.updateCourseCachedFields(existingLesson.section.courseId);
    }

    return lesson;
  }

  /**
   * Delete a lesson
   * Requirements: 1.7
   */
  async deleteLesson(lessonId: string): Promise<void> {
    // Verify lesson exists and get section/course info
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          select: { id: true, courseId: true },
        },
      },
    });

    if (!lesson) {
      throw new LessonError(
        'Lesson not found',
        LessonErrorCode.LESSON_NOT_FOUND,
        404
      );
    }

    const { sectionId, courseId } = {
      sectionId: lesson.section.id,
      courseId: lesson.section.courseId,
    };

    // Delete lesson (cascades to quiz and progress due to onDelete: Cascade)
    await this.prisma.lesson.delete({
      where: { id: lessonId },
    });

    // Reorder remaining lessons to maintain sequential order
    const remainingLessons = await this.prisma.lesson.findMany({
      where: { sectionId },
      orderBy: { order: 'asc' },
      select: { id: true },
    });

    // Update order for remaining lessons
    await Promise.all(
      remainingLessons.map((l, index) =>
        this.prisma.lesson.update({
          where: { id: l.id },
          data: { order: index },
        })
      )
    );

    // Update course cached fields
    await this.updateCourseCachedFields(courseId);
  }

  /**
   * Get a lesson by ID
   */
  async getLessonById(lessonId: string): Promise<Lesson | null> {
    return this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
  }

  /**
   * Get a lesson by ID with its quiz
   */
  async getLessonWithQuiz(lessonId: string): Promise<LessonWithQuiz | null> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        quiz: true,
      },
    });

    return lesson as LessonWithQuiz | null;
  }

  /**
   * Get all lessons for a section
   */
  async getLessonsBySection(sectionId: string): Promise<Lesson[]> {
    return this.prisma.lesson.findMany({
      where: { sectionId },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Reorder lessons within a section
   * Requirements: 1.9
   */
  async reorderLessons(data: ReorderLessonsData): Promise<void> {
    // Validate input
    const validatedData = ReorderLessonsSchema.parse(data);

    // Verify section exists
    const section = await this.prisma.section.findUnique({
      where: { id: validatedData.sectionId },
      select: { id: true },
    });

    if (!section) {
      throw new LessonError(
        'Section not found',
        LessonErrorCode.SECTION_NOT_FOUND,
        404
      );
    }

    // Verify all lesson IDs belong to this section
    const lessons = await this.prisma.lesson.findMany({
      where: {
        sectionId: validatedData.sectionId,
        id: { in: validatedData.lessonIds },
      },
      select: { id: true },
    });

    if (lessons.length !== validatedData.lessonIds.length) {
      throw new LessonError(
        'One or more lesson IDs are invalid or do not belong to this section',
        LessonErrorCode.INVALID_LESSON_IDS,
        400
      );
    }

    // Update order for each lesson in a transaction
    await this.prisma.$transaction(
      validatedData.lessonIds.map((lessonId, index) =>
        this.prisma.lesson.update({
          where: { id: lessonId },
          data: { order: index },
        })
      )
    );
  }

  /**
   * Validate a YouTube URL and fetch metadata
   * Requirements: 1.8
   */
  async validateYouTubeUrl(url: string): Promise<YouTubeValidationResult> {
    if (!url || typeof url !== 'string') {
      return {
        isValid: false,
        videoId: null,
        metadata: null,
        error: 'YouTube URL is required',
      };
    }

    const videoId = extractYouTubeVideoId(url);

    if (!videoId) {
      return {
        isValid: false,
        videoId: null,
        metadata: null,
        error:
          'Invalid YouTube URL. Please use youtube.com/watch or youtu.be format',
      };
    }

    // Fetch metadata
    const metadata = await fetchYouTubeMetadata(videoId);

    if (!metadata) {
      return {
        isValid: false,
        videoId,
        metadata: null,
        error:
          'Could not fetch video metadata. Please check if the video exists and is public.',
      };
    }

    return {
      isValid: true,
      videoId,
      metadata,
    };
  }

  /**
   * Get the next order number for a new lesson in a section
   */
  async getNextOrder(sectionId: string): Promise<number> {
    const lastLesson = await this.prisma.lesson.findFirst({
      where: { sectionId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return lastLesson ? lastLesson.order + 1 : 0;
  }

  /**
   * Validate that a lesson belongs to a course owned by a teacher
   */
  async validateOwnership(
    lessonId: string,
    teacherId: string
  ): Promise<boolean> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: {
              select: { teacherId: true },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new LessonError(
        'Lesson not found',
        LessonErrorCode.LESSON_NOT_FOUND,
        404
      );
    }

    return lesson.section.course.teacherId === teacherId;
  }

  /**
   * Get the section ID for a lesson
   */
  async getSectionIdForLesson(lessonId: string): Promise<string | null> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { sectionId: true },
    });

    return lesson?.sectionId ?? null;
  }

  /**
   * Get the course ID for a lesson
   */
  async getCourseIdForLesson(lessonId: string): Promise<string | null> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          select: { courseId: true },
        },
      },
    });

    return lesson?.section.courseId ?? null;
  }

  /**
   * Update course cached fields after lesson changes
   * Updates totalDuration and lessonCount
   */
  async updateCourseCachedFields(courseId: string): Promise<void> {
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
          l => l.type === 'VIDEO' && l.youtubeId
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
        enrollmentCount:
          (course as any)._count?.enrollments || course.enrollmentCount,
        reviewCount: (course as any)._count?.reviews || course.reviewCount,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    });
  }
}

// Export singleton instance
export const lessonService = new LessonService();

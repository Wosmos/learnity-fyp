/**
 * Progress Service Implementation
 * Handles all progress tracking operations
 *
 * Requirements covered:
 * - 5.3: Track video watch progress and mark lesson complete when 90% watched
 * - 5.4: Award 10 XP points when lesson is completed
 * - 5.5: Allow manual lesson completion
 * - 5.6: Remember last watched position and resume
 * - 5.7: Show next lesson recommendation
 * - 5.8: Lock subsequent sections until previous section is 80% complete
 * - 7.1: Display overall course progress percentage
 * - 7.3: Display section-wise progress bars
 * - 7.4: Mark course as completed when all lessons and quizzes done
 * - 7.5: Update student's daily streak
 * - 7.7: Show time spent on course
 */

import {
  PrismaClient,
  LessonProgress,
  EnrollmentStatus,
  XPReason,
  QuestType,
} from '@prisma/client';
import {
  IProgressService,
  CourseProgress,
  SectionProgress,
  LessonProgressSummary,
  MarkCompleteResult,
  UpdateProgressResult,
  NextLessonRecommendation,
  ProgressError,
  ProgressErrorCode,
} from '@/lib/interfaces/progress.interface';
import { prisma as defaultPrisma } from '@/lib/prisma';
import { gamificationService } from '@/lib/services/gamification.service';
import { XP_AMOUNTS } from '@/lib/interfaces/gamification.interface';

/** Completion threshold - lesson is auto-completed when 90% watched */
const COMPLETION_THRESHOLD = 0.9;

/** XP awarded for completing a lesson */
const LESSON_COMPLETE_XP = 10;

/** Section unlock threshold - 80% of previous section must be complete */
const SECTION_UNLOCK_THRESHOLD = 0.8;

/**
 * ProgressService - Implements progress tracking business logic
 * Uses dependency injection for PrismaClient
 */
export class ProgressService implements IProgressService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  /**
   * Update video watch progress
   * Requirements: 5.3, 5.6
   */
  async updateVideoProgress(
    studentId: string,
    lessonId: string,
    watchedSeconds: number,
    lastPosition?: number
  ): Promise<UpdateProgressResult> {
    // Validate input
    if (watchedSeconds < 0) {
      throw new ProgressError(
        'Watched seconds cannot be negative',
        ProgressErrorCode.INVALID_PROGRESS,
        400
      );
    }

    // Get lesson with section and course info
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: {
              select: { id: true, requireSequentialProgress: true },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new ProgressError(
        'Lesson not found',
        ProgressErrorCode.LESSON_NOT_FOUND,
        404
      );
    }

    const courseId = lesson.section.course.id;

    // Verify student is enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
    });

    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new ProgressError(
        'You must be enrolled in this course to track progress',
        ProgressErrorCode.NOT_ENROLLED,
        403
      );
    }

    // Check if lesson is unlocked (if sequential progress is required)
    const requireSequential =
      lesson.section.course.requireSequentialProgress !== false;
    if (requireSequential) {
      const isUnlocked = await this.isLessonUnlocked(studentId, lessonId);
      if (!isUnlocked) {
        throw new ProgressError(
          'This lesson is locked. Complete the previous lesson first.',
          ProgressErrorCode.SECTION_LOCKED, // Reusing error code for simplicity
          403
        );
      }
    }

    // Get or create lesson progress
    let lessonProgress = await this.prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: { studentId, lessonId },
      },
    });

    // Check if already completed
    if (lessonProgress?.completed) {
      // Just update last position for resume functionality
      const updated = await this.prisma.lessonProgress.update({
        where: { id: lessonProgress.id },
        data: {
          lastPosition: lastPosition ?? watchedSeconds,
        },
      });
      return {
        lessonProgress: updated,
        autoCompleted: false,
      };
    }

    // Calculate if should auto-complete (90% threshold)
    const shouldAutoComplete =
      lesson.duration > 0 &&
      watchedSeconds >= lesson.duration * COMPLETION_THRESHOLD;

    // Update or create progress
    if (lessonProgress) {
      lessonProgress = await this.prisma.lessonProgress.update({
        where: { id: lessonProgress.id },
        data: {
          watchedSeconds: Math.max(
            lessonProgress.watchedSeconds,
            watchedSeconds
          ),
          lastPosition: lastPosition ?? watchedSeconds,
          completed: shouldAutoComplete,
          completedAt: shouldAutoComplete ? new Date() : null,
        },
      });
    } else {
      lessonProgress = await this.prisma.lessonProgress.create({
        data: {
          studentId,
          lessonId,
          watchedSeconds,
          lastPosition: lastPosition ?? watchedSeconds,
          completed: shouldAutoComplete,
          completedAt: shouldAutoComplete ? new Date() : null,
        },
      });
    }

    // If auto-completed, award XP and update enrollment
    let xpAwarded: number | undefined;
    if (shouldAutoComplete) {
      xpAwarded = await this.awardLessonXP(studentId, lessonId);
      await this.updateEnrollmentProgress(studentId, courseId);
      await this.updateStreak(studentId);
    }

    // Update enrollment last accessed
    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { lastAccessedAt: new Date() },
    });

    return {
      lessonProgress,
      autoCompleted: shouldAutoComplete,
      xpAwarded,
    };
  }

  /**
   * Mark a lesson as complete
   * Requirements: 5.4, 5.5, 7.5
   */
  async markLessonComplete(
    studentId: string,
    lessonId: string
  ): Promise<MarkCompleteResult> {
    // Get lesson with section and course info
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: {
              select: { id: true, requireSequentialProgress: true },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new ProgressError(
        'Lesson not found',
        ProgressErrorCode.LESSON_NOT_FOUND,
        404
      );
    }

    const courseId = lesson.section.course.id;

    // Verify student is enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
    });

    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new ProgressError(
        'You must be enrolled in this course to mark lessons complete',
        ProgressErrorCode.NOT_ENROLLED,
        403
      );
    }

    // Check if lesson is unlocked
    const requireSequential =
      lesson.section.course.requireSequentialProgress !== false;
    if (requireSequential) {
      const isUnlocked = await this.isLessonUnlocked(studentId, lessonId);
      if (!isUnlocked) {
        throw new ProgressError(
          'This lesson is locked. Complete the previous lesson first.',
          ProgressErrorCode.SECTION_LOCKED,
          403
        );
      }
    }

    // Get or create lesson progress
    let lessonProgress = await this.prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: { studentId, lessonId },
      },
    });

    // Check if already completed
    const wasAlreadyCompleted = lessonProgress?.completed ?? false;

    // Update or create progress
    if (lessonProgress) {
      if (!lessonProgress.completed) {
        lessonProgress = await this.prisma.lessonProgress.update({
          where: { id: lessonProgress.id },
          data: {
            completed: true,
            completedAt: new Date(),
            watchedSeconds: Math.max(
              lessonProgress.watchedSeconds,
              lesson.duration
            ),
          },
        });
      }
    } else {
      lessonProgress = await this.prisma.lessonProgress.create({
        data: {
          studentId,
          lessonId,
          completed: true,
          completedAt: new Date(),
          watchedSeconds: lesson.duration,
          lastPosition: lesson.duration,
        },
      });
    }

    // Award XP only if not already completed
    let xpAwarded = 0;
    if (!wasAlreadyCompleted) {
      xpAwarded = await this.awardLessonXP(studentId, lessonId);
    }

    // Update streak
    const newStreak = await this.updateStreak(studentId);

    // Update enrollment progress
    const enrollmentProgress = await this.updateEnrollmentProgress(
      studentId,
      courseId
    );

    // Check if course is completed
    const courseCompleted = await this.checkCourseCompletion(
      studentId,
      courseId
    );

    // Update enrollment last accessed
    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { lastAccessedAt: new Date() },
    });

    return {
      lessonProgress,
      xpAwarded,
      newStreak,
      enrollmentProgress,
      courseCompleted,
    };
  }

  /**
   * Get lesson progress for a student
   */
  async getLessonProgress(
    studentId: string,
    lessonId: string
  ): Promise<LessonProgress | null> {
    return this.prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: { studentId, lessonId },
      },
    });
  }

  /**
   * Get overall course progress for a student
   * Requirements: 7.1
   */
  async getCourseProgress(
    studentId: string,
    courseId: string
  ): Promise<CourseProgress> {
    // Get course with all sections and lessons
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!course) {
      throw new ProgressError(
        'Course not found',
        ProgressErrorCode.COURSE_NOT_FOUND,
        404
      );
    }

    // Get enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
    });

    if (!enrollment) {
      throw new ProgressError(
        'You are not enrolled in this course',
        ProgressErrorCode.NOT_ENROLLED,
        403
      );
    }

    // Get all lesson progress for this student in this course
    const allLessonIds = course.sections.flatMap(s => s.lessons.map(l => l.id));
    const progressRecords = await this.prisma.lessonProgress.findMany({
      where: {
        studentId,
        lessonId: { in: allLessonIds },
      },
    });

    // Create a map for quick lookup
    const progressMap = new Map(progressRecords.map(p => [p.lessonId, p]));

    // Calculate totals
    let totalLessons = 0;
    let completedLessons = 0;
    const completedLessonIds: string[] = [];
    let totalDuration = 0;
    let watchedDuration = 0;

    // Build section progress
    const sections: SectionProgress[] = [];
    let previousSectionComplete = true; // First section is always unlocked

    for (const section of course.sections) {
      let sectionCompletedLessons = 0;
      const lessons: LessonProgressSummary[] = [];

      for (const lesson of section.lessons) {
        totalLessons++;
        totalDuration += lesson.duration;

        const progress = progressMap.get(lesson.id);
        const isCompleted = progress?.completed ?? false;

        if (isCompleted) {
          completedLessons++;
          sectionCompletedLessons++;
          completedLessonIds.push(lesson.id);
        }

        watchedDuration += progress?.watchedSeconds ?? 0;

        lessons.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          order: lesson.order,
          type: lesson.type,
          duration: lesson.duration,
          watchedSeconds: progress?.watchedSeconds ?? 0,
          lastPosition: progress?.lastPosition ?? 0,
          completed: isCompleted,
          completedAt: progress?.completedAt,
        });
      }

      const sectionTotalLessons = section.lessons.length;
      const sectionProgressPercentage =
        sectionTotalLessons > 0
          ? Math.round((sectionCompletedLessons / sectionTotalLessons) * 100)
          : 0;

      // Determine if section is unlocked
      const isUnlocked = course.requireSequentialProgress
        ? previousSectionComplete
        : true;

      sections.push({
        sectionId: section.id,
        sectionTitle: section.title,
        order: section.order,
        totalLessons: sectionTotalLessons,
        completedLessons: sectionCompletedLessons,
        completedLessonIds: lessons
          .filter(l => l.completed)
          .map(l => l.lessonId),
        progressPercentage: sectionProgressPercentage,
        isUnlocked,
        lessons,
      });

      // Update for next section - unlocked if this section is 80% complete
      previousSectionComplete =
        sectionProgressPercentage >= SECTION_UNLOCK_THRESHOLD * 100;
    }

    // Calculate overall progress percentage
    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return {
      courseId,
      studentId,
      totalLessons,
      completedLessons,
      completedLessonIds,
      progressPercentage,
      totalDuration,
      watchedDuration,
      sections,
      isCompleted: enrollment.status === EnrollmentStatus.COMPLETED,
      completedAt: enrollment.completedAt,
    };
  }

  /**
   * Get section progress percentage
   * Requirements: 7.3
   */
  async getSectionProgress(
    studentId: string,
    sectionId: string
  ): Promise<number> {
    // Get section with lessons
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        lessons: {
          select: { id: true },
        },
      },
    });

    if (!section) {
      throw new ProgressError(
        'Section not found',
        ProgressErrorCode.SECTION_NOT_FOUND,
        404
      );
    }

    if (section.lessons.length === 0) {
      return 0;
    }

    // Get completed lessons count
    const lessonIds = section.lessons.map(l => l.id);
    const completedCount = await this.prisma.lessonProgress.count({
      where: {
        studentId,
        lessonId: { in: lessonIds },
        completed: true,
      },
    });

    return Math.round((completedCount / section.lessons.length) * 100);
  }

  /**
   * Check if a section is unlocked for a student
   * Requirements: 5.8
   */
  async isSectionUnlocked(
    studentId: string,
    sectionId: string
  ): Promise<boolean> {
    // Get section with course info
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        course: {
          select: { id: true, requireSequentialProgress: true },
          include: {
            sections: {
              orderBy: { order: 'asc' },
              select: { id: true, order: true },
            },
          },
        },
      },
    });

    if (!section) {
      throw new ProgressError(
        'Section not found',
        ProgressErrorCode.SECTION_NOT_FOUND,
        404
      );
    }

    // If sequential progress is not required, all sections are unlocked
    if (!section.course.requireSequentialProgress) {
      return true;
    }

    // First section is always unlocked
    if (section.order === 0) {
      return true;
    }

    // Find the previous section
    const previousSection = section.course.sections.find(
      s => s.order === section.order - 1
    );

    if (!previousSection) {
      // No previous section found, unlock this one
      return true;
    }

    // Check if previous section is at least 80% complete
    const previousProgress = await this.getSectionProgress(
      studentId,
      previousSection.id
    );
    return previousProgress >= SECTION_UNLOCK_THRESHOLD * 100;
  }

  /**
   * Check if a lesson is unlocked for a student
   * Enforces sequential lesson flow within and across sections
   */
  async isLessonUnlocked(
    studentId: string,
    lessonId: string
  ): Promise<boolean> {
    // Get lesson with course structure
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: {
              include: {
                sections: {
                  orderBy: { order: 'asc' },
                  include: {
                    lessons: {
                      orderBy: { order: 'asc' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) return false;

    const course = lesson.section.course;

    // If sequential not required, unlocked (default to true now)
    if (course.requireSequentialProgress === false) {
      return true;
    }

    // Flatten all lessons across all sections in the correct order
    const allLessons = course.sections.flatMap(s => s.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);

    // First lesson of the course is always unlocked
    if (currentIndex === 0) return true;

    // Check if the immediately preceding lesson is completed
    const previousLesson = allLessons[currentIndex - 1];
    const previousProgress = await this.prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: { studentId, lessonId: previousLesson.id },
      },
    });

    return previousProgress?.completed ?? false;
  }

  /**
   * Get the next lesson recommendation
   * Requirements: 5.7
   */
  async getNextLesson(
    studentId: string,
    courseId: string
  ): Promise<NextLessonRecommendation> {
    // Get course progress
    const progress = await this.getCourseProgress(studentId, courseId);

    // If course is completed, return null
    if (progress.isCompleted) {
      return {
        lesson: null,
        section: null,
        isNextSection: false,
        courseCompleted: true,
      };
    }

    // Find the first incomplete lesson in an unlocked section
    for (const section of progress.sections) {
      if (!section.isUnlocked) {
        continue;
      }

      for (const lessonSummary of section.lessons) {
        if (!lessonSummary.completed) {
          // Get full lesson and section data
          const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonSummary.lessonId },
          });
          const sectionData = await this.prisma.section.findUnique({
            where: { id: section.sectionId },
          });

          // Check if this is the first lesson of a new section
          const isNextSection = lessonSummary.order === 0 && section.order > 0;

          return {
            lesson,
            section: sectionData,
            isNextSection,
            courseCompleted: false,
          };
        }
      }
    }

    // All lessons completed but course not marked complete
    return {
      lesson: null,
      section: null,
      isNextSection: false,
      courseCompleted: true,
    };
  }

  /**
   * Get total time spent on a course
   * Requirements: 7.7
   */
  async getTimeSpent(studentId: string, courseId: string): Promise<number> {
    // Get all lessons for the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            lessons: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!course) {
      throw new ProgressError(
        'Course not found',
        ProgressErrorCode.COURSE_NOT_FOUND,
        404
      );
    }

    const lessonIds = course.sections.flatMap(s => s.lessons.map(l => l.id));

    // Sum up watched seconds
    const result = await this.prisma.lessonProgress.aggregate({
      where: {
        studentId,
        lessonId: { in: lessonIds },
      },
      _sum: {
        watchedSeconds: true,
      },
    });

    return result._sum.watchedSeconds ?? 0;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Award XP for completing a lesson
   * @private
   */
  private async awardLessonXP(
    studentId: string,
    lessonId: string
  ): Promise<number> {
    // Get or create user progress
    let userProgress = await this.prisma.userProgress.findUnique({
      where: { userId: studentId },
    });

    if (!userProgress) {
      userProgress = await this.prisma.userProgress.create({
        data: {
          userId: studentId,
          totalXP: 0,
          currentLevel: 1,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    }

    // Award XP
    await this.prisma.$transaction([
      // Update total XP
      this.prisma.userProgress.update({
        where: { userId: studentId },
        data: {
          totalXP: { increment: LESSON_COMPLETE_XP },
          lastActivityAt: new Date(),
        },
      }),
      // Log XP activity
      this.prisma.xPActivity.create({
        data: {
          userId: studentId,
          amount: LESSON_COMPLETE_XP,
          reason: XPReason.LESSON_COMPLETE,
          sourceId: lessonId,
        },
      }),
    ]);

    return LESSON_COMPLETE_XP;
  }

  /**
   * Update enrollment progress percentage
   * @private
   */
  private async updateEnrollmentProgress(
    studentId: string,
    courseId: string
  ): Promise<number> {
    // Get course with all lessons
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            lessons: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!course) {
      return 0;
    }

    const allLessonIds = course.sections.flatMap(s => s.lessons.map(l => l.id));
    const totalLessons = allLessonIds.length;

    if (totalLessons === 0) {
      return 0;
    }

    // Count completed lessons
    const completedCount = await this.prisma.lessonProgress.count({
      where: {
        studentId,
        lessonId: { in: allLessonIds },
        completed: true,
      },
    });

    // Calculate progress percentage
    const progress = Math.round((completedCount / totalLessons) * 100);

    // Update enrollment
    await this.prisma.enrollment.update({
      where: {
        studentId_courseId: { studentId, courseId },
      },
      data: {
        progress,
        lastAccessedAt: new Date(),
      },
    });

    return progress;
  }

  /**
   * Update student's daily streak
   * @private
   */
  private async updateStreak(studentId: string): Promise<number> {
    // Get user progress
    let userProgress = await this.prisma.userProgress.findUnique({
      where: { userId: studentId },
    });

    if (!userProgress) {
      userProgress = await this.prisma.userProgress.create({
        data: {
          userId: studentId,
          totalXP: 0,
          currentLevel: 1,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityAt: new Date(),
        },
      });
      return 1;
    }

    const now = new Date();
    const lastActivity = userProgress.lastActivityAt;

    if (!lastActivity) {
      // First activity ever
      await this.prisma.userProgress.update({
        where: { userId: studentId },
        data: {
          currentStreak: 1,
          longestStreak: Math.max(1, userProgress.longestStreak),
          lastActivityAt: now,
        },
      });
      return 1;
    }

    // Check if last activity was yesterday (streak continues)
    const lastActivityDate = new Date(lastActivity);
    lastActivityDate.setHours(0, 0, 0, 0);

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = userProgress.currentStreak;

    if (lastActivityDate.getTime() === yesterday.getTime()) {
      // Last activity was yesterday - increment streak
      newStreak = userProgress.currentStreak + 1;
    } else if (lastActivityDate.getTime() === today.getTime()) {
      // Already active today - keep current streak
      newStreak = userProgress.currentStreak;
    } else {
      // Streak broken - reset to 1
      newStreak = 1;
    }

    // Update streak
    await this.prisma.userProgress.update({
      where: { userId: studentId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, userProgress.longestStreak),
        lastActivityAt: now,
      },
    });

    return newStreak;
  }

  /**
   * Check if course is completed (all lessons done, all quizzes passed)
   * Enhanced with gamification integration
   * @private
   */
  private async checkCourseCompletion(
    studentId: string,
    courseId: string
  ): Promise<boolean> {
    // Get course with all lessons and quizzes
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            lessons: {
              include: {
                quiz: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return false;
    }

    // Get all lesson IDs and quiz IDs
    const allLessons = course.sections.flatMap(s => s.lessons);
    const allLessonIds = allLessons.map(l => l.id);
    const allQuizIds = allLessons.filter(l => l.quiz).map(l => l.quiz!.id);

    // Check if all lessons are completed
    const completedLessonsCount = await this.prisma.lessonProgress.count({
      where: {
        studentId,
        lessonId: { in: allLessonIds },
        completed: true,
      },
    });

    if (completedLessonsCount < allLessonIds.length) {
      return false;
    }

    // Check if all quizzes are passed
    if (allQuizIds.length > 0) {
      for (const quizId of allQuizIds) {
        const passedAttempt = await this.prisma.quizAttempt.findFirst({
          where: {
            studentId,
            quizId,
            passed: true,
          },
        });

        if (!passedAttempt) {
          return false;
        }
      }
    }

    // Check if already completed (avoid duplicate rewards)
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
    });

    const wasAlreadyCompleted =
      enrollment?.status === EnrollmentStatus.COMPLETED;

    // Mark enrollment as completed
    await this.prisma.enrollment.update({
      where: {
        studentId_courseId: { studentId, courseId },
      },
      data: {
        status: EnrollmentStatus.COMPLETED,
        progress: 100,
        completedAt: new Date(),
      },
    });

    // === GAMIFICATION INTEGRATION ===
    // Only award rewards if this is the first completion
    if (!wasAlreadyCompleted) {
      try {
        // 1. Award course completion XP
        await gamificationService.awardXP(
          studentId,
          XP_AMOUNTS.COURSE_COMPLETE,
          XPReason.COURSE_COMPLETE,
          courseId
        );

        // 2. Update quest progress for course completion
        await gamificationService.updateQuestProgress(
          studentId,
          QuestType.COURSE_ENROLLMENT // Using enrollment quest type for completion tracking
        );

        // 3. Check and award all relevant badges
        await gamificationService.checkAllBadges(studentId);

        // 4. Create certificate if not exists
        await this.createCertificateIfNotExists(studentId, courseId);
      } catch (error) {
        // Log error but don't fail the completion
        console.error('[checkCourseCompletion] Gamification error:', error);
      }
    }

    return true;
  }

  /**
   * Create certificate for completed course if not already exists
   * @private
   */
  private async createCertificateIfNotExists(
    studentId: string,
    courseId: string
  ): Promise<void> {
    // Check if certificate already exists
    const existingCertificate = await this.prisma.certificate.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
    });

    if (existingCertificate) {
      return;
    }

    // Generate unique certificate ID
    const certificateId = this.generateCertificateId();

    // Create certificate
    await this.prisma.certificate.create({
      data: {
        studentId,
        courseId,
        certificateId,
      },
    });
  }

  /**
   * Generate unique certificate ID
   * @private
   */
  private generateCertificateId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = [];
    for (let i = 0; i < 3; i++) {
      let segment = '';
      for (let j = 0; j < 4; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      segments.push(segment);
    }
    return segments.join('-'); // Format: XXXX-XXXX-XXXX
  }
}

// Export singleton instance
export const progressService = new ProgressService();

/**
 * Enrollment Service Implementation
 * Handles all enrollment management operations
 *
 * Requirements covered:
 * - 4.1: Course enrollment
 * - 4.2: Enrollment record creation with initial state (0% progress, ACTIVE status)
 * - 4.3: Duplicate enrollment prevention
 * - 4.4: Student's enrolled courses display
 * - 4.5: Unenrollment with history preservation
 * - 9.1: Teacher analytics - enrollment data
 * - 11.3: Communication link visibility for enrolled students
 */

import {
  PrismaClient,
  Enrollment,
  EnrollmentStatus,
  CourseStatus,
} from '@prisma/client';
import {
  IEnrollmentService,
  EnrollmentWithCourse,
  EnrollmentWithStudent,
  PaginatedEnrollments,
  EnrollmentError,
  EnrollmentErrorCode,
} from '@/lib/interfaces/enrollment.interface';
import { EnrollmentFiltersData } from '@/lib/validators/enrollment';
import { prisma as defaultPrisma } from '@/lib/prisma';
import { walletService } from './wallet.service';

/**
 * EnrollmentService - Implements enrollment management business logic
 * Uses dependency injection for PrismaClient
 */
export class EnrollmentService implements IEnrollmentService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  /**
   * Enroll a student in a course
   * Requirements: 4.1, 4.2, 4.3
   */
  async enrollStudent(
    studentId: string,
    courseId: string
  ): Promise<Enrollment> {
    // Verify course exists and is published
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        status: true,
        enrollmentCount: true,
        isFree: true,
        price: true,
        title: true,
      },
    });

    if (!course) {
      throw new EnrollmentError(
        'Course not found',
        EnrollmentErrorCode.COURSE_NOT_FOUND,
        404
      );
    }

    if (course.status !== CourseStatus.PUBLISHED) {
      throw new EnrollmentError(
        'Cannot enroll in an unpublished course',
        EnrollmentErrorCode.COURSE_NOT_PUBLISHED,
        400
      );
    }

    // Check for existing enrollment (Requirement 4.3: prevent duplicates)
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      // If previously unenrolled, reactivate the enrollment
      if (existingEnrollment.status === EnrollmentStatus.UNENROLLED) {
        const reactivatedEnrollment = await this.prisma.$transaction(
          async tx => {
            // Reactivate enrollment
            const enrollment = await tx.enrollment.update({
              where: { id: existingEnrollment.id },
              data: {
                status: EnrollmentStatus.ACTIVE,
                lastAccessedAt: new Date(),
              },
            });

            // Increment course enrollment count
            await tx.course.update({
              where: { id: courseId },
              data: {
                enrollmentCount: { increment: 1 },
              },
            });

            return enrollment;
          }
        );

        return reactivatedEnrollment;
      }

      // Already actively enrolled
      throw new EnrollmentError(
        'You are already enrolled in this course',
        EnrollmentErrorCode.ALREADY_ENROLLED,
        409
      );
    }

    // Create new enrollment with initial state (Requirement 4.2)
    const enrollment = await this.prisma.$transaction(async tx => {
      // Handle payment if course is not free
      if (!course.isFree && course.price && Number(course.price) > 0) {
        const amount = Number(course.price);
        const hasBalance = await walletService.hasSufficientBalance(
          studentId,
          amount
        );

        if (!hasBalance) {
          throw new EnrollmentError(
            'Insufficient funds in wallet',
            EnrollmentErrorCode.INSUFFICIENT_FUNDS,
            402
          );
        }

        // Execute purchase through wallet service (pass transaction client if possible, but here we'll just do it)
        // Note: walletService currently doesn't accept 'tx', so we do it manually in the transaction
        const wallet = await tx.wallet.findUnique({
          where: { userId: studentId },
        });
        if (!wallet || Number(wallet.balance) < amount) {
          throw new EnrollmentError(
            'Insufficient funds',
            EnrollmentErrorCode.INSUFFICIENT_FUNDS,
            402
          );
        }

        // Deduct from wallet
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: amount } },
        });

        // Create wallet transaction record
        await tx.walletTransaction.create({
          data: {
            userId: studentId,
            walletId: wallet.id,
            amount: amount,
            type: 'PURCHASE' as any,
            status: 'COMPLETED' as any,
            description: `Enrolled in course: ${course.title}`,
            metadata: { courseId },
          },
        });
      }

      // Create enrollment with 0% progress and ACTIVE status
      const newEnrollment = await tx.enrollment.create({
        data: {
          studentId,
          courseId,
          status: EnrollmentStatus.ACTIVE,
          progress: 0, // Initial progress is 0%
          enrolledAt: new Date(),
          lastAccessedAt: new Date(),
        },
      });

      // Increment course enrollment count
      await tx.course.update({
        where: { id: courseId },
        data: {
          enrollmentCount: { increment: 1 },
        },
      });

      return newEnrollment;
    });

    return enrollment;
  }

  /**
   * Unenroll a student from a course
   * Requirements: 4.5
   */
  async unenrollStudent(studentId: string, courseId: string): Promise<void> {
    // Find existing enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new EnrollmentError(
        'You are not enrolled in this course',
        EnrollmentErrorCode.NOT_ENROLLED,
        404
      );
    }

    if (enrollment.status === EnrollmentStatus.UNENROLLED) {
      throw new EnrollmentError(
        'You have already unenrolled from this course',
        EnrollmentErrorCode.NOT_ENROLLED,
        400
      );
    }

    // Change status to UNENROLLED (preserve history) and decrement count
    await this.prisma.$transaction(async tx => {
      // Update enrollment status
      await tx.enrollment.update({
        where: { id: enrollment.id },
        data: {
          status: EnrollmentStatus.UNENROLLED,
        },
      });

      // Decrement course enrollment count
      await tx.course.update({
        where: { id: courseId },
        data: {
          enrollmentCount: { decrement: 1 },
        },
      });
    });
  }

  /**
   * Get a specific enrollment
   */
  async getEnrollment(
    studentId: string,
    courseId: string
  ): Promise<Enrollment | null> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    return enrollment;
  }

  /**
   * Get all enrollments for a student
   * Requirements: 4.4
   */
  async getStudentEnrollments(
    studentId: string,
    filters?: EnrollmentFiltersData
  ): Promise<PaginatedEnrollments<EnrollmentWithCourse>> {
    const { status, page = 1, limit = 12 } = filters || {};

    // Build where clause
    const where: Record<string, unknown> = {
      studentId,
    };

    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await this.prisma.enrollment.count({ where });

    // Get paginated enrollments with course details
    const enrollments = await this.prisma.enrollment.findMany({
      where,
      include: {
        course: {
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
        },
      },
      orderBy: { lastAccessedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      enrollments: enrollments as EnrollmentWithCourse[],
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Get all enrollments for a course (teacher view)
   * Requirements: 9.1
   */
  async getCourseEnrollments(
    courseId: string,
    filters?: EnrollmentFiltersData
  ): Promise<PaginatedEnrollments<EnrollmentWithStudent>> {
    const { status, page = 1, limit = 12 } = filters || {};

    // Build where clause
    const where: Record<string, unknown> = {
      courseId,
    };

    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await this.prisma.enrollment.count({ where });

    // Get paginated enrollments with student details
    const enrollments = await this.prisma.enrollment.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      enrollments: enrollments as EnrollmentWithStudent[],
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Check if a student is actively enrolled in a course
   * Requirements: 11.3
   */
  async isEnrolled(studentId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
      select: { status: true },
    });

    return enrollment?.status === EnrollmentStatus.ACTIVE;
  }

  /**
   * Update enrollment progress
   */
  async updateProgress(
    studentId: string,
    courseId: string,
    progress: number
  ): Promise<Enrollment> {
    // Validate progress value
    if (progress < 0 || progress > 100) {
      throw new EnrollmentError(
        'Progress must be between 0 and 100',
        EnrollmentErrorCode.INVALID_PROGRESS,
        400
      );
    }

    // Find enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new EnrollmentError(
        'Enrollment not found',
        EnrollmentErrorCode.ENROLLMENT_NOT_FOUND,
        404
      );
    }

    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new EnrollmentError(
        'Cannot update progress for inactive enrollment',
        EnrollmentErrorCode.NOT_ENROLLED,
        400
      );
    }

    // Update progress
    const updatedEnrollment = await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: Math.round(progress),
        lastAccessedAt: new Date(),
      },
    });

    return updatedEnrollment;
  }

  /**
   * Mark enrollment as completed
   */
  async markCompleted(
    studentId: string,
    courseId: string
  ): Promise<Enrollment> {
    // Find enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new EnrollmentError(
        'Enrollment not found',
        EnrollmentErrorCode.ENROLLMENT_NOT_FOUND,
        404
      );
    }

    // Update to completed status
    const updatedEnrollment = await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: EnrollmentStatus.COMPLETED,
        progress: 100,
        completedAt: new Date(),
        lastAccessedAt: new Date(),
      },
    });

    return updatedEnrollment;
  }

  /**
   * Update last accessed timestamp
   */
  async updateLastAccessed(studentId: string, courseId: string): Promise<void> {
    await this.prisma.enrollment.updateMany({
      where: {
        studentId,
        courseId,
        status: EnrollmentStatus.ACTIVE,
      },
      data: {
        lastAccessedAt: new Date(),
      },
    });
  }

  /**
   * Get enrollment count for a course
   */
  async getEnrollmentCount(courseId: string): Promise<number> {
    const count = await this.prisma.enrollment.count({
      where: {
        courseId,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    return count;
  }
}

// Export singleton instance
export const enrollmentService = new EnrollmentService();

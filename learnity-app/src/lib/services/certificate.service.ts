/**
 * Certificate Service Implementation
 * Handles all certificate generation and management operations
 * 
 * Requirements covered:
 * - 10.1: Mark course as completed when 100% lessons and all quizzes passed
 * - 10.2: Generate completion certificate with student name, course title, date, unique ID
 * - 10.3: Allow students to download certificate as PDF
 * - 10.4: Award 50 XP bonus for course completion
 * - 10.5: Display completed courses in student profile
 * - 10.6: Unlock "Course Completer" badge after first course completion
 */

import { PrismaClient, Certificate, BadgeType, XPReason, EnrollmentStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');
import {
  ICertificateService,
  CertificateWithDetails,
  GenerateCertificateResult,
  CompletionStatus,
  PaginatedCertificates,
  CertificateError,
  CertificateErrorCode,
} from '@/lib/interfaces/certificate.interface';
import { prisma as defaultPrisma } from '@/lib/prisma';

/** XP awarded for completing a course */
const COURSE_COMPLETE_XP = 50;

/**
 * CertificateService - Implements certificate management business logic
 * Uses dependency injection for PrismaClient
 */
export class CertificateService implements ICertificateService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  /**
   * Generate a unique certificate ID
   * Format: CERT-XXXXXXXX-XXXX (uppercase alphanumeric)
   */
  private generateCertificateId(): string {
    const uuid = randomUUID().replace(/-/g, '').toUpperCase();
    return `CERT-${uuid.substring(0, 8)}-${uuid.substring(8, 12)}`;
  }

  /**
   * Check if a student has completed a course
   * Requirements: 10.1
   */
  async checkCourseCompletion(studentId: string, courseId: string): Promise<CompletionStatus> {
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
      throw new CertificateError(
        'Course not found',
        CertificateErrorCode.COURSE_NOT_FOUND,
        404
      );
    }

    // Get all lessons and quizzes
    const allLessons = course.sections.flatMap(s => s.lessons);
    const allLessonIds = allLessons.map(l => l.id);
    const allQuizzes = allLessons.filter(l => l.quiz).map(l => l.quiz!);
    const allQuizIds = allQuizzes.map(q => q.id);

    const totalLessons = allLessonIds.length;
    const totalQuizzes = allQuizIds.length;

    // Check completed lessons
    const completedLessonsCount = await this.prisma.lessonProgress.count({
      where: {
        studentId,
        lessonId: { in: allLessonIds },
        completed: true,
      },
    });

    // Check passed quizzes
    let passedQuizzesCount = 0;
    if (totalQuizzes > 0) {
      for (const quizId of allQuizIds) {
        const passedAttempt = await this.prisma.quizAttempt.findFirst({
          where: {
            studentId,
            quizId,
            passed: true,
          },
        });
        if (passedAttempt) {
          passedQuizzesCount++;
        }
      }
    }

    // Build missing requirements list
    const missingRequirements: string[] = [];
    
    if (completedLessonsCount < totalLessons) {
      const remaining = totalLessons - completedLessonsCount;
      missingRequirements.push(`${remaining} lesson${remaining > 1 ? 's' : ''} not completed`);
    }
    
    if (passedQuizzesCount < totalQuizzes) {
      const remaining = totalQuizzes - passedQuizzesCount;
      missingRequirements.push(`${remaining} quiz${remaining > 1 ? 'zes' : ''} not passed`);
    }

    const isComplete = completedLessonsCount === totalLessons && 
                       passedQuizzesCount === totalQuizzes;

    return {
      isComplete,
      totalLessons,
      completedLessons: completedLessonsCount,
      totalQuizzes,
      passedQuizzes: passedQuizzesCount,
      missingRequirements,
    };
  }

  /**
   * Generate a certificate for a completed course
   * Requirements: 10.1, 10.2, 10.4, 10.6
   */
  async generateCertificate(studentId: string, courseId: string): Promise<GenerateCertificateResult> {
    // Check if certificate already exists
    const existingCertificate = await this.prisma.certificate.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
    });

    if (existingCertificate) {
      throw new CertificateError(
        'Certificate already exists for this course',
        CertificateErrorCode.CERTIFICATE_ALREADY_EXISTS,
        409
      );
    }

    // Check enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
    });

    if (!enrollment) {
      throw new CertificateError(
        'You must be enrolled in this course to receive a certificate',
        CertificateErrorCode.NOT_ENROLLED,
        403
      );
    }

    // Check course completion
    const completionStatus = await this.checkCourseCompletion(studentId, courseId);

    if (!completionStatus.isComplete) {
      if (completionStatus.completedLessons < completionStatus.totalLessons) {
        throw new CertificateError(
          `Course not completed. ${completionStatus.missingRequirements.join(', ')}`,
          CertificateErrorCode.LESSONS_NOT_COMPLETED,
          400
        );
      }
      if (completionStatus.passedQuizzes < completionStatus.totalQuizzes) {
        throw new CertificateError(
          `Course not completed. ${completionStatus.missingRequirements.join(', ')}`,
          CertificateErrorCode.QUIZZES_NOT_PASSED,
          400
        );
      }
      throw new CertificateError(
        `Course not completed. ${completionStatus.missingRequirements.join(', ')}`,
        CertificateErrorCode.COURSE_NOT_COMPLETED,
        400
      );
    }

    // Check if this is the student's first course completion
    const existingCertificatesCount = await this.prisma.certificate.count({
      where: { studentId },
    });
    const isFirstCompletion = existingCertificatesCount === 0;

    // Generate certificate in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Generate unique certificate ID
      const certificateId = this.generateCertificateId();

      // Create certificate
      const certificate = await tx.certificate.create({
        data: {
          studentId,
          courseId,
          certificateId,
        },
      });

      // Update enrollment status to COMPLETED
      await tx.enrollment.update({
        where: {
          studentId_courseId: { studentId, courseId },
        },
        data: {
          status: EnrollmentStatus.COMPLETED,
          progress: 100,
          completedAt: new Date(),
        },
      });

      // Award XP for course completion
      let userProgress = await tx.userProgress.findUnique({
        where: { userId: studentId },
      });

      if (!userProgress) {
        userProgress = await tx.userProgress.create({
          data: {
            userId: studentId,
            totalXP: 0,
            currentLevel: 1,
            currentStreak: 0,
            longestStreak: 0,
          },
        });
      }

      // Update total XP
      await tx.userProgress.update({
        where: { userId: studentId },
        data: {
          totalXP: { increment: COURSE_COMPLETE_XP },
          lastActivityAt: new Date(),
        },
      });

      // Log XP activity
      await tx.xPActivity.create({
        data: {
          userId: studentId,
          amount: COURSE_COMPLETE_XP,
          reason: XPReason.COURSE_COMPLETE,
          sourceId: courseId,
        },
      });

      // Award badge if first completion
      let badgeAwarded: BadgeType | null = null;
      if (isFirstCompletion) {
        // Check if badge already exists (shouldn't, but be safe)
        const existingBadge = await tx.badge.findUnique({
          where: {
            userId_type: {
              userId: studentId,
              type: BadgeType.FIRST_COURSE_COMPLETE,
            },
          },
        });

        if (!existingBadge) {
          await tx.badge.create({
            data: {
              userId: studentId,
              type: BadgeType.FIRST_COURSE_COMPLETE,
            },
          });
          badgeAwarded = BadgeType.FIRST_COURSE_COMPLETE;
        }
      }

      // Check for milestone badges (5 courses, 10 courses)
      const totalCertificates = existingCertificatesCount + 1;
      
      if (totalCertificates === 5) {
        const existingBadge = await tx.badge.findUnique({
          where: {
            userId_type: {
              userId: studentId,
              type: BadgeType.FIVE_COURSES_COMPLETE,
            },
          },
        });
        if (!existingBadge) {
          await tx.badge.create({
            data: {
              userId: studentId,
              type: BadgeType.FIVE_COURSES_COMPLETE,
            },
          });
          badgeAwarded = BadgeType.FIVE_COURSES_COMPLETE;
        }
      } else if (totalCertificates === 10) {
        const existingBadge = await tx.badge.findUnique({
          where: {
            userId_type: {
              userId: studentId,
              type: BadgeType.TEN_COURSES_COMPLETE,
            },
          },
        });
        if (!existingBadge) {
          await tx.badge.create({
            data: {
              userId: studentId,
              type: BadgeType.TEN_COURSES_COMPLETE,
            },
          });
          badgeAwarded = BadgeType.TEN_COURSES_COMPLETE;
        }
      }

      return {
        certificate,
        badgeAwarded,
      };
    });

    return {
      certificate: result.certificate,
      xpAwarded: COURSE_COMPLETE_XP,
      badgeAwarded: result.badgeAwarded,
      isFirstCompletion,
    };
  }

  /**
   * Get a certificate by its unique certificate ID
   * Requirements: 10.2
   */
  async getCertificate(certificateId: string): Promise<CertificateWithDetails | null> {
    const certificate = await this.prisma.certificate.findUnique({
      where: { certificateId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            difficulty: true,
          },
        },
      },
    });

    return certificate as CertificateWithDetails | null;
  }

  /**
   * Get a certificate by student and course
   */
  async getCertificateByStudentAndCourse(
    studentId: string,
    courseId: string
  ): Promise<Certificate | null> {
    return this.prisma.certificate.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
    });
  }

  /**
   * Get all certificates for a student
   * Requirements: 10.5
   */
  async getStudentCertificates(
    studentId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedCertificates> {
    // Get total count
    const total = await this.prisma.certificate.count({
      where: { studentId },
    });

    // Get paginated certificates
    const certificates = await this.prisma.certificate.findMany({
      where: { studentId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            difficulty: true,
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      certificates: certificates as CertificateWithDetails[],
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Check if a certificate already exists for student and course
   */
  async hasCertificate(studentId: string, courseId: string): Promise<boolean> {
    const certificate = await this.prisma.certificate.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
      select: { id: true },
    });

    return certificate !== null;
  }

  /**
   * Verify a certificate by its public ID
   */
  async verifyCertificate(certificateId: string): Promise<CertificateWithDetails | null> {
    return this.getCertificate(certificateId);
  }

  /**
   * Download certificate as PDF
   * Requirements: 10.3
   * Generates a professional certificate PDF with student name, course title, date, and certificate ID
   */
  async downloadCertificatePDF(certificateId: string): Promise<Buffer> {
    const certificate = await this.getCertificate(certificateId);

    if (!certificate) {
      throw new CertificateError(
        'Certificate not found',
        CertificateErrorCode.CERTIFICATE_NOT_FOUND,
        404
      );
    }

    try {
      return await this.generatePDF(certificate);
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new CertificateError(
        'Failed to generate certificate PDF',
        CertificateErrorCode.PDF_GENERATION_FAILED,
        500
      );
    }
  }

  /**
   * Generate PDF buffer for a certificate
   * @private
   */
  private async generatePDF(certificate: CertificateWithDetails): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Create PDF document in landscape orientation
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        // Collect PDF data chunks
        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // Draw decorative border
        this.drawBorder(doc, pageWidth, pageHeight);

        // Certificate title
        doc
          .fontSize(36)
          .font('Helvetica-Bold')
          .fillColor('#1a365d')
          .text('Certificate of Completion', 0, 80, {
            align: 'center',
            width: pageWidth,
          });

        // Decorative line
        doc
          .strokeColor('#3182ce')
          .lineWidth(2)
          .moveTo(pageWidth / 2 - 150, 130)
          .lineTo(pageWidth / 2 + 150, 130)
          .stroke();

        // "This is to certify that" text
        doc
          .fontSize(14)
          .font('Helvetica')
          .fillColor('#4a5568')
          .text('This is to certify that', 0, 160, {
            align: 'center',
            width: pageWidth,
          });

        // Student name
        const studentName = `${certificate.student.firstName} ${certificate.student.lastName}`;
        doc
          .fontSize(32)
          .font('Helvetica-Bold')
          .fillColor('#2d3748')
          .text(studentName, 0, 190, {
            align: 'center',
            width: pageWidth,
          });

        // "has successfully completed" text
        doc
          .fontSize(14)
          .font('Helvetica')
          .fillColor('#4a5568')
          .text('has successfully completed the course', 0, 240, {
            align: 'center',
            width: pageWidth,
          });

        // Course title
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .fillColor('#3182ce')
          .text(certificate.course.title, 0, 270, {
            align: 'center',
            width: pageWidth,
          });

        // Difficulty badge
        const difficultyText = `Level: ${certificate.course.difficulty}`;
        doc
          .fontSize(12)
          .font('Helvetica')
          .fillColor('#718096')
          .text(difficultyText, 0, 310, {
            align: 'center',
            width: pageWidth,
          });

        // Issue date
        const issuedDate = certificate.issuedAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        doc
          .fontSize(12)
          .font('Helvetica')
          .fillColor('#4a5568')
          .text(`Issued on ${issuedDate}`, 0, 350, {
            align: 'center',
            width: pageWidth,
          });

        // Certificate ID
        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#a0aec0')
          .text(`Certificate ID: ${certificate.certificateId}`, 0, 380, {
            align: 'center',
            width: pageWidth,
          });

        // Verification note
        doc
          .fontSize(9)
          .font('Helvetica-Oblique')
          .fillColor('#a0aec0')
          .text(
            'This certificate can be verified at learnity.com/verify',
            0,
            400,
            {
              align: 'center',
              width: pageWidth,
            }
          );

        // Platform branding
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .fillColor('#1a365d')
          .text('Learnity', 0, pageHeight - 80, {
            align: 'center',
            width: pageWidth,
          });

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#718096')
          .text('Empowering Learning, One Course at a Time', 0, pageHeight - 60, {
            align: 'center',
            width: pageWidth,
          });

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Draw decorative border on the certificate
   * @private
   */
  private drawBorder(
    doc: PDFKit.PDFDocument,
    pageWidth: number,
    pageHeight: number
  ): void {
    const margin = 30;
    const innerMargin = 40;

    // Outer border
    doc
      .strokeColor('#3182ce')
      .lineWidth(3)
      .rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin)
      .stroke();

    // Inner border
    doc
      .strokeColor('#90cdf4')
      .lineWidth(1)
      .rect(
        innerMargin,
        innerMargin,
        pageWidth - 2 * innerMargin,
        pageHeight - 2 * innerMargin
      )
      .stroke();

    // Corner decorations
    const cornerSize = 20;
    const corners = [
      { x: margin + 10, y: margin + 10 },
      { x: pageWidth - margin - 10 - cornerSize, y: margin + 10 },
      { x: margin + 10, y: pageHeight - margin - 10 - cornerSize },
      { x: pageWidth - margin - 10 - cornerSize, y: pageHeight - margin - 10 - cornerSize },
    ];

    doc.fillColor('#3182ce');
    corners.forEach((corner) => {
      doc.rect(corner.x, corner.y, cornerSize, cornerSize).fill();
    });
  }
}


// Export singleton instance
export const certificateService = new CertificateService();

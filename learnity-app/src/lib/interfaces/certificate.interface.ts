/**
 * Certificate Service Interface
 * Defines the contract for certificate generation and management operations
 *
 * Requirements covered:
 * - 10.1: Mark course as completed when 100% lessons and all quizzes passed
 * - 10.2: Generate completion certificate with student name, course title, date, unique ID
 * - 10.3: Allow students to download certificate as PDF
 * - 10.4: Award 50 XP bonus for course completion
 * - 10.5: Display completed courses in student profile
 * - 10.6: Unlock "Course Completer" badge after first course completion
 */

import { Certificate, Course, User } from '@prisma/client';

// ============================================
// CERTIFICATE DTOs AND TYPES
// ============================================

/**
 * Certificate with related course and student information
 */
export interface CertificateWithDetails extends Certificate {
  student: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  course: Pick<Course, 'id' | 'title' | 'slug' | 'description' | 'difficulty'>;
}

/**
 * Certificate data for PDF generation
 */
export interface CertificatePDFData {
  certificateId: string;
  studentName: string;
  courseTitle: string;
  courseDescription: string;
  issuedAt: Date;
  difficulty: string;
}

/**
 * Result of generating a certificate
 */
export interface GenerateCertificateResult {
  certificate: Certificate;
  xpAwarded: number;
  badgeAwarded: string | null;
  isFirstCompletion: boolean;
}

/**
 * Course completion status check result
 */
export interface CompletionStatus {
  isComplete: boolean;
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  passedQuizzes: number;
  missingRequirements: string[];
}

/**
 * Paginated certificates response
 */
export interface PaginatedCertificates {
  certificates: CertificateWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// ============================================
// CERTIFICATE SERVICE INTERFACE
// ============================================

/**
 * ICertificateService - Certificate management operations interface
 * Implements all certificate-related business logic
 */
export interface ICertificateService {
  /**
   * Generate a certificate for a completed course
   * @param studentId - The student ID
   * @param courseId - The course ID
   * @returns The generated certificate with XP and badge info
   * Requirements: 10.1, 10.2, 10.4, 10.6
   */
  generateCertificate(
    studentId: string,
    courseId: string
  ): Promise<GenerateCertificateResult>;

  /**
   * Get a certificate by its unique certificate ID
   * @param certificateId - The unique certificate ID (public verification ID)
   * @returns The certificate with details or null
   * Requirements: 10.2
   */
  getCertificate(certificateId: string): Promise<CertificateWithDetails | null>;

  /**
   * Get a certificate by student and course
   * @param studentId - The student ID
   * @param courseId - The course ID
   * @returns The certificate or null
   */
  getCertificateByStudentAndCourse(
    studentId: string,
    courseId: string
  ): Promise<Certificate | null>;

  /**
   * Get all certificates for a student
   * @param studentId - The student ID
   * @param page - Page number (default 1)
   * @param limit - Items per page (default 10)
   * @returns Paginated certificates
   * Requirements: 10.5
   */
  getStudentCertificates(
    studentId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedCertificates>;

  /**
   * Download certificate as PDF
   * @param certificateId - The unique certificate ID
   * @returns PDF buffer
   * Requirements: 10.3
   */
  downloadCertificatePDF(certificateId: string): Promise<Buffer>;

  /**
   * Check if a student has completed a course
   * @param studentId - The student ID
   * @param courseId - The course ID
   * @returns Completion status with details
   * Requirements: 10.1
   */
  checkCourseCompletion(
    studentId: string,
    courseId: string
  ): Promise<CompletionStatus>;

  /**
   * Check if a certificate already exists for student and course
   * @param studentId - The student ID
   * @param courseId - The course ID
   * @returns True if certificate exists
   */
  hasCertificate(studentId: string, courseId: string): Promise<boolean>;

  /**
   * Verify a certificate by its public ID
   * @param certificateId - The unique certificate ID
   * @returns The certificate with details or null if invalid
   */
  verifyCertificate(
    certificateId: string
  ): Promise<CertificateWithDetails | null>;
}

// ============================================
// CERTIFICATE ERROR TYPES
// ============================================

/**
 * Certificate error codes for specific error handling
 */
export enum CertificateErrorCode {
  // Business logic errors
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  NOT_ENROLLED = 'NOT_ENROLLED',
  COURSE_NOT_COMPLETED = 'COURSE_NOT_COMPLETED',
  CERTIFICATE_ALREADY_EXISTS = 'CERTIFICATE_ALREADY_EXISTS',
  CERTIFICATE_NOT_FOUND = 'CERTIFICATE_NOT_FOUND',
  LESSONS_NOT_COMPLETED = 'LESSONS_NOT_COMPLETED',
  QUIZZES_NOT_PASSED = 'QUIZZES_NOT_PASSED',

  // Authorization errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Generation errors
  PDF_GENERATION_FAILED = 'PDF_GENERATION_FAILED',
}

/**
 * Custom error class for certificate-related errors
 */
export class CertificateError extends Error {
  constructor(
    message: string,
    public code: CertificateErrorCode,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'CertificateError';
  }
}

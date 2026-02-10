/**
 * Tutoring Session Service Interface
 * Defines the contract for 1-on-1 tutoring session operations
 */

import { TutoringSession, TutoringSessionStatus } from '@prisma/client';

export interface TutoringSessionWithDetails extends TutoringSession {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string | null;
  };
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string | null;
  };
}

export interface CreateTutoringSessionData {
  teacherId: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration?: number;
}

export interface ITutoringSessionService {
  /**
   * Create a tutoring session request (Student)
   */
  createSessionRequest(
    studentId: string,
    data: CreateTutoringSessionData
  ): Promise<TutoringSession>;

  /**
   * Accept a tutoring session request (Teacher)
   */
  acceptSession(sessionId: string, teacherId: string): Promise<TutoringSession>;

  /**
   * Reject a tutoring session request (Teacher)
   */
  rejectSession(
    sessionId: string,
    teacherId: string,
    reason?: string
  ): Promise<TutoringSession>;

  /**
   * Cancel a tutoring session (Student or Teacher)
   */
  cancelSession(
    sessionId: string,
    userId: string,
    reason?: string
  ): Promise<TutoringSession>;

  /**
   * Start a tutoring session (Teacher)
   */
  startSession(sessionId: string, teacherId: string): Promise<TutoringSession>;

  /**
   * End a tutoring session (Teacher)
   */
  endSession(sessionId: string, teacherId: string): Promise<TutoringSession>;

  /**
   * Get tutoring sessions for a student
   */
  getStudentSessions(
    studentId: string,
    status?: TutoringSessionStatus
  ): Promise<TutoringSessionWithDetails[]>;

  /**
   * Get tutoring sessions for a teacher
   */
  getTeacherSessions(
    teacherId: string,
    status?: TutoringSessionStatus
  ): Promise<TutoringSessionWithDetails[]>;

  /**
   * Get a specific tutoring session
   */
  getSession(sessionId: string): Promise<TutoringSessionWithDetails | null>;

  /**
   * Generate 100ms room credentials
   */
  generateRoomCredentials(
    sessionId: string,
    userId: string
  ): Promise<{ roomId: string; token: string }>;
}

export enum TutoringSessionErrorCode {
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_STATUS = 'INVALID_STATUS',
  ALREADY_PROCESSED = 'ALREADY_PROCESSED',
}

export class TutoringSessionError extends Error {
  constructor(
    message: string,
    public code: TutoringSessionErrorCode,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'TutoringSessionError';
  }
}

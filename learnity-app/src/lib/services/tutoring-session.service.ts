/**
 * Tutoring Session Service Implementation
 * Handles 1-on-1 tutoring session management with 100ms integration
 */

import {
  PrismaClient,
  TutoringSession,
  TutoringSessionStatus,
} from '@prisma/client';
import {
  ITutoringSessionService,
  TutoringSessionWithDetails,
  CreateTutoringSessionData,
  TutoringSessionError,
  TutoringSessionErrorCode,
} from '@/lib/interfaces/tutoring-session.interface';
import { prisma as defaultPrisma } from '@/lib/prisma';

export class TutoringSessionService implements ITutoringSessionService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  async createSessionRequest(
    studentId: string,
    data: CreateTutoringSessionData
  ): Promise<TutoringSession> {
    // Verify teacher exists
    const teacher = await this.prisma.user.findUnique({
      where: { id: data.teacherId },
      select: { id: true, role: true },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      throw new TutoringSessionError(
        'Teacher not found',
        TutoringSessionErrorCode.SESSION_NOT_FOUND,
        404
      );
    }

    // Create session request
    const session = await this.prisma.tutoringSession.create({
      data: {
        studentId,
        teacherId: data.teacherId,
        title: data.title,
        description: data.description,
        scheduledAt: data.scheduledAt,
        duration: data.duration || 60,
        status: TutoringSessionStatus.PENDING,
      },
    });

    return session;
  }

  async acceptSession(
    sessionId: string,
    teacherId: string
  ): Promise<TutoringSession> {
    const session = await this.prisma.tutoringSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new TutoringSessionError(
        'Session not found',
        TutoringSessionErrorCode.SESSION_NOT_FOUND,
        404
      );
    }

    if (session.teacherId !== teacherId) {
      throw new TutoringSessionError(
        'Unauthorized',
        TutoringSessionErrorCode.UNAUTHORIZED,
        403
      );
    }

    if (session.status !== TutoringSessionStatus.PENDING) {
      throw new TutoringSessionError(
        'Session already processed',
        TutoringSessionErrorCode.ALREADY_PROCESSED,
        400
      );
    }

    // Generate 100ms room
    const roomName = `tutoring-${sessionId}`;
    const hmsRoomId = `room-${sessionId}`; // In production, call 100ms API

    const updatedSession = await this.prisma.tutoringSession.update({
      where: { id: sessionId },
      data: {
        status: TutoringSessionStatus.ACCEPTED,
        hmsRoomId,
        hmsRoomName: roomName,
      },
    });

    return updatedSession;
  }

  async rejectSession(
    sessionId: string,
    teacherId: string,
    reason?: string
  ): Promise<TutoringSession> {
    const session = await this.prisma.tutoringSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new TutoringSessionError(
        'Session not found',
        TutoringSessionErrorCode.SESSION_NOT_FOUND,
        404
      );
    }

    if (session.teacherId !== teacherId) {
      throw new TutoringSessionError(
        'Unauthorized',
        TutoringSessionErrorCode.UNAUTHORIZED,
        403
      );
    }

    if (session.status !== TutoringSessionStatus.PENDING) {
      throw new TutoringSessionError(
        'Session already processed',
        TutoringSessionErrorCode.ALREADY_PROCESSED,
        400
      );
    }

    const updatedSession = await this.prisma.tutoringSession.update({
      where: { id: sessionId },
      data: {
        status: TutoringSessionStatus.REJECTED,
        rejectionReason: reason,
      },
    });

    return updatedSession;
  }

  async cancelSession(
    sessionId: string,
    userId: string,
    reason?: string
  ): Promise<TutoringSession> {
    const session = await this.prisma.tutoringSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new TutoringSessionError(
        'Session not found',
        TutoringSessionErrorCode.SESSION_NOT_FOUND,
        404
      );
    }

    if (session.studentId !== userId && session.teacherId !== userId) {
      throw new TutoringSessionError(
        'Unauthorized',
        TutoringSessionErrorCode.UNAUTHORIZED,
        403
      );
    }

    if (
      session.status === TutoringSessionStatus.COMPLETED ||
      session.status === TutoringSessionStatus.CANCELLED
    ) {
      throw new TutoringSessionError(
        'Cannot cancel completed or already cancelled session',
        TutoringSessionErrorCode.INVALID_STATUS,
        400
      );
    }

    const updatedSession = await this.prisma.tutoringSession.update({
      where: { id: sessionId },
      data: {
        status: TutoringSessionStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    return updatedSession;
  }

  async startSession(
    sessionId: string,
    teacherId: string
  ): Promise<TutoringSession> {
    const session = await this.prisma.tutoringSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new TutoringSessionError(
        'Session not found',
        TutoringSessionErrorCode.SESSION_NOT_FOUND,
        404
      );
    }

    if (session.teacherId !== teacherId) {
      throw new TutoringSessionError(
        'Unauthorized',
        TutoringSessionErrorCode.UNAUTHORIZED,
        403
      );
    }

    if (session.status !== TutoringSessionStatus.SCHEDULED) {
      throw new TutoringSessionError(
        'Session must be in scheduled status to start',
        TutoringSessionErrorCode.INVALID_STATUS,
        400
      );
    }

    const updatedSession = await this.prisma.tutoringSession.update({
      where: { id: sessionId },
      data: {
        status: TutoringSessionStatus.LIVE,
        startedAt: new Date(),
      },
    });

    return updatedSession;
  }

  async endSession(
    sessionId: string,
    teacherId: string
  ): Promise<TutoringSession> {
    const session = await this.prisma.tutoringSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new TutoringSessionError(
        'Session not found',
        TutoringSessionErrorCode.SESSION_NOT_FOUND,
        404
      );
    }

    if (session.teacherId !== teacherId) {
      throw new TutoringSessionError(
        'Unauthorized',
        TutoringSessionErrorCode.UNAUTHORIZED,
        403
      );
    }

    if (session.status !== TutoringSessionStatus.LIVE) {
      throw new TutoringSessionError(
        'Session must be live to end',
        TutoringSessionErrorCode.INVALID_STATUS,
        400
      );
    }

    const updatedSession = await this.prisma.tutoringSession.update({
      where: { id: sessionId },
      data: {
        status: TutoringSessionStatus.COMPLETED,
        endedAt: new Date(),
      },
    });

    return updatedSession;
  }

  async getStudentSessions(
    studentId: string,
    status?: TutoringSessionStatus
  ): Promise<TutoringSessionWithDetails[]> {
    const where: any = { studentId };
    if (status) {
      where.status = status;
    }

    const sessions = await this.prisma.tutoringSession.findMany({
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
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return sessions as TutoringSessionWithDetails[];
  }

  async getTeacherSessions(
    teacherId: string,
    status?: TutoringSessionStatus
  ): Promise<TutoringSessionWithDetails[]> {
    const where: any = { teacherId };
    if (status) {
      where.status = status;
    }

    const sessions = await this.prisma.tutoringSession.findMany({
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
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return sessions as TutoringSessionWithDetails[];
  }

  async getSession(
    sessionId: string
  ): Promise<TutoringSessionWithDetails | null> {
    const session = await this.prisma.tutoringSession.findUnique({
      where: { id: sessionId },
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
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    return session as TutoringSessionWithDetails | null;
  }

  async generateRoomCredentials(
    sessionId: string,
    userId: string
  ): Promise<{ roomId: string; token: string }> {
    const session = await this.prisma.tutoringSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new TutoringSessionError(
        'Session not found',
        TutoringSessionErrorCode.SESSION_NOT_FOUND,
        404
      );
    }

    if (session.studentId !== userId && session.teacherId !== userId) {
      throw new TutoringSessionError(
        'Unauthorized',
        TutoringSessionErrorCode.UNAUTHORIZED,
        403
      );
    }

    if (!session.hmsRoomId) {
      throw new TutoringSessionError(
        'Room not created yet',
        TutoringSessionErrorCode.INVALID_STATUS,
        400
      );
    }

    // In production, generate actual 100ms token using their SDK
    // For now, return mock data
    const token = `mock-token-${userId}-${sessionId}`;

    return {
      roomId: session.hmsRoomId,
      token,
    };
  }
}

export const tutoringSessionService = new TutoringSessionService();

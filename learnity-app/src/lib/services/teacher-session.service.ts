/**
 * Teacher Session Service
 * Handles group chats, video sessions, and scheduling for teachers
 */

import { prisma } from '@/lib/prisma';
import { streamChatService } from './stream-chat.service';
import { hmsVideoService } from './hms-video.service';
import {
  TeacherGroupChat,
  VideoSession,
  VideoSessionParticipant,
  SessionType,
  RecurrenceType,
  VideoSessionStatus,
  User,
} from '@prisma/client';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface CreateGroupChatData {
  teacherId: string;
  name: string;
  description?: string;
  studentIds: string[];
}

export interface ScheduleSessionData {
  teacherId: string;
  title: string;
  description?: string;
  sessionType: SessionType;
  scheduledAt: Date;
  duration: number; // minutes
  studentIds: string[];
  isRecurring?: boolean;
  recurrence?: RecurrenceType;
}

export interface UpdateSessionData {
  title?: string;
  description?: string;
  scheduledAt?: Date;
  duration?: number;
  studentIds?: string[];
}

export interface SessionFilters {
  status?: VideoSessionStatus;
  startDate?: Date;
  endDate?: Date;
  sessionType?: SessionType;
}

export interface ITeacherSessionService {
  // Group Chat Management
  createGroupChat(data: CreateGroupChatData): Promise<TeacherGroupChat>;
  addStudentsToGroupChat(chatId: string, studentIds: string[]): Promise<void>;
  removeStudentFromGroupChat(chatId: string, studentId: string): Promise<void>;
  getTeacherGroupChats(teacherId: string): Promise<TeacherGroupChat[]>;
  deleteGroupChat(chatId: string): Promise<void>;

  // Video Session Management
  scheduleSession(data: ScheduleSessionData): Promise<VideoSession>;
  updateSession(sessionId: string, data: UpdateSessionData): Promise<VideoSession>;
  cancelSession(sessionId: string, reason: string): Promise<void>;
  startInstantCall(chatId: string, teacherId: string, title: string): Promise<VideoSession>;
  startSession(sessionId: string): Promise<VideoSession>;
  endSession(sessionId: string): Promise<void>;

  // Session Queries
  getTeacherSessions(teacherId: string, filters?: SessionFilters): Promise<VideoSession[]>;
  getStudentSessions(studentId: string): Promise<VideoSession[]>;
  getUpcomingSessions(userId: string): Promise<VideoSession[]>;
  getSessionById(sessionId: string): Promise<VideoSession | null>;

  // Participant Management
  getEnrolledStudents(teacherId: string): Promise<any[]>;
  trackAttendance(sessionId: string, studentId: string, joined: boolean): Promise<void>;
}

// ============================================
// SERVICE IMPLEMENTATION
// ============================================

export class TeacherSessionService implements ITeacherSessionService {
  /**
   * Create a new group chat
   */
  async createGroupChat(data: CreateGroupChatData): Promise<TeacherGroupChat> {
    const { teacherId, name, description, studentIds } = data;

    // Verify teacher exists
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      throw new Error('Invalid teacher ID');
    }

    // Create GetStream channel
    const streamChannelId = await streamChatService.createTeacherGroupChannel(
      `group_${Date.now()}`,
      name,
      teacherId,
      studentIds
    );

    // Create group chat in database
    const groupChat = await prisma.teacherGroupChat.create({
      data: {
        teacherId,
        name,
        description,
        streamChannelId,
        members: {
          create: studentIds.map((studentId) => ({
            studentId,
          })),
        },
      },
      include: {
        members: {
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
        },
      },
    });

    return groupChat;
  }

  /**
   * Add students to existing group chat
   */
  async addStudentsToGroupChat(chatId: string, studentIds: string[]): Promise<void> {
    const chat = await prisma.teacherGroupChat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new Error('Group chat not found');
    }

    // Add to GetStream channel
    for (const studentId of studentIds) {
      await streamChatService.addMemberToChannel(chat.streamChannelId, studentId);
    }

    // Add to database
    await prisma.teacherGroupChatMember.createMany({
      data: studentIds.map((studentId) => ({
        chatId,
        studentId,
      })),
      skipDuplicates: true,
    });
  }

  /**
   * Remove student from group chat
   */
  async removeStudentFromGroupChat(chatId: string, studentId: string): Promise<void> {
    const chat = await prisma.teacherGroupChat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new Error('Group chat not found');
    }

    // Remove from GetStream channel
    await streamChatService.removeMemberFromChannel(chat.streamChannelId, studentId);

    // Remove from database
    await prisma.teacherGroupChatMember.delete({
      where: {
        chatId_studentId: {
          chatId,
          studentId,
        },
      },
    });
  }

  /**
   * Get all group chats for a teacher
   */
  async getTeacherGroupChats(teacherId: string): Promise<TeacherGroupChat[]> {
    return prisma.teacherGroupChat.findMany({
      where: { teacherId },
      include: {
        members: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete group chat
   */
  async deleteGroupChat(chatId: string): Promise<void> {
    const chat = await prisma.teacherGroupChat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new Error('Group chat not found');
    }

    // Delete GetStream channel
    await streamChatService.deleteChannel(chat.streamChannelId);

    // Delete from database (cascade will delete members)
    await prisma.teacherGroupChat.delete({
      where: { id: chatId },
    });
  }

  /**
   * Schedule a new video session
   */
  async scheduleSession(data: ScheduleSessionData): Promise<VideoSession> {
    const {
      teacherId,
      title,
      description,
      sessionType,
      scheduledAt,
      duration,
      studentIds,
      isRecurring = false,
      recurrence,
    } = data;

    // Create 100ms room
    const hmsRoom = await hmsVideoService.createRoom({
      name: `session-${Date.now()}`,
      description: title,
    });

    // Create GetStream channel for session chat
    const streamChannelId = await streamChatService.createSessionChannel(
      `session_${Date.now()}`,
      title,
      teacherId,
      studentIds
    );

    // Create session in database
    const session = await prisma.videoSession.create({
      data: {
        teacherId,
        title,
        description,
        sessionType,
        scheduledAt,
        duration,
        isRecurring,
        recurrence,
        hmsRoomId: hmsRoom.id,
        hmsRoomName: hmsRoom.name,
        streamChannelId,
        status: 'SCHEDULED',
        participants: {
          create: studentIds.map((studentId) => ({
            studentId,
          })),
        },
      },
      include: {
        participants: {
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
        },
      },
    });

    return session;
  }

  /**
   * Update existing session
   */
  async updateSession(sessionId: string, data: UpdateSessionData): Promise<VideoSession> {
    const session = await prisma.videoSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'SCHEDULED') {
      throw new Error('Can only update scheduled sessions');
    }

    // Update participants if provided
    if (data.studentIds) {
      // Remove old participants
      await prisma.videoSessionParticipant.deleteMany({
        where: { sessionId },
      });

      // Add new participants
      await prisma.videoSessionParticipant.createMany({
        data: data.studentIds.map((studentId) => ({
          sessionId,
          studentId,
        })),
      });

      // Update GetStream channel members
      if (session.streamChannelId) {
        // This is simplified - in production, you'd want to diff and update
        for (const studentId of data.studentIds) {
          await streamChatService.addMemberToChannel(session.streamChannelId, studentId);
        }
      }
    }

    // Update session details
    return prisma.videoSession.update({
      where: { id: sessionId },
      data: {
        title: data.title,
        description: data.description,
        scheduledAt: data.scheduledAt,
        duration: data.duration,
      },
      include: {
        participants: {
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
        },
      },
    });
  }

  /**
   * Cancel a session
   */
  async cancelSession(sessionId: string, reason: string): Promise<void> {
    await prisma.videoSession.update({
      where: { id: sessionId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });
  }

  /**
   * Start an instant call from a chat
   */
  async startInstantCall(
    chatId: string,
    teacherId: string,
    title: string
  ): Promise<VideoSession> {
    // Get chat members
    const chat = await prisma.teacherGroupChat.findUnique({
      where: { id: chatId },
      include: {
        members: true,
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    const studentIds = chat.members.map((m) => m.studentId);

    // Create 100ms room
    const hmsRoom = await hmsVideoService.createRoom({
      name: `instant-${Date.now()}`,
      description: title,
    });

    // Create session
    const session = await prisma.videoSession.create({
      data: {
        teacherId,
        title,
        sessionType: 'GROUP_MEETING',
        scheduledAt: new Date(),
        duration: 60, // Default 1 hour
        hmsRoomId: hmsRoom.id,
        hmsRoomName: hmsRoom.name,
        streamChannelId: chat.streamChannelId, // Use existing chat channel
        status: 'LIVE',
        startedAt: new Date(),
        participants: {
          create: studentIds.map((studentId) => ({
            studentId,
          })),
        },
      },
      include: {
        participants: {
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
        },
      },
    });

    return session;
  }

  /**
   * Start a scheduled session
   */
  async startSession(sessionId: string): Promise<VideoSession> {
    return prisma.videoSession.update({
      where: { id: sessionId },
      data: {
        status: 'LIVE',
        startedAt: new Date(),
      },
      include: {
        participants: {
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
        },
      },
    });
  }

  /**
   * End a session
   */
  async endSession(sessionId: string): Promise<void> {
    const session = await prisma.videoSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // End 100ms session if exists
    if (session.hmsRoomId) {
      try {
        await hmsVideoService.endSession(session.hmsRoomId);
      } catch (error) {
        console.error('Failed to end HMS session:', error);
      }
    }

    // Update session status
    await prisma.videoSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
      },
    });
  }

  /**
   * Get teacher's sessions with filters
   */
  async getTeacherSessions(
    teacherId: string,
    filters?: SessionFilters
  ): Promise<VideoSession[]> {
    const where: any = { teacherId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.sessionType) {
      where.sessionType = filters.sessionType;
    }

    if (filters?.startDate || filters?.endDate) {
      where.scheduledAt = {};
      if (filters.startDate) {
        where.scheduledAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.scheduledAt.lte = filters.endDate;
      }
    }

    return prisma.videoSession.findMany({
      where,
      include: {
        participants: {
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
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  /**
   * Get student's sessions
   */
  async getStudentSessions(studentId: string): Promise<VideoSession[]> {
    return prisma.videoSession.findMany({
      where: {
        participants: {
          some: {
            studentId,
          },
        },
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
        participants: {
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
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  /**
   * Get upcoming sessions for a user
   */
  async getUpcomingSessions(userId: string): Promise<VideoSession[]> {
    const now = new Date();

    return prisma.videoSession.findMany({
      where: {
        OR: [
          { teacherId: userId },
          {
            participants: {
              some: {
                studentId: userId,
              },
            },
          },
        ],
        scheduledAt: {
          gte: now,
        },
        status: 'SCHEDULED',
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
        participants: {
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
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
    });
  }

  /**
   * Get session by ID
   */
  async getSessionById(sessionId: string): Promise<VideoSession | null> {
    return prisma.videoSession.findUnique({
      where: { id: sessionId },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
        participants: {
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
        },
      },
    });
  }

  /**
   * Get all enrolled students for a teacher
   */
  async getEnrolledStudents(teacherId: string): Promise<any[]> {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          teacherId,
        },
        status: 'ACTIVE',
      },
      select: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
            role: true,
          },
        },
      },
      distinct: ['studentId'],
    });

    return enrollments.map((e) => e.student);
  }

  /**
   * Track student attendance
   */
  async trackAttendance(
    sessionId: string,
    studentId: string,
    joined: boolean
  ): Promise<void> {
    const participant = await prisma.videoSessionParticipant.findUnique({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId,
        },
      },
    });

    if (!participant) {
      throw new Error('Participant not found');
    }

    if (joined) {
      await prisma.videoSessionParticipant.update({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId,
          },
        },
        data: {
          joinedAt: new Date(),
          attended: true,
        },
      });
    } else {
      await prisma.videoSessionParticipant.update({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId,
          },
        },
        data: {
          leftAt: new Date(),
        },
      });
    }
  }
}

// Export singleton instance
export const teacherSessionService = new TeacherSessionService();

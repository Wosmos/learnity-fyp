/**
 * Course Room Service
 * Orchestrates 100ms video rooms and GetStream chat channels for courses
 */

import { prisma } from '@/lib/prisma';
import { streamChatService } from './stream-chat.service';
import { hmsVideoService } from './hms-video.service';

export interface CourseRoomData {
  id: string;
  courseId: string;
  hmsRoomId: string | null;
  streamChannelId: string | null;
  chatEnabled: boolean;
  videoEnabled: boolean;
}

export interface CreateCourseRoomOptions {
  courseId: string;
  courseName: string;
  teacherId: string;
  enableChat?: boolean;
  enableVideo?: boolean;
}

export interface ICourseRoomService {
  createCourseRoom(options: CreateCourseRoomOptions): Promise<CourseRoomData>;
  getCourseRoom(courseId: string): Promise<CourseRoomData | null>;
  addStudentToRoom(courseId: string, studentId: string): Promise<void>;
  removeStudentFromRoom(courseId: string, studentId: string): Promise<void>;
  deleteCourseRoom(courseId: string): Promise<void>;
}

class CourseRoomService implements ICourseRoomService {
  /**
   * Create a course room with both chat channel and video room
   */
  async createCourseRoom(
    options: CreateCourseRoomOptions
  ): Promise<CourseRoomData> {
    const {
      courseId,
      courseName,
      teacherId,
      enableChat = true,
      enableVideo = true,
    } = options;

    // Check if room already exists
    const existingRoom = await prisma.courseRoom.findUnique({
      where: { courseId },
    });

    if (existingRoom) {
      return existingRoom;
    }

    let streamChannelId: string | null = null;
    let hmsRoomId: string | null = null;

    // Get enrolled students
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId, status: 'ACTIVE' },
      select: { studentId: true },
    });
    const studentIds = enrollments.map(
      (e: { studentId: string }) => e.studentId
    );

    // Create GetStream chat channel
    if (enableChat) {
      try {
        streamChannelId = await streamChatService.createCourseChannel(
          courseId,
          courseName,
          teacherId,
          studentIds
        );
      } catch (error) {
        console.error('Failed to create GetStream channel:', error);
        // Continue without chat if it fails
      }
    }

    // Create 100ms video room
    if (enableVideo) {
      try {
        const room = await hmsVideoService.createRoom({
          name: `course-${courseId}`,
          description: `Video room for ${courseName}`,
        });
        hmsRoomId = room.id;
      } catch (error) {
        console.error('Failed to create 100ms room:', error);
        // Continue without video if it fails
      }
    }

    // Save to database
    const courseRoom = await prisma.courseRoom.create({
      data: {
        courseId,
        hmsRoomId,
        hmsRoomName: `course-${courseId}`,
        streamChannelId,
        chatEnabled: enableChat && !!streamChannelId,
        videoEnabled: enableVideo && !!hmsRoomId,
      },
    });

    return courseRoom;
  }

  /**
   * Get course room by course ID
   */
  async getCourseRoom(courseId: string): Promise<CourseRoomData | null> {
    return prisma.courseRoom.findUnique({
      where: { courseId },
    });
  }

  /**
   * Add a student to the course room (called on enrollment)
   */
  async addStudentToRoom(courseId: string, studentId: string): Promise<void> {
    const room = await this.getCourseRoom(courseId);

    if (!room) {
      console.warn(`No room found for course ${courseId}`);
      return;
    }

    // Add to GetStream channel
    if (room.streamChannelId && room.chatEnabled) {
      try {
        await streamChatService.addMemberToChannel(
          room.streamChannelId,
          studentId
        );
      } catch (error) {
        console.error('Failed to add student to chat channel:', error);
      }
    }
  }

  /**
   * Remove a student from the course room (called on unenrollment)
   */
  async removeStudentFromRoom(
    courseId: string,
    studentId: string
  ): Promise<void> {
    const room = await this.getCourseRoom(courseId);

    if (!room) {
      return;
    }

    // Remove from GetStream channel
    if (room.streamChannelId && room.chatEnabled) {
      try {
        await streamChatService.removeMemberFromChannel(
          room.streamChannelId,
          studentId
        );
      } catch (error) {
        console.error('Failed to remove student from chat channel:', error);
      }
    }
  }

  /**
   * Delete course room and associated resources
   */
  async deleteCourseRoom(courseId: string): Promise<void> {
    const room = await this.getCourseRoom(courseId);

    if (!room) {
      return;
    }

    // Delete GetStream channel
    if (room.streamChannelId) {
      try {
        await streamChatService.deleteChannel(room.streamChannelId);
      } catch (error) {
        console.error('Failed to delete chat channel:', error);
      }
    }

    // Disable 100ms room (can't delete, but can disable)
    if (room.hmsRoomId) {
      try {
        await hmsVideoService.disableRoom(room.hmsRoomId);
      } catch (error) {
        console.error('Failed to disable video room:', error);
      }
    }

    // Delete from database
    await prisma.courseRoom.delete({
      where: { courseId },
    });
  }

  /**
   * Ensure room exists for a course (create if not exists)
   * Also creates missing 100ms/GetStream resources if room exists but resources are missing
   */
  async ensureRoomExists(courseId: string): Promise<CourseRoomData> {
    const existingRoom = await this.getCourseRoom(courseId);

    // Get course details (needed for both new and existing rooms)
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, teacherId: true },
    });

    if (!course) {
      throw new Error(`Course ${courseId} not found`);
    }

    // If no room exists, create a new one
    if (!existingRoom) {
      return this.createCourseRoom({
        courseId: course.id,
        courseName: course.title,
        teacherId: course.teacherId,
      });
    }

    // Room exists but may be missing 100ms room or GetStream channel
    // Check if we need to create missing resources
    let needsUpdate = false;
    let hmsRoomId = existingRoom.hmsRoomId;
    let streamChannelId = existingRoom.streamChannelId;
    let videoEnabled = existingRoom.videoEnabled;
    let chatEnabled = existingRoom.chatEnabled;

    // Create 100ms room if missing and video should be enabled
    if (!hmsRoomId) {
      try {
        const room = await hmsVideoService.createRoom({
          name: `course-${courseId}`,
          description: `Video room for ${course.title}`,
        });
        hmsRoomId = room.id;
        videoEnabled = true;
        needsUpdate = true;
        console.log(`Created 100ms room for course ${courseId}: ${hmsRoomId}`);
      } catch (error) {
        console.error('Failed to create 100ms room:', error);
        // Keep video disabled if creation fails
        videoEnabled = false;
      }
    }

    // Create GetStream channel if missing and chat should be enabled
    if (!streamChannelId) {
      try {
        // Get enrolled students
        const enrollments = await prisma.enrollment.findMany({
          where: { courseId, status: 'ACTIVE' },
          select: { studentId: true },
        });
        const studentIds = enrollments.map(
          (e: { studentId: string }) => e.studentId
        );

        streamChannelId = await streamChatService.createCourseChannel(
          courseId,
          course.title,
          course.teacherId,
          studentIds
        );
        chatEnabled = true;
        needsUpdate = true;
        console.log(
          `Created GetStream channel for course ${courseId}: ${streamChannelId}`
        );
      } catch (error) {
        console.error('Failed to create GetStream channel:', error);
        // Keep chat disabled if creation fails
        chatEnabled = false;
      }
    }

    // Update database if resources were created
    if (needsUpdate) {
      const updatedRoom = await prisma.courseRoom.update({
        where: { courseId },
        data: {
          hmsRoomId,
          streamChannelId,
          videoEnabled,
          chatEnabled,
        },
      });
      return updatedRoom;
    }

    return existingRoom;
  }

  /**
   * Ensure a specific user is in the course room (chat channel)
   * This is used to fix membership issues if the user joined after room creation
   * or if the sync failed.
   */
  async ensureUserInRoom(courseId: string, userId: string): Promise<void> {
    const room = await this.getCourseRoom(courseId);

    if (!room || !room.chatEnabled || !room.streamChannelId) {
      return;
    }

    try {
      // We don't check if they are already in - addMemberToChannel is likely idempotent
      // or cheaper to just call than query first.
      await streamChatService.addMemberToChannel(room.streamChannelId, userId);
    } catch (error) {
      console.error(
        `Failed to ensure user ${userId} is in room ${courseId}:`,
        error
      );
    }
  }
}

// Export singleton instance
export const courseRoomService = new CourseRoomService();

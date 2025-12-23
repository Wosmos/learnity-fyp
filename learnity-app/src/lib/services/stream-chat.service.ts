/**
 * GetStream Chat Service
 * Handles chat channel creation, user tokens, and messaging functionality
 */

import { StreamChat } from 'stream-chat';

// Types
export interface StreamUserData {
  id: string;
  name: string;
  image?: string;
  role: 'teacher' | 'student' | 'admin';
}

export interface CreateChannelOptions {
  channelId: string;
  channelType?: 'messaging' | 'livestream' | 'team';
  name: string;
  members: string[];
  createdBy: string;
  image?: string;
  extraData?: Record<string, unknown>;
}

export interface IStreamChatService {
  generateUserToken(userId: string): string;
  createCourseChannel(courseId: string, courseName: string, teacherId: string, studentIds: string[]): Promise<string>;
  createDirectMessageChannel(user1Id: string, user2Id: string): Promise<string>;
  addMemberToChannel(channelId: string, userId: string): Promise<void>;
  removeMemberFromChannel(channelId: string, userId: string): Promise<void>;
  deleteChannel(channelId: string): Promise<void>;
}

class StreamChatService implements IStreamChatService {
  private client: StreamChat | null = null;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || '';
    this.apiSecret = process.env.STREAM_API_SECRET || '';
  }

  /**
   * Get or create the server-side StreamChat client
   */
  private getClient(): StreamChat {
    if (!this.client) {
      if (!this.apiKey || !this.apiSecret) {
        throw new Error('GetStream API credentials not configured');
      }
      this.client = StreamChat.getInstance(this.apiKey, this.apiSecret);
    }
    return this.client;
  }

  /**
   * Generate a user token for client-side authentication
   */
  generateUserToken(userId: string): string {
    const client = this.getClient();
    return client.createToken(userId);
  }

  /**
   * Upsert a user in GetStream
   * Note: Custom roles must be defined in GetStream dashboard first
   * Using default 'user' role for all users
   */
  async upsertUser(userData: StreamUserData): Promise<void> {
    const client = this.getClient();
    // Use type assertion to allow custom fields
    await client.upsertUser({
      id: userData.id,
      name: userData.name,
      image: userData.image,
      // Store role as custom field, not as Stream role (which requires dashboard config)
      learnity_role: userData.role,
    } as Parameters<typeof client.upsertUser>[0]);
  }

  /**
   * Create a course chat channel
   * Channel ID format: course_{courseId}
   */
  async createCourseChannel(
    courseId: string,
    courseName: string,
    teacherId: string,
    studentIds: string[]
  ): Promise<string> {
    const client = this.getClient();
    const channelId = `course_${courseId}`;
    
    // All members including teacher
    const members = Array.from(new Set([teacherId, ...studentIds]));

    const channel = client.channel('messaging', channelId, {
      members,
      created_by_id: teacherId,
    });

    // Set channel data after creation
    await channel.create();
    // Update channel with custom data
    await channel.update({ name: courseName } as Record<string, unknown>);
    
    return channelId;
  }

  /**
   * Create a direct message channel between two users
   * Channel ID format: dm_{sortedUserIds}
   */
  async createDirectMessageChannel(user1Id: string, user2Id: string): Promise<string> {
    const client = this.getClient();
    
    // Sort IDs to ensure consistent channel ID regardless of who initiates
    const sortedIds = [user1Id, user2Id].sort();
    const channelId = `dm_${sortedIds[0]}_${sortedIds[1]}`;

    const channel = client.channel('messaging', channelId, {
      members: sortedIds,
    });

    await channel.create();
    return channelId;
  }

  /**
   * Add a member to an existing channel (e.g., when student enrolls)
   */
  async addMemberToChannel(channelId: string, userId: string): Promise<void> {
    const client = this.getClient();
    const channel = client.channel('messaging', channelId);
    await channel.addMembers([userId]);
  }

  /**
   * Remove a member from a channel (e.g., when student unenrolls)
   */
  async removeMemberFromChannel(channelId: string, userId: string): Promise<void> {
    const client = this.getClient();
    const channel = client.channel('messaging', channelId);
    await channel.removeMembers([userId]);
  }

  /**
   * Delete a channel
   */
  async deleteChannel(channelId: string): Promise<void> {
    const client = this.getClient();
    const channel = client.channel('messaging', channelId);
    await channel.delete();
  }

  /**
   * Get channel members
   */
  async getChannelMembers(channelId: string): Promise<string[]> {
    const client = this.getClient();
    const channel = client.channel('messaging', channelId);
    const response = await channel.queryMembers({});
    return response.members.map(m => m.user_id || '').filter(Boolean);
  }
}

// Export singleton instance
export const streamChatService = new StreamChatService();

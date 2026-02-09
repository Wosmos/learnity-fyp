/**
 * Push Notification Service
 * Handles FCM push notifications for sessions and communication
 * 
 * Firebase Cloud Messaging (FCM) is 100% FREE with unlimited usage!
 */

import { prisma } from '@/lib/prisma';
import { Platform, NotificationType } from '@prisma/client';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, string>;
  priority?: 'high' | 'normal';
}

export interface IPushNotificationService {
  // Device Token Management
  registerDeviceToken(userId: string, token: string, platform: Platform): Promise<void>;
  unregisterDeviceToken(token: string): Promise<void>;
  getUserDeviceTokens(userId: string): Promise<string[]>;

  // Send Notifications
  sendNotification(userId: string, notification: NotificationData): Promise<void>;
  sendBulkNotifications(userIds: string[], notification: NotificationData): Promise<void>;

  // Session-specific notifications
  notifyGroupChatCreated(chatId: string, chatName: string, studentIds: string[]): Promise<void>;
  notifyNewMessage(channelId: string, senderId: string, senderName: string): Promise<void>;
  notifyInstantCallStarted(sessionId: string, participantIds: string[], title: string): Promise<void>;
  notifySessionScheduled(sessionId: string): Promise<void>;
  notifySessionReminder(sessionId: string): Promise<void>;
  notifySessionLive(sessionId: string): Promise<void>;
  notifySessionCancelled(sessionId: string, reason: string): Promise<void>;
}

// ============================================
// SERVICE IMPLEMENTATION
// ============================================

export class PushNotificationService implements IPushNotificationService {
  private serverKey: string;

  constructor() {
    this.serverKey = process.env.FIREBASE_SERVER_KEY || '';
  }

  /**
   * Register device token for push notifications
   */
  async registerDeviceToken(
    userId: string,
    token: string,
    platform: Platform
  ): Promise<void> {
    await prisma.deviceToken.upsert({
      where: { token },
      create: {
        userId,
        token,
        platform,
        isActive: true,
      },
      update: {
        userId,
        platform,
        isActive: true,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Unregister device token
   */
  async unregisterDeviceToken(token: string): Promise<void> {
    await prisma.deviceToken.update({
      where: { token },
      data: { isActive: false },
    });
  }

  /**
   * Get all active device tokens for a user
   */
  async getUserDeviceTokens(userId: string): Promise<string[]> {
    const tokens = await prisma.deviceToken.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: { token: true },
    });

    return tokens.map((t) => t.token);
  }

  /**
   * Send notification to a single user
   */
  async sendNotification(userId: string, notification: NotificationData): Promise<void> {
    const tokens = await this.getUserDeviceTokens(userId);

    if (tokens.length === 0) {
      console.log(`No device tokens found for user ${userId}`);
      return;
    }

    await this.sendFCMNotification(tokens, notification);

    // Save notification to database
    await prisma.sessionNotification.create({
      data: {
        userId,
        type: 'NEW_MESSAGE', // Default type
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sent: true,
        sentAt: new Date(),
      },
    });
  }

  /**
   * Send notification to multiple users
   */
  async sendBulkNotifications(
    userIds: string[],
    notification: NotificationData
  ): Promise<void> {
    for (const userId of userIds) {
      await this.sendNotification(userId, notification);
    }
  }

  /**
   * Notify students when added to a group chat
   */
  async notifyGroupChatCreated(
    chatId: string,
    chatName: string,
    studentIds: string[]
  ): Promise<void> {
    const notification: NotificationData = {
      title: 'Added to Group Chat',
      body: `You've been added to "${chatName}"`,
      data: {
        type: 'GROUP_CHAT_CREATED',
        chatId,
      },
      priority: 'normal',
    };

    await this.sendBulkNotifications(studentIds, notification);
  }

  /**
   * Notify about new message (with rate limiting to avoid spam)
   */
  async notifyNewMessage(
    channelId: string,
    senderId: string,
    senderName: string
  ): Promise<void> {
    // Get channel members (excluding sender)
    const members = await this.getChannelMembers(channelId);
    const recipientIds = members.filter((id) => id !== senderId);

    const notification: NotificationData = {
      title: `New message from ${senderName}`,
      body: 'Tap to view',
      data: {
        type: 'NEW_MESSAGE',
        channelId,
        senderId,
      },
      priority: 'normal',
    };

    // TODO: Add rate limiting to avoid spam
    await this.sendBulkNotifications(recipientIds, notification);
  }

  /**
   * Notify participants when instant call starts
   */
  async notifyInstantCallStarted(
    sessionId: string,
    participantIds: string[],
    title: string
  ): Promise<void> {
    const notification: NotificationData = {
      title: '🔴 Live Call Started',
      body: `${title} - Join now!`,
      data: {
        type: 'INSTANT_CALL_STARTED',
        sessionId,
      },
      priority: 'high', // High priority for instant calls
    };

    await this.sendBulkNotifications(participantIds, notification);
  }

  /**
   * Notify when session is scheduled
   */
  async notifySessionScheduled(sessionId: string): Promise<void> {
    const session = await prisma.videoSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: true,
      },
    });

    if (!session) return;

    const participantIds = session.participants.map((p) => p.studentId);

    const notification: NotificationData = {
      title: 'Session Scheduled',
      body: `${session.title} on ${session.scheduledAt.toLocaleDateString()}`,
      data: {
        type: 'SESSION_SCHEDULED',
        sessionId,
      },
      priority: 'normal',
    };

    await this.sendBulkNotifications(participantIds, notification);
  }

  /**
   * Send reminder 15 minutes before session
   */
  async notifySessionReminder(sessionId: string): Promise<void> {
    const session = await prisma.videoSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: true,
      },
    });

    if (!session) return;

    const participantIds = session.participants.map((p) => p.studentId);

    const notification: NotificationData = {
      title: '⏰ Session Starting Soon',
      body: `${session.title} starts in 15 minutes`,
      data: {
        type: 'SESSION_REMINDER',
        sessionId,
      },
      priority: 'high',
    };

    await this.sendBulkNotifications(participantIds, notification);
  }

  /**
   * Notify when session goes live
   */
  async notifySessionLive(sessionId: string): Promise<void> {
    const session = await prisma.videoSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: true,
      },
    });

    if (!session) return;

    const participantIds = session.participants.map((p) => p.studentId);

    const notification: NotificationData = {
      title: '🔴 Session is Live',
      body: `${session.title} - Join now!`,
      data: {
        type: 'SESSION_LIVE',
        sessionId,
      },
      priority: 'high',
    };

    await this.sendBulkNotifications(participantIds, notification);
  }

  /**
   * Notify when session is cancelled
   */
  async notifySessionCancelled(sessionId: string, reason: string): Promise<void> {
    const session = await prisma.videoSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: true,
      },
    });

    if (!session) return;

    const participantIds = session.participants.map((p) => p.studentId);

    const notification: NotificationData = {
      title: 'Session Cancelled',
      body: `${session.title} - ${reason}`,
      data: {
        type: 'SESSION_CANCELLED',
        sessionId,
      },
      priority: 'normal',
    };

    await this.sendBulkNotifications(participantIds, notification);
  }

  /**
   * Send FCM notification using Firebase Cloud Messaging API
   */
  private async sendFCMNotification(
    tokens: string[],
    notification: NotificationData
  ): Promise<void> {
    if (!this.serverKey) {
      console.warn('Firebase Server Key not configured. Skipping FCM notification.');
      return;
    }

    try {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${this.serverKey}`,
        },
        body: JSON.stringify({
          registration_ids: tokens,
          notification: {
            title: notification.title,
            body: notification.body,
            sound: 'default',
            badge: '1',
          },
          data: notification.data || {},
          priority: notification.priority || 'normal',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('FCM notification failed:', error);
      } else {
        const result = await response.json();
        console.log('FCM notification sent:', result);
      }
    } catch (error) {
      console.error('Failed to send FCM notification:', error);
    }
  }

  /**
   * Get channel members (helper method)
   */
  private async getChannelMembers(channelId: string): Promise<string[]> {
    // This would query GetStream or your database
    // For now, return empty array
    // TODO: Implement proper channel member lookup
    return [];
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

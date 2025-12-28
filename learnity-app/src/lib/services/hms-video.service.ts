/**
 * 100ms Video Service
 * Handles video room creation, auth tokens, and session management
 */

import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

// Types
export interface HMSRoomConfig {
  name: string;
  description?: string;
  templateId?: string;
  region?: string;
}

export interface HMSTokenConfig {
  roomId: string;
  userId: string;
  role: 'host' | 'guest' | 'viewer';
  userName: string;
}

export interface HMSRoom {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
  customer_id?: string;
  template_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IHMSVideoService {
  createRoom(config: HMSRoomConfig): Promise<HMSRoom>;
  generateAuthToken(config: HMSTokenConfig): string;
  getRoom(roomId: string): Promise<HMSRoom | null>;
  disableRoom(roomId: string): Promise<void>;
  enableRoom(roomId: string): Promise<void>;
}

class HMSVideoService implements IHMSVideoService {
  private accessKey: string;
  private secret: string;
  private templateId: string;
  private baseUrl = 'https://api.100ms.live/v2';

  constructor() {
    this.accessKey = process.env.HMS_ACCESS_KEY || '';
    this.secret = process.env.HMS_SECRET || '';
    this.templateId = process.env.HMS_TEMPLATE_ID || '';
  }

  /**
   * Generate management token for API calls
   */
  private generateManagementToken(): string {
    if (!this.accessKey || !this.secret) {
      throw new Error('100ms credentials not configured');
    }

    const payload = {
      access_key: this.accessKey,
      type: 'management',
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, this.secret, {
      algorithm: 'HS256',
      expiresIn: '24h',
      jwtid: randomUUID(),
    });
  }

  /**
   * Generate auth token for client-side room joining
   */
  generateAuthToken(config: HMSTokenConfig): string {
    if (!this.accessKey || !this.secret) {
      throw new Error('100ms credentials not configured');
    }

    const payload = {
      access_key: this.accessKey,
      room_id: config.roomId,
      user_id: config.userId,
      role: config.role,
      type: 'app',
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, this.secret, {
      algorithm: 'HS256',
      expiresIn: '24h',
      jwtid: randomUUID(),
    });
  }

  /**
   * Create a new 100ms room
   */
  async createRoom(config: HMSRoomConfig): Promise<HMSRoom> {
    const managementToken = this.generateManagementToken();

    const response = await fetch(`${this.baseUrl}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managementToken}`,
      },
      body: JSON.stringify({
        name: config.name,
        description: config.description || `Room for ${config.name}`,
        template_id: config.templateId || this.templateId,
        region: config.region || 'us',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create 100ms room: ${error}`);
    }

    return response.json();
  }

  /**
   * Get room details
   */
  async getRoom(roomId: string): Promise<HMSRoom | null> {
    const managementToken = this.generateManagementToken();

    const response = await fetch(`${this.baseUrl}/rooms/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${managementToken}`,
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get 100ms room: ${error}`);
    }

    return response.json();
  }

  /**
   * Disable a room (prevents new joins)
   */
  async disableRoom(roomId: string): Promise<void> {
    const managementToken = this.generateManagementToken();

    const response = await fetch(`${this.baseUrl}/rooms/${roomId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managementToken}`,
      },
      body: JSON.stringify({ enabled: false }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to disable 100ms room: ${error}`);
    }
  }

  /**
   * Enable a room
   */
  async enableRoom(roomId: string): Promise<void> {
    const managementToken = this.generateManagementToken();

    const response = await fetch(`${this.baseUrl}/rooms/${roomId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managementToken}`,
      },
      body: JSON.stringify({ enabled: true }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to enable 100ms room: ${error}`);
    }
  }

  /**
   * Get active sessions for a room
   */
  async getActiveSessions(roomId: string): Promise<any[]> {
    const managementToken = this.generateManagementToken();

    const response = await fetch(`${this.baseUrl}/sessions?room_id=${roomId}&active=true`, {
      headers: {
        'Authorization': `Bearer ${managementToken}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * End an active session
   */
  async endSession(roomId: string, reason?: string): Promise<void> {
    const managementToken = this.generateManagementToken();

    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managementToken}`,
      },
      body: JSON.stringify({
        reason: reason || 'Session ended by host',
        lock: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to end session: ${error}`);
    }
  }
}

// Export singleton instance
export const hmsVideoService = new HMSVideoService();

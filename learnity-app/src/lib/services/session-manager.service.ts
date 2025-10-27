/**
 * Session Manager Service
 * Comprehensive session management with Firebase Auth integration, token blacklisting, and device tracking
 * Implements OOP principles with dependency injection and follows development standards
 */

import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { adminAuth } from '@/lib/config/firebase-admin';
import {
  ISessionManagerService,
  TokenValidationResult,
  SessionPayload,
  CreateSessionData,
  UserSession,
  DeviceInfo,
  TrackedDevice,
  SessionActivity,
  SessionStats,
  BlacklistedToken,
  SessionConfig,
  SessionError,
  SessionErrorCode,
  DeviceRiskLevel,
  DeviceTypeStats
} from '@/lib/interfaces/session.interface';
import { UserRole, Permission } from '@/types/auth';
import { securityService } from './security.service';

export class SessionManagerService implements ISessionManagerService {
  private readonly prisma: PrismaClient;
  private readonly config: SessionConfig;
  private readonly blacklistedTokens = new Map<string, BlacklistedToken>();
  private readonly activeSessions = new Map<string, UserSession>();
  private cleanupInterval?: NodeJS.Timeout;

  constructor(
    prisma?: PrismaClient,
    config?: Partial<SessionConfig>
  ) {
    this.prisma = prisma || new PrismaClient();
    this.config = {
      maxSessionsPerUser: 5,
      sessionInactivityTimeout: 30 * 60 * 1000, // 30 minutes
      deviceTrustDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
      blacklistCleanupInterval: 60 * 60 * 1000, // 1 hour
      enableDeviceTracking: true,
      enableSessionAnalytics: true,
      ...config
    };

    this.initializeCleanupScheduler();
  }

  /**
   * Validate Firebase ID token
   */
  async validateFirebaseToken(idToken: string): Promise<TokenValidationResult> {
    try {
      // Check if token is blacklisted first
      const isBlacklisted = await this.isFirebaseTokenBlacklisted(idToken);
      if (isBlacklisted) {
        return {
          isValid: false,
          isExpired: false,
          isBlacklisted: true,
          error: 'Token is blacklisted'
        };
      }

      // Verify Firebase ID token
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      const now = new Date();
      const expiresAt = new Date(decodedToken.exp * 1000);
      const issuedAt = new Date(decodedToken.iat * 1000);

      const isExpired = expiresAt <= now;

      // Extract session payload from Firebase token
      const payload: SessionPayload = {
        firebaseUid: decodedToken.uid,
        sessionId: decodedToken.sessionId || '', // Custom claim if set
        role: (decodedToken.role as UserRole) || UserRole.STUDENT,
        permissions: (decodedToken.permissions as Permission[]) || [],
        deviceFingerprint: decodedToken.deviceFingerprint || '',
        ipAddress: decodedToken.ipAddress || '',
        issuedAt,
        expiresAt,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      };

      return {
        isValid: !isExpired,
        isExpired,
        isBlacklisted: false,
        payload
      };
    } catch (error) {
      return {
        isValid: false,
        isExpired: false,
        isBlacklisted: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Extract Firebase token payload without validation
   */
  async extractFirebaseTokenPayload(idToken: string): Promise<SessionPayload | null> {
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken, true); // checkRevoked = true
      const expiresAt = new Date(decodedToken.exp * 1000);
      const issuedAt = new Date(decodedToken.iat * 1000);

      return {
        firebaseUid: decodedToken.uid,
        sessionId: decodedToken.sessionId || '',
        role: (decodedToken.role as UserRole) || UserRole.STUDENT,
        permissions: (decodedToken.permissions as Permission[]) || [],
        deviceFingerprint: decodedToken.deviceFingerprint || '',
        ipAddress: decodedToken.ipAddress || '',
        issuedAt,
        expiresAt,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      };
    } catch {
      return null;
    }
  }

  /**
   * Blacklist a Firebase ID token
   */
  async blacklistFirebaseToken(idToken: string, reason?: string): Promise<void> {
    try {
      const payload = await this.extractFirebaseTokenPayload(idToken);
      if (!payload) {
        return; // Invalid token, nothing to blacklist
      }

      const tokenHash = this.hashToken(idToken);
      const blacklistedToken: BlacklistedToken = {
        tokenHash,
        firebaseUid: payload.firebaseUid,
        blacklistedAt: new Date(),
        expiresAt: payload.expiresAt,
        reason,
        sessionId: payload.sessionId
      };

      // Store in memory for fast lookup
      this.blacklistedTokens.set(tokenHash, blacklistedToken);

      // Revoke the Firebase token
      try {
        await adminAuth.revokeRefreshTokens(payload.firebaseUid);
      } catch (error) {
        console.warn('Failed to revoke Firebase refresh tokens:', error);
      }

      // Log security event
      await securityService.logSecurityEvent({
        type: 'TOKEN_BLACKLISTED',
        firebaseUid: payload.firebaseUid,
        ipAddress: payload.ipAddress || 'unknown',
        userAgent: 'system',
        deviceFingerprint: payload.deviceFingerprint || 'unknown',
        riskLevel: 'MEDIUM',
        blocked: true,
        reason: reason || 'Firebase token blacklisted',
        metadata: { sessionId: payload.sessionId }
      });
    } catch (error) {
      console.error('Failed to blacklist Firebase token:', error);
    }
  }

  /**
   * Blacklist all tokens for a user
   */
  async blacklistAllUserTokens(firebaseUid: string, reason?: string): Promise<void> {
    try {
      // Get all user sessions
      const sessions = await this.getUserSessions(firebaseUid);
      
      // Terminate all sessions
      await Promise.all(
        sessions.map(session => this.terminateSession(session.id, reason))
      );

      // Revoke all Firebase refresh tokens for the user
      try {
        await adminAuth.revokeRefreshTokens(firebaseUid);
      } catch (error) {
        console.warn('Failed to revoke Firebase refresh tokens:', error);
      }

      // Update blacklisted tokens in memory
      for (const [, blacklistedToken] of this.blacklistedTokens.entries()) {
        if (blacklistedToken.firebaseUid === firebaseUid) {
          blacklistedToken.reason = reason || 'All user tokens blacklisted';
        }
      }
    } catch (error) {
      console.error('Failed to blacklist all user tokens:', error);
    }
  }

  /**
   * Check if Firebase token is blacklisted
   */
  async isFirebaseTokenBlacklisted(idToken: string): Promise<boolean> {
    const tokenHash = this.hashToken(idToken);
    const blacklistedToken = this.blacklistedTokens.get(tokenHash);
    
    if (!blacklistedToken) {
      return false;
    }

    // Check if blacklisted token has expired
    if (blacklistedToken.expiresAt <= new Date()) {
      this.blacklistedTokens.delete(tokenHash);
      return false;
    }

    return true;
  }

  /**
   * Clean up expired blacklisted tokens
   */
  async cleanupExpiredBlacklistedTokens(): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;

    for (const [tokenHash, blacklistedToken] of this.blacklistedTokens.entries()) {
      if (blacklistedToken.expiresAt <= now) {
        this.blacklistedTokens.delete(tokenHash);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Create a new session
   */
  async createSession(sessionData: CreateSessionData): Promise<UserSession> {
    try {
      // Check session limits
      const existingSessions = await this.getUserSessions(sessionData.firebaseUid);
      const activeSessions = existingSessions.filter(s => s.isActive);
      
      if (activeSessions.length >= this.config.maxSessionsPerUser) {
        // Terminate oldest session
        const oldestSession = activeSessions.sort((a, b) => 
          a.lastActivityAt.getTime() - b.lastActivityAt.getTime()
        )[0];
        await this.terminateSession(oldestSession.id, 'Session limit exceeded');
      }

      // Track device if enabled
      if (this.config.enableDeviceTracking) {
        await this.trackDevice(sessionData.deviceInfo);
      }

      const sessionId = this.generateSessionId();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days default

      const session: UserSession = {
        id: sessionId,
        firebaseUid: sessionData.firebaseUid,
        deviceFingerprint: sessionData.deviceInfo.fingerprint,
        deviceInfo: sessionData.deviceInfo,
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        loginMethod: sessionData.loginMethod,
        createdAt: now,
        lastActivityAt: now,
        expiresAt,
        isActive: true,
        activityCount: 1
      };

      // Store in memory for fast access
      this.activeSessions.set(sessionId, session);

      // Log session creation
      await securityService.logAuthEvent({
        type: 'AUTH_LOGIN',
        firebaseUid: sessionData.firebaseUid,
        action: 'SESSION_CREATED',
        resource: 'session',
        newValues: { sessionId, loginMethod: sessionData.loginMethod },
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent,
        deviceFingerprint: sessionData.deviceInfo.fingerprint,
        success: true
      });

      return session;
    } catch (error) {
      throw this.createSessionError(
        SessionErrorCode.SESSION_NOT_FOUND,
        'Failed to create session',
        { error: (error as Error).message }
      );
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<UserSession | null> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt <= new Date() || !session.isActive) {
      this.activeSessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(firebaseUid: string): Promise<UserSession[]> {
    const userSessions: UserSession[] = [];
    
    for (const session of this.activeSessions.values()) {
      if (session.firebaseUid === firebaseUid) {
        // Check if session is still valid
        if (session.expiresAt > new Date() && session.isActive) {
          userSessions.push(session);
        } else {
          // Clean up expired session
          this.activeSessions.delete(session.id);
        }
      }
    }

    return userSessions;
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string, activity: SessionActivity): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session || !session.isActive) {
      return;
    }

    // Update last activity time
    session.lastActivityAt = activity.timestamp;

    // Increment activity counter
    session.activityCount++;

    // Store updated session
    this.activeSessions.set(sessionId, session);
  }

  /**
   * Terminate a session
   */
  async terminateSession(sessionId: string, reason?: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      return;
    }

    // Mark session as terminated
    session.isActive = false;
    session.terminatedAt = new Date();
    session.terminationReason = reason;

    // Remove from active sessions
    this.activeSessions.delete(sessionId);

    // Log session termination
    await securityService.logAuthEvent({
      type: 'AUTH_LOGOUT',
      firebaseUid: session.firebaseUid,
      action: 'SESSION_TERMINATED',
      resource: 'session',
      newValues: { reason },
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceFingerprint: session.deviceFingerprint,
      success: true
    });
  }

  /**
   * Terminate all sessions for a user
   */
  async terminateAllUserSessions(firebaseUid: string, reason?: string): Promise<number> {
    const sessions = await this.getUserSessions(firebaseUid);
    
    await Promise.all(
      sessions.map(session => this.terminateSession(session.id, reason))
    );

    return sessions.length;
  }

  /**
   * Track device information
   */
  async trackDevice(deviceInfo: DeviceInfo): Promise<TrackedDevice> {
    // This is a simplified implementation
    // In a real application, you might want to store this in the database
    const now = new Date();
    
    const trackedDevice: TrackedDevice = {
      id: this.generateDeviceId(),
      firebaseUid: '', // Will be set by caller
      deviceFingerprint: deviceInfo.fingerprint,
      deviceInfo,
      firstSeenAt: now,
      lastSeenAt: now,
      sessionCount: 1,
      isCurrentDevice: true,
      isTrusted: false,
      riskLevel: DeviceRiskLevel.LOW
    };

    return trackedDevice;
  }

  /**
   * Get device history for a user
   */
  async getDeviceHistory(_firebaseUid: string): Promise<TrackedDevice[]> {
    // Simplified implementation - in real app, query from database
    return [];
  }

  /**
   * Check if device is new for user
   */
  async isNewDevice(firebaseUid: string, deviceFingerprint: string): Promise<boolean> {
    const deviceHistory = await this.getDeviceHistory(firebaseUid);
    return !deviceHistory.some(device => device.deviceFingerprint === deviceFingerprint);
  }

  /**
   * Get session statistics
   */
  async getSessionStats(firebaseUid?: string): Promise<SessionStats> {
    const sessions = firebaseUid 
      ? await this.getUserSessions(firebaseUid)
      : Array.from(this.activeSessions.values());

    const activeSessions = sessions.filter(s => s.isActive);
    const expiredSessions = sessions.filter(s => s.expiresAt <= new Date());
    const terminatedSessions = sessions.filter(s => s.terminatedAt);

    // Calculate average session duration
    const completedSessions = sessions.filter(s => s.terminatedAt);
    const totalDuration = completedSessions.reduce((sum, session) => {
      const duration = (session.terminatedAt!.getTime() - session.createdAt.getTime());
      return sum + duration;
    }, 0);
    const averageSessionDuration = completedSessions.length > 0 
      ? totalDuration / completedSessions.length 
      : 0;

    // Get unique devices
    const uniqueDevices = new Set(sessions.map(s => s.deviceFingerprint)).size;

    // Device type stats (simplified)
    const deviceTypes = new Map<string, number>();
    sessions.forEach(session => {
      const deviceType = session.deviceInfo.isMobile ? 'Mobile' : 
                        session.deviceInfo.isTablet ? 'Tablet' : 'Desktop';
      deviceTypes.set(deviceType, (deviceTypes.get(deviceType) || 0) + 1);
    });

    const topDeviceTypes: DeviceTypeStats[] = Array.from(deviceTypes.entries())
      .map(([deviceType, count]) => ({
        deviceType,
        count,
        percentage: (count / sessions.length) * 100
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      expiredSessions: expiredSessions.length,
      terminatedSessions: terminatedSessions.length,
      averageSessionDuration,
      uniqueDevices,
      suspiciousActivities: 0, // Would be calculated from security events
      topDeviceTypes,
      topLocations: [] // Would be calculated from IP geolocation
    };
  }

  /**
   * Get count of active sessions
   */
  async getActiveSessionsCount(): Promise<number> {
    return this.activeSessions.size;
  }

  /**
   * Get sessions by time range
   */
  async getSessionsByTimeRange(startDate: Date, endDate: Date): Promise<UserSession[]> {
    return Array.from(this.activeSessions.values()).filter(session => 
      session.createdAt >= startDate && session.createdAt <= endDate
    );
  }

  // Private helper methods

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  private generateDeviceId(): string {
    return randomBytes(16).toString('hex');
  }

  private createSessionError(code: SessionErrorCode, message: string, details?: Record<string, unknown>): SessionError {
    return { code, message, details };
  }

  private initializeCleanupScheduler(): void {
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.cleanupExpiredBlacklistedTokens();
        // Clean up expired sessions
        for (const [sessionId, session] of this.activeSessions.entries()) {
          if (session.expiresAt <= new Date()) {
            this.activeSessions.delete(sessionId);
          }
        }
      } catch (error) {
        console.error('Cleanup scheduler error:', error);
      }
    }, this.config.blacklistCleanupInterval);
  }

  /**
   * Cleanup resources and disconnect
   */
  async disconnect(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    await this.prisma.$disconnect();
  }
}

// Export singleton instance
export const sessionManager = new SessionManagerService();
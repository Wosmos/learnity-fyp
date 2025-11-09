/**
 * Session Manager Service
 * Comprehensive session management with Firebase Auth integration, token blacklisting, and device tracking
 * Implements OOP principles with dependency injection and follows development standards
 * Enhanced with custom access/refresh token pairs for improved security
 */

import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes, createHmac } from 'crypto';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
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
  DeviceTypeStats,
  TokenPair,
  AccessTokenPayload,
  RefreshTokenPayload
} from '@/lib/interfaces/session.interface';
import { UserRole, Permission } from '@/types/auth';
import { securityService } from './security.service';

export class SessionManagerService implements ISessionManagerService {
  private readonly prisma: PrismaClient;
  private readonly config: SessionConfig;
  private readonly blacklistedTokens = new Map<string, BlacklistedToken>();
  private readonly activeSessions = new Map<string, UserSession>();
  private readonly refreshTokens = new Map<string, RefreshTokenPayload>();
  private cleanupInterval?: NodeJS.Timeout;
  
  // JWT secrets - in production, these should come from environment variables
  private readonly ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-token-secret-key';
  private readonly REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret-key';
  private readonly ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

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
   * Generate access and refresh token pair
   */
  async generateTokenPair(sessionData: CreateSessionData): Promise<TokenPair> {
    try {
      const sessionId = this.generateSessionId();
      const now = new Date();
      const accessTokenExpiresAt = new Date(now.getTime() + (15 * 60 * 1000)); // 15 minutes
      const refreshTokenExpiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days

      // Create access token payload
      const accessTokenPayload: AccessTokenPayload = {
        firebaseUid: sessionData.firebaseUid,
        sessionId,
        role: sessionData.claims.role,
        permissions: sessionData.claims.permissions,
        deviceFingerprint: sessionData.deviceInfo.fingerprint,
        ipAddress: sessionData.ipAddress,
        tokenType: 'access',
        iat: Math.floor(now.getTime() / 1000),
        exp: Math.floor(accessTokenExpiresAt.getTime() / 1000)
      };

      // Create refresh token payload
      const refreshTokenPayload: RefreshTokenPayload = {
        firebaseUid: sessionData.firebaseUid,
        sessionId,
        deviceFingerprint: sessionData.deviceInfo.fingerprint,
        tokenType: 'refresh',
        iat: Math.floor(now.getTime() / 1000),
        exp: Math.floor(refreshTokenExpiresAt.getTime() / 1000)
      };

      // Generate tokens
      const accessToken = sign(accessTokenPayload, this.ACCESS_TOKEN_SECRET, {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
        issuer: 'learnity-auth',
        audience: 'learnity-app'
      });

      const refreshToken = sign(refreshTokenPayload, this.REFRESH_TOKEN_SECRET, {
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
        issuer: 'learnity-auth',
        audience: 'learnity-app'
      });

      // Store refresh token for validation
      this.refreshTokens.set(this.hashToken(refreshToken), refreshTokenPayload);

      // Create session
      const session = await this.createSession({
        ...sessionData,
        // Override sessionId with the one from token
      });

      // Update session with token info
      session.id = sessionId;
      this.activeSessions.set(sessionId, session);

      return {
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt
      };
    } catch (error) {
      throw this.createSessionError(
        SessionErrorCode.TOKEN_GENERATION_FAILED,
        'Failed to generate token pair',
        { error: (error as Error).message }
      );
    }
  }

  /**
   * Validate access token
   */
  async validateAccessToken(accessToken: string): Promise<TokenValidationResult> {
    try {
      // Check if token is blacklisted first
      const isBlacklisted = await this.isTokenBlacklisted(accessToken);
      if (isBlacklisted) {
        return {
          isValid: false,
          isExpired: false,
          isBlacklisted: true,
          error: 'Access token is blacklisted'
        };
      }

      // Verify JWT token
      const decoded = verify(accessToken, this.ACCESS_TOKEN_SECRET, {
        issuer: 'learnity-auth',
        audience: 'learnity-app'
      }) as AccessTokenPayload;

      const now = new Date();
      const expiresAt = new Date((decoded.exp || 0) * 1000);
      const issuedAt = new Date((decoded.iat || 0) * 1000);
      const isExpired = expiresAt <= now;

      // Validate token type
      if (decoded.tokenType !== 'access') {
        return {
          isValid: false,
          isExpired: false,
          isBlacklisted: false,
          error: 'Invalid token type'
        };
      }

      // Create session payload
      const payload: SessionPayload = {
        firebaseUid: decoded.firebaseUid,
        sessionId: decoded.sessionId,
        role: decoded.role,
        permissions: decoded.permissions,
        deviceFingerprint: decoded.deviceFingerprint,
        ipAddress: decoded.ipAddress,
        issuedAt,
        expiresAt
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
   * Validate refresh token
   */
  async validateRefreshToken(refreshToken: string): Promise<TokenValidationResult> {
    try {
      // Check if token is blacklisted first
      const isBlacklisted = await this.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        return {
          isValid: false,
          isExpired: false,
          isBlacklisted: true,
          error: 'Refresh token is blacklisted'
        };
      }

      // Verify JWT token
      const decoded = verify(refreshToken, this.REFRESH_TOKEN_SECRET, {
        issuer: 'learnity-auth',
        audience: 'learnity-app'
      }) as RefreshTokenPayload;

      const now = new Date();
      const expiresAt = new Date((decoded.exp || 0) * 1000);
      const issuedAt = new Date((decoded.iat || 0) * 1000);
      const isExpired = expiresAt <= now;

      // Validate token type
      if (decoded.tokenType !== 'refresh') {
        return {
          isValid: false,
          isExpired: false,
          isBlacklisted: false,
          error: 'Invalid token type'
        };
      }

      // Check if refresh token exists in our store
      const tokenHash = this.hashToken(refreshToken);
      const storedToken = this.refreshTokens.get(tokenHash);
      if (!storedToken) {
        return {
          isValid: false,
          isExpired: false,
          isBlacklisted: false,
          error: 'Refresh token not found'
        };
      }

      return {
        isValid: !isExpired,
        isExpired,
        isBlacklisted: false
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
   * Refresh token pair using refresh token
   */
  async refreshTokenPair(refreshToken: string): Promise<TokenPair> {
    try {
      // Validate refresh token
      const validation = await this.validateRefreshToken(refreshToken);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid refresh token');
      }

      // Extract refresh token payload
      const refreshPayload = await this.extractRefreshTokenPayload(refreshToken);
      if (!refreshPayload) {
        throw new Error('Failed to extract refresh token payload');
      }

      // Get session data
      const session = await this.getSession(refreshPayload.sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Get user profile from Firebase to get current claims
      try {
        const userRecord = await adminAuth.getUser(refreshPayload.firebaseUid);
        const customClaims = userRecord.customClaims || {};

        // Generate new token pair
        const newTokenPair = await this.generateTokenPair({
          firebaseUid: refreshPayload.firebaseUid,
          deviceInfo: session.deviceInfo,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          claims: {
            role: (customClaims.role as UserRole) || UserRole.STUDENT,
            permissions: (customClaims.permissions as Permission[]) || [],
            profileComplete: customClaims.profileComplete || false,
            emailVerified: customClaims.emailVerified || false
          },
          loginMethod: session.loginMethod
        });

        // Blacklist old refresh token
        await this.blacklistToken(refreshToken, 'Token refreshed');

        return newTokenPair;
      } catch (firebaseError) {
        throw new Error('Failed to get user data from Firebase');
      }
    } catch (error) {
      throw this.createSessionError(
        SessionErrorCode.TOKEN_GENERATION_FAILED,
        'Failed to refresh token pair',
        { error: (error as Error).message }
      );
    }
  }

  /**
   * Blacklist both access and refresh tokens
   */
  async blacklistTokenPair(accessToken: string, refreshToken: string, reason?: string): Promise<void> {
    await Promise.all([
      this.blacklistToken(accessToken, reason),
      this.blacklistToken(refreshToken, reason)
    ]);
  }

  /**
   * Extract access token payload
   */
  async extractAccessTokenPayload(accessToken: string): Promise<AccessTokenPayload | null> {
    try {
      const decoded = verify(accessToken, this.ACCESS_TOKEN_SECRET, {
        issuer: 'learnity-auth',
        audience: 'learnity-app',
        ignoreExpiration: true // Allow extraction even if expired
      }) as AccessTokenPayload;

      return decoded.tokenType === 'access' ? decoded : null;
    } catch {
      return null;
    }
  }

  /**
   * Extract refresh token payload
   */
  async extractRefreshTokenPayload(refreshToken: string): Promise<RefreshTokenPayload | null> {
    try {
      const decoded = verify(refreshToken, this.REFRESH_TOKEN_SECRET, {
        issuer: 'learnity-auth',
        audience: 'learnity-app',
        ignoreExpiration: true // Allow extraction even if expired
      }) as RefreshTokenPayload;

      return decoded.tokenType === 'refresh' ? decoded : null;
    } catch {
      return null;
    }
  }

  /**
   * Generic token blacklisting method
   */
  public async blacklistToken(token: string, reason?: string): Promise<void> {
    try {
      const tokenHash = this.hashToken(token);
      
      // Try to extract payload to get expiration
      let expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // Default 7 days
      let firebaseUid = 'unknown';
      let sessionId = '';

      // Try access token first
      const accessPayload = await this.extractAccessTokenPayload(token);
      if (accessPayload) {
        expiresAt = new Date((accessPayload.exp || 0) * 1000);
        firebaseUid = accessPayload.firebaseUid;
        sessionId = accessPayload.sessionId;
      } else {
        // Try refresh token
        const refreshPayload = await this.extractRefreshTokenPayload(token);
        if (refreshPayload) {
          expiresAt = new Date((refreshPayload.exp || 0) * 1000);
          firebaseUid = refreshPayload.firebaseUid;
          sessionId = refreshPayload.sessionId;
        }
      }

      const blacklistedToken: BlacklistedToken = {
        tokenHash,
        firebaseUid,
        blacklistedAt: new Date(),
        expiresAt,
        reason,
        sessionId
      };

      // Store in memory for fast lookup
      this.blacklistedTokens.set(tokenHash, blacklistedToken);

      // Remove from refresh token store if it's a refresh token
      this.refreshTokens.delete(tokenHash);

      // Log security event
      await securityService.logSecurityEvent({
        type: 'TOKEN_BLACKLISTED',
        firebaseUid,
        ipAddress: 'system',
        userAgent: 'system',
        deviceFingerprint: 'system',
        riskLevel: 'MEDIUM',
        blocked: true,
        reason: reason || 'Token blacklisted',
        metadata: { sessionId, tokenType: accessPayload ? 'access' : 'refresh' }
      });
    } catch (error) {
      console.error('Failed to blacklist token:', error);
    }
  }

  /**
   * Check if any token (access or refresh) is blacklisted
   */
  private async isTokenBlacklisted(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);
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
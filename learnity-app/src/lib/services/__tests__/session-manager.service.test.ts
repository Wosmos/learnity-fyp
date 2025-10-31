/**
 * Session Manager Service Tests
 * Tests for comprehensive session management with token pairs, blacklisting, and device tracking
 */

import { SessionManagerService } from "../session-manager.service";
import { UserRole, Permission } from "@/types/auth";
import { LoginMethod } from "@/lib/interfaces/session.interface";
import { PrismaClient } from "@prisma/client";

// Mock dependencies
jest.mock("@/lib/config/firebase-admin");
jest.mock("../security.service");

describe("SessionManagerService", () => {
  let sessionManager: SessionManagerService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  const mockSessionData = {
    firebaseUid: "test-firebase-uid",
    deviceInfo: {
      fingerprint: "test-device-fingerprint",
      platform: "web",
      browser: "Chrome",
      browserVersion: "120.0",
      os: "Windows",
      osVersion: "11",
      screenResolution: "1920x1080",
      timezone: "UTC",
      language: "en-US",
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    },
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    claims: {
      role: UserRole.STUDENT,
      permissions: [Permission.VIEW_STUDENT_DASHBOARD],
      profileComplete: true,
      emailVerified: true,
    },
    loginMethod: LoginMethod.EMAIL_PASSWORD,
  };

  beforeEach(() => {
    // Create mock Prisma client
    mockPrisma = {
      $disconnect: jest.fn(),
    } as any;

    sessionManager = new SessionManagerService(mockPrisma, {
      maxSessionsPerUser: 3,
      sessionInactivityTimeout: 30 * 60 * 1000,
      enableDeviceTracking: true,
      enableSessionAnalytics: true,
    });
  });

  afterEach(async () => {
    await sessionManager.disconnect();
    jest.clearAllMocks();
  });

  describe("Token Pair Generation", () => {
    it("should generate valid access and refresh token pair", async () => {
      const tokenPair = await sessionManager.generateTokenPair(mockSessionData);

      expect(tokenPair).toHaveProperty("accessToken");
      expect(tokenPair).toHaveProperty("refreshToken");
      expect(tokenPair).toHaveProperty("accessTokenExpiresAt");
      expect(tokenPair).toHaveProperty("refreshTokenExpiresAt");
      expect(typeof tokenPair.accessToken).toBe("string");
      expect(typeof tokenPair.refreshToken).toBe("string");
      expect(tokenPair.accessTokenExpiresAt).toBeInstanceOf(Date);
      expect(tokenPair.refreshTokenExpiresAt).toBeInstanceOf(Date);
    });

    it("should generate tokens with correct expiration times", async () => {
      const beforeGeneration = new Date();
      const tokenPair = await sessionManager.generateTokenPair(mockSessionData);

      // Access token should expire in ~15 minutes
      const accessTokenDuration =
        tokenPair.accessTokenExpiresAt.getTime() - beforeGeneration.getTime();
      expect(accessTokenDuration).toBeGreaterThan(14 * 60 * 1000); // At least 14 minutes
      expect(accessTokenDuration).toBeLessThan(16 * 60 * 1000); // At most 16 minutes

      // Refresh token should expire in ~7 days
      const refreshTokenDuration =
        tokenPair.refreshTokenExpiresAt.getTime() - beforeGeneration.getTime();
      expect(refreshTokenDuration).toBeGreaterThan(6.9 * 24 * 60 * 60 * 1000); // At least 6.9 days
      expect(refreshTokenDuration).toBeLessThan(7.1 * 24 * 60 * 60 * 1000); // At most 7.1 days
    });
  });

  describe("Token Validation", () => {
    it("should validate valid access token", async () => {
      const tokenPair = await sessionManager.generateTokenPair(mockSessionData);
      const validation = await sessionManager.validateAccessToken(
        tokenPair.accessToken
      );

      expect(validation.isValid).toBe(true);
      expect(validation.isExpired).toBe(false);
      expect(validation.isBlacklisted).toBe(false);
      expect(validation.payload).toBeDefined();
      expect(validation.payload?.firebaseUid).toBe(mockSessionData.firebaseUid);
      expect(validation.payload?.role).toBe(mockSessionData.claims.role);
    });

    it("should validate valid refresh token", async () => {
      const tokenPair = await sessionManager.generateTokenPair(mockSessionData);
      const validation = await sessionManager.validateRefreshToken(
        tokenPair.refreshToken
      );

      expect(validation.isValid).toBe(true);
      expect(validation.isExpired).toBe(false);
      expect(validation.isBlacklisted).toBe(false);
    });

    it("should reject invalid access token", async () => {
      const validation = await sessionManager.validateAccessToken(
        "invalid-token"
      );

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeDefined();
    });

    it("should reject invalid refresh token", async () => {
      const validation = await sessionManager.validateRefreshToken(
        "invalid-token"
      );

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeDefined();
    });
  });

  describe("Token Payload Extraction", () => {
    it("should extract access token payload correctly", async () => {
      const tokenPair = await sessionManager.generateTokenPair(mockSessionData);
      const payload = await sessionManager.extractAccessTokenPayload(
        tokenPair.accessToken
      );

      expect(payload).toBeDefined();
      expect(payload?.firebaseUid).toBe(mockSessionData.firebaseUid);
      expect(payload?.role).toBe(mockSessionData.claims.role);
      expect(payload?.permissions).toEqual(mockSessionData.claims.permissions);
      expect(payload?.deviceFingerprint).toBe(
        mockSessionData.deviceInfo.fingerprint
      );
      expect(payload?.ipAddress).toBe(mockSessionData.ipAddress);
      expect(payload?.tokenType).toBe("access");
    });

    it("should extract refresh token payload correctly", async () => {
      const tokenPair = await sessionManager.generateTokenPair(mockSessionData);
      const payload = await sessionManager.extractRefreshTokenPayload(
        tokenPair.refreshToken
      );

      expect(payload).toBeDefined();
      expect(payload?.firebaseUid).toBe(mockSessionData.firebaseUid);
      expect(payload?.deviceFingerprint).toBe(
        mockSessionData.deviceInfo.fingerprint
      );
      expect(payload?.tokenType).toBe("refresh");
    });

    it("should return null for invalid tokens", async () => {
      const accessPayload = await sessionManager.extractAccessTokenPayload(
        "invalid-token"
      );
      const refreshPayload = await sessionManager.extractRefreshTokenPayload(
        "invalid-token"
      );

      expect(accessPayload).toBeNull();
      expect(refreshPayload).toBeNull();
    });
  });

  describe("Token Blacklisting", () => {
    it("should blacklist token pair successfully", async () => {
      const tokenPair = await sessionManager.generateTokenPair(mockSessionData);

      await sessionManager.blacklistTokenPair(
        tokenPair.accessToken,
        tokenPair.refreshToken,
        "Test blacklisting"
      );

      const accessValidation = await sessionManager.validateAccessToken(
        tokenPair.accessToken
      );
      const refreshValidation = await sessionManager.validateRefreshToken(
        tokenPair.refreshToken
      );

      expect(accessValidation.isBlacklisted).toBe(true);
      expect(refreshValidation.isBlacklisted).toBe(true);
    });

    it("should prevent use of blacklisted tokens", async () => {
      const tokenPair = await sessionManager.generateTokenPair(mockSessionData);

      await sessionManager.blacklistTokenPair(
        tokenPair.accessToken,
        tokenPair.refreshToken,
        "Test blacklisting"
      );

      const accessValidation = await sessionManager.validateAccessToken(
        tokenPair.accessToken
      );
      const refreshValidation = await sessionManager.validateRefreshToken(
        tokenPair.refreshToken
      );

      expect(accessValidation.isValid).toBe(false);
      expect(refreshValidation.isValid).toBe(false);
    });
  });

  describe("Session Management", () => {
    it("should create session successfully", async () => {
      const session = await sessionManager.createSession(mockSessionData);

      expect(session).toBeDefined();
      expect(session.firebaseUid).toBe(mockSessionData.firebaseUid);
      expect(session.deviceFingerprint).toBe(
        mockSessionData.deviceInfo.fingerprint
      );
      expect(session.ipAddress).toBe(mockSessionData.ipAddress);
      expect(session.loginMethod).toBe(mockSessionData.loginMethod);
      expect(session.isActive).toBe(true);
    });

    it("should retrieve session by ID", async () => {
      const createdSession = await sessionManager.createSession(
        mockSessionData
      );
      const retrievedSession = await sessionManager.getSession(
        createdSession.id
      );

      expect(retrievedSession).toBeDefined();
      expect(retrievedSession?.id).toBe(createdSession.id);
      expect(retrievedSession?.firebaseUid).toBe(mockSessionData.firebaseUid);
    });

    it("should get user sessions", async () => {
      await sessionManager.createSession(mockSessionData);
      await sessionManager.createSession({
        ...mockSessionData,
        deviceInfo: {
          ...mockSessionData.deviceInfo,
          fingerprint: "different-device",
        },
      });

      const sessions = await sessionManager.getUserSessions(
        mockSessionData.firebaseUid
      );

      expect(sessions).toHaveLength(2);
      expect(
        sessions.every((s) => s.firebaseUid === mockSessionData.firebaseUid)
      ).toBe(true);
    });

    it("should terminate session", async () => {
      const session = await sessionManager.createSession(mockSessionData);
      await sessionManager.terminateSession(session.id, "Test termination");

      const retrievedSession = await sessionManager.getSession(session.id);
      expect(retrievedSession).toBeNull();
    });

    it("should terminate all user sessions", async () => {
      await sessionManager.createSession(mockSessionData);
      await sessionManager.createSession({
        ...mockSessionData,
        deviceInfo: {
          ...mockSessionData.deviceInfo,
          fingerprint: "different-device",
        },
      });

      const terminatedCount = await sessionManager.terminateAllUserSessions(
        mockSessionData.firebaseUid,
        "Test bulk termination"
      );

      expect(terminatedCount).toBe(2);

      const remainingSessions = await sessionManager.getUserSessions(
        mockSessionData.firebaseUid
      );
      expect(remainingSessions).toHaveLength(0);
    });
  });

  describe("Device Tracking", () => {
    it("should track device information", async () => {
      const trackedDevice = await sessionManager.trackDevice(
        mockSessionData.deviceInfo
      );

      expect(trackedDevice).toBeDefined();
      expect(trackedDevice.deviceFingerprint).toBe(
        mockSessionData.deviceInfo.fingerprint
      );
      expect(trackedDevice.deviceInfo).toEqual(mockSessionData.deviceInfo);
      expect(trackedDevice.isCurrentDevice).toBe(true);
      expect(trackedDevice.sessionCount).toBe(1);
    });

    it("should identify new devices", async () => {
      const isNew = await sessionManager.isNewDevice(
        mockSessionData.firebaseUid,
        "new-device-fingerprint"
      );

      expect(isNew).toBe(true);
    });
  });

  describe("Session Analytics", () => {
    it("should provide session statistics", async () => {
      await sessionManager.createSession(mockSessionData);
      await sessionManager.createSession({
        ...mockSessionData,
        firebaseUid: "different-user",
        deviceInfo: {
          ...mockSessionData.deviceInfo,
          fingerprint: "different-device",
        },
      });

      const stats = await sessionManager.getSessionStats();

      expect(stats).toBeDefined();
      expect(stats.totalSessions).toBeGreaterThan(0);
      expect(stats.activeSessions).toBeGreaterThan(0);
      expect(stats.uniqueDevices).toBeGreaterThan(0);
      expect(Array.isArray(stats.topDeviceTypes)).toBe(true);
    });

    it("should get active sessions count", async () => {
      await sessionManager.createSession(mockSessionData);
      const count = await sessionManager.getActiveSessionsCount();

      expect(count).toBeGreaterThan(0);
    });
  });

  describe("Cleanup Operations", () => {
    it("should cleanup expired blacklisted tokens", async () => {
      const tokenPair = await sessionManager.generateTokenPair(mockSessionData);
      await sessionManager.blacklistTokenPair(
        tokenPair.accessToken,
        tokenPair.refreshToken,
        "Test cleanup"
      );

      const cleanedCount =
        await sessionManager.cleanupExpiredBlacklistedTokens();

      // Since tokens are not expired yet, cleanup count should be 0
      expect(cleanedCount).toBe(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid session data gracefully", async () => {
      const invalidSessionData = {
        ...mockSessionData,
        firebaseUid: "", // Invalid empty UID
      };

      await expect(
        sessionManager.generateTokenPair(invalidSessionData)
      ).rejects.toThrow();
    });

    it("should handle non-existent session retrieval", async () => {
      const session = await sessionManager.getSession(
        "non-existent-session-id"
      );
      expect(session).toBeNull();
    });
  });
});

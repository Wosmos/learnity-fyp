/**
 * Session Manager Service Interface
 * Defines contracts for comprehensive session management with token pairs,
 * blacklisting, and device tracking
 */

import { UserRole, Permission, CustomClaims } from '@/types/auth';

export interface ISessionManagerService {
  // Firebase token management and blacklisting
  validateFirebaseToken(idToken: string): Promise<TokenValidationResult>;
  extractFirebaseTokenPayload(idToken: string): Promise<SessionPayload | null>;
  blacklistFirebaseToken(idToken: string, reason?: string): Promise<void>;
  blacklistAllUserTokens(firebaseUid: string, reason?: string): Promise<void>;
  isFirebaseTokenBlacklisted(idToken: string): Promise<boolean>;
  cleanupExpiredBlacklistedTokens(): Promise<number>;
  
  // Session tracking
  createSession(sessionData: CreateSessionData): Promise<UserSession>;
  getSession(sessionId: string): Promise<UserSession | null>;
  getUserSessions(firebaseUid: string): Promise<UserSession[]>;
  updateSessionActivity(sessionId: string, activity: SessionActivity): Promise<void>;
  terminateSession(sessionId: string, reason?: string): Promise<void>;
  terminateAllUserSessions(firebaseUid: string, reason?: string): Promise<number>;
  
  // Device tracking
  trackDevice(deviceInfo: DeviceInfo): Promise<TrackedDevice>;
  getDeviceHistory(firebaseUid: string): Promise<TrackedDevice[]>;
  isNewDevice(firebaseUid: string, deviceFingerprint: string): Promise<boolean>;
  
  // Session analytics
  getSessionStats(firebaseUid?: string): Promise<SessionStats>;
  getActiveSessionsCount(): Promise<number>;
  getSessionsByTimeRange(startDate: Date, endDate: Date): Promise<UserSession[]>;
}

// Core Types - Firebase Auth Integration
export interface FirebaseTokenInfo {
  idToken: string;
  expiresAt: Date;
  issuedAt: Date;
  claims: CustomClaims;
}

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  isBlacklisted: boolean;
  payload?: SessionPayload;
  error?: string;
}

export interface SessionPayload {
  firebaseUid: string;
  sessionId: string;
  role: UserRole;
  permissions: Permission[];
  deviceFingerprint: string;
  ipAddress: string;
  issuedAt: Date;
  expiresAt: Date;
  email?: string;
  emailVerified?: boolean;
}

export interface CreateSessionData {
  firebaseUid: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  claims: CustomClaims;
  loginMethod: LoginMethod;
}

export interface UserSession {
  id: string;
  firebaseUid: string;
  deviceFingerprint: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  loginMethod: LoginMethod;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  isActive: boolean;
  terminatedAt?: Date;
  terminationReason?: string;
  activityCount: number;
}

export interface DeviceInfo {
  fingerprint: string;
  platform: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  screenResolution: string;
  timezone: string;
  language: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface TrackedDevice {
  id: string;
  firebaseUid: string;
  deviceFingerprint: string;
  deviceInfo: DeviceInfo;
  firstSeenAt: Date;
  lastSeenAt: Date;
  sessionCount: number;
  isCurrentDevice: boolean;
  isTrusted: boolean;
  riskLevel: DeviceRiskLevel;
}

export interface SessionActivity {
  action: SessionAction;
  resource?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  terminatedSessions: number;
  averageSessionDuration: number;
  uniqueDevices: number;
  suspiciousActivities: number;
  topDeviceTypes: DeviceTypeStats[];
  topLocations: LocationStats[];
}

export interface DeviceTypeStats {
  deviceType: string;
  count: number;
  percentage: number;
}

export interface LocationStats {
  country: string;
  count: number;
  percentage: number;
}

// Enums
export enum LoginMethod {
  EMAIL_PASSWORD = 'EMAIL_PASSWORD',
  GOOGLE_OAUTH = 'GOOGLE_OAUTH',
  MICROSOFT_OAUTH = 'MICROSOFT_OAUTH',
  STATIC_ADMIN = 'STATIC_ADMIN'
}

export enum SessionAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  PERMISSION_CHECK = 'PERMISSION_CHECK',
  ROUTE_ACCESS = 'ROUTE_ACCESS',
  API_CALL = 'API_CALL',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

export enum DeviceRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Blacklist Types
export interface BlacklistedToken {
  tokenHash: string;
  firebaseUid: string;
  blacklistedAt: Date;
  expiresAt: Date;
  reason?: string;
  sessionId?: string;
}

// Configuration Types
export interface SessionConfig {
  maxSessionsPerUser: number;
  sessionInactivityTimeout: number; // milliseconds
  deviceTrustDuration: number; // milliseconds
  blacklistCleanupInterval: number; // milliseconds
  enableDeviceTracking: boolean;
  enableSessionAnalytics: boolean;
}

// Error Types
export interface SessionError {
  code: SessionErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export enum SessionErrorCode {
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_BLACKLISTED = 'TOKEN_BLACKLISTED',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_TERMINATED = 'SESSION_TERMINATED',
  MAX_SESSIONS_EXCEEDED = 'MAX_SESSIONS_EXCEEDED',
  DEVICE_NOT_TRUSTED = 'DEVICE_NOT_TRUSTED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  TOKEN_GENERATION_FAILED = 'TOKEN_GENERATION_FAILED'
}
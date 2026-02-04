/**
 * Enhanced Security Service for Authentication
 * Handles comprehensive security analysis, audit logging, and threat detection
 */

import { PrismaClient } from '@prisma/client';
import {
  ISecurityService,
  HCaptchaResult,
  LoginAttempt,
  SecurityEvent,
  AuthEvent,
  AuditFilters,
  AuditLog,
} from '@/lib/interfaces/auth';
import { generateDeviceFingerprint } from '@/lib/utils/device-fingerprint';
import { SecurityRequest, SecurityAssessment } from '@/types/auth';
import {
  RiskLevel,
  SecurityAction,
  SecurityEventType,
  EventType,
  AuthErrorCode,
} from '@/types/auth';
import { hCaptchaService } from '@/lib/services/hcaptcha.service';
import { appCheckService } from '@/lib/services/app-check.service';

export class SecurityService implements ISecurityService {
  private prisma: PrismaClient;
  private readonly RATE_LIMIT_WINDOWS = {
    immediate: 5 * 60 * 1000, // 5 minutes
    short: 15 * 60 * 1000, // 15 minutes
    medium: 60 * 60 * 1000, // 1 hour
    long: 24 * 60 * 60 * 1000, // 24 hours
  };

  private readonly RATE_LIMIT_THRESHOLDS = {
    immediate: { ip: 3, email: 2, device: 2 },
    short: { ip: 8, email: 5, device: 5 },
    medium: { ip: 15, email: 8, device: 10 },
    long: { ip: 25, email: 12, device: 15 },
  };

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Verify App Check token (delegated to AppCheckService)
   */
  async verifyAppCheckToken(token: string): Promise<boolean> {
    return await appCheckService.validateAppCheckToken(token);
  }

  /**
   * Generate App Check token (delegated to AppCheckService)
   */
  async generateAppCheckToken(): Promise<string> {
    const token = await appCheckService.getAppCheckToken();
    return token || '';
  }

  /**
   * Verify hCaptcha token (delegated to HCaptchaService)
   */
  async verifyHCaptcha(token: string, action: string): Promise<HCaptchaResult> {
    const result = await hCaptchaService.verifyTokenWithValidation(
      token,
      action
    );
    return {
      success: result.success,
      challenge_ts: result.result?.challenge_ts || new Date().toISOString(),
      hostname: result.result?.hostname || 'unknown',
      error_codes: result.success ? undefined : ['verification-failed'],
    };
  }

  /**
   * Comprehensive request analysis for security assessment
   */
  async analyzeRequest(request: SecurityRequest): Promise<SecurityAssessment> {
    try {
      const now = new Date();
      const timeWindows = {
        immediate: new Date(now.getTime() - this.RATE_LIMIT_WINDOWS.immediate),
        short: new Date(now.getTime() - this.RATE_LIMIT_WINDOWS.short),
        medium: new Date(now.getTime() - this.RATE_LIMIT_WINDOWS.medium),
        long: new Date(now.getTime() - this.RATE_LIMIT_WINDOWS.long),
      };

      // Parallel analysis for performance
      const [
        ipAnalysis,
        deviceAnalysis,
        userAnalysis,
        securityEvents,
        patternAnalysis,
      ] = await Promise.all([
        this.analyzeIPAddress(request.ipAddress, timeWindows),
        this.analyzeDevice(request.deviceFingerprint, timeWindows),
        request.firebaseUid
          ? this.analyzeUser(request.firebaseUid, timeWindows)
          : Promise.resolve(null),
        this.getRecentSecurityEvents(request.ipAddress, timeWindows.medium),
        this.analyzeRequestPatterns(request),
      ]);

      // Determine risk level based on multiple factors
      const riskFactors = [
        ipAnalysis.riskLevel,
        deviceAnalysis.riskLevel,
        userAnalysis?.riskLevel || RiskLevel.LOW,
        patternAnalysis.riskLevel,
      ];

      const highestRisk = this.getHighestRiskLevel(riskFactors);
      const blockedReasons: string[] = [];
      const allowedActions: SecurityAction[] = [];

      // Compile blocked reasons
      if (ipAnalysis.blocked) blockedReasons.push(...ipAnalysis.reasons);
      if (deviceAnalysis.blocked)
        blockedReasons.push(...deviceAnalysis.reasons);
      if (userAnalysis?.blocked) blockedReasons.push(...userAnalysis.reasons);
      if (patternAnalysis.blocked)
        blockedReasons.push(...patternAnalysis.reasons);
      if (securityEvents.length > 0)
        blockedReasons.push(`${securityEvents.length} recent security events`);

      // Determine allowed actions based on risk level
      switch (highestRisk) {
        case RiskLevel.LOW:
          allowedActions.push(...Object.values(SecurityAction));
          break;
        case RiskLevel.MEDIUM:
          allowedActions.push(
            SecurityAction.LOGIN,
            SecurityAction.PROFILE_UPDATE
          );
          break;
        case RiskLevel.HIGH:
          allowedActions.push(SecurityAction.LOGIN); // Only login with additional verification
          break;
        case RiskLevel.CRITICAL:
          // No actions allowed
          break;
      }

      return {
        riskLevel: highestRisk,
        requiresAdditionalVerification: highestRisk >= RiskLevel.MEDIUM,
        requiresCaptcha:
          highestRisk >= RiskLevel.MEDIUM || blockedReasons.length > 0,
        blockedReasons,
        allowedActions,
      };
    } catch (error) {
      console.error('Security analysis failed:', error);
      // Fail secure - return high risk assessment
      return {
        riskLevel: RiskLevel.HIGH,
        requiresAdditionalVerification: true,
        requiresCaptcha: true,
        blockedReasons: ['Security analysis failed'],
        allowedActions: [SecurityAction.LOGIN],
      };
    }
  }

  /**
   * Generate device fingerprint with enhanced entropy
   */
  generateDeviceFingerprint(request: Request): string {
    return generateDeviceFingerprint(request, {
      hashLength: 24,
      enhancedEntropy: true,
    });
  }

  /**
   * Analyze login attempt for comprehensive security assessment
   */
  async analyzeLoginAttempt(
    attempt: LoginAttempt
  ): Promise<SecurityAssessment> {
    const securityRequest: SecurityRequest = {
      ipAddress: attempt.ipAddress,
      userAgent: attempt.userAgent,
      deviceFingerprint: attempt.deviceFingerprint,
      timestamp: attempt.timestamp,
      action: SecurityAction.LOGIN,
      firebaseUid: attempt.firebaseUid,
    };

    const assessment = await this.analyzeRequest(securityRequest);

    // Additional login-specific analysis
    if (attempt.success === false && attempt.errorCode) {
      // Increase risk for specific error patterns
      if (
        [
          AuthErrorCode.INVALID_CREDENTIALS,
          AuthErrorCode.ACCOUNT_NOT_FOUND,
        ].includes(attempt.errorCode as AuthErrorCode)
      ) {
        assessment.riskLevel = this.increaseRiskLevel(assessment.riskLevel);
        assessment.requiresCaptcha = true;
      }
    }

    return assessment;
  }

  /**
   * Flag suspicious activity and create security event
   */
  async flagSuspiciousActivity(
    firebaseUid: string,
    activity: SecurityEvent
  ): Promise<void> {
    try {
      await this.prisma.securityEvent.create({
        data: {
          firebaseUid,
          eventType: activity.type as SecurityEventType,
          riskLevel: activity.riskLevel as RiskLevel,
          ipAddress: activity.ipAddress,
          userAgent: activity.userAgent,
          deviceFingerprint: activity.deviceFingerprint,
          blocked: activity.blocked,
          reason: activity.reason,
          metadata: activity.metadata || {},
        },
      });

      // Auto-escalate critical events
      if (activity.riskLevel === RiskLevel.CRITICAL) {
        await this.escalateCriticalEvent(firebaseUid, activity);
      }
    } catch (error) {
      console.error('Failed to flag suspicious activity:', error);
    }
  }

  /**
   * Log authentication event with comprehensive metadata
   */
  async logAuthEvent(event: AuthEvent): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          firebaseUid: event.firebaseUid,
          eventType: event.type as EventType,
          action: event.action,
          resource: event.resource,
          oldValues: event.oldValues || {},
          newValues: event.newValues || {},
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          deviceFingerprint: event.deviceFingerprint,
          success: event.success,
          errorMessage: event.errorMessage,
          metadata: event.metadata || {},
        },
      });
    } catch (error) {
      console.error('Failed to log auth event:', error);
    }
  }

  /**
   * Log security event
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    await this.flagSuspiciousActivity(event.firebaseUid || '', event);
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(filters: AuditFilters): Promise<AuditLog[]> {
    try {
      const where: any = {};

      if (filters.userId) where.userId = filters.userId;
      if (filters.firebaseUid) where.firebaseUid = filters.firebaseUid;
      if (filters.eventType) where.eventType = filters.eventType;
      if (filters.success !== undefined) where.success = filters.success;
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
      }

      const auditLogs = await this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 100,
        skip: filters.offset || 0,
      });

      return auditLogs.map(log => ({
        id: log.id,
        userId: log.userId || undefined,
        firebaseUid: log.firebaseUid || undefined,
        eventType: log.eventType,
        action: log.action,
        resource: log.resource || undefined,
        oldValues: (log.oldValues as Record<string, any>) || undefined,
        newValues: (log.newValues as Record<string, any>) || undefined,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        deviceFingerprint: log.deviceFingerprint || undefined,
        success: log.success,
        errorMessage: log.errorMessage || undefined,
        metadata: (log.metadata as Record<string, any>) || undefined,
        createdAt: log.createdAt,
      }));
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return [];
    }
  }

  // Private helper methods

  private async analyzeIPAddress(
    ipAddress: string,
    timeWindows: any
  ): Promise<{
    riskLevel: RiskLevel;
    blocked: boolean;
    reasons: string[];
  }> {
    const [immediateFailures, shortFailures, mediumFailures, longFailures] =
      await Promise.all([
        this.prisma.auditLog.count({
          where: {
            ipAddress,
            eventType: EventType.AUTH_LOGIN,
            success: false,
            createdAt: { gte: timeWindows.immediate },
          },
        }),
        this.prisma.auditLog.count({
          where: {
            ipAddress,
            eventType: EventType.AUTH_LOGIN,
            success: false,
            createdAt: { gte: timeWindows.short },
          },
        }),
        this.prisma.auditLog.count({
          where: {
            ipAddress,
            eventType: EventType.AUTH_LOGIN,
            success: false,
            createdAt: { gte: timeWindows.medium },
          },
        }),
        this.prisma.auditLog.count({
          where: {
            ipAddress,
            eventType: EventType.AUTH_LOGIN,
            success: false,
            createdAt: { gte: timeWindows.long },
          },
        }),
      ]);

    const reasons: string[] = [];
    let riskLevel = RiskLevel.LOW;
    let blocked = false;

    if (immediateFailures >= this.RATE_LIMIT_THRESHOLDS.immediate.ip) {
      riskLevel = RiskLevel.CRITICAL;
      blocked = true;
      reasons.push(`${immediateFailures} failures in 5 minutes`);
    } else if (shortFailures >= this.RATE_LIMIT_THRESHOLDS.short.ip) {
      riskLevel = RiskLevel.HIGH;
      blocked = true;
      reasons.push(`${shortFailures} failures in 15 minutes`);
    } else if (mediumFailures >= this.RATE_LIMIT_THRESHOLDS.medium.ip) {
      riskLevel = RiskLevel.HIGH;
      reasons.push(`${mediumFailures} failures in 1 hour`);
    } else if (longFailures >= this.RATE_LIMIT_THRESHOLDS.long.ip) {
      riskLevel = RiskLevel.MEDIUM;
      reasons.push(`${longFailures} failures in 24 hours`);
    }

    return { riskLevel, blocked, reasons };
  }

  private async analyzeDevice(
    deviceFingerprint: string,
    timeWindows: any
  ): Promise<{
    riskLevel: RiskLevel;
    blocked: boolean;
    reasons: string[];
  }> {
    const deviceFailures = await this.prisma.auditLog.count({
      where: {
        deviceFingerprint,
        eventType: EventType.AUTH_LOGIN,
        success: false,
        createdAt: { gte: timeWindows.medium },
      },
    });

    const reasons: string[] = [];
    let riskLevel = RiskLevel.LOW;
    let blocked = false;

    if (deviceFailures >= this.RATE_LIMIT_THRESHOLDS.medium.device) {
      riskLevel = RiskLevel.HIGH;
      blocked = true;
      reasons.push(`${deviceFailures} device failures`);
    } else if (deviceFailures >= 5) {
      riskLevel = RiskLevel.MEDIUM;
      reasons.push(`${deviceFailures} device failures`);
    }

    return { riskLevel, blocked, reasons };
  }

  private async analyzeUser(
    firebaseUid: string,
    timeWindows: any
  ): Promise<{
    riskLevel: RiskLevel;
    blocked: boolean;
    reasons: string[];
  }> {
    const userFailures = await this.prisma.auditLog.count({
      where: {
        firebaseUid,
        eventType: EventType.AUTH_LOGIN,
        success: false,
        createdAt: { gte: timeWindows.short },
      },
    });

    const reasons: string[] = [];
    let riskLevel = RiskLevel.LOW;
    let blocked = false;

    if (userFailures >= 10) {
      riskLevel = RiskLevel.HIGH;
      blocked = true;
      reasons.push(`${userFailures} user failures`);
    } else if (userFailures >= 5) {
      riskLevel = RiskLevel.MEDIUM;
      reasons.push(`${userFailures} user failures`);
    }

    return { riskLevel, blocked, reasons };
  }

  private async analyzeRequestPatterns(request: SecurityRequest): Promise<{
    riskLevel: RiskLevel;
    blocked: boolean;
    reasons: string[];
  }> {
    // Analyze user agent for bot patterns
    const userAgent = request.userAgent.toLowerCase();
    const reasons: string[] = [];
    let riskLevel = RiskLevel.LOW;
    let blocked = false;

    // Check for bot indicators
    const botIndicators = [
      'bot',
      'crawler',
      'spider',
      'scraper',
      'curl',
      'wget',
    ];
    if (botIndicators.some(indicator => userAgent.includes(indicator))) {
      riskLevel = RiskLevel.HIGH;
      blocked = true;
      reasons.push('Bot user agent detected');
    }

    // Check for suspicious user agent patterns
    if (userAgent.length < 10 || userAgent === 'unknown') {
      riskLevel = RiskLevel.MEDIUM;
      reasons.push('Suspicious user agent');
    }

    return { riskLevel, blocked, reasons };
  }

  private async getRecentSecurityEvents(
    ipAddress: string,
    since: Date
  ): Promise<unknown[]> {
    return await this.prisma.securityEvent.findMany({
      where: {
        ipAddress,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  private getHighestRiskLevel(riskLevels: RiskLevel[]): RiskLevel {
    const riskOrder = [
      RiskLevel.LOW,
      RiskLevel.MEDIUM,
      RiskLevel.HIGH,
      RiskLevel.CRITICAL,
    ];
    return riskLevels.reduce((highest, current) => {
      return riskOrder.indexOf(current) > riskOrder.indexOf(highest)
        ? current
        : highest;
    }, RiskLevel.LOW);
  }

  private increaseRiskLevel(currentLevel: RiskLevel): RiskLevel {
    switch (currentLevel) {
      case RiskLevel.LOW:
        return RiskLevel.MEDIUM;
      case RiskLevel.MEDIUM:
        return RiskLevel.HIGH;
      case RiskLevel.HIGH:
        return RiskLevel.CRITICAL;
      default:
        return currentLevel;
    }
  }

  private async escalateCriticalEvent(
    firebaseUid: string,
    event: SecurityEvent
  ): Promise<void> {
    // Log critical event escalation
    console.error('CRITICAL SECURITY EVENT:', {
      firebaseUid,
      event: event.type,
      ipAddress: event.ipAddress,
      reason: event.reason,
      timestamp: new Date().toISOString(),
    });

    // In production, this could trigger alerts, notifications, etc.
  }

  /**
   * Cleanup database connections
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Export singleton instance
export const securityService = new SecurityService();

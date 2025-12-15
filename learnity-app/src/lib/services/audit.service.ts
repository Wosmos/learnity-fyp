/**
 * Comprehensive Audit Logging and Monitoring Service
 * Handles detailed authentication event logging, security monitoring, and audit trail management
 */

import { PrismaClient } from '@prisma/client';
import { 
  AuditLog,
  AuditFilters,
  AuthEvent,
  SecurityEvent
} from '@/lib/interfaces/auth';
import { 
  EventType,
  SecurityEventType,
  RiskLevel
} from '@/types/auth';

export interface IAuditService {
  // Enhanced audit logging
  logAuthenticationEvent(event: AuthenticationEventData): Promise<void>;
  logSecurityEvent(event: SecurityEventData): Promise<void>;
  logAdminAction(event: AdminActionData): Promise<void>;
  logSystemEvent(event: SystemEventData): Promise<void>;
  
  // Audit retrieval and analysis
  getAuditLogs(filters: AuditFilters): Promise<PaginatedAuditLogs>;
  getSecurityEvents(filters: SecurityEventFilters): Promise<PaginatedSecurityEvents>;
  getAuditSummary(timeRange: TimeRange): Promise<AuditSummary>;
  
  // Security monitoring
  detectSuspiciousPatterns(timeRange: TimeRange): Promise<SuspiciousPattern[]>;
  generateSecurityReport(timeRange: TimeRange): Promise<SecurityReport>;
  getFailedLoginAnalysis(timeRange: TimeRange): Promise<FailedLoginAnalysis>;
  
  // Automated alerts
  checkForAlerts(): Promise<SecurityAlert[]>;
  createAlert(alert: CreateAlertData): Promise<void>;
  resolveAlert(alertId: string, resolution: string): Promise<void>;
}

export interface AuthenticationEventData {
  firebaseUid?: string;
  email?: string;
  eventType: EventType;
  action: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface SecurityEventData {
  firebaseUid?: string;
  eventType: SecurityEventType;
  riskLevel: RiskLevel;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  blocked: boolean;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface AdminActionData {
  adminFirebaseUid: string;
  action: string;
  targetResource: string;
  targetUserId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
}

export interface SystemEventData {
  eventType: string;
  action: string;
  component: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface PaginatedAuditLogs {
  logs: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedSecurityEvents {
  events: SecurityEventWithUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SecurityEventWithUser {
  id: string;
  firebaseUid?: string;
  eventType: SecurityEventType;
  riskLevel: RiskLevel;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  blocked: boolean;
  reason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface SecurityEventFilters extends AuditFilters {
  eventType?: SecurityEventType;
  riskLevel?: RiskLevel;
  blocked?: boolean;
  ipAddress?: string;
}

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export interface AuditSummary {
  totalEvents: number;
  successfulLogins: number;
  failedLogins: number;
  registrations: number;
  passwordResets: number;
  securityEvents: number;
  topIpAddresses: IpAddressStats[];
  topUserAgents: UserAgentStats[];
  eventsByHour: HourlyStats[];
}

export interface IpAddressStats {
  ipAddress: string;
  count: number;
  successRate: number;
  lastSeen: Date;
}

export interface UserAgentStats {
  userAgent: string;
  count: number;
  uniqueUsers: number;
  lastSeen: Date;
}

export interface HourlyStats {
  hour: number;
  date: string;
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
}

export interface SuspiciousPattern {
  type: 'MULTIPLE_FAILED_LOGINS' | 'UNUSUAL_IP_ACTIVITY' | 'BOT_ACTIVITY' | 'BRUTE_FORCE_ATTACK';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedUsers: string[];
  ipAddresses: string[];
  timeRange: TimeRange;
  eventCount: number;
  metadata: Record<string, any>;
}

export interface SecurityReport {
  timeRange: TimeRange;
  summary: AuditSummary;
  suspiciousPatterns: SuspiciousPattern[];
  topThreats: ThreatSummary[];
  recommendations: string[];
  generatedAt: Date;
}

export interface ThreatSummary {
  type: string;
  count: number;
  severity: string;
  description: string;
}

export interface FailedLoginAnalysis {
  totalFailedLogins: number;
  uniqueIpAddresses: number;
  uniqueUsers: number;
  topFailureReasons: FailureReasonStats[];
  timeDistribution: HourlyStats[];
  ipAddressAnalysis: IpAddressStats[];
}

export interface FailureReasonStats {
  reason: string;
  count: number;
  percentage: number;
}

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

export interface CreateAlertData {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

export class AuditService implements IAuditService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Log comprehensive authentication events
   */
  async logAuthenticationEvent(event: AuthenticationEventData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          firebaseUid: event.firebaseUid,
          eventType: event.eventType,
          action: event.action,
          resource: 'authentication',
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          deviceFingerprint: event.deviceFingerprint,
          success: event.success,
          errorMessage: event.errorMessage,
          metadata: {
            ...event.metadata,
            email: event.email,
            timestamp: new Date().toISOString()
          }
        }
      });

      // Auto-detect suspicious patterns for failed logins
      if (!event.success && event.eventType === EventType.AUTH_LOGIN) {
        await this.checkForSuspiciousLoginActivity(event);
      }
    } catch (error) {
      console.error('Failed to log authentication event:', error);
    }
  }

  /**
   * Log security events with enhanced metadata
   */
  async logSecurityEvent(event: SecurityEventData): Promise<void> {
    try {
      await this.prisma.securityEvent.create({
        data: {
          firebaseUid: event.firebaseUid,
          eventType: event.eventType,
          riskLevel: event.riskLevel,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          deviceFingerprint: event.deviceFingerprint,
          blocked: event.blocked,
          reason: event.reason,
          metadata: {
            ...event.metadata,
            timestamp: new Date().toISOString()
          }
        }
      });

      // Create alerts for high-risk events
      if (event.riskLevel === RiskLevel.HIGH || event.riskLevel === RiskLevel.CRITICAL) {
        await this.createSecurityAlert(event);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Log admin actions with full audit trail
   */
  async logAdminAction(event: AdminActionData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          firebaseUid: event.adminFirebaseUid,
          eventType: EventType.ADMIN_ACTION,
          action: event.action,
          resource: event.targetResource,
          oldValues: event.oldValues || {},
          newValues: event.newValues || {},
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          success: event.success,
          errorMessage: event.errorMessage,
          metadata: {
            targetUserId: event.targetUserId,
            adminAction: true,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }

  /**
   * Log system events for monitoring
   */
  async logSystemEvent(event: SystemEventData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          eventType: EventType.ADMIN_ACTION, // Using ADMIN_ACTION for system events
          action: event.action,
          resource: event.component,
          ipAddress: 'system',
          userAgent: 'system',
          success: event.success,
          errorMessage: event.errorMessage,
          metadata: {
            ...event.metadata,
            systemEvent: true,
            eventType: event.eventType,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Failed to log system event:', error);
    }
  }

  /**
   * Get paginated audit logs with advanced filtering
   */
  async getAuditLogs(filters: AuditFilters): Promise<PaginatedAuditLogs> {
    try {
      const page = Math.max(1, filters.offset ? Math.floor(filters.offset / (filters.limit || 50)) + 1 : 1);
      const pageSize = Math.min(100, filters.limit || 50);
      const skip = (page - 1) * pageSize;

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

      const [logs, total] = await Promise.all([
        this.prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: pageSize,
          skip,
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                role: true
              }
            }
          }
        }),
        this.prisma.auditLog.count({ where })
      ]);

      return {
        logs: logs.map(log => ({
          id: log.id,
          userId: log.userId || undefined,
          firebaseUid: log.firebaseUid || undefined,
          eventType: log.eventType,
          action: log.action,
          resource: log.resource || undefined,
          oldValues: log.oldValues as Record<string, any> || undefined,
          newValues: log.newValues as Record<string, any> || undefined,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          deviceFingerprint: log.deviceFingerprint || undefined,
          success: log.success,
          errorMessage: log.errorMessage || undefined,
          metadata: log.metadata as Record<string, any> || undefined,
          createdAt: log.createdAt
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return {
        logs: [],
        total: 0,
        page: 1,
        pageSize: 50,
        totalPages: 0
      };
    }
  }

  /**
   * Get paginated security events with user information
   */
  async getSecurityEvents(filters: SecurityEventFilters): Promise<PaginatedSecurityEvents> {
    try {
      const page = Math.max(1, filters.offset ? Math.floor(filters.offset / (filters.limit || 50)) + 1 : 1);
      const pageSize = Math.min(100, filters.limit || 50);
      const skip = (page - 1) * pageSize;

      const where: any = {};

      if (filters.firebaseUid) where.firebaseUid = filters.firebaseUid;
      if (filters.eventType) where.eventType = filters.eventType;
      if (filters.riskLevel) where.riskLevel = filters.riskLevel;
      if (filters.blocked !== undefined) where.blocked = filters.blocked;
      if (filters.ipAddress) where.ipAddress = filters.ipAddress;
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
      }

      const [events, total] = await Promise.all([
        this.prisma.securityEvent.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: pageSize,
          skip,
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                role: true
              }
            }
          }
        }),
        this.prisma.securityEvent.count({ where })
      ]);

      return {
        events: events.map(event => ({
          id: event.id,
          firebaseUid: event.firebaseUid || undefined,
          eventType: event.eventType as SecurityEventType,
          riskLevel: event.riskLevel as RiskLevel,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          deviceFingerprint: event.deviceFingerprint,
          blocked: event.blocked,
          reason: event.reason || undefined,
          metadata: event.metadata as Record<string, any> || undefined,
          createdAt: event.createdAt,
          user: event.user ? {
            email: event.user.email,
            firstName: event.user.firstName,
            lastName: event.user.lastName,
            role: event.user.role
          } : undefined
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error) {
      console.error('Failed to get security events:', error);
      return {
        events: [],
        total: 0,
        page: 1,
        pageSize: 50,
        totalPages: 0
      };
    }
  }

  /**
   * Generate comprehensive audit summary
   */
  async getAuditSummary(timeRange: TimeRange): Promise<AuditSummary> {
    try {
      const [
        totalEvents,
        successfulLogins,
        failedLogins,
        registrations,
        passwordResets,
        securityEvents,
        topIpAddresses,
        topUserAgents,
        eventsByHour
      ] = await Promise.all([
        this.prisma.auditLog.count({
          where: {
            createdAt: { gte: timeRange.startDate, lte: timeRange.endDate }
          }
        }),
        this.prisma.auditLog.count({
          where: {
            eventType: EventType.AUTH_LOGIN,
            success: true,
            createdAt: { gte: timeRange.startDate, lte: timeRange.endDate }
          }
        }),
        this.prisma.auditLog.count({
          where: {
            eventType: EventType.AUTH_LOGIN,
            success: false,
            createdAt: { gte: timeRange.startDate, lte: timeRange.endDate }
          }
        }),
        this.prisma.auditLog.count({
          where: {
            eventType: EventType.AUTH_REGISTER,
            createdAt: { gte: timeRange.startDate, lte: timeRange.endDate }
          }
        }),
        this.prisma.auditLog.count({
          where: {
            eventType: EventType.AUTH_PASSWORD_RESET,
            createdAt: { gte: timeRange.startDate, lte: timeRange.endDate }
          }
        }),
        this.prisma.securityEvent.count({
          where: {
            createdAt: { gte: timeRange.startDate, lte: timeRange.endDate }
          }
        }),
        this.getTopIpAddresses(timeRange),
        this.getTopUserAgents(timeRange),
        this.getEventsByHour(timeRange)
      ]);

      return {
        totalEvents,
        successfulLogins,
        failedLogins,
        registrations,
        passwordResets,
        securityEvents,
        topIpAddresses,
        topUserAgents,
        eventsByHour
      };
    } catch (error) {
      console.error('Failed to generate audit summary:', error);
      return {
        totalEvents: 0,
        successfulLogins: 0,
        failedLogins: 0,
        registrations: 0,
        passwordResets: 0,
        securityEvents: 0,
        topIpAddresses: [],
        topUserAgents: [],
        eventsByHour: []
      };
    }
  }

  /**
   * Detect suspicious patterns in authentication data
   */
  async detectSuspiciousPatterns(timeRange: TimeRange): Promise<SuspiciousPattern[]> {
    const patterns: SuspiciousPattern[] = [];

    try {
      // Detect multiple failed logins from same IP
      const failedLoginsByIp = await this.prisma.auditLog.groupBy({
        by: ['ipAddress'],
        where: {
          eventType: EventType.AUTH_LOGIN,
          success: false,
          createdAt: { gte: timeRange.startDate, lte: timeRange.endDate }
        },
        _count: { ipAddress: true },
        having: { ipAddress: { _count: { gt: 10 } } }
      });

      for (const ipGroup of failedLoginsByIp) {
        patterns.push({
          type: 'MULTIPLE_FAILED_LOGINS',
          description: `${ipGroup._count.ipAddress} failed login attempts from IP ${ipGroup.ipAddress}`,
          severity: ipGroup._count.ipAddress > 50 ? 'CRITICAL' : ipGroup._count.ipAddress > 25 ? 'HIGH' : 'MEDIUM',
          affectedUsers: [],
          ipAddresses: [ipGroup.ipAddress],
          timeRange,
          eventCount: ipGroup._count.ipAddress,
          metadata: { ipAddress: ipGroup.ipAddress }
        });
      }

      // Detect bot activity patterns
      const botPatterns = await this.prisma.auditLog.findMany({
        where: {
          userAgent: { contains: 'bot', mode: 'insensitive' },
          createdAt: { gte: timeRange.startDate, lte: timeRange.endDate }
        },
        select: { ipAddress: true, userAgent: true },
        distinct: ['ipAddress', 'userAgent']
      });

      if (botPatterns.length > 0) {
        patterns.push({
          type: 'BOT_ACTIVITY',
          description: `Bot activity detected from ${botPatterns.length} different sources`,
          severity: 'MEDIUM',
          affectedUsers: [],
          ipAddresses: [...new Set(botPatterns.map(p => p.ipAddress))],
          timeRange,
          eventCount: botPatterns.length,
          metadata: { botPatterns }
        });
      }

      return patterns;
    } catch (error) {
      console.error('Failed to detect suspicious patterns:', error);
      return [];
    }
  }

  /**
   * Generate comprehensive security report
   */
  async generateSecurityReport(timeRange: TimeRange): Promise<SecurityReport> {
    try {
      const [summary, suspiciousPatterns, topThreats] = await Promise.all([
        this.getAuditSummary(timeRange),
        this.detectSuspiciousPatterns(timeRange),
        this.getTopThreats(timeRange)
      ]);

      const recommendations = this.generateRecommendations(summary, suspiciousPatterns);

      return {
        timeRange,
        summary,
        suspiciousPatterns,
        topThreats,
        recommendations,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to generate security report:', error);
      throw error;
    }
  }

  /**
   * Analyze failed login attempts
   */
  async getFailedLoginAnalysis(timeRange: TimeRange): Promise<FailedLoginAnalysis> {
    try {
      const failedLogins = await this.prisma.auditLog.findMany({
        where: {
          eventType: EventType.AUTH_LOGIN,
          success: false,
          createdAt: { gte: timeRange.startDate, lte: timeRange.endDate }
        },
        select: {
          ipAddress: true,
          firebaseUid: true,
          errorMessage: true,
          createdAt: true
        }
      });

      const totalFailedLogins = failedLogins.length;
      const uniqueIpAddresses = new Set(failedLogins.map(f => f.ipAddress)).size;
      const uniqueUsers = new Set(failedLogins.filter(f => f.firebaseUid).map(f => f.firebaseUid)).size;

      // Analyze failure reasons
      const failureReasons = failedLogins.reduce((acc, login) => {
        const reason = login.errorMessage || 'Unknown';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topFailureReasons: FailureReasonStats[] = Object.entries(failureReasons)
        .map(([reason, count]) => ({
          reason,
          count,
          percentage: (count / totalFailedLogins) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Generate time distribution and IP analysis
      const timeDistribution = await this.getEventsByHour(timeRange, EventType.AUTH_LOGIN, false);
      const ipAddressAnalysis = await this.getTopIpAddresses(timeRange, false);

      return {
        totalFailedLogins,
        uniqueIpAddresses,
        uniqueUsers,
        topFailureReasons,
        timeDistribution,
        ipAddressAnalysis
      };
    } catch (error) {
      console.error('Failed to analyze failed logins:', error);
      throw error;
    }
  }

  /**
   * Check for automated security alerts
   */
  async checkForAlerts(): Promise<SecurityAlert[]> {
    // This would be implemented with a separate alerts table
    // For now, return empty array as placeholder
    return [];
  }

  /**
   * Create security alert
   */
  async createAlert(alert: CreateAlertData): Promise<void> {
    // This would be implemented with a separate alerts table
    console.log('Security alert created:', alert);
  }

  /**
   * Resolve security alert
   */
  async resolveAlert(alertId: string, resolution: string): Promise<void> {
    // This would be implemented with a separate alerts table
    console.log('Security alert resolved:', { alertId, resolution });
  }

  // Private helper methods

  private async checkForSuspiciousLoginActivity(event: AuthenticationEventData): Promise<void> {
    const recentFailures = await this.prisma.auditLog.count({
      where: {
        ipAddress: event.ipAddress,
        eventType: EventType.AUTH_LOGIN,
        success: false,
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } // Last 15 minutes
      }
    });

    if (recentFailures >= 5) {
      await this.logSecurityEvent({
        firebaseUid: event.firebaseUid,
        eventType: SecurityEventType.MULTIPLE_FAILED_ATTEMPTS,
        riskLevel: RiskLevel.HIGH,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        deviceFingerprint: event.deviceFingerprint || '',
        blocked: false,
        reason: `${recentFailures} failed login attempts in 15 minutes`,
        metadata: { failureCount: recentFailures }
      });
    }
  }

  private async createSecurityAlert(event: SecurityEventData): Promise<void> {
    await this.createAlert({
      type: event.eventType,
      severity: event.riskLevel === RiskLevel.CRITICAL ? 'CRITICAL' : 'HIGH',
      title: `Security Event: ${event.eventType}`,
      description: event.reason || 'High-risk security event detected',
      metadata: {
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        firebaseUid: event.firebaseUid,
        ...event.metadata
      }
    });
  }

  private async getTopIpAddresses(timeRange: TimeRange, successOnly: boolean = true): Promise<IpAddressStats[]> {
    const ipGroups = await this.prisma.auditLog.groupBy({
      by: ['ipAddress'],
      where: {
        createdAt: { gte: timeRange.startDate, lte: timeRange.endDate },
        ...(successOnly ? { success: true } : {})
      },
      _count: { ipAddress: true },
      orderBy: { _count: { ipAddress: 'desc' } },
      take: 10
    });

    const ipStats: IpAddressStats[] = [];
    for (const ipGroup of ipGroups) {
      const [totalEvents, successfulEvents, lastEvent] = await Promise.all([
        this.prisma.auditLog.count({
          where: {
            ipAddress: ipGroup.ipAddress,
            createdAt: { gte: timeRange.startDate, lte: timeRange.endDate }
          }
        }),
        this.prisma.auditLog.count({
          where: {
            ipAddress: ipGroup.ipAddress,
            success: true,
            createdAt: { gte: timeRange.startDate, lte: timeRange.endDate }
          }
        }),
        this.prisma.auditLog.findFirst({
          where: { ipAddress: ipGroup.ipAddress },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        })
      ]);

      ipStats.push({
        ipAddress: ipGroup.ipAddress,
        count: totalEvents,
        successRate: totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0,
        lastSeen: lastEvent?.createdAt || new Date()
      });
    }

    return ipStats;
  }

  private async getTopUserAgents(timeRange: TimeRange): Promise<UserAgentStats[]> {
    const userAgentGroups = await this.prisma.auditLog.groupBy({
      by: ['userAgent'],
      where: {
        createdAt: { gte: timeRange.startDate, lte: timeRange.endDate }
      },
      _count: { userAgent: true },
      orderBy: { _count: { userAgent: 'desc' } },
      take: 10
    });

    const userAgentStats: UserAgentStats[] = [];
    for (const uaGroup of userAgentGroups) {
      const [uniqueUsers, lastEvent] = await Promise.all([
        this.prisma.auditLog.findMany({
          where: {
            userAgent: uaGroup.userAgent,
            firebaseUid: { not: null },
            createdAt: { gte: timeRange.startDate, lte: timeRange.endDate }
          },
          select: { firebaseUid: true },
          distinct: ['firebaseUid']
        }),
        this.prisma.auditLog.findFirst({
          where: { userAgent: uaGroup.userAgent },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        })
      ]);

      userAgentStats.push({
        userAgent: uaGroup.userAgent,
        count: uaGroup._count.userAgent,
        uniqueUsers: uniqueUsers.length,
        lastSeen: lastEvent?.createdAt || new Date()
      });
    }

    return userAgentStats;
  }

  private async getEventsByHour(timeRange: TimeRange, eventType?: EventType, successOnly?: boolean): Promise<HourlyStats[]> {
    const events = await this.prisma.auditLog.findMany({
      where: {
        createdAt: { gte: timeRange.startDate, lte: timeRange.endDate },
        ...(eventType ? { eventType } : {}),
        ...(successOnly !== undefined ? { success: successOnly } : {})
      },
      select: {
        createdAt: true,
        success: true
      }
    });

    const hourlyData: Record<string, HourlyStats> = {};

    events.forEach(event => {
      const hour = event.createdAt.getHours();
      const date = event.createdAt.toISOString().split('T')[0];
      const key = `${date}-${hour}`;

      if (!hourlyData[key]) {
        hourlyData[key] = {
          hour,
          date,
          totalEvents: 0,
          successfulEvents: 0,
          failedEvents: 0
        };
      }

      hourlyData[key].totalEvents++;
      if (event.success) {
        hourlyData[key].successfulEvents++;
      } else {
        hourlyData[key].failedEvents++;
      }
    });

    return Object.values(hourlyData).sort((a, b) => 
      new Date(`${a.date}T${a.hour.toString().padStart(2, '0')}:00:00`).getTime() - 
      new Date(`${b.date}T${b.hour.toString().padStart(2, '0')}:00:00`).getTime()
    );
  }

  private async getTopThreats(timeRange: TimeRange): Promise<ThreatSummary[]> {
    const securityEvents = await this.prisma.securityEvent.groupBy({
      by: ['eventType', 'riskLevel'],
      where: {
        createdAt: { gte: timeRange.startDate, lte: timeRange.endDate }
      },
      _count: { eventType: true },
      orderBy: { _count: { eventType: 'desc' } }
    });

    return securityEvents.map(event => ({
      type: event.eventType,
      count: event._count.eventType,
      severity: event.riskLevel,
      description: this.getThreatDescription(event.eventType, event.riskLevel)
    }));
  }

  private getThreatDescription(eventType: string, riskLevel: string): string {
    const descriptions: Record<string, string> = {
      'SUSPICIOUS_LOGIN': 'Unusual login patterns detected',
      'RATE_LIMIT_EXCEEDED': 'Rate limiting triggered due to excessive requests',
      'BOT_DETECTED': 'Automated bot activity identified',
      'MULTIPLE_FAILED_ATTEMPTS': 'Multiple failed authentication attempts',
      'NEW_DEVICE_LOGIN': 'Login from unrecognized device',
      'UNUSUAL_ACTIVITY': 'Anomalous user behavior detected'
    };

    return descriptions[eventType] || 'Unknown security event';
  }

  private generateRecommendations(summary: AuditSummary, patterns: SuspiciousPattern[]): string[] {
    const recommendations: string[] = [];

    if (summary.failedLogins > summary.successfulLogins * 0.1) {
      recommendations.push('High failure rate detected. Consider implementing additional security measures.');
    }

    if (patterns.some(p => p.type === 'MULTIPLE_FAILED_LOGINS')) {
      recommendations.push('Implement progressive rate limiting for failed login attempts.');
    }

    if (patterns.some(p => p.type === 'BOT_ACTIVITY')) {
      recommendations.push('Enable CAPTCHA verification for suspicious traffic.');
    }

    if (summary.securityEvents > 100) {
      recommendations.push('Review security event patterns and consider tightening security policies.');
    }

    return recommendations;
  }

  /**
   * Cleanup database connections
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Export singleton instance
export const auditService = new AuditService();
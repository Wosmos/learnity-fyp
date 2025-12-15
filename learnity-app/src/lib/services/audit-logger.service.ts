/**
 * Audit Logger Service
 * Handles logging of authentication events and access control violations
 */

import { UserRole } from '@/types/auth';

export interface AuditEvent {
  eventType: AuditEventType;
  userId?: string;
  userEmail?: string;
  userRole?: UserRole;
  resource: string;
  action: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  details?: Record<string, any>;
  errorMessage?: string;
}

export enum AuditEventType {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  ACCESS_DENIED = 'ACCESS_DENIED',
  ROLE_VERIFICATION = 'ROLE_VERIFICATION',
  DASHBOARD_ACCESS = 'DASHBOARD_ACCESS',
  UNAUTHORIZED_ATTEMPT = 'UNAUTHORIZED_ATTEMPT'
}

class AuditLoggerService {
  private static instance: AuditLoggerService;

  private constructor() {}

  public static getInstance(): AuditLoggerService {
    if (!AuditLoggerService.instance) {
      AuditLoggerService.instance = new AuditLoggerService();
    }
    return AuditLoggerService.instance;
  }

  /**
   * Log successful dashboard access
   */
  public logDashboardAccess(
    userId: string,
    userEmail: string,
    userRole: UserRole,
    dashboardType: string
  ): void {
    const event: AuditEvent = {
      eventType: AuditEventType.DASHBOARD_ACCESS,
      userId,
      userEmail,
      userRole,
      resource: `dashboard/${dashboardType}`,
      action: 'ACCESS',
      success: true,
      timestamp: new Date().toISOString(),
      details: {
        dashboardType,
        accessMethod: 'client-side-protection'
      }
    };

    this.logEvent(event);
  }

  /**
   * Log unauthorized access attempt
   */
  public logUnauthorizedAccess(
    userId: string,
    userEmail: string,
    actualRole: UserRole,
    attemptedResource: string,
    expectedRole: UserRole
  ): void {
    const event: AuditEvent = {
      eventType: AuditEventType.UNAUTHORIZED_ATTEMPT,
      userId,
      userEmail,
      userRole: actualRole,
      resource: attemptedResource,
      action: 'ACCESS_DENIED',
      success: false,
      timestamp: new Date().toISOString(),
      details: {
        actualRole,
        expectedRole,
        securityViolation: true
      },
      errorMessage: `User with role ${actualRole} attempted to access ${attemptedResource} which requires ${expectedRole}`
    };

    this.logEvent(event);
    this.alertSecurityTeam(event);
  }

  /**
   * Log authentication events
   */
  public logAuthentication(
    userId: string,
    userEmail: string,
    success: boolean,
    errorMessage?: string
  ): void {
    const event: AuditEvent = {
      eventType: AuditEventType.AUTHENTICATION,
      userId,
      userEmail,
      resource: 'authentication',
      action: 'LOGIN',
      success,
      timestamp: new Date().toISOString(),
      errorMessage
    };

    this.logEvent(event);
  }

  /**
   * Log role verification events
   */
  public logRoleVerification(
    userId: string,
    userEmail: string,
    userRole: UserRole,
    resource: string,
    success: boolean,
    errorMessage?: string
  ): void {
    const event: AuditEvent = {
      eventType: AuditEventType.ROLE_VERIFICATION,
      userId,
      userEmail,
      userRole,
      resource,
      action: 'VERIFY_ROLE',
      success,
      timestamp: new Date().toISOString(),
      details: {
        verificationMethod: 'firebase-claims'
      },
      errorMessage
    };

    this.logEvent(event);
  }

  /**
   * Log access control violations
   */
  public logAccessControlViolation(
    userId: string,
    userEmail: string,
    userRole: UserRole,
    resource: string,
    requiredRole: UserRole,
    violationType: string
  ): void {
    const event: AuditEvent = {
      eventType: AuditEventType.ACCESS_DENIED,
      userId,
      userEmail,
      userRole,
      resource,
      action: 'ACCESS_CONTROL_VIOLATION',
      success: false,
      timestamp: new Date().toISOString(),
      details: {
        violationType,
        requiredRole,
        securityAlert: true
      },
      errorMessage: `Access control violation: ${violationType}`
    };

    this.logEvent(event);
    this.alertSecurityTeam(event);
  }

  /**
   * Core logging method
   */
  private logEvent(event: AuditEvent): void {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Audit Event:', event);
    }

    // In production, this would send to a logging service
    // For now, we'll use console.log but in a real app this would be:
    // - Sent to a logging service like CloudWatch, Datadog, etc.
    // - Stored in a secure audit database
    // - Sent to SIEM systems for security monitoring
    
    try {
      // Store in localStorage for demo purposes (in production, use proper logging service)
      const existingLogs = this.getStoredLogs();
      existingLogs.push(event);
      
      // Keep only last 100 events in localStorage
      const recentLogs = existingLogs.slice(-100);
      localStorage.setItem('audit_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to store audit log:', error);
    }
  }

  /**
   * Alert security team for critical events
   */
  private alertSecurityTeam(event: AuditEvent): void {
    // In production, this would trigger security alerts
    console.warn('🚨 SECURITY ALERT:', {
      type: event.eventType,
      user: event.userEmail,
      resource: event.resource,
      timestamp: event.timestamp,
      details: event.details
    });

    // In a real application, this would:
    // - Send alerts to security team via email/Slack
    // - Trigger automated security responses
    // - Update threat detection systems
    // - Potentially block suspicious users
  }

  /**
   * Get stored audit logs (for demo purposes)
   */
  public getStoredLogs(): AuditEvent[] {
    try {
      const logs = localStorage.getItem('audit_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      return [];
    }
  }

  /**
   * Clear stored logs (for demo purposes)
   */
  public clearLogs(): void {
    try {
      localStorage.removeItem('audit_logs');
    } catch (error) {
      console.error('Failed to clear audit logs:', error);
    }
  }

  /**
   * Get logs by event type
   */
  public getLogsByType(eventType: AuditEventType): AuditEvent[] {
    return this.getStoredLogs().filter(log => log.eventType === eventType);
  }

  /**
   * Get logs by user
   */
  public getLogsByUser(userId: string): AuditEvent[] {
    return this.getStoredLogs().filter(log => log.userId === userId);
  }

  /**
   * Get security violations
   */
  public getSecurityViolations(): AuditEvent[] {
    return this.getStoredLogs().filter(log => 
      log.eventType === AuditEventType.UNAUTHORIZED_ATTEMPT ||
      log.eventType === AuditEventType.ACCESS_DENIED ||
      (log.details && log.details.securityViolation)
    );
  }
}

// Export singleton instance
export const auditLogger = AuditLoggerService.getInstance();
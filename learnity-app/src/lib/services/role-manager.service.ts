import { adminAuth } from '@/lib/config/firebase-admin';
import { tokenManager } from '@/lib/services/token-manager.service';
import { IRoleManager } from '@/lib/interfaces/auth';
import { 
  CustomClaims, 
  UserRole, 
  Permission, 
  AuthError, 
  AuthErrorCode,
  EventType
} from '@/types/auth';
import { PrismaClient } from '@prisma/client';

export class RoleManagerService implements IRoleManager {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private readonly ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.STUDENT]: [
      Permission.VIEW_STUDENT_DASHBOARD,
      Permission.JOIN_STUDY_GROUPS,
      Permission.BOOK_TUTORING,
      Permission.ENHANCE_PROFILE
    ],
    [UserRole.TEACHER]: [
      Permission.VIEW_TEACHER_DASHBOARD,
      Permission.MANAGE_SESSIONS,
      Permission.UPLOAD_CONTENT,
      Permission.VIEW_STUDENT_PROGRESS
    ],
    [UserRole.PENDING_TEACHER]: [
      Permission.VIEW_APPLICATION_STATUS,
      Permission.UPDATE_APPLICATION
    ],
    [UserRole.ADMIN]: [
      Permission.VIEW_ADMIN_PANEL,
      Permission.MANAGE_USERS,
      Permission.APPROVE_TEACHERS,
      Permission.VIEW_AUDIT_LOGS,
      Permission.MANAGE_PLATFORM
    ]
  };

  private readonly PROTECTED_ROUTES: Record<string, Permission[]> = {
    '/dashboard/student': [Permission.VIEW_STUDENT_DASHBOARD],
    '/dashboard/teacher': [Permission.VIEW_TEACHER_DASHBOARD],
    '/dashboard/admin': [Permission.VIEW_ADMIN_PANEL],
    '/admin': [Permission.VIEW_ADMIN_PANEL],
    '/admin/users': [Permission.MANAGE_USERS],
    '/admin/teachers': [Permission.APPROVE_TEACHERS],
    '/admin/audit': [Permission.VIEW_AUDIT_LOGS],
    '/teacher/sessions': [Permission.MANAGE_SESSIONS],
    '/teacher/content': [Permission.UPLOAD_CONTENT],
    '/student/groups': [Permission.JOIN_STUDY_GROUPS],
    '/student/tutoring': [Permission.BOOK_TUTORING],
    '/profile/enhance': [Permission.ENHANCE_PROFILE],
    '/application/status': [Permission.VIEW_APPLICATION_STATUS],
    '/application/update': [Permission.UPDATE_APPLICATION]
  };

  /**
   * Check if user has a specific permission
   */
  async hasPermission(firebaseUid: string, permission: Permission): Promise<boolean> {
    try {
      const claims = await this.getCustomClaims(firebaseUid);
      return claims.permissions.includes(permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user has a specific role
   */
  async hasRole(firebaseUid: string, role: UserRole): Promise<boolean> {
    try {
      const claims = await this.getCustomClaims(firebaseUid);
      return claims.role === role;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(firebaseUid: string): Promise<Permission[]> {
    try {
      const claims = await this.getCustomClaims(firebaseUid);
      return claims.permissions || [];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  /**
   * Set custom claims for a user
   */
  async setCustomClaims(firebaseUid: string, claims: CustomClaims): Promise<void> {
    try {
      // Validate role and permissions
      const validatedClaims = this.validateClaims(claims);
      
      // Set claims in Firebase Auth
      await adminAuth.setCustomUserClaims(firebaseUid, validatedClaims);
      
      // Invalidate token cache to force refresh
      tokenManager.invalidateUserToken(firebaseUid);
    } catch (error: any) {
      throw this.mapRoleError(error);
    }
  }

  /**
   * Get custom claims for a user
   */
  async getCustomClaims(firebaseUid: string): Promise<CustomClaims> {
    try {
      const user = await adminAuth.getUser(firebaseUid);
      const claims = user.customClaims as CustomClaims;
      
      if (!claims || !claims.role) {
        // Return default claims for new users
        return {
          role: UserRole.STUDENT,
          permissions: this.ROLE_PERMISSIONS[UserRole.STUDENT],
          profileComplete: false,
          emailVerified: user.emailVerified
        };
      }

      return claims;
    } catch (error: any) {
      throw this.mapRoleError(error);
    }
  }

  /**
   * Validate route access for a user
   */
  async validateRouteAccess(firebaseUid: string, route: string): Promise<boolean> {
    try {
      const requiredPermissions = this.getRoutePermissions(route);
      
      if (requiredPermissions.length === 0) {
        // Route doesn't require specific permissions
        return true;
      }

      const userPermissions = await this.getUserPermissions(firebaseUid);
      
      // Check if user has at least one required permission
      return requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );
    } catch (error) {
      console.error('Error validating route access:', error);
      return false;
    }
  }

  /**
   * Create a role requirement function
   */
  requireRole(requiredRole: UserRole): (firebaseUid: string) => Promise<boolean> {
    return async (firebaseUid: string): Promise<boolean> => {
      return this.hasRole(firebaseUid, requiredRole);
    };
  }

  /**
   * Update user role and refresh permissions
   */
  async updateUserRole(firebaseUid: string, newRole: UserRole, reason?: string, adminUid?: string): Promise<void> {
    try {
      const currentClaims = await this.getCustomClaims(firebaseUid);
      const oldRole = currentClaims.role;
      
      const updatedClaims: CustomClaims = {
        ...currentClaims,
        role: newRole,
        permissions: this.ROLE_PERMISSIONS[newRole]
      };

      await this.setCustomClaims(firebaseUid, updatedClaims);

      // Enhanced audit logging for role changes
      await this.logRoleChangeEvent({
        firebaseUid,
        adminUid,
        oldRole,
        newRole,
        reason: reason || 'Role update requested',
        success: true
      });

    } catch (error: any) {
      // Log failed role change attempt
      await this.logRoleChangeEvent({
        firebaseUid,
        adminUid,
        oldRole: (await this.getCustomClaims(firebaseUid)).role,
        newRole,
        reason: reason || 'Role update requested',
        success: false,
        errorMessage: error.message
      });
      
      throw this.mapRoleError(error);
    }
  }

  /**
   * Approve teacher application and update role
   */
  async approveTeacher(firebaseUid: string, adminUid: string): Promise<void> {
    try {
      const currentClaims = await this.getCustomClaims(firebaseUid);
      
      if (currentClaims.role !== UserRole.PENDING_TEACHER) {
        throw new Error('User is not a pending teacher');
      }

      await this.updateUserRole(firebaseUid, UserRole.TEACHER, 'Teacher application approved', adminUid);
      
      // Log teacher approval event
      await this.logTeacherApprovalEvent({
        firebaseUid,
        adminUid,
        decision: 'APPROVED',
        success: true
      });

    } catch (error: any) {
      // Log failed teacher approval
      await this.logTeacherApprovalEvent({
        firebaseUid,
        adminUid,
        decision: 'APPROVED',
        success: false,
        errorMessage: error.message
      });
      
      throw this.mapRoleError(error);
    }
  }

  /**
   * Reject teacher application (keep as pending with note)
   */
  async rejectTeacher(firebaseUid: string, reason: string, adminUid: string): Promise<void> {
    try {
      const currentClaims = await this.getCustomClaims(firebaseUid);
      
      if (currentClaims.role !== UserRole.PENDING_TEACHER) {
        throw new Error('User is not a pending teacher');
      }

      // Log teacher rejection event
      await this.logTeacherApprovalEvent({
        firebaseUid,
        adminUid,
        decision: 'REJECTED',
        reason,
        success: true
      });

    } catch (error: any) {
      // Log failed teacher rejection
      await this.logTeacherApprovalEvent({
        firebaseUid,
        adminUid,
        decision: 'REJECTED',
        reason,
        success: false,
        errorMessage: error.message
      });
      
      throw this.mapRoleError(error);
    }
  }

  /**
   * Get permissions required for a route
   */
  private getRoutePermissions(route: string): Permission[] {
    // Check exact match first
    if (this.PROTECTED_ROUTES[route]) {
      return this.PROTECTED_ROUTES[route];
    }

    // Check for partial matches (e.g., /admin/users/123 matches /admin/users)
    for (const [protectedRoute, permissions] of Object.entries(this.PROTECTED_ROUTES)) {
      if (route.startsWith(protectedRoute)) {
        return permissions;
      }
    }

    return [];
  }

  /**
   * Validate claims structure and permissions
   */
  private validateClaims(claims: CustomClaims): CustomClaims {
    // Ensure role is valid
    if (!Object.values(UserRole).includes(claims.role)) {
      throw new Error(`Invalid role: ${claims.role}`);
    }

    // Ensure permissions match role
    const rolePermissions = this.ROLE_PERMISSIONS[claims.role];
    const validPermissions = claims.permissions.filter(permission => 
      rolePermissions.includes(permission)
    );

    return {
      ...claims,
      permissions: validPermissions
    };
  }

  /**
   * Check if user can access admin features
   */
  async canAccessAdmin(firebaseUid: string): Promise<boolean> {
    return this.hasRole(firebaseUid, UserRole.ADMIN);
  }

  /**
   * Check if user can manage other users
   */
  async canManageUsers(firebaseUid: string): Promise<boolean> {
    return this.hasPermission(firebaseUid, Permission.MANAGE_USERS);
  }

  /**
   * Check if user can approve teachers
   */
  async canApproveTeachers(firebaseUid: string): Promise<boolean> {
    return this.hasPermission(firebaseUid, Permission.APPROVE_TEACHERS);
  }

  /**
   * Get role hierarchy level (for permission inheritance)
   */
  private getRoleLevel(role: UserRole): number {
    const hierarchy = {
      [UserRole.STUDENT]: 1,
      [UserRole.PENDING_TEACHER]: 2,
      [UserRole.TEACHER]: 3,
      [UserRole.ADMIN]: 4
    };
    
    return hierarchy[role] || 0;
  }

  /**
   * Check if role A can manage role B
   */
  canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    const managerLevel = this.getRoleLevel(managerRole);
    const targetLevel = this.getRoleLevel(targetRole);
    
    // Admins can manage everyone, others can only manage lower levels
    return managerRole === UserRole.ADMIN || managerLevel > targetLevel;
  }

  /**
   * Get all available permissions for a role
   */
  getRolePermissions(role: UserRole): Permission[] {
    return this.ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Log role change events for audit trail
   */
  private async logRoleChangeEvent(event: {
    firebaseUid: string;
    adminUid?: string;
    oldRole: UserRole;
    newRole: UserRole;
    reason: string;
    success: boolean;
    errorMessage?: string;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          firebaseUid: event.firebaseUid,
          eventType: EventType.ROLE_CHANGE,
          action: `Role change: ${event.oldRole} -> ${event.newRole}`,
          resource: 'user_role',
          oldValues: { role: event.oldRole },
          newValues: { role: event.newRole },
          ipAddress: '127.0.0.1', // Will be updated by middleware
          userAgent: 'RoleManagerService',
          success: event.success,
          errorMessage: event.errorMessage,
          metadata: {
            adminUid: event.adminUid,
            reason: event.reason,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Failed to log role change event:', error);
    }
  }

  /**
   * Log teacher approval/rejection events for audit trail
   */
  private async logTeacherApprovalEvent(event: {
    firebaseUid: string;
    adminUid: string;
    decision: 'APPROVED' | 'REJECTED';
    reason?: string;
    success: boolean;
    errorMessage?: string;
  }): Promise<void> {
    try {
      const eventType = event.decision === 'APPROVED' 
        ? EventType.TEACHER_APPLICATION_APPROVE 
        : EventType.TEACHER_APPLICATION_REJECT;

      await this.prisma.auditLog.create({
        data: {
          firebaseUid: event.firebaseUid,
          eventType,
          action: `Teacher application ${event.decision.toLowerCase()}`,
          resource: 'teacher_application',
          newValues: { 
            decision: event.decision,
            approvedBy: event.adminUid 
          },
          ipAddress: '127.0.0.1', // Will be updated by middleware
          userAgent: 'RoleManagerService',
          success: event.success,
          errorMessage: event.errorMessage,
          metadata: {
            adminUid: event.adminUid,
            reason: event.reason,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Failed to log teacher approval event:', error);
    }
  }

  /**
   * Log permission check events for security monitoring
   */
  async logPermissionCheck(firebaseUid: string, permission: Permission, granted: boolean): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          firebaseUid,
          eventType: EventType.ADMIN_ACTION,
          action: `Permission check: ${permission}`,
          resource: 'permission',
          newValues: { 
            permission,
            granted 
          },
          ipAddress: '127.0.0.1', // Will be updated by middleware
          userAgent: 'RoleManagerService',
          success: true,
          metadata: {
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Failed to log permission check:', error);
    }
  }

  /**
   * Get role change history for a user
   */
  async getRoleChangeHistory(firebaseUid: string): Promise<any[]> {
    try {
      return await this.prisma.auditLog.findMany({
        where: {
          firebaseUid,
          eventType: EventType.ROLE_CHANGE
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
    } catch (error) {
      console.error('Failed to get role change history:', error);
      return [];
    }
  }

  /**
   * Get teacher approval history
   */
  async getTeacherApprovalHistory(limit: number = 100): Promise<any[]> {
    try {
      return await this.prisma.auditLog.findMany({
        where: {
          eventType: {
            in: [EventType.TEACHER_APPLICATION_APPROVE, EventType.TEACHER_APPLICATION_REJECT]
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('Failed to get teacher approval history:', error);
      return [];
    }
  }

  /**
   * Map role-related errors
   */
  private mapRoleError(error: any): AuthError {
    const errorCode = error.code || 'unknown';
    
    switch (errorCode) {
      case 'auth/user-not-found':
        return {
          code: AuthErrorCode.ACCOUNT_NOT_FOUND,
          message: 'User account not found'
        };
      
      case 'auth/insufficient-permission':
        return {
          code: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
          message: 'Insufficient permissions to perform this action'
        };
      
      default:
        return {
          code: AuthErrorCode.INTERNAL_ERROR,
          message: error.message || 'Role management operation failed'
        };
    }
  }

  /**
   * Cleanup database connections
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Export singleton instance
export const roleManager = new RoleManagerService();
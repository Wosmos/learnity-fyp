/**
 * Permission Checking Hooks
 * Advanced hooks for permission and role checking in React components
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { roleManager } from '@/lib/services/role-manager.service';
import { UserRole, Permission } from '@/types/auth';

export interface PermissionCheckResult {
  hasPermission: boolean;
  loading: boolean;
  error: string | null;
}

export interface RouteAccessResult {
  canAccess: boolean;
  loading: boolean;
  error: string | null;
}

export interface RoleCheckResult {
  hasRole: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for checking multiple permissions at once
 */
export function usePermissionCheck(
  permissions: Permission[]
): PermissionCheckResult {
  const { claims, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPermission = useMemo(() => {
    if (!claims || !claims.permissions) return false;
    return permissions.every(permission =>
      claims.permissions.includes(permission)
    );
  }, [claims, permissions]);

  return {
    hasPermission,
    loading: authLoading || loading,
    error,
  };
}

/**
 * Hook for checking if user has any of the specified permissions
 */
export function useAnyPermission(
  permissions: Permission[]
): PermissionCheckResult {
  const { claims, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPermission = useMemo(() => {
    if (!claims || !claims.permissions) return false;
    return permissions.some(permission =>
      claims.permissions.includes(permission)
    );
  }, [claims, permissions]);

  return {
    hasPermission,
    loading: authLoading || loading,
    error,
  };
}

/**
 * Hook for checking route access
 */
export function useRouteAccess(route: string): RouteAccessResult {
  const { user, loading: authLoading } = useAuth();
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAccess = useCallback(async () => {
    if (!user) {
      setCanAccess(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const access = await roleManager.validateRouteAccess(user.uid, route);
      setCanAccess(access);
    } catch (err: any) {
      setError(err.message);
      setCanAccess(false);
    } finally {
      setLoading(false);
    }
  }, [user, route]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return {
    canAccess,
    loading: authLoading || loading,
    error,
  };
}

/**
 * Hook for checking if user has any of the specified roles
 */
export function useRoleCheck(roles: UserRole[]): RoleCheckResult {
  const { claims, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasRole = useMemo(() => {
    if (!claims) return false;
    return roles.includes(claims.role);
  }, [claims, roles]);

  return {
    hasRole,
    loading: authLoading || loading,
    error,
  };
}

/**
 * Hook for checking if user can manage another user's role
 */
export function useCanManageRole(targetRole: UserRole): PermissionCheckResult {
  const { claims, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPermission = useMemo(() => {
    if (!claims) return false;
    return roleManager.canManageRole(claims.role, targetRole);
  }, [claims, targetRole]);

  return {
    hasPermission,
    loading: authLoading || loading,
    error,
  };
}

/**
 * Hook for getting all permissions for current user
 */
export function useUserPermissions(): {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
} {
  const { claims, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permissions = useMemo(() => {
    return claims?.permissions || [];
  }, [claims]);

  return {
    permissions,
    loading: authLoading || loading,
    error,
  };
}

/**
 * Hook for checking admin-specific permissions
 */
export function useAdminPermissions() {
  const canAccessAdmin = usePermissionCheck([Permission.VIEW_ADMIN_PANEL]);
  const canManageUsers = usePermissionCheck([Permission.MANAGE_USERS]);
  const canApproveTeachers = usePermissionCheck([Permission.APPROVE_TEACHERS]);
  const canViewAuditLogs = usePermissionCheck([Permission.VIEW_AUDIT_LOGS]);
  const canManagePlatform = usePermissionCheck([Permission.MANAGE_PLATFORM]);

  return {
    canAccessAdmin: canAccessAdmin.hasPermission,
    canManageUsers: canManageUsers.hasPermission,
    canApproveTeachers: canApproveTeachers.hasPermission,
    canViewAuditLogs: canViewAuditLogs.hasPermission,
    canManagePlatform: canManagePlatform.hasPermission,
    loading:
      canAccessAdmin.loading ||
      canManageUsers.loading ||
      canApproveTeachers.loading ||
      canViewAuditLogs.loading ||
      canManagePlatform.loading,
    error:
      canAccessAdmin.error ||
      canManageUsers.error ||
      canApproveTeachers.error ||
      canViewAuditLogs.error ||
      canManagePlatform.error,
  };
}

/**
 * Hook for checking teacher-specific permissions
 */
export function useTeacherPermissions() {
  const canAccessTeacherDashboard = usePermissionCheck([
    Permission.VIEW_TEACHER_DASHBOARD,
  ]);
  const canManageSessions = usePermissionCheck([Permission.MANAGE_SESSIONS]);
  const canUploadContent = usePermissionCheck([Permission.UPLOAD_CONTENT]);
  const canViewStudentProgress = usePermissionCheck([
    Permission.VIEW_STUDENT_PROGRESS,
  ]);

  return {
    canAccessTeacherDashboard: canAccessTeacherDashboard.hasPermission,
    canManageSessions: canManageSessions.hasPermission,
    canUploadContent: canUploadContent.hasPermission,
    canViewStudentProgress: canViewStudentProgress.hasPermission,
    loading:
      canAccessTeacherDashboard.loading ||
      canManageSessions.loading ||
      canUploadContent.loading ||
      canViewStudentProgress.loading,
    error:
      canAccessTeacherDashboard.error ||
      canManageSessions.error ||
      canUploadContent.error ||
      canViewStudentProgress.error,
  };
}

/**
 * Hook for checking student-specific permissions
 */
export function useStudentPermissions() {
  const canAccessStudentDashboard = usePermissionCheck([
    Permission.VIEW_STUDENT_DASHBOARD,
  ]);
  const canJoinStudyGroups = usePermissionCheck([Permission.JOIN_STUDY_GROUPS]);
  const canBookTutoring = usePermissionCheck([Permission.BOOK_TUTORING]);
  const canEnhanceProfile = usePermissionCheck([Permission.ENHANCE_PROFILE]);

  return {
    canAccessStudentDashboard: canAccessStudentDashboard.hasPermission,
    canJoinStudyGroups: canJoinStudyGroups.hasPermission,
    canBookTutoring: canBookTutoring.hasPermission,
    canEnhanceProfile: canEnhanceProfile.hasPermission,
    loading:
      canAccessStudentDashboard.loading ||
      canJoinStudyGroups.loading ||
      canBookTutoring.loading ||
      canEnhanceProfile.loading,
    error:
      canAccessStudentDashboard.error ||
      canJoinStudyGroups.error ||
      canBookTutoring.error ||
      canEnhanceProfile.error,
  };
}

/**
 * Hook for checking pending teacher permissions
 */
export function usePendingTeacherPermissions() {
  const canViewApplicationStatus = usePermissionCheck([
    Permission.VIEW_APPLICATION_STATUS,
  ]);
  const canUpdateApplication = usePermissionCheck([
    Permission.UPDATE_APPLICATION,
  ]);

  return {
    canViewApplicationStatus: canViewApplicationStatus.hasPermission,
    canUpdateApplication: canUpdateApplication.hasPermission,
    loading: canViewApplicationStatus.loading || canUpdateApplication.loading,
    error: canViewApplicationStatus.error || canUpdateApplication.error,
  };
}

/**
 * Hook for dynamic permission checking with caching
 */
export function useDynamicPermissionCheck() {
  const { user } = useAuth();
  const [cache, setCache] = useState<Map<string, PermissionCheckResult>>(
    new Map()
  );

  const checkPermission = useCallback(
    async (permission: Permission): Promise<boolean> => {
      if (!user) return false;

      const cacheKey = `${user.uid}-${permission}`;
      const cached = cache.get(cacheKey);

      if (cached && !cached.loading) {
        return cached.hasPermission;
      }

      try {
        const hasPermission = await roleManager.hasPermission(
          user.uid,
          permission
        );

        setCache(prev =>
          new Map(prev).set(cacheKey, {
            hasPermission,
            loading: false,
            error: null,
          })
        );

        return hasPermission;
      } catch (error: any) {
        setCache(prev =>
          new Map(prev).set(cacheKey, {
            hasPermission: false,
            loading: false,
            error: error.message,
          })
        );

        return false;
      }
    },
    [user, cache]
  );

  const checkRole = useCallback(
    async (role: UserRole): Promise<boolean> => {
      if (!user) return false;

      const cacheKey = `${user.uid}-role-${role}`;
      const cached = cache.get(cacheKey);

      if (cached && !cached.loading) {
        return cached.hasPermission;
      }

      try {
        const hasRole = await roleManager.hasRole(user.uid, role);

        setCache(prev =>
          new Map(prev).set(cacheKey, {
            hasPermission: hasRole,
            loading: false,
            error: null,
          })
        );

        return hasRole;
      } catch (error: any) {
        setCache(prev =>
          new Map(prev).set(cacheKey, {
            hasPermission: false,
            loading: false,
            error: error.message,
          })
        );

        return false;
      }
    },
    [user, cache]
  );

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  return {
    checkPermission,
    checkRole,
    clearCache,
    cacheSize: cache.size,
  };
}

/**
 * Hook for checking if user profile meets certain criteria
 */
export function useProfileRequirements() {
  const { claims, loading } = useAuth();

  const requirements = useMemo(() => {
    if (!claims) {
      return {
        isEmailVerified: false,
        isProfileComplete: false,
        hasValidRole: false,
        canAccessPlatform: false,
      };
    }

    return {
      isEmailVerified: claims.emailVerified,
      isProfileComplete: claims.profileComplete,
      hasValidRole: Object.values(UserRole).includes(claims.role),
      canAccessPlatform:
        claims.emailVerified &&
        claims.profileComplete &&
        Object.values(UserRole).includes(claims.role),
    };
  }, [claims]);

  return {
    ...requirements,
    loading,
  };
}

/**
 * Hook for checking feature flags based on user role/permissions
 */
export function useFeatureFlags() {
  const { claims, loading } = useAuth();

  const features = useMemo(() => {
    if (!claims) {
      return {
        canUseBetaFeatures: false,
        canAccessAdvancedSettings: false,
        canViewAnalytics: false,
        canExportData: false,
      };
    }

    const isAdmin = claims.role === UserRole.ADMIN;
    const isTeacher = claims.role === UserRole.TEACHER || isAdmin;

    return {
      canUseBetaFeatures: isAdmin,
      canAccessAdvancedSettings: isAdmin || isTeacher,
      canViewAnalytics: isAdmin || isTeacher,
      canExportData: isAdmin,
    };
  }, [claims]);

  return {
    ...features,
    loading,
  };
}

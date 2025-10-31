/**
 * Permission-Based UI Components
 * Components that render conditionally based on user permissions and roles
 */

'use client';

import React from 'react';
import { useAuth, usePermission, useRole, useRoles } from '@/hooks/useAuth';
import { UserRole, Permission } from '@/types/auth';

export interface PermissionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

export interface RequirePermissionProps extends PermissionGateProps {
  permission: Permission;
}

export interface RequireRoleProps extends PermissionGateProps {
  role: UserRole;
}

export interface RequireRolesProps extends PermissionGateProps {
  roles: UserRole[];
  requireAll?: boolean; // If true, user must have ALL roles, otherwise ANY role
}

/**
 * Component that renders children only if user has required permission
 */
export function RequirePermission({ 
  permission, 
  children, 
  fallback = null,
  loading = null 
}: RequirePermissionProps) {
  const { loading: authLoading } = useAuth();
  const hasPermission = usePermission(permission);

  if (authLoading) {
    return <>{loading}</>;
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component that renders children only if user has required role
 */
export function RequireRole({ 
  role, 
  children, 
  fallback = null,
  loading = null 
}: RequireRoleProps) {
  const { loading: authLoading } = useAuth();
  const hasRole = useRole(role);

  if (authLoading) {
    return <>{loading}</>;
  }

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component that renders children only if user has any of the required roles
 */
export function RequireRoles({ 
  roles, 
  requireAll = false,
  children, 
  fallback = null,
  loading = null 
}: RequireRolesProps) {
  const { loading: authLoading, claims } = useAuth();

  if (authLoading) {
    return <>{loading}</>;
  }

  if (!claims) {
    return <>{fallback}</>;
  }

  const hasAccess = requireAll 
    ? roles.every(role => claims.role === role) // This doesn't make sense for single role, but kept for API consistency
    : roles.includes(claims.role);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component that renders children only for admin users
 */
export function AdminOnly({ 
  children, 
  fallback = null,
  loading = null 
}: PermissionGateProps) {
  return (
    <RequireRole 
      role={UserRole.ADMIN} 
      fallback={fallback}
      loading={loading}
    >
      {children}
    </RequireRole>
  );
}

/**
 * Component that renders children only for teacher users (including admins)
 */
export function TeacherOnly({ 
  children, 
  fallback = null,
  loading = null 
}: PermissionGateProps) {
  return (
    <RequireRoles 
      roles={[UserRole.TEACHER, UserRole.ADMIN]} 
      fallback={fallback}
      loading={loading}
    >
      {children}
    </RequireRoles>
  );
}

/**
 * Component that renders children only for student users
 */
export function StudentOnly({ 
  children, 
  fallback = null,
  loading = null 
}: PermissionGateProps) {
  return (
    <RequireRole 
      role={UserRole.STUDENT} 
      fallback={fallback}
      loading={loading}
    >
      {children}
    </RequireRole>
  );
}

/**
 * Component that renders children only for pending teacher users
 */
export function PendingTeacherOnly({ 
  children, 
  fallback = null,
  loading = null 
}: PermissionGateProps) {
  return (
    <RequireRole 
      role={UserRole.PENDING_TEACHER} 
      fallback={fallback}
      loading={loading}
    >
      {children}
    </RequireRole>
  );
}

/**
 * Component that renders children only for authenticated users
 */
export function AuthenticatedOnly({ 
  children, 
  fallback = null,
  loading = null 
}: PermissionGateProps) {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <>{loading}</>;
  }

  if (!user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component that renders children only for unauthenticated users
 */
export function UnauthenticatedOnly({ 
  children, 
  fallback = null,
  loading = null 
}: PermissionGateProps) {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <>{loading}</>;
  }

  if (user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for permission-based rendering
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission,
  FallbackComponent?: React.ComponentType<P>
) {
  return function PermissionWrappedComponent(props: P) {
    const hasPermission = usePermission(permission);
    
    if (!hasPermission) {
      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }
    
    return <Component {...props} />;
  };
}

/**
 * Higher-order component for role-based rendering
 */
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  role: UserRole,
  FallbackComponent?: React.ComponentType<P>
) {
  return function RoleWrappedComponent(props: P) {
    const hasRole = useRole(role);
    
    if (!hasRole) {
      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }
    
    return <Component {...props} />;
  };
}

/**
 * Higher-order component for admin-only components
 */
export function withAdminRole<P extends object>(
  Component: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<P>
) {
  return withRole(Component, UserRole.ADMIN, FallbackComponent);
}

/**
 * Higher-order component for teacher-only components
 */
export function withTeacherRole<P extends object>(
  Component: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<P>
) {
  return function TeacherWrappedComponent(props: P) {
    const isTeacher = useRoles([UserRole.TEACHER, UserRole.ADMIN]);
    
    if (!isTeacher) {
      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }
    
    return <Component {...props} />;
  };
}
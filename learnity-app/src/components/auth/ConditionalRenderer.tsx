/**
 * Conditional Rendering Components
 * Advanced permission-based UI components for complex conditional rendering
 */

'use client';

import React from 'react';
import { useAuth, usePermission, useRole } from '@/hooks/useAuth';
import { UserRole, Permission } from '@/types/auth';

export interface ConditionalRendererProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

export interface MultiPermissionProps extends ConditionalRendererProps {
  permissions: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions, otherwise ANY permission
}

export interface MultiRoleProps extends ConditionalRendererProps {
  roles: UserRole[];
  requireAll?: boolean; // If true, user must have ALL roles (doesn't make sense but kept for API consistency)
}

export interface ConditionalProps extends ConditionalRendererProps {
  condition: boolean;
}

/**
 * Component that renders children based on multiple permissions
 */
export function RequireMultiplePermissions({
  permissions,
  requireAll = false,
  children,
  fallback = null,
  loading = null,
}: MultiPermissionProps) {
  const { loading: authLoading, claims } = useAuth();

  if (authLoading) {
    return <>{loading}</>;
  }

  if (!claims) {
    return <>{fallback}</>;
  }

  const hasAccess = requireAll
    ? permissions.every(permission => claims.permissions.includes(permission))
    : permissions.some(permission => claims.permissions.includes(permission));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component that renders children based on multiple roles
 */
export function RequireMultipleRoles({
  roles,
  requireAll = false,
  children,
  fallback = null,
  loading = null,
}: MultiRoleProps) {
  const { loading: authLoading, claims } = useAuth();

  if (authLoading) {
    return <>{loading}</>;
  }

  if (!claims) {
    return <>{fallback}</>;
  }

  const hasAccess = requireAll
    ? roles.every(role => claims.role === role) // This doesn't make logical sense but kept for API consistency
    : roles.includes(claims.role);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component that renders children based on a custom condition
 */
export function ConditionalRender({
  condition,
  children,
  fallback = null,
  loading = null,
}: ConditionalProps) {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return <>{loading}</>;
  }

  if (!condition) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component that renders different content based on user role
 */
export interface RoleSwitchProps {
  studentContent?: React.ReactNode;
  teacherContent?: React.ReactNode;
  adminContent?: React.ReactNode;
  pendingTeacherContent?: React.ReactNode;
  defaultContent?: React.ReactNode;
  loading?: React.ReactNode;
}

export function RoleSwitch({
  studentContent,
  teacherContent,
  adminContent,
  pendingTeacherContent,
  defaultContent = null,
  loading = null,
}: RoleSwitchProps) {
  const { loading: authLoading, claims } = useAuth();

  if (authLoading) {
    return <>{loading}</>;
  }

  if (!claims) {
    return <>{defaultContent}</>;
  }

  switch (claims.role) {
    case UserRole.STUDENT:
      return <>{studentContent || defaultContent}</>;
    case UserRole.TEACHER:
      return <>{teacherContent || defaultContent}</>;
    case UserRole.ADMIN:
      return <>{adminContent || defaultContent}</>;
    case UserRole.PENDING_TEACHER:
      return <>{pendingTeacherContent || defaultContent}</>;
    default:
      return <>{defaultContent}</>;
  }
}

/**
 * Component that renders different content based on permission level
 */
export interface PermissionSwitchProps {
  permissionMap: Record<Permission, React.ReactNode>;
  defaultContent?: React.ReactNode;
  loading?: React.ReactNode;
}

export function PermissionSwitch({
  permissionMap,
  defaultContent = null,
  loading = null,
}: PermissionSwitchProps) {
  const { loading: authLoading, claims } = useAuth();

  if (authLoading) {
    return <>{loading}</>;
  }

  if (!claims) {
    return <>{defaultContent}</>;
  }

  // Find the first permission the user has and render its content
  for (const [permission, content] of Object.entries(permissionMap)) {
    if (claims.permissions.includes(permission as Permission)) {
      return <>{content}</>;
    }
  }

  return <>{defaultContent}</>;
}

/**
 * Component that renders children only if profile is complete
 */
export function RequireCompleteProfile({
  children,
  fallback = null,
  loading = null,
}: ConditionalRendererProps) {
  const { loading: authLoading, claims } = useAuth();

  if (authLoading) {
    return <>{loading}</>;
  }

  if (!claims || !claims.profileComplete) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component that renders children only if email is verified
 */
export function RequireEmailVerification({
  children,
  fallback = null,
  loading = null,
}: ConditionalRendererProps) {
  const { loading: authLoading, claims } = useAuth();

  if (authLoading) {
    return <>{loading}</>;
  }

  if (!claims || !claims.emailVerified) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component that renders children with different styles based on permissions
 */
export interface PermissionStyledProps {
  children: React.ReactNode;
  permission: Permission;
  authorizedClassName?: string;
  unauthorizedClassName?: string;
  loading?: React.ReactNode;
}

export function PermissionStyled({
  children,
  permission,
  authorizedClassName = '',
  unauthorizedClassName = 'opacity-50 cursor-not-allowed',
  loading = null,
}: PermissionStyledProps) {
  const { loading: authLoading } = useAuth();
  const hasPermission = usePermission(permission);

  if (authLoading) {
    return <>{loading}</>;
  }

  const className = hasPermission ? authorizedClassName : unauthorizedClassName;

  return <div className={className}>{children}</div>;
}

/**
 * Component that renders children with different styles based on role
 */
export interface RoleStyledProps {
  children: React.ReactNode;
  role: UserRole;
  authorizedClassName?: string;
  unauthorizedClassName?: string;
  loading?: React.ReactNode;
}

export function RoleStyled({
  children,
  role,
  authorizedClassName = '',
  unauthorizedClassName = 'opacity-50 cursor-not-allowed',
  loading = null,
}: RoleStyledProps) {
  const { loading: authLoading } = useAuth();
  const hasRole = useRole(role);

  if (authLoading) {
    return <>{loading}</>;
  }

  const className = hasRole ? authorizedClassName : unauthorizedClassName;

  return <div className={className}>{children}</div>;
}

/**
 * Higher-order component for conditional rendering based on multiple conditions
 */
export interface ComplexConditionProps extends ConditionalRendererProps {
  conditions: {
    permissions?: Permission[];
    roles?: UserRole[];
    requireAllPermissions?: boolean;
    requireAllRoles?: boolean;
    profileComplete?: boolean;
    emailVerified?: boolean;
    customCondition?: () => boolean;
  };
}

export function ComplexConditionalRender({
  conditions,
  children,
  fallback = null,
  loading = null,
}: ComplexConditionProps) {
  const { loading: authLoading, claims } = useAuth();

  if (authLoading) {
    return <>{loading}</>;
  }

  if (!claims) {
    return <>{fallback}</>;
  }

  // Check permissions
  if (conditions.permissions && conditions.permissions.length > 0) {
    const hasPermissions = conditions.requireAllPermissions
      ? conditions.permissions.every(permission =>
          claims.permissions.includes(permission)
        )
      : conditions.permissions.some(permission =>
          claims.permissions.includes(permission)
        );

    if (!hasPermissions) {
      return <>{fallback}</>;
    }
  }

  // Check roles
  if (conditions.roles && conditions.roles.length > 0) {
    const hasRoles = conditions.requireAllRoles
      ? conditions.roles.every(role => claims.role === role) // Doesn't make logical sense but kept for consistency
      : conditions.roles.includes(claims.role);

    if (!hasRoles) {
      return <>{fallback}</>;
    }
  }

  // Check profile completion
  if (
    conditions.profileComplete !== undefined &&
    claims.profileComplete !== conditions.profileComplete
  ) {
    return <>{fallback}</>;
  }

  // Check email verification
  if (
    conditions.emailVerified !== undefined &&
    claims.emailVerified !== conditions.emailVerified
  ) {
    return <>{fallback}</>;
  }

  // Check custom condition
  if (conditions.customCondition && !conditions.customCondition()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component that renders a loading state while checking permissions
 */
export interface PermissionLoaderProps {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export function PermissionLoader({
  children,
  loadingComponent = (
    <div className='animate-pulse'>Loading permissions...</div>
  ),
}: PermissionLoaderProps) {
  const { loading } = useAuth();

  if (loading) {
    return <>{loadingComponent}</>;
  }

  return <>{children}</>;
}

/**
 * Component that shows different content for first-time users vs returning users
 */
export interface UserExperienceProps extends ConditionalRendererProps {
  firstTimeContent: React.ReactNode;
  returningUserContent: React.ReactNode;
}

export function UserExperienceSwitch({
  firstTimeContent,
  returningUserContent,
  loading = null,
}: UserExperienceProps) {
  const { loading: authLoading, claims } = useAuth();

  if (authLoading) {
    return <>{loading}</>;
  }

  if (!claims) {
    return <>{firstTimeContent}</>;
  }

  // Consider user as first-time if profile is not complete
  const isFirstTime = !claims.profileComplete;

  return <>{isFirstTime ? firstTimeContent : returningUserContent}</>;
}

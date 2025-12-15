/**
 * Permission-Based Form Components
 * Form components that adapt based on user permissions and roles
 */

'use client';

import React from 'react';
import { useAuth, usePermission, useRole } from '@/hooks/useAuth';
import { UserRole, Permission } from '@/types/auth';
import { RequirePermission, RequireRole } from '@/components/auth/PermissionGate';

export interface PermissionBasedFieldProps {
  children: React.ReactNode;
  permission?: Permission;
  role?: UserRole;
  roles?: UserRole[];
  readOnlyFallback?: React.ReactNode;
  hiddenFallback?: React.ReactNode;
  mode?: 'hide' | 'readonly' | 'disabled';
}

export interface PermissionBasedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: Permission;
  role?: UserRole;
  roles?: UserRole[];
  children: React.ReactNode;
  fallbackText?: string;
  loadingText?: string;
}

export interface PermissionBasedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  permission?: Permission;
  role?: UserRole;
  roles?: UserRole[];
  readOnlyPermission?: Permission;
  readOnlyRole?: UserRole;
}

/**
 * Form field that adapts based on user permissions
 */
export function PermissionBasedField({
  children,
  permission,
  role,
  roles,
  readOnlyFallback,
  hiddenFallback,
  mode = 'hide'
}: PermissionBasedFieldProps) {
  const { loading, claims } = useAuth();

  if (loading) {
    return <div className="animate-pulse h-10 bg-gray-200 rounded" />;
  }

  if (!claims) {
    return mode === 'hide' ? <>{hiddenFallback}</> : <>{readOnlyFallback}</>;
  }

  // Check permission access
  let hasAccess = true;

  if (permission && !claims.permissions.includes(permission)) {
    hasAccess = false;
  }

  if (role && claims.role !== role) {
    hasAccess = false;
  }

  if (roles && !roles.includes(claims.role)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    switch (mode) {
      case 'hide':
        return <>{hiddenFallback}</>;
      case 'readonly':
        return <>{readOnlyFallback || children}</>;
      case 'disabled':
        return (
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
        );
      default:
        return <>{hiddenFallback}</>;
    }
  }

  return <>{children}</>;
}

/**
 * Button that adapts based on user permissions
 */
export function PermissionBasedButton({
  permission,
  role,
  roles,
  children,
  fallbackText = 'Not Authorized',
  loadingText = 'Loading...',
  disabled,
  className = '',
  ...props
}: PermissionBasedButtonProps) {
  const { loading, claims } = useAuth();

  if (loading) {
    return (
      <button
        disabled
        className={`${className} opacity-50 cursor-not-allowed`}
        {...props}
      >
        {loadingText}
      </button>
    );
  }

  if (!claims) {
    return (
      <button
        disabled
        className={`${className} opacity-50 cursor-not-allowed`}
        {...props}
      >
        {fallbackText}
      </button>
    );
  }

  // Check permission access
  let hasAccess = true;

  if (permission && !claims.permissions.includes(permission)) {
    hasAccess = false;
  }

  if (role && claims.role !== role) {
    hasAccess = false;
  }

  if (roles && !roles.includes(claims.role)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return (
      <button
        disabled
        className={`${className} opacity-50 cursor-not-allowed`}
        {...props}
      >
        {fallbackText}
      </button>
    );
  }

  return (
    <button
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Input that adapts based on user permissions
 */
export function PermissionBasedInput({
  permission,
  role,
  roles,
  readOnlyPermission,
  readOnlyRole,
  className = '',
  ...props
}: PermissionBasedInputProps) {
  const { loading, claims } = useAuth();

  if (loading) {
    return (
      <input
        disabled
        className={`${className} animate-pulse bg-gray-200`}
        {...props}
      />
    );
  }

  if (!claims) {
    return (
      <input
        disabled
        className={`${className} opacity-50`}
        {...props}
      />
    );
  }

  // Check if field should be hidden
  let hasAccess = true;

  if (permission && !claims.permissions.includes(permission)) {
    hasAccess = false;
  }

  if (role && claims.role !== role) {
    hasAccess = false;
  }

  if (roles && !roles.includes(claims.role)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return null; // Hide the input entirely
  }

  // Check if field should be read-only
  let isReadOnly = props.readOnly || false;

  if (readOnlyPermission && !claims.permissions.includes(readOnlyPermission)) {
    isReadOnly = true;
  }

  if (readOnlyRole && claims.role !== readOnlyRole) {
    isReadOnly = true;
  }

  return (
    <input
      readOnly={isReadOnly}
      className={`${className} ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      {...props}
    />
  );
}

/**
 * Select dropdown that adapts based on user permissions
 */
export interface PermissionBasedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  permission?: Permission;
  role?: UserRole;
  roles?: UserRole[];
  children: React.ReactNode;
}

export function PermissionBasedSelect({
  permission,
  role,
  roles,
  children,
  className = '',
  ...props
}: PermissionBasedSelectProps) {
  const { loading, claims } = useAuth();

  if (loading) {
    return (
      <select
        disabled
        className={`${className} animate-pulse bg-gray-200`}
        {...props}
      >
        <option>Loading...</option>
      </select>
    );
  }

  if (!claims) {
    return (
      <select
        disabled
        className={`${className} opacity-50`}
        {...props}
      >
        <option>Not Authorized</option>
      </select>
    );
  }

  // Check permission access
  let hasAccess = true;

  if (permission && !claims.permissions.includes(permission)) {
    hasAccess = false;
  }

  if (role && claims.role !== role) {
    hasAccess = false;
  }

  if (roles && !roles.includes(claims.role)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return null; // Hide the select entirely
  }

  return (
    <select className={className} {...props}>
      {children}
    </select>
  );
}

/**
 * Textarea that adapts based on user permissions
 */
export interface PermissionBasedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  permission?: Permission;
  role?: UserRole;
  roles?: UserRole[];
  readOnlyPermission?: Permission;
  readOnlyRole?: UserRole;
}

export function PermissionBasedTextarea({
  permission,
  role,
  roles,
  readOnlyPermission,
  readOnlyRole,
  className = '',
  ...props
}: PermissionBasedTextareaProps) {
  const { loading, claims } = useAuth();

  if (loading) {
    return (
      <textarea
        disabled
        className={`${className} animate-pulse bg-gray-200`}
        {...props}
      />
    );
  }

  if (!claims) {
    return (
      <textarea
        disabled
        className={`${className} opacity-50`}
        {...props}
      />
    );
  }

  // Check if field should be hidden
  let hasAccess = true;

  if (permission && !claims.permissions.includes(permission)) {
    hasAccess = false;
  }

  if (role && claims.role !== role) {
    hasAccess = false;
  }

  if (roles && !roles.includes(claims.role)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return null; // Hide the textarea entirely
  }

  // Check if field should be read-only
  let isReadOnly = props.readOnly || false;

  if (readOnlyPermission && !claims.permissions.includes(readOnlyPermission)) {
    isReadOnly = true;
  }

  if (readOnlyRole && claims.role !== readOnlyRole) {
    isReadOnly = true;
  }

  return (
    <textarea
      readOnly={isReadOnly}
      className={`${className} ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      {...props}
    />
  );
}

/**
 * Form section that can be hidden or shown based on permissions
 */
export interface PermissionBasedSectionProps {
  children: React.ReactNode;
  permission?: Permission;
  role?: UserRole;
  roles?: UserRole[];
  title?: string;
  description?: string;
  className?: string;
}

export function PermissionBasedSection({
  children,
  permission,
  role,
  roles,
  title,
  description,
  className = ''
}: PermissionBasedSectionProps) {
  return (
    <PermissionBasedField
      permission={permission}
      role={role}
      roles={roles}
      mode="hide"
    >
      <div className={`permission-based-section ${className}`}>
        {title && (
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-gray-600 mb-4">
            {description}
          </p>
        )}
        {children}
      </div>
    </PermissionBasedField>
  );
}

/**
 * Form wrapper that shows different forms based on user role
 */
export interface RoleBasedFormProps {
  studentForm?: React.ReactNode;
  teacherForm?: React.ReactNode;
  adminForm?: React.ReactNode;
  pendingTeacherForm?: React.ReactNode;
  defaultForm?: React.ReactNode;
  loading?: React.ReactNode;
}

export function RoleBasedForm({
  studentForm,
  teacherForm,
  adminForm,
  pendingTeacherForm,
  defaultForm,
  loading = <div className="animate-pulse">Loading form...</div>
}: RoleBasedFormProps) {
  const { loading: authLoading, claims } = useAuth();

  if (authLoading) {
    return <>{loading}</>;
  }

  if (!claims) {
    return <>{defaultForm}</>;
  }

  switch (claims.role) {
    case UserRole.STUDENT:
      return <>{studentForm || defaultForm}</>;
    case UserRole.TEACHER:
      return <>{teacherForm || defaultForm}</>;
    case UserRole.ADMIN:
      return <>{adminForm || defaultForm}</>;
    case UserRole.PENDING_TEACHER:
      return <>{pendingTeacherForm || defaultForm}</>;
    default:
      return <>{defaultForm}</>;
  }
}

/**
 * Checkbox that can be controlled by permissions
 */
export interface PermissionBasedCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  permission?: Permission;
  role?: UserRole;
  roles?: UserRole[];
  label?: string;
}

export function PermissionBasedCheckbox({
  permission,
  role,
  roles,
  label,
  className = '',
  ...props
}: PermissionBasedCheckboxProps) {
  const { loading, claims } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center">
        <input
          type="checkbox"
          disabled
          className={`${className} animate-pulse`}
          {...props}
        />
        {label && <span className="ml-2 text-gray-400">Loading...</span>}
      </div>
    );
  }

  if (!claims) {
    return null;
  }

  // Check permission access
  let hasAccess = true;

  if (permission && !claims.permissions.includes(permission)) {
    hasAccess = false;
  }

  if (role && claims.role !== role) {
    hasAccess = false;
  }

  if (roles && !roles.includes(claims.role)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        className={className}
        {...props}
      />
      {label && <label className="ml-2 text-sm text-gray-700">{label}</label>}
    </div>
  );
}

/**
 * File input that can be controlled by permissions
 */
export interface PermissionBasedFileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  permission?: Permission;
  role?: UserRole;
  roles?: UserRole[];
  label?: string;
  acceptedTypes?: string[];
}

export function PermissionBasedFileInput({
  permission,
  role,
  roles,
  label,
  acceptedTypes,
  className = '',
  ...props
}: PermissionBasedFileInputProps) {
  const { loading, claims } = useAuth();

  if (loading) {
    return (
      <div className="space-y-2">
        {label && <label className="block text-sm font-medium text-gray-400">Loading...</label>}
        <input
          type="file"
          disabled
          className={`${className} animate-pulse bg-gray-200`}
          {...props}
        />
      </div>
    );
  }

  if (!claims) {
    return null;
  }

  // Check permission access
  let hasAccess = true;

  if (permission && !claims.permissions.includes(permission)) {
    hasAccess = false;
  }

  if (role && claims.role !== role) {
    hasAccess = false;
  }

  if (roles && !roles.includes(claims.role)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return null;
  }

  const accept = acceptedTypes ? acceptedTypes.join(',') : props.accept;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type="file"
        accept={accept}
        className={`${className} block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-blue-700 hover:file:bg-slate-100`}
        {...props}
      />
    </div>
  );
}
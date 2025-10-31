/**
 * Permission-Based UI Components - Index
 * Centralized exports for all permission and role-based components
 */

// Core Permission Gates
export {
  RequirePermission,
  RequireRole,
  RequireRoles,
  AdminOnly,
  TeacherOnly,
  StudentOnly,
  PendingTeacherOnly,
  AuthenticatedOnly,
  UnauthenticatedOnly,
  withPermission,
  withRole,
  withAdminRole,
  withTeacherRole,
  type PermissionGateProps,
  type RequirePermissionProps,
  type RequireRoleProps,
  type RequireRolesProps
} from './PermissionGate';

// Advanced Conditional Rendering
export {
  RequireMultiplePermissions,
  RequireMultipleRoles,
  ConditionalRender,
  RoleSwitch,
  PermissionSwitch,
  RequireCompleteProfile,
  RequireEmailVerification,
  PermissionStyled,
  RoleStyled,
  ComplexConditionalRender,
  PermissionLoader,
  UserExperienceSwitch,
  type ConditionalRendererProps,
  type MultiPermissionProps,
  type MultiRoleProps,
  type ConditionalProps,
  type RoleSwitchProps,
  type PermissionSwitchProps,
  type PermissionStyledProps,
  type RoleStyledProps,
  type ComplexConditionProps,
  type PermissionLoaderProps,
  type UserExperienceProps
} from './ConditionalRenderer';

// Permission-Based Form Components
export {
  PermissionBasedField,
  PermissionBasedButton,
  PermissionBasedInput,
  PermissionBasedSelect,
  PermissionBasedTextarea,
  PermissionBasedSection,
  RoleBasedForm,
  PermissionBasedCheckbox,
  PermissionBasedFileInput,
  type PermissionBasedFieldProps,
  type PermissionBasedButtonProps,
  type PermissionBasedInputProps,
  type PermissionBasedSelectProps,
  type PermissionBasedTextareaProps,
  type PermissionBasedSectionProps,
  type RoleBasedFormProps,
  type PermissionBasedCheckboxProps,
  type PermissionBasedFileInputProps
} from './PermissionBasedForm';

// Navigation Components
export {
  RoleBasedNavigation,
  StudentNavigation,
  TeacherNavigation,
  AdminNavigation,
  PendingTeacherNavigation,
  AdaptiveNavigation,
  RoleBreadcrumbs,
  QuickActions,
  type NavigationItem,
  type RoleBasedNavigationProps,
  type BreadcrumbItem,
  type RoleBreadcrumbsProps,
  type QuickActionProps
} from '../navigation/RoleBasedNavigation';

// Re-export hooks for convenience
export {
  useAuth,
  usePermission,
  useRole,
  useRoles,
  useIsAdmin,
  useIsTeacher,
  useIsStudent,
  useIsPendingTeacher,
  useIsAuthenticated,
  useCurrentRole,
  usePermissions
} from '../../hooks/useAuth';

export {
  usePermissionCheck,
  useAnyPermission,
  useRouteAccess,
  useRoleCheck,
  useCanManageRole,
  useUserPermissions,
  useAdminPermissions,
  useTeacherPermissions,
  useStudentPermissions,
  usePendingTeacherPermissions,
  useDynamicPermissionCheck,
  useProfileRequirements,
  useFeatureFlags,
  type PermissionCheckResult,
  type RouteAccessResult,
  type RoleCheckResult
} from '../../hooks/usePermissionCheck';

// Re-export types for convenience
export {
  UserRole,
  Permission,
  ApplicationStatus,
  AuthErrorCode
} from '../../types/auth';

export type {
  CustomClaims,
  UserProfile,
  StudentProfile,
  TeacherProfile,
  AdminProfile,
  AuthError
} from '../../types/auth';
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

// Authentication service hooks
export { useAuthService } from '../../hooks/useAuthService';
export { useLogout } from '../../hooks/useLogout';
export { useDeepLinking, useMobileDeepLinking } from '../../hooks/useDeepLinking';

// Authentication store
export {
  useAuthStore,
  useAuthUser,
  useAuthClaims,
  useAuthProfile,
  useAuthLoading,
  useAuthError,
  useIsAuthenticated as useStoreIsAuthenticated,
  useRegistrationStep,
  useSelectedRole,
  useHasPermission,
  useHasRole,
  useHasAnyRole,
  useIsAdmin as useStoreIsAdmin,
  useIsTeacher as useStoreIsTeacher,
  useIsStudent as useStoreIsStudent,
  useIsPendingTeacher as useStoreIsPendingTeacher
} from '../../lib/stores/auth.store';

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

// Registration Flow Components
export {
  default as RegistrationFlow,
  type RegistrationFlowProps
} from './RegistrationFlow';

export {
  default as RoleSelection,
  type RoleSelectionProps
} from './RoleSelection';

export {
  default as StudentRegistrationForm,
  type StudentRegistrationFormProps
} from './StudentRegistrationForm';

export {
  default as TeacherRegistrationForm,
  type TeacherRegistrationFormProps
} from './TeacherRegistrationForm';

export {
  default as EmailVerificationPending,
  type EmailVerificationPendingProps
} from './EmailVerificationPending';

// Login and Password Management Components
export {
  default as LoginForm,
  type LoginFormProps
} from './LoginForm';

export {
  default as PasswordResetRequestForm,
  type PasswordResetRequestFormProps
} from './PasswordResetRequestForm';

export {
  default as PasswordResetForm,
  type PasswordResetFormProps
} from './PasswordResetForm';

export {
  default as EmailVerificationResult,
  type EmailVerificationResultProps
} from './EmailVerificationResult';

// Authentication State Management
export {
  default as AuthProvider,
  useAuthContext,
  withAuth,
  type AuthContextValue,
  type AuthProviderProps
} from './AuthProvider';

// Mobile-Optimized Components
export {
  default as MobileAuthLayout,
  type MobileAuthLayoutProps
} from './MobileAuthLayout';

export {
  default as MobileLoginForm,
  type MobileLoginFormProps
} from './MobileLoginForm';

export {
  default as MobileRegistrationFlow,
  type MobileRegistrationFlowProps
} from './MobileRegistrationFlow';

export {
  default as ResponsiveAuthRouter,
  type ResponsiveAuthRouterProps
} from './ResponsiveAuthRouter';

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
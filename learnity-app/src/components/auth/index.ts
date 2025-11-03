/**
 * Authentication Components - Index (Client-Safe)
 * Exports only client-safe components and hooks
 */

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

// Client-safe hooks
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
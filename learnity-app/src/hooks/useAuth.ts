/**
 * Authentication Hooks for React Components
 * Unified authentication system using client-side token claims + Zustand store
 */

'use client';

// Re-export unified auth hook
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
  usePermissions,
  type UseAuthReturn,
  type AuthState,
  type AuthActions,
} from './useAuth.unified';

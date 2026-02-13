/**
 * Authentication Hooks for React Components
 * Unified authentication system consolidating useAuth and useClientAuth
 * Uses client-side token claims as base, integrated with Zustand store
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

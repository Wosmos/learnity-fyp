/**
 * Unified Authentication Hook
 * Consolidates useAuth and useClientAuth into a single, coherent system
 * Uses client-side token claims as base, with optional server-side enhancements
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import { UserRole, Permission, CustomClaims, UserProfile } from '@/types/auth';
import { useAuthStore } from '@/lib/stores/auth.store';

// Role-based permissions mapping (client-side)
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.STUDENT]: [
    Permission.VIEW_STUDENT_DASHBOARD,
    Permission.JOIN_STUDY_GROUPS,
    Permission.BOOK_TUTORING,
    Permission.ENHANCE_PROFILE,
  ],
  [UserRole.TEACHER]: [
    Permission.VIEW_TEACHER_DASHBOARD,
    Permission.MANAGE_SESSIONS,
    Permission.UPLOAD_CONTENT,
    Permission.VIEW_STUDENT_PROGRESS,
  ],
  [UserRole.PENDING_TEACHER]: [
    Permission.VIEW_APPLICATION_STATUS,
    Permission.UPDATE_APPLICATION,
  ],
  [UserRole.ADMIN]: [
    Permission.VIEW_ADMIN_PANEL,
    Permission.MANAGE_USERS,
    Permission.APPROVE_TEACHERS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.MANAGE_PLATFORM,
  ],
  [UserRole.REJECTED_TEACHER]: [Permission.VIEW_APPLICATION_STATUS],
};

export interface AuthState {
  user: FirebaseUser | null;
  claims: CustomClaims | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface AuthActions {
  refreshClaims: () => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

export type UseAuthReturn = AuthState & AuthActions;

/**
 * Extract custom claims from Firebase ID token
 */
async function extractClaimsFromToken(
  user: FirebaseUser
): Promise<CustomClaims | null> {
  try {
    // Force token refresh to get latest claims
    const idTokenResult = await user.getIdTokenResult(true);
    const firebaseClaims = idTokenResult.claims;

    console.log('Firebase claims:', firebaseClaims); // Debug logging

    // Check if custom claims exist
    if (!firebaseClaims.role) {
      console.warn('No custom claims found, user may need profile sync');

      // Try to trigger profile sync
      try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/auth/sync-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
            'X-Firebase-UID': user.uid,
          },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            providerData: user.providerData.map(provider => ({
              providerId: provider.providerId,
              uid: provider.uid,
              displayName: provider.displayName,
              email: provider.email,
              photoURL: provider.photoURL,
            })),
          }),
        });

        if (response.ok) {
          console.log('Profile sync triggered successfully');
          // Get fresh token with updated claims
          const freshTokenResult = await user.getIdTokenResult(true);
          const freshClaims = freshTokenResult.claims;

          if (freshClaims.role) {
            const role = freshClaims.role as UserRole;
            const permissions = ROLE_PERMISSIONS[role] || [];

            return {
              role,
              permissions,
              profileComplete: Boolean(freshClaims.profileComplete),
              emailVerified: user.emailVerified || false,
              profileId: (freshClaims.profileId as string) || '',
              lastLoginAt: (freshClaims.lastLoginAt as string) || '',
            };
          }
        }
      } catch (syncError) {
        console.error('Failed to sync profile:', syncError);
      }
    } else {
      // Claims exist, use them
      const role = firebaseClaims.role as UserRole;
      const permissions = ROLE_PERMISSIONS[role] || [];

      return {
        role,
        permissions,
        profileComplete: Boolean(firebaseClaims.profileComplete),
        emailVerified: user.emailVerified || false,
        profileId: (firebaseClaims.profileId as string) || '',
        lastLoginAt: (firebaseClaims.lastLoginAt as string) || '',
      };
    }

    // Fallback: return basic claims for authenticated users
    return {
      role: UserRole.STUDENT,
      permissions: ROLE_PERMISSIONS[UserRole.STUDENT],
      profileComplete: false,
      emailVerified: user.emailVerified || false,
      profileId: '',
      lastLoginAt: '',
    };
  } catch (error) {
    console.error('Error extracting claims from token:', error);

    // Fallback: return basic claims for authenticated users
    return {
      role: UserRole.STUDENT,
      permissions: ROLE_PERMISSIONS[UserRole.STUDENT],
      profileComplete: false,
      emailVerified: user.emailVerified || false,
      profileId: '',
      lastLoginAt: '',
    };
  }
}

/**
 * Main unified authentication hook
 * Combines functionality from useAuth and useClientAuth
 */
export function useAuth(): UseAuthReturn {
  const store = useAuthStore();

  const {
    user,
    claims,
    profile,
    isLoading: loading,
    error: storeError,
    isAuthenticated,
    hasPermission: storeHasPermission,
    hasRole: storeHasRole,
    hasAnyRole: storeHasAnyRole,
  } = store;

  const error = storeError ? storeError.message : null;
  const isAdmin = storeHasRole(UserRole.ADMIN);

  /**
   * Refresh user claims from Firebase token
   */
  const refreshClaims = useCallback(async () => {
    if (!user) return;
    try {
      // Force token refresh to get latest claims
      await user.getIdToken(true);
      // The actual store update should be handled by the refresh logic in AuthProvider or a dedicated action
      console.log('[useAuth] Claims refresh requested');
    } catch (error: any) {
      console.error('[useAuth] Failed to refresh claims:', error);
    }
  }, [user]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await auth.signOut();
      store.clearAuth();

      // Clear profile store as well
      const { useProfileStore } = await import('@/lib/stores/profile.store');
      useProfileStore.getState().clearProfile();

      // Clear cache
      localStorage.removeItem('learnity_user_claims');
      localStorage.removeItem('learnity-auth-storage');

      // Force reload to clear memory
      window.location.href = '/auth/login';
    } catch (error: any) {
      console.error('[useAuth] Failed to logout:', error);
      // Still try to force login page if signout fails
      window.location.href = '/auth/login';
    }
  }, [store]);

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return storeHasPermission(permission);
    },
    [storeHasPermission]
  );

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return storeHasRole(role);
    },
    [storeHasRole]
  );

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      return storeHasAnyRole(roles);
    },
    [storeHasAnyRole]
  );

  // Memoize the return object to prevent infinite re-render loops in components
  return useMemo(
    () => ({
      user,
      claims,
      profile,
      loading,
      error,
      isAuthenticated,
      isAdmin,
      refreshClaims,
      logout,
      hasPermission,
      hasRole,
      hasAnyRole,
    }),
    [
      user,
      claims,
      profile,
      loading,
      error,
      isAuthenticated,
      isAdmin,
      refreshClaims,
      logout,
      hasPermission,
      hasRole,
      hasAnyRole,
    ]
  );
}

/**
 * Hook for checking specific permission
 */
export function usePermission(permission: Permission): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

/**
 * Hook for checking specific role
 */
export function useRole(role: UserRole): boolean {
  const { hasRole } = useAuth();
  return hasRole(role);
}

/**
 * Hook for checking multiple roles
 */
export function useRoles(roles: UserRole[]): boolean {
  const { hasAnyRole } = useAuth();
  return hasAnyRole(roles);
}

/**
 * Hook for admin users
 */
export function useIsAdmin(): boolean {
  const { isAdmin } = useAuth();
  return isAdmin;
}

/**
 * Hook for teacher users (including admins)
 */
export function useIsTeacher(): boolean {
  return useRoles([UserRole.TEACHER, UserRole.ADMIN]);
}

/**
 * Hook for student users
 */
export function useIsStudent(): boolean {
  return useRole(UserRole.STUDENT);
}

/**
 * Hook for pending teacher users
 */
export function useIsPendingTeacher(): boolean {
  return useRole(UserRole.PENDING_TEACHER);
}

/**
 * Hook for checking if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated, loading } = useAuth();
  return !loading && isAuthenticated;
}

/**
 * Hook for getting current user role
 */
export function useCurrentRole(): UserRole | null {
  const { claims } = useAuth();
  return claims?.role || null;
}

/**
 * Hook for getting user permissions
 */
export function usePermissions(): Permission[] {
  const { claims } = useAuth();
  return claims?.permissions || [];
}

/**
 * Backward compatibility: ClientAuthState interface
 * This allows gradual migration from useClientAuth
 */
export interface ClientAuthState {
  user: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  claims: CustomClaims | null;
}

/**
 * Backward compatible hook for useClientAuth
 * @deprecated Use useAuth() instead. This will be removed in a future version.
 */
export function useClientAuth(): ClientAuthState {
  const { user, loading, isAdmin, isAuthenticated, claims } = useAuth();
  return {
    user,
    loading,
    isAdmin,
    isAuthenticated,
    claims,
  };
}

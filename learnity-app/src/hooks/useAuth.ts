/**
 * Authentication Hooks for React Components
 * Provides authentication state and permission checking
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import { roleManager } from '@/lib/services/role-manager.service';
import { 
  UserRole, 
  Permission, 
  CustomClaims,
  UserProfile 
} from '@/types/auth';

export interface AuthState {
  user: FirebaseUser | null;
  claims: CustomClaims | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  refreshClaims: () => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canAccessRoute: (route: string) => Promise<boolean>;
}

/**
 * Main authentication hook
 */
export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    claims: null,
    profile: null,
    loading: true,
    error: null
  });

  /**
   * Refresh user claims from Firebase
   */
  const refreshClaims = useCallback(async () => {
    if (!state.user) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Force token refresh to get latest claims
      await state.user.getIdToken(true);
      const claims = await roleManager.getCustomClaims(state.user.uid);
      
      setState(prev => ({ 
        ...prev, 
        claims, 
        loading: false 
      }));
    } catch (error: any) {
      console.error('Failed to refresh claims:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        loading: false 
      }));
    }
  }, [state.user]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await auth.signOut();
      setState({
        user: null,
        claims: null,
        profile: null,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Failed to logout:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message 
      }));
    }
  }, []);

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!state.claims || !state.claims.permissions) return false;
    return state.claims.permissions.includes(permission);
  }, [state.claims]);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role: UserRole): boolean => {
    if (!state.claims) return false;
    return state.claims.role === role;
  }, [state.claims]);

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    if (!state.claims) return false;
    return roles.includes(state.claims.role);
  }, [state.claims]);

  /**
   * Check if user can access specific route
   */
  const canAccessRoute = useCallback(async (route: string): Promise<boolean> => {
    if (!state.user) return false;
    
    try {
      return await roleManager.validateRouteAccess(state.user.uid, route);
    } catch (error) {
      console.error('Failed to validate route access:', error);
      return false;
    }
  }, [state.user]);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setState(prev => ({ ...prev, loading: true, error: null }));
          
          // Get user claims
          const claims = await roleManager.getCustomClaims(user.uid);
          
          setState({
            user,
            claims,
            profile: null, // TODO: Fetch from database service
            loading: false,
            error: null
          });
        } catch (error: any) {
          console.error('Failed to get user claims:', error);
          setState({
            user,
            claims: null,
            profile: null,
            loading: false,
            error: error.message
          });
        }
      } else {
        setState({
          user: null,
          claims: null,
          profile: null,
          loading: false,
          error: null
        });
      }
    });

    return unsubscribe;
  }, []);

  return {
    ...state,
    refreshClaims,
    logout,
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccessRoute
  };
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
  return useRole(UserRole.ADMIN);
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
  const { user, loading } = useAuth();
  return !loading && !!user;
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
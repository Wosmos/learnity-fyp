/**
 * Authentication Context Provider
 * Provides authentication state and methods to React components
 * OPTIMIZED: Uses centralized profile store to prevent duplicate API calls
 */

'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useProfileStore } from '@/lib/stores/profile.store';
// Note: roleManager is server-side only, we'll use API calls instead
import {
  UserRole,
  Permission,
  CustomClaims,
  UserProfile,
  AuthError,
  AuthErrorCode,
} from '@/types/auth';

export interface AuthContextValue {
  // State
  user: FirebaseUser | null;
  claims: CustomClaims | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;

  // Actions
  refreshClaims: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;

  // Permission helpers
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canAccessRoute: (route: string) => Promise<boolean>;

  // Role-specific helpers
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isPendingTeacher: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    claims,
    profile,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setClaims,
    setProfile,
    setLoading,
    setError,
    clearAuth,
    updateLastActivity,
    hasPermission,
    hasRole,
    hasAnyRole,
  } = useAuthStore();

  // Use centralized profile store
  const {
    setProfile: setProfileStore,
    setLoading: setProfileLoading,
    clearProfile,
    isCacheValid,
  } = useProfileStore();

  // Prevent duplicate fetches
  const fetchingRef = useRef(false);

  /**
   * Refresh user claims from Firebase and sync with store
   */
  const refreshClaims = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Force token refresh to get latest claims
      await user.getIdToken(true);

      // Get custom claims from API instead of direct Firebase Admin access
      const response = await fetch('/api/auth/claims', {
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
      });

      const customClaims = response.ok ? await response.json() : null;

      setClaims(customClaims);

      // Update cache with fresh claims
      if (customClaims) {
        localStorage.setItem(
          'learnity_user_claims',
          JSON.stringify({
            uid: user.uid,
            claims: customClaims,
            timestamp: Date.now(),
          })
        );
      }

      updateLastActivity();
    } catch (error: any) {
      console.error('Failed to refresh claims:', error);
      setError({
        code: AuthErrorCode.TOKEN_INVALID,
        message: 'Failed to refresh authentication. Please sign in again.',
        details: { originalError: error.message },
      });
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setError, setClaims, updateLastActivity]);

  /**
   * Logout user and clear all auth state
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Call client logout (clears session and Firebase)
      const { clientAuthService } =
        await import('@/lib/services/client-auth.service');
      await clientAuthService.logout();

      // 2. Clear stores
      clearAuth();
      clearProfile();

      // 3. Clear all cached data
      if (typeof window !== 'undefined') {
        // Clear all learnity/firebase/auth related items from localStorage
        const keysToRemove = Object.keys(localStorage).filter(
          key =>
            key.startsWith('learnity-') ||
            key.startsWith('firebase-') ||
            key.startsWith('auth-')
        );
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Clear specific known keys just in case
        localStorage.removeItem('learnity_user_claims');
        localStorage.removeItem('learnity-auth-storage');

        // Clear sessionStorage
        sessionStorage.clear();

        // Clear any auth-related cookies
        document.cookie.split(';').forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (
            name.includes('auth') ||
            name.includes('session') ||
            name.includes('token')
          ) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          }
        });
      }

      // 4. Hard redirect to clear everything in memory
      window.location.href = '/auth/login';
    } catch (error: any) {
      console.error('Failed to logout:', error);
      setError({
        code: AuthErrorCode.INTERNAL_ERROR,
        message: 'Failed to sign out. Please try again.',
        details: { originalError: error.message },
      });
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearAuth, clearProfile]);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  /**
   * Check if user can access specific route
   */
  const canAccessRoute = useCallback(
    async (route: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const response = await fetch(
          `/api/auth/route-access?route=${encodeURIComponent(route)}`,
          {
            headers: {
              Authorization: `Bearer ${await user.getIdToken()}`,
            },
          }
        );

        return response.ok ? await response.json() : false;
      } catch (error) {
        console.error('Failed to validate route access:', error);
        return false;
      }
    },
    [user]
  );

  /**
   * Set up Firebase auth state listener
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      setLoading(true);

      if (firebaseUser) {
        try {
          setUser(firebaseUser);

          // Check for cached claims to show UI immediately
          const cachedClaims = localStorage.getItem('learnity_user_claims');
          if (cachedClaims) {
            try {
              const parsed = JSON.parse(cachedClaims);
              // Check if cache is for the same user and is fresh
              if (
                parsed.uid === firebaseUser.uid &&
                parsed.timestamp &&
                Date.now() - parsed.timestamp < 5 * 60 * 1000
              ) {
                setClaims(parsed.claims);
                setLoading(false); // Show UI immediately with cached data
              } else if (parsed.uid !== firebaseUser.uid) {
                // Clear stale cache for different user
                localStorage.removeItem('learnity_user_claims');
                clearProfile(); // Clear previous account's profile
              }
            } catch (e) {
              console.warn('Failed to parse cached claims:', e);
            }
          }

          const idToken = await firebaseUser.getIdToken();

          // Prevent duplicate fetches
          if (fetchingRef.current) return;
          fetchingRef.current = true;

          // Check if profile is already cached
          const profileCached = isCacheValid();

          // Parallel fetch: claims, profile (only if not cached), and sync (fire-and-forget)
          const fetchPromises: Promise<any>[] = [
            fetch('/api/auth/claims', {
              headers: { Authorization: `Bearer ${idToken}` },
            }),
          ];

          // Only fetch profile if not cached
          if (!profileCached) {
            setProfileLoading(true);
            fetchPromises.push(
              fetch('/api/auth/profile', {
                headers: { Authorization: `Bearer ${idToken}` },
              })
            );
          }

          // Fire-and-forget sync - don't wait for it
          syncUserProfile(firebaseUser).catch(err =>
            console.warn('Profile sync failed (non-critical):', err)
          );

          const responses = await Promise.all(fetchPromises);
          const claimsResponse = responses[0];
          const profileResponse = profileCached ? null : responses[1];

          // Process claims
          if (claimsResponse.ok) {
            const customClaims = await claimsResponse.json();
            setClaims(customClaims);

            // Cache claims with timestamp and UID
            localStorage.setItem(
              'learnity_user_claims',
              JSON.stringify({
                uid: firebaseUser.uid,
                claims: customClaims,
                timestamp: Date.now(),
              })
            );
          }

          // Process profile - update both stores
          if (profileResponse?.ok) {
            const userProfile = await profileResponse.json();
            setProfile(userProfile);
            setProfileStore(userProfile); // Update centralized store
          }
          setProfileLoading(false);
          fetchingRef.current = false;

          updateLastActivity();
        } catch (error: any) {
          console.error('Failed to initialize user session:', error);
          setError({
            code: AuthErrorCode.INTERNAL_ERROR,
            message:
              'Failed to initialize session. Please try signing in again.',
            details: { originalError: error.message },
          });

          // Clear user on error
          setUser(null);
          setClaims(null);
          setProfile(null);
          clearProfile(); // Clear centralized profile store
          localStorage.removeItem('learnity_user_claims');
          fetchingRef.current = false;
        }
      } else {
        // User signed out - clear cache
        clearAuth();
        clearProfile(); // Clear centralized profile store
        localStorage.removeItem('learnity_user_claims');
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [
    setUser,
    setClaims,
    setProfile,
    setLoading,
    setError,
    clearAuth,
    updateLastActivity,
  ]);

  /**
   * Sync user profile with Neon DB
   * Creates profile if it doesn't exist, updates if it does
   */
  const syncUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken();

      // Check if profile exists and sync
      const response = await fetch('/api/auth/sync-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
          'X-Firebase-UID': firebaseUser.uid,
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          providerData: firebaseUser.providerData.map(provider => ({
            providerId: provider.providerId,
            uid: provider.uid,
            displayName: provider.displayName,
            email: provider.email,
            photoURL: provider.photoURL,
          })),
        }),
      });

      if (!response.ok) {
        console.warn('Failed to sync user profile:', await response.text());
      } else {
        console.log('✅ User profile synced successfully');
      }
    } catch (error) {
      console.error('Failed to sync user profile:', error);
      // Don't throw here as we don't want to break the auth flow
    }
  };

  /**
   * Set up automatic token refresh
   */
  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const refreshInterval = setInterval(
      async () => {
        try {
          // Refresh token every 50 minutes (Firebase tokens expire after 1 hour)
          await user.getIdToken(true);
          updateLastActivity();
        } catch (error) {
          console.error('Failed to refresh token:', error);
          // Don't set error here as it might be a temporary network issue
        }
      },
      50 * 60 * 1000
    ); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [user, isAuthenticated, updateLastActivity]);

  /**
   * Set up session timeout monitoring
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSessionTimeout = () => {
      const lastActivity = useAuthStore.getState().lastActivity;
      if (lastActivity) {
        const now = new Date();
        const timeSinceLastActivity = now.getTime() - lastActivity.getTime();
        const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours

        if (timeSinceLastActivity > sessionTimeout) {
          logout();
        }
      }
    };

    const timeoutInterval = setInterval(checkSessionTimeout, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(timeoutInterval);
  }, [isAuthenticated, logout]);

  // Role-specific computed values
  const isAdmin = hasRole(UserRole.ADMIN);
  const isTeacher = hasRole(UserRole.TEACHER);
  const isStudent = hasRole(UserRole.STUDENT);
  const isPendingTeacher = hasRole(UserRole.PENDING_TEACHER);

  const contextValue: AuthContextValue = {
    // State
    user,
    claims,
    profile,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    refreshClaims,
    logout,
    clearError,

    // Permission helpers
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccessRoute,

    // Role-specific helpers
    isAdmin,
    isTeacher,
    isStudent,
    isPendingTeacher,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 */
export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

/**
 * Higher-order component to provide authentication context
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  const WrappedComponent = (props: P) => (
    <AuthProvider>
      <Component {...props} />
    </AuthProvider>
  );

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name
    })`;
  return WrappedComponent;
};

export default AuthProvider;

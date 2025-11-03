/**
 * Authentication Context Provider
 * Provides authentication state and methods to React components
 */

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
} from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/config/firebase";
import { useAuthStore } from "@/lib/stores/auth.store";
// Note: roleManager is server-side only, we'll use API calls instead
import {
  UserRole,
  Permission,
  CustomClaims,
  UserProfile,
  AuthError,
  AuthErrorCode,
} from "@/types/auth";

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
      const response = await fetch("/api/auth/claims", {
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
      });

      const customClaims = response.ok ? await response.json() : null;

      setClaims(customClaims);
      updateLastActivity();
    } catch (error: any) {
      console.error("Failed to refresh claims:", error);
      setError({
        code: AuthErrorCode.TOKEN_INVALID,
        message: "Failed to refresh authentication. Please sign in again.",
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
      await signOut(auth);
      clearAuth();
    } catch (error: any) {
      console.error("Failed to logout:", error);
      setError({
        code: AuthErrorCode.INTERNAL_ERROR,
        message: "Failed to sign out. Please try again.",
        details: { originalError: error.message },
      });
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearAuth]);

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
        console.error("Failed to validate route access:", error);
        return false;
      }
    },
    [user]
  );

  /**
   * Set up Firebase auth state listener
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        try {
          setUser(firebaseUser);

          // Sync user profile with Neon DB (create if doesn't exist)
          await syncUserProfile(firebaseUser);

          // Get user claims and profile from API
          const response = await fetch("/api/auth/claims", {
            headers: {
              Authorization: `Bearer ${await firebaseUser.getIdToken()}`,
            },
          });

          const customClaims = response.ok ? await response.json() : null;
          setClaims(customClaims);

          // Fetch user profile from database
          const profileResponse = await fetch("/api/auth/profile", {
            headers: {
              Authorization: `Bearer ${await firebaseUser.getIdToken()}`,
            },
          });

          const userProfile = profileResponse.ok ? await profileResponse.json() : null;
          setProfile(userProfile);

          updateLastActivity();
        } catch (error: any) {
          console.error("Failed to initialize user session:", error);
          setError({
            code: AuthErrorCode.INTERNAL_ERROR,
            message:
              "Failed to initialize session. Please try signing in again.",
            details: { originalError: error.message },
          });

          // Clear user on error
          setUser(null);
          setClaims(null);
          setProfile(null);
        }
      } else {
        // User signed out
        clearAuth();
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
      const response = await fetch("/api/auth/sync-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
          "X-Firebase-UID": firebaseUser.uid,
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
            photoURL: provider.photoURL
          }))
        }),
      });

      if (!response.ok) {
        console.warn("Failed to sync user profile:", await response.text());
      } else {
        console.log("✅ User profile synced successfully");
      }
    } catch (error) {
      console.error("Failed to sync user profile:", error);
      // Don't throw here as we don't want to break the auth flow
    }
  };

  /**
   * Set up automatic token refresh
   */
  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        // Refresh token every 50 minutes (Firebase tokens expire after 1 hour)
        await user.getIdToken(true);
        updateLastActivity();
      } catch (error) {
        console.error("Failed to refresh token:", error);
        // Don't set error here as it might be a temporary network issue
      }
    }, 50 * 60 * 1000); // 50 minutes

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
    throw new Error("useAuthContext must be used within an AuthProvider");
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

  WrappedComponent.displayName = `withAuth(${
    Component.displayName || Component.name
  })`;
  return WrappedComponent;
};

export default AuthProvider;

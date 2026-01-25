/**
 * Authentication Redirect Hook
 * Manages authentication-based redirects with role-based routing
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getPostAuthRedirect,
  getRedirectFromUrl,
  hasRouteAccess,
  requiresAuthentication,
} from '@/lib/utils/auth-redirect.utils';
import { UserRole } from '@/types/auth';
import { useClientAuth } from './useClientAuth';

export interface UseAuthRedirectOptions {
  enabled?: boolean;
  fallbackPath?: string;
  preserveQuery?: boolean;
  redirectDelay?: number;
}

export interface UseAuthRedirectReturn {
  isRedirecting: boolean;
  shouldShowContent: boolean;
  redirectPath: string | null;
  error: string | null;
}

/**
 * Custom hook for managing authentication-based redirects
 * Monitors authentication state and handles role-based routing
 */
export function useAuthRedirect(
  options: UseAuthRedirectOptions = {}
): UseAuthRedirectReturn {
  const {
    enabled = true,
    fallbackPath = '/dashboard',
    preserveQuery = true,
    redirectDelay = 100,
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, isAuthenticated, claims } = useClientAuth();

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate the appropriate redirect path based on authentication state
   */
  const calculateRedirectPath = useCallback((): string | null => {
    if (!enabled || loading) {
      return null;
    }

    try {
      // Get the requested redirect path from URL parameters
      const requestedRedirect = getRedirectFromUrl(searchParams);

      if (isAuthenticated && user && claims) {
        // User is authenticated - determine where to redirect
        const userRole = claims.role;

        // If there's a requested redirect, check if user has access
        if (requestedRedirect && hasRouteAccess(requestedRedirect, userRole)) {
          return requestedRedirect;
        }

        // Get the appropriate dashboard based on role and profile completion
        return getPostAuthRedirect({
          role: userRole,
          claims,
          defaultRoute: fallbackPath,
        });
      } else if (!isAuthenticated && !loading) {
        // User is not authenticated
        const currentPath = window.location.pathname;

        // If current path requires authentication, redirect to login
        if (requiresAuthentication(currentPath)) {
          const loginUrl = '/auth/login';
          if (preserveQuery && currentPath !== '/') {
            const encodedPath = encodeURIComponent(
              currentPath + window.location.search
            );
            return `${loginUrl}?redirect=${encodedPath}`;
          }
          return loginUrl;
        }
      }

      return null;
    } catch (err) {
      console.error('Error calculating redirect path:', err);
      setError('Failed to determine redirect path');
      return null;
    }
  }, [
    enabled,
    loading,
    isAuthenticated,
    user,
    claims,
    searchParams,
    fallbackPath,
    preserveQuery,
  ]);

  /**
   * Perform the redirect with optional delay
   */
  const performRedirect = useCallback(
    (path: string) => {
      setIsRedirecting(true);
      setError(null);

      const redirect = () => {
        try {
          router.push(path);
        } catch (err) {
          console.error('Redirect failed:', err);
          setError('Redirect failed');
          setIsRedirecting(false);
        }
      };

      if (redirectDelay > 0) {
        setTimeout(redirect, redirectDelay);
      } else {
        redirect();
      }
    },
    [router, redirectDelay]
  );

  /**
   * Main effect to handle authentication state changes and redirects
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const newRedirectPath = calculateRedirectPath();
    setRedirectPath(newRedirectPath);

    if (newRedirectPath && !isRedirecting) {
      performRedirect(newRedirectPath);
    } else if (!newRedirectPath) {
      setIsRedirecting(false);
    }
  }, [enabled, calculateRedirectPath, performRedirect, isRedirecting]);

  /**
   * Reset redirecting state when authentication loading completes
   */
  useEffect(() => {
    if (!loading && !redirectPath) {
      setIsRedirecting(false);
    }
  }, [loading, redirectPath]);

  /**
   * Handle authentication errors
   */
  useEffect(() => {
    if (!loading && !isAuthenticated && user === null) {
      // Authentication failed or user logged out
      setError(null); // Clear any previous errors
    }
  }, [loading, isAuthenticated, user]);

  return {
    isRedirecting: isRedirecting || loading,
    shouldShowContent: !isRedirecting && !loading && !redirectPath,
    redirectPath,
    error,
  };
}

/**
 * Hook specifically for home page authentication redirects
 * Simplified version focused on home page use case with enhanced error handling
 */
export function useHomeAuthRedirect(): UseAuthRedirectReturn {
  const { user, loading, isAuthenticated, claims } = useClientAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Handle authentication errors with recovery strategies
  const handleAuthError = useCallback(
    (err: any) => {
      console.error('Home page authentication error:', err);

      // Log error for monitoring and debugging
      const errorDetails = {
        error: err?.message || 'Unknown authentication error',
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
        url: typeof window !== 'undefined' ? window.location.href : 'SSR',
        retryCount,
      };

      // In a real app, this would send to monitoring service
      console.warn('Authentication error logged:', errorDetails);

      // Determine error recovery strategy
      if (err?.code === 'auth/network-request-failed' && retryCount < 3) {
        // Network error - retry after delay
        setError('Connection issue. Retrying...');
        setTimeout(
          () => {
            setRetryCount(prev => prev + 1);
            setError(null);
            // Force re-evaluation by updating a dependency
          },
          1000 * (retryCount + 1)
        ); // Exponential backoff
      } else if (
        err?.code === 'auth/id-token-expired' ||
        err?.code === 'auth/invalid-user-token'
      ) {
        // Invalid/expired token - clear session and show landing page
        setError(null); // Don't show error to user, just clear session
        setIsRedirecting(false);
        // The auth system should handle token cleanup
      } else {
        // Other errors - show landing page gracefully
        setError(null); // Don't show error to user for better UX
        setIsRedirecting(false);
      }
    },
    [retryCount]
  );

  useEffect(() => {
    if (loading) {
      return; // Still loading authentication state
    }

    // Handle successful authentication
    if (isAuthenticated && user && claims) {
      // User is authenticated, redirect to appropriate dashboard
      setIsRedirecting(true);
      setError(null);
      setRetryCount(0); // Reset retry count on success

      try {
        const redirectPath = getPostAuthRedirect({
          role: claims.role,
          claims,
        });

        // Small delay to prevent flash of content
        setTimeout(() => {
          try {
            router.push(redirectPath);
          } catch (routerError) {
            console.error('Router push failed:', routerError);
            handleAuthError(routerError);
          }
        }, 100);
      } catch (err) {
        console.error('Home redirect failed:', err);
        handleAuthError(err);
      }
    } else if (!loading && isAuthenticated && user && !claims) {
      // User is authenticated but no claims - this might be a timing issue
      console.warn('User authenticated but no claims found, waiting...');

      // Set a timeout to prevent infinite waiting
      setTimeout(() => {
        if (!claims) {
          console.error('Claims not loaded after timeout, showing error');
          setError(
            'Authentication incomplete. Please try refreshing the page.'
          );
          setIsRedirecting(false);
        }
      }, 5000); // 5 second timeout
    } else if (!loading) {
      // User is not authenticated, show landing page
      setIsRedirecting(false);
      setError(null);
      setRetryCount(0);
    }
  }, [
    loading,
    isAuthenticated,
    user,
    claims,
    router,
    handleAuthError,
    retryCount,
  ]);

  // Clear errors after a timeout for better UX
  useEffect(() => {
    if (error && !error.includes('Retrying')) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  return {
    isRedirecting: isRedirecting || loading,
    shouldShowContent: !isRedirecting && !loading && !isAuthenticated && !error,
    redirectPath:
      isAuthenticated && claims
        ? getPostAuthRedirect({ role: claims.role, claims })
        : null,
    error,
  };
}

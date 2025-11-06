/**
 * Logout Hook
 * Provides logout functionality with proper state cleanup and server-side session termination
 */

'use client';

import { useState, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import { useAuthStore } from '@/lib/stores/auth.store';
import { AuthError, AuthErrorCode } from '@/types/auth';

export interface LogoutOptions {
  allDevices?: boolean;
}

export interface LogoutHook {
  logout: (options?: LogoutOptions) => Promise<void>;
  isLoggingOut: boolean;
  error: AuthError | null;
}

export const useLogout = (): LogoutHook => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const { clearAuth, setError: setStoreError } = useAuthStore();

  const logout = useCallback(async (options: LogoutOptions = {}) => {
    setIsLoggingOut(true);
    setError(null);
    
    try {
      // Get current user and tokens before signing out
      const currentUser = auth.currentUser;
      let idToken: string | null = null;
      let refreshToken: string | null = null;

      if (currentUser) {
        try {
          idToken = await currentUser.getIdToken();
          // Note: Firebase doesn't expose refresh tokens directly in the client SDK
          // The server will handle refresh token cleanup based on the ID token
        } catch (tokenError) {
          console.warn('Failed to get ID token before logout:', tokenError);
        }
      }

      // Call server-side logout API to handle session cleanup and token blacklisting
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(idToken && { 'Authorization': `Bearer ${idToken}` }),
            'x-device-fingerprint': getDeviceFingerprint(),
          },
          body: JSON.stringify({
            allDevices: options.allDevices || false,
            refreshToken // Will be null from client, but kept for API compatibility
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn('Server-side logout failed:', errorData);
          // Continue with client-side logout even if server-side fails
        }
      } catch (apiError) {
        console.warn('Failed to call logout API:', apiError);
        // Continue with client-side logout even if API call fails
      }

      // Sign out from Firebase
      await signOut(auth);
      
      // Clear all auth state
      clearAuth();
      
      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Clear localStorage items related to auth
        const keysToRemove = Object.keys(localStorage).filter(key => 
          key.startsWith('learnity-') || 
          key.startsWith('firebase-') ||
          key.startsWith('auth-')
        );
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear sessionStorage
        sessionStorage.clear();

        // Clear any auth-related cookies
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.includes('auth') || name.includes('session') || name.includes('token')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          }
        });
      }
      
    } catch (error: any) {
      console.error('Logout failed:', error);
      
      const authError: AuthError = {
        code: AuthErrorCode.INTERNAL_ERROR,
        message: 'Failed to sign out. Please try again.',
        details: { originalError: error.message }
      };
      
      setError(authError);
      setStoreError(authError);
      
      // Even if logout fails, clear local state
      clearAuth();
    } finally {
      setIsLoggingOut(false);
    }
  }, [clearAuth, setStoreError]);

  return {
    logout,
    isLoggingOut,
    error
  };
};

/**
 * Generate a simple device fingerprint for logout tracking
 */
function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server';
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
}
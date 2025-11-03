/**
 * Logout Hook
 * Provides logout functionality with proper state cleanup
 */

'use client';

import { useState, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import { useAuthStore } from '@/lib/stores/auth.store';
import { AuthError, AuthErrorCode } from '@/types/auth';

export interface LogoutHook {
  logout: () => Promise<void>;
  isLoggingOut: boolean;
  error: AuthError | null;
}

export const useLogout = (): LogoutHook => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const { clearAuth, setError: setStoreError } = useAuthStore();

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    setError(null);
    
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear all auth state
      clearAuth();
      
      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Clear localStorage items related to auth
        const keysToRemove = Object.keys(localStorage).filter(key => 
          key.startsWith('learnity-') || key.startsWith('firebase-')
        );
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear sessionStorage
        sessionStorage.clear();
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
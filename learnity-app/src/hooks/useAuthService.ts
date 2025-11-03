/**
 * Authentication Service Hooks
 * Provides authentication operations with Firebase integration
 */

'use client';

import { useState, useCallback } from 'react';
import { 
  StudentRegistrationData, 
  TeacherRegistrationData, 
  LoginData,
  PasswordResetRequestData,
  PasswordResetData
} from '@/lib/validators/auth';
import { clientAuthService } from '@/lib/services/client-auth.service';
import { useAuthStore } from '@/lib/stores/auth.store';
import { AuthError, AuthErrorCode } from '@/types/auth';

export interface AuthServiceHooks {
  // Registration
  registerStudent: (data: StudentRegistrationData) => Promise<void>;
  registerTeacher: (data: TeacherRegistrationData) => Promise<void>;
  
  // Login
  login: (data: LoginData) => Promise<void>;
  socialLogin: (provider: 'google' | 'microsoft') => Promise<void>;
  
  // Password management
  requestPasswordReset: (data: PasswordResetRequestData) => Promise<void>;
  resetPassword: (data: PasswordResetData) => Promise<void>;
  
  // Email verification
  resendVerificationEmail: () => Promise<void>;
  
  // State
  isLoading: boolean;
  error: AuthError | null;
}

export const useAuthService = (): AuthServiceHooks => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const { setUser, setClaims, setError: setStoreError } = useAuthStore();

  const handleError = useCallback((error: any): AuthError => {
    console.error('Auth service error:', error);
    
    // Map Firebase errors to our error codes
    const authError: AuthError = {
      code: AuthErrorCode.INTERNAL_ERROR,
      message: `An unexpected error occurred. Please try again.${error.message}`,
      details: { originalError: error.message }
    };

    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          authError.code = AuthErrorCode.ACCOUNT_NOT_FOUND;
          authError.message = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          authError.code = AuthErrorCode.INVALID_CREDENTIALS;
          authError.message = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          authError.code = AuthErrorCode.WEAK_PASSWORD;
          authError.message = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          authError.code = AuthErrorCode.INVALID_CREDENTIALS;
          authError.message = 'Invalid email or password.';
          break;
        case 'auth/too-many-requests':
          authError.code = AuthErrorCode.TOO_MANY_ATTEMPTS;
          authError.message = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/user-disabled':
          authError.code = AuthErrorCode.ACCOUNT_LOCKED;
          authError.message = 'This account has been disabled.';
          break;
      }
    }

    setError(authError);
    setStoreError(authError);
    return authError;
  }, [setStoreError]);

  const registerStudent = useCallback(async (data: StudentRegistrationData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await clientAuthService.registerStudent(data);
      if (result.success && result.user) {
        setUser(result.user);
        // Claims will be set by the auth provider
      } else {
        throw new Error(result.error?.message || 'Registration failed');
      }
    } catch (error: any) {
      throw handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [setUser, handleError]);

  const registerTeacher = useCallback(async (data: TeacherRegistrationData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await clientAuthService.registerTeacher(data);
      if (result.success && result.user) {
        setUser(result.user);
        // Claims will be set by the auth provider
      } else {
        throw new Error(result.error?.message || 'Registration failed');
      }
    } catch (error: any) {
      throw handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [setUser, handleError]);

  const login = useCallback(async (data: LoginData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await clientAuthService.login(data);
      if (result.success && result.user) {
        setUser(result.user);
        // Claims will be set by the auth provider
      } else {
        throw new Error(result.error?.message || 'Login failed');
      }
    } catch (error: any) {
      throw handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [setUser, handleError]);

  const socialLogin = useCallback(async (provider: 'google' | 'microsoft') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await clientAuthService.socialLogin(provider);
      if (result.success && result.user) {
        setUser(result.user);
        // Claims will be set by the auth provider
      } else {
        throw new Error(result.error?.message || `${provider} login failed`);
      }
    } catch (error: any) {
      throw handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [setUser, handleError]);

  const requestPasswordReset = useCallback(async (data: PasswordResetRequestData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await clientAuthService.sendPasswordReset(data.email);
    } catch (error: any) {
      throw handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const resetPassword = useCallback(async (data: PasswordResetData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await clientAuthService.updatePassword(data.password);
    } catch (error: any) {
      throw handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const resendVerificationEmail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('No user found');
      }
      await clientAuthService.sendEmailVerification(user);
    } catch (error: unknown) {
      throw handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    registerStudent,
    registerTeacher,
    login,
    socialLogin,
    requestPasswordReset,
    resetPassword,
    resendVerificationEmail,
    isLoading,
    error
  };
};
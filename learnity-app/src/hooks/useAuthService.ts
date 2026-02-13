/**
 * Authentication Service Hooks
 * Provides authentication operations with Firebase integration
 */

'use client';

import { useState, useCallback } from 'react';
import {
  StudentRegistrationData,
  EnhancedTeacherRegistrationData,
  LoginData,
  PasswordResetRequestData,
  PasswordResetData,
} from '@/lib/validators/auth';
import { clientAuthService } from '@/lib/services/client-auth.service';
import { useAuthStore } from '@/lib/stores/auth.store';
import { AuthError, AuthErrorCode } from '@/types/auth';
import { formatErrorForDisplay } from '@/lib/utils/error-messages';

export interface AuthServiceHooks {
  // Registration
  registerStudent: (data: StudentRegistrationData) => Promise<void>;
  registerTeacher: (data: any) => Promise<void>;
  registerQuickTeacher: (data: any) => Promise<void>;

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

  const handleError = useCallback(
    (error: any): never => {
      console.error('Auth service error:', error);

      // Get user-friendly error message
      const errorMessage = formatErrorForDisplay(error);

      // Map to AuthError for store
      const authError: AuthError = {
        code: error.code || AuthErrorCode.INTERNAL_ERROR,
        message: errorMessage.description,
        details: { originalError: error.message },
      };

      setError(authError);
      setStoreError(authError);

      // Throw error with user-friendly message
      throw new Error(errorMessage.description);
    },
    [setStoreError]
  );

  const registerStudent = useCallback(
    async (data: StudentRegistrationData) => {
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
    },
    [setUser, handleError]
  );

  const registerTeacher = useCallback(
    async (data: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await clientAuthService.registerEnhancedTeacher(data);
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
    },
    [setUser, handleError]
  );

  const registerQuickTeacher = useCallback(
    async (data: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await clientAuthService.registerQuickTeacher(data);
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
    },
    [setUser, handleError]
  );

  const login = useCallback(
    async (data: LoginData) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await clientAuthService.login(data);
        if (result.success && result.user) {
          // Check for email verification
          if (!result.user.emailVerified) {
            setUser(result.user);
            throw {
              code: AuthErrorCode.EMAIL_NOT_VERIFIED,
              message: 'Your email address is not verified. Please verify your email to access your account.',
            };
          }
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
    },
    [setUser, handleError]
  );

  const socialLogin = useCallback(
    async (provider: 'google' | 'microsoft') => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await clientAuthService.socialLogin(provider);
        if (result.success && result.user) {
          // Check for email verification
          if (!result.user.emailVerified) {
            setUser(result.user);
            throw {
              code: AuthErrorCode.EMAIL_NOT_VERIFIED,
              message: 'Your email address is not verified. Please verify your email to access your account.',
            };
          }
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
    },
    [setUser, handleError]
  );

  const requestPasswordReset = useCallback(
    async (data: PasswordResetRequestData) => {
      setIsLoading(true);
      setError(null);

      try {
        await clientAuthService.sendPasswordReset(data.email);
      } catch (error: any) {
        throw handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  const resetPassword = useCallback(
    async (data: PasswordResetData) => {
      setIsLoading(true);
      setError(null);

      try {
        await clientAuthService.updatePassword(data.password);
      } catch (error: any) {
        throw handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

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
    registerQuickTeacher,
    login,
    socialLogin,
    requestPasswordReset,
    resetPassword,
    resendVerificationEmail,
    isLoading,
    error,
  };
};

/**
 * Deep Linking Hook
 * Handles deep links for email verification and password reset
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import { AuthError, AuthErrorCode } from '@/types/auth';

export interface DeepLinkingState {
  isProcessing: boolean;
  error: AuthError | null;
  success: boolean;
  actionType: 'verifyEmail' | 'resetPassword' | null;
  resetToken: string | null;
}

export interface DeepLinkingActions {
  handleEmailVerification: (actionCode: string) => Promise<void>;
  handlePasswordResetVerification: (actionCode: string) => Promise<string>;
  clearState: () => void;
}

export const useDeepLinking = (): DeepLinkingState & DeepLinkingActions => {
  const [state, setState] = useState<DeepLinkingState>({
    isProcessing: false,
    error: null,
    success: false,
    actionType: null,
    resetToken: null,
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleError = useCallback((error: any): AuthError => {
    console.error('Deep linking error:', error);

    const authError: AuthError = {
      code: AuthErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred.',
      details: { originalError: error.message },
    };

    if (error.code) {
      switch (error.code) {
        case 'auth/expired-action-code':
          authError.code = AuthErrorCode.TOKEN_EXPIRED;
          authError.message =
            'This link has expired. Please request a new one.';
          break;
        case 'auth/invalid-action-code':
          authError.code = AuthErrorCode.TOKEN_INVALID;
          authError.message = 'This link is invalid or has already been used.';
          break;
        case 'auth/user-disabled':
          authError.code = AuthErrorCode.ACCOUNT_LOCKED;
          authError.message = 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
          authError.code = AuthErrorCode.ACCOUNT_NOT_FOUND;
          authError.message = 'No account found for this email address.';
          break;
      }
    }

    return authError;
  }, []);

  const handleEmailVerification = useCallback(
    async (actionCode: string) => {
      setState(prev => ({
        ...prev,
        isProcessing: true,
        error: null,
        actionType: 'verifyEmail',
      }));

      try {
        await applyActionCode(auth, actionCode);

        setState(prev => ({
          ...prev,
          isProcessing: false,
          success: true,
        }));

        // Redirect to success page or dashboard
        router.push('/auth/verification-success');
      } catch (error: any) {
        const authError = handleError(error);
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: authError,
        }));

        // Redirect to error page
        router.push('/auth/verification-error');
      }
    },
    [router, handleError]
  );

  const handlePasswordResetVerification = useCallback(
    async (actionCode: string): Promise<string> => {
      setState(prev => ({
        ...prev,
        isProcessing: true,
        error: null,
        actionType: 'resetPassword',
      }));

      try {
        // Verify the password reset code and get the email
        const email = await verifyPasswordResetCode(auth, actionCode);

        setState(prev => ({
          ...prev,
          isProcessing: false,
          success: true,
          resetToken: actionCode,
        }));

        return email;
      } catch (error: any) {
        const authError = handleError(error);
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error: authError,
        }));

        throw authError;
      }
    },
    [handleError]
  );

  const clearState = useCallback(() => {
    setState({
      isProcessing: false,
      error: null,
      success: false,
      actionType: null,
      resetToken: null,
    });
  }, []);

  // Auto-handle deep links on mount
  useEffect(() => {
    const mode = searchParams.get('mode');
    const actionCode = searchParams.get('oobCode');

    if (!mode || !actionCode) return;

    switch (mode) {
      case 'verifyEmail':
        handleEmailVerification(actionCode);
        break;
      case 'resetPassword':
        handlePasswordResetVerification(actionCode)
          .then(() => {
            // Redirect to password reset form
            router.push(`/auth/reset-password?token=${actionCode}`);
          })
          .catch(() => {
            // Error is already handled in the function
            router.push('/auth/reset-password-error');
          });
        break;
      default:
        console.warn('Unknown action mode:', mode);
    }
  }, [
    searchParams,
    handleEmailVerification,
    handlePasswordResetVerification,
    router,
  ]);

  return {
    ...state,
    handleEmailVerification,
    handlePasswordResetVerification,
    clearState,
  };
};

/**
 * Hook for handling mobile app deep links
 */
export const useMobileDeepLinking = () => {
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Check if mobile app is installed
    const checkAppInstalled = () => {
      // This is a simplified check - in a real app you'd use proper app detection
      const userAgent = navigator.userAgent;
      const isInApp = /LearnityApp/i.test(userAgent);
      setIsAppInstalled(isInApp);
    };

    checkAppInstalled();
  }, []);

  const openInApp = useCallback(
    (path: string) => {
      if (isAppInstalled) {
        // Try to open in app
        window.location.href = `learnity://auth${path}`;
      } else {
        // Fallback to web
        window.location.href = path;
      }
    },
    [isAppInstalled]
  );

  const generateAppLink = useCallback((path: string) => {
    return `learnity://auth${path}`;
  }, []);

  return {
    isAppInstalled,
    openInApp,
    generateAppLink,
  };
};

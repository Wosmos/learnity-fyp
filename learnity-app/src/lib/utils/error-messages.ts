/**
 * User-Friendly Error Messages
 * Maps Firebase and application errors to meaningful user messages
 */

import { AuthErrorCode } from '@/types/auth';

export interface ErrorMessage {
  title: string;
  description: string;
  variant: 'destructive' | 'warning' | 'default';
}

/**
 * Get user-friendly error message from Firebase error code
 */
export function getAuthErrorMessage(errorCode: string): ErrorMessage {
  switch (errorCode) {
    // Authentication Errors
    case 'auth/user-not-found':
      return {
        title: 'Account Not Found',
        description:
          'No account exists with this email address. Please check your email or sign up for a new account.',
        variant: 'destructive',
      };

    case 'auth/wrong-password':
      return {
        title: 'Incorrect Password',
        description:
          'The password you entered is incorrect. Please try again or reset your password.',
        variant: 'destructive',
      };

    case 'auth/invalid-email':
      return {
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      };

    case 'auth/email-already-in-use':
      return {
        title: 'Email Already Registered',
        description:
          'An account with this email already exists. Please sign in or use a different email.',
        variant: 'destructive',
      };

    case 'auth/weak-password':
      return {
        title: 'Weak Password',
        description:
          'Your password must be at least 6 characters long and include a mix of letters and numbers.',
        variant: 'destructive',
      };

    case 'auth/too-many-requests':
      return {
        title: 'Too Many Attempts',
        description:
          'Too many failed login attempts. Please wait a few minutes before trying again.',
        variant: 'destructive',
      };

    case 'auth/user-disabled':
      return {
        title: 'Account Disabled',
        description:
          'This account has been disabled. Please contact support for assistance.',
        variant: 'destructive',
      };

    case 'auth/operation-not-allowed':
      return {
        title: 'Operation Not Allowed',
        description:
          'This sign-in method is not enabled. Please contact support.',
        variant: 'destructive',
      };

    case 'auth/account-exists-with-different-credential':
      return {
        title: 'Account Exists',
        description:
          'An account already exists with this email using a different sign-in method. Please use your original sign-in method.',
        variant: 'destructive',
      };

    case 'auth/invalid-credential':
      return {
        title: 'Invalid Credentials',
        description:
          'The credentials provided are invalid or have expired. Please try again.',
        variant: 'destructive',
      };

    case 'auth/popup-closed-by-user':
      return {
        title: 'Sign-In Cancelled',
        description:
          'The sign-in popup was closed before completing. Please try again.',
        variant: 'warning',
      };

    case 'auth/popup-blocked':
      return {
        title: 'Popup Blocked',
        description:
          'Please allow popups for this site to sign in with social providers.',
        variant: 'warning',
      };

    case 'auth/network-request-failed':
      return {
        title: 'Network Error',
        description:
          'Unable to connect to the server. Please check your internet connection and try again.',
        variant: 'destructive',
      };

    case 'auth/requires-recent-login':
      return {
        title: 'Re-authentication Required',
        description:
          'This operation requires recent authentication. Please sign in again.',
        variant: 'warning',
      };

    case 'auth/email-already-verified':
      return {
        title: 'Email Already Verified',
        description: 'Your email address has already been verified.',
        variant: 'default',
      };

    // Token Errors
    case 'auth/id-token-expired':
    case AuthErrorCode.TOKEN_EXPIRED:
      return {
        title: 'Session Expired',
        description: 'Your session has expired. Please sign in again.',
        variant: 'warning',
      };

    case 'auth/id-token-revoked':
    case AuthErrorCode.TOKEN_REVOKED:
      return {
        title: 'Session Revoked',
        description: 'Your session has been revoked. Please sign in again.',
        variant: 'destructive',
      };

    case 'auth/invalid-id-token':
    case AuthErrorCode.TOKEN_INVALID:
      return {
        title: 'Invalid Session',
        description: 'Your session is invalid. Please sign in again.',
        variant: 'destructive',
      };

    // Custom Application Errors
    case AuthErrorCode.EMAIL_NOT_VERIFIED:
      return {
        title: 'Email Not Verified',
        description:
          'Please verify your email address before signing in. Check your inbox for the verification link.',
        variant: 'warning',
      };

    case AuthErrorCode.ACCOUNT_LOCKED:
      return {
        title: 'Account Locked',
        description:
          'Your account has been locked due to suspicious activity. Please contact support.',
        variant: 'destructive',
      };

    case AuthErrorCode.INSUFFICIENT_PERMISSIONS:
      return {
        title: 'Access Denied',
        description: "You don't have permission to perform this action.",
        variant: 'destructive',
      };

    case AuthErrorCode.ROLE_NOT_APPROVED:
      return {
        title: 'Pending Approval',
        description:
          "Your account is pending approval. You'll be notified once it's reviewed.",
        variant: 'warning',
      };

    case AuthErrorCode.RATE_LIMIT_EXCEEDED:
      return {
        title: 'Rate Limit Exceeded',
        description:
          'Too many requests. Please slow down and try again in a few moments.',
        variant: 'destructive',
      };

    case AuthErrorCode.SERVICE_UNAVAILABLE:
      return {
        title: 'Service Unavailable',
        description:
          'The service is temporarily unavailable. Please try again later.',
        variant: 'destructive',
      };

    case AuthErrorCode.INVALID_CREDENTIALS:
      return {
        title: 'Invalid Credentials',
        description:
          'The email or password you entered is incorrect. Please try again.',
        variant: 'destructive',
      };

    // Default Error
    default:
      return {
        title: 'Something Went Wrong',
        description:
          'An unexpected error occurred. Please try again or contact support if the problem persists.',
        variant: 'destructive',
      };
  }
}

/**
 * Get success message for auth operations
 */
export function getAuthSuccessMessage(operation: string): ErrorMessage {
  switch (operation) {
    case 'login':
      return {
        title: 'Welcome Back!',
        description: 'You have successfully signed in.',
        variant: 'default',
      };

    case 'register':
      return {
        title: 'Account Created!',
        description: 'Please check your email to verify your account.',
        variant: 'default',
      };

    case 'password-reset-request':
      return {
        title: 'Reset Email Sent',
        description:
          'Check your email for instructions to reset your password.',
        variant: 'default',
      };

    case 'password-reset-complete':
      return {
        title: 'Password Updated',
        description: 'Your password has been successfully updated.',
        variant: 'default',
      };

    case 'email-verification-sent':
      return {
        title: 'Verification Email Sent',
        description: 'Please check your inbox and click the verification link.',
        variant: 'default',
      };

    case 'profile-updated':
      return {
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        variant: 'default',
      };

    case 'logout':
      return {
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
        variant: 'default',
      };

    default:
      return {
        title: 'Success',
        description: 'Operation completed successfully.',
        variant: 'default',
      };
  }
}

/**
 * Format error for display
 */
export function formatErrorForDisplay(error: any): ErrorMessage {
  // If it's already a formatted error message
  if (error.title && error.description) {
    return error;
  }

  // If it has a code property
  if (error.code) {
    return getAuthErrorMessage(error.code);
  }

  // If it's a Firebase error
  if (error.message && error.message.includes('auth/')) {
    const match = error.message.match(/auth\/[\w-]+/);
    if (match) {
      return getAuthErrorMessage(match[0]);
    }
  }

  // Default error
  return {
    title: 'Error',
    description: error.message || 'An unexpected error occurred.',
    variant: 'destructive',
  };
}

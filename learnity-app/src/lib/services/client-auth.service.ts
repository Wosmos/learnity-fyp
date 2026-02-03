/**
 * Client-Side Authentication Service
 *
 * Handles authentication operations in the browser using Firebase Client SDK.
 * This service is for CLIENT-SIDE use only (React components, hooks).
 *
 * For server-side operations (API routes), use FirebaseAuthService instead.
 *
 * Key differences:
 * - ClientAuthService: Uses Firebase Client SDK, calls API endpoints for server operations
 * - FirebaseAuthService: Uses both Client and Admin SDK, can set custom claims directly
 *
 * Usage:
 * - Client components/hooks: Use ClientAuthService (via useAuthService hook)
 * - API routes: Use FirebaseAuthService
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  signOut,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import {
  StudentRegistrationData,
  TeacherRegistrationData,
  EnhancedTeacherRegistrationData,
  LoginData,
} from '@/lib/validators/auth';
import { FirebaseAuthResult } from '@/types/auth';

export class ClientAuthService {
  private googleProvider: GoogleAuthProvider;
  private microsoftProvider: OAuthProvider;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    this.microsoftProvider = new OAuthProvider('microsoft.com');

    // Configure providers
    this.googleProvider.addScope('email');
    this.googleProvider.addScope('profile');

    this.microsoftProvider.addScope('email');
    this.microsoftProvider.addScope('profile');
  }

  /**
   * Set server-side session cookie to pass middleware protection
   */
  private async setSessionCookie(idToken: string): Promise<void> {
    try {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
    } catch (error) {
      console.error('Failed to set session cookie:', error);
      // Don't throw, let client-side auth proceed
    }
  }

  /**
   * Register a new student
   */
  async registerStudent(
    data: StudentRegistrationData
  ): Promise<FirebaseAuthResult> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Call API to create user profile
      const idToken = await userCredential.user.getIdToken();
      const response = await fetch('/api/auth/register/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
          'X-Firebase-UID': userCredential.user.uid,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user profile');
      }

      // Set session cookie for middleware
      await this.setSessionCookie(idToken);

      return {
        success: true,
        user: userCredential.user,
        needsEmailVerification: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code || 'REGISTRATION_FAILED',
          message: error.message || 'Registration failed',
        },
      };
    }
  }

  /**
   * Register a new teacher (legacy)
   */
  async registerTeacher(
    data: TeacherRegistrationData
  ): Promise<FirebaseAuthResult> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Call API to create teacher application
      const response = await fetch('/api/auth/register/teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create teacher application');
      }

      // Set session cookie for middleware
      await this.setSessionCookie(await userCredential.user.getIdToken());

      return {
        success: true,
        user: userCredential.user,
        needsEmailVerification: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code || 'REGISTRATION_FAILED',
          message: error.message || 'Registration failed',
        },
      };
    }
  }

  /**
   * Register a new teacher with quick registration
   */
  async registerQuickTeacher(data: any): Promise<FirebaseAuthResult> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Call API to create quick teacher application
      const idToken = await userCredential.user.getIdToken();
      const response = await fetch('/api/auth/register/teacher/quick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
          'X-Firebase-UID': userCredential.user.uid,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to create quick teacher application'
        );
      }

      // Set session cookie for middleware
      await this.setSessionCookie(idToken);

      return {
        success: true,
        user: userCredential.user,
        needsEmailVerification: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code || 'REGISTRATION_FAILED',
          message: error.message || 'Quick teacher registration failed',
        },
      };
    }
  }

  /**
   * Register a new teacher with enhanced profile data (legacy)
   */
  async registerEnhancedTeacher(
    data: EnhancedTeacherRegistrationData
  ): Promise<FirebaseAuthResult> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Call API to create enhanced teacher application
      const idToken = await userCredential.user.getIdToken();
      const response = await fetch('/api/auth/register/teacher/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
          'X-Firebase-UID': userCredential.user.uid,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to create enhanced teacher application'
        );
      }

      // Set session cookie for middleware
      await this.setSessionCookie(idToken);

      return {
        success: true,
        user: userCredential.user,
        needsEmailVerification: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code || 'REGISTRATION_FAILED',
          message: error.message || 'Enhanced teacher registration failed',
        },
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async login(data: LoginData): Promise<FirebaseAuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const idToken = await userCredential.user.getIdToken();
      await this.setSessionCookie(idToken);

      return {
        success: true,
        user: userCredential.user,
        idToken: idToken,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code || 'LOGIN_FAILED',
          message: error.message || 'Login failed',
        },
      };
    }
  }

  /**
   * Social login with Google or Microsoft
   */
  async socialLogin(
    provider: 'google' | 'microsoft'
  ): Promise<FirebaseAuthResult> {
    try {
      const authProvider =
        provider === 'google' ? this.googleProvider : this.microsoftProvider;
      const userCredential = await signInWithPopup(auth, authProvider);
      const user = userCredential.user;

      // The profile sync will be handled automatically by the AuthProvider
      // when the auth state changes, so we don't need to call it here

      const idToken = await user.getIdToken();
      await this.setSessionCookie(idToken);

      return {
        success: true,
        user,
        idToken: idToken,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code || 'SOCIAL_LOGIN_FAILED',
          message: error.message || `${provider} login failed`,
        },
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    await firebaseUpdatePassword(user, newPassword);
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(user: FirebaseUser): Promise<void> {
    await sendEmailVerification(user);
  }

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    try {
      // 1. Clear server-side session cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Failed to clear server session:', error);
    } finally {
      // 2. Sign out from Firebase
      await signOut(auth);
    }
  }
}

// Export singleton instance
export const clientAuthService = new ClientAuthService();

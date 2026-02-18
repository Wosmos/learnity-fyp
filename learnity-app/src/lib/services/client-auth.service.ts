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
  updateProfile,
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

      // Update Firebase profile with name
      await updateProfile(userCredential.user, {
        displayName: `${data.firstName} ${data.lastName}`.trim(),
      });

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

      // Update Firebase profile with name
      await updateProfile(userCredential.user, {
        displayName: `${data.firstName} ${data.lastName}`.trim(),
      });

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

      // Update Firebase profile with name
      await updateProfile(userCredential.user, {
        displayName: `${data.firstName} ${data.lastName}`.trim(),
      });

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

      // Update Firebase profile with name
      await updateProfile(userCredential.user, {
        displayName: `${data.firstName} ${data.lastName}`.trim(),
      });

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
   * Handles full profile sync + token refresh + cookie update before returning,
   * so the middleware has the correct role claim immediately.
   */
  async socialLogin(
    provider: 'google' | 'microsoft'
  ): Promise<FirebaseAuthResult> {
    try {
      const authProvider =
        provider === 'google' ? this.googleProvider : this.microsoftProvider;
      const userCredential = await signInWithPopup(auth, authProvider);
      const user = userCredential.user;

      // 1. Sync profile — creates DB user + sets Firebase custom claims
      await this.syncProfileForSocialLogin(user);

      // 2. Force token refresh so the JWT now includes the role claim
      const freshToken = await user.getIdToken(true);

      // 3. Set session cookie with the fresh token (middleware reads role from it)
      await this.setSessionCookie(freshToken);

      // 4. Cache claims locally so AuthProvider picks them up instantly
      this.cacheClaimsFromToken(freshToken, user.uid);

      return {
        success: true,
        user,
        idToken: freshToken,
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
   * Sync user profile for social login — creates DB record + sets Firebase claims
   */
  private async syncProfileForSocialLogin(
    user: FirebaseUser
  ): Promise<void> {
    try {
      const idToken = await user.getIdToken();
      await fetch('/api/auth/sync-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
          'X-Firebase-UID': user.uid,
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          providerData: user.providerData.map(p => ({
            providerId: p.providerId,
            uid: p.uid,
            displayName: p.displayName,
            email: p.email,
            photoURL: p.photoURL,
          })),
        }),
      });
    } catch (err) {
      console.warn('Social login profile sync failed:', err);
    }
  }

  /**
   * Parse JWT and cache claims in localStorage for instant AuthProvider pickup
   */
  private cacheClaimsFromToken(token: string, uid: string): void {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));

      if (payload.role) {
        localStorage.setItem(
          'learnity_user_claims',
          JSON.stringify({
            uid,
            claims: {
              role: payload.role,
              permissions: payload.permissions || [],
              emailVerified: payload.email_verified || false,
              profileComplete: payload.profileComplete || false,
              profileId: payload.profileId || '',
              lastLoginAt: payload.lastLoginAt || '',
            },
            timestamp: Date.now(),
          })
        );
      }
    } catch (err) {
      console.warn('Failed to cache claims from token:', err);
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

/**
 * Client-Side Authentication Service
 * Handles authentication operations in the browser using Firebase Client SDK
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
  UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import { 
  StudentRegistrationData, 
  TeacherRegistrationData, 
  LoginData 
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
   * Register a new student
   */
  async registerStudent(data: StudentRegistrationData): Promise<FirebaseAuthResult> {
    try {
      console.log('🔵 Starting student registration...', { email: data.email });
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      console.log('✅ Firebase user created:', userCredential.user.uid);

      // Send email verification
      await sendEmailVerification(userCredential.user);
      console.log('✅ Email verification sent');

      // Call API to create user profile
      console.log('🔵 Calling API to create user profile...');
      const idToken = await userCredential.user.getIdToken();
      const response = await fetch('/api/auth/register/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          'X-Firebase-UID': userCredential.user.uid,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API call failed:', errorData);
        throw new Error('Failed to create user profile');
      }

      console.log('✅ Registration complete!');
      return {
        success: true,
        user: userCredential.user,
        needsEmailVerification: true
      };
    } catch (error: any) {
      console.error('❌ Student registration failed:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      return {
        success: false,
        error: {
          code: error.code || 'REGISTRATION_FAILED',
          message: error.message || 'Registration failed'
        }
      };
    }
  }

  /**
   * Register a new teacher
   */
  async registerTeacher(data: TeacherRegistrationData): Promise<FirebaseAuthResult> {
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

      return {
        success: true,
        user: userCredential.user,
        needsEmailVerification: true
      };
    } catch (error: any) {
      console.error('Teacher registration failed:', error);
      return {
        success: false,
        error: {
          code: error.code || 'REGISTRATION_FAILED',
          message: error.message || 'Registration failed'
        }
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

      return {
        success: true,
        user: userCredential.user,
        idToken: await userCredential.user.getIdToken()
      };
    } catch (error: any) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: {
          code: error.code || 'LOGIN_FAILED',
          message: error.message || 'Login failed'
        }
      };
    }
  }

  /**
   * Social login with Google or Microsoft
   */
  async socialLogin(provider: 'google' | 'microsoft'): Promise<FirebaseAuthResult> {
    try {
      console.log(`🔵 Starting ${provider} login...`);
      
      const authProvider = provider === 'google' ? this.googleProvider : this.microsoftProvider;
      const userCredential = await signInWithPopup(auth, authProvider);
      const user = userCredential.user;

      console.log('✅ Firebase social login successful:', user.uid);

      // The profile sync will be handled automatically by the AuthProvider
      // when the auth state changes, so we don't need to call it here
      
      return {
        success: true,
        user,
        idToken: await user.getIdToken()
      };
    } catch (error: any) {
      console.error(`❌ ${provider} login failed:`, {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      return {
        success: false,
        error: {
          code: error.code || 'SOCIAL_LOGIN_FAILED',
          message: error.message || `${provider} login failed`
        }
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset failed:', error);
      throw error;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }
      
      await firebaseUpdatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Password update failed:', error);
      throw error;
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(user: FirebaseUser): Promise<void> {
    try {
      await sendEmailVerification(user);
    } catch (error: any) {
      console.error('Email verification failed:', error);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      console.error('Logout failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const clientAuthService = new ClientAuthService();
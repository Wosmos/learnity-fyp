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
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  getIdToken,
  getIdTokenResult
} from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import { adminAuth } from '@/lib/config/firebase-admin';
import { IFirebaseAuthService } from '@/lib/interfaces/auth';
import {
  FirebaseAuthResult,
  CustomClaims,
  AuthError,
  AuthErrorCode,
  UserRole
} from '@/types/auth';
import {
  StudentRegistrationData,
  TeacherRegistrationData,
  LoginData,
  StaticAdminLoginData
} from '@/lib/validators/auth';

export class FirebaseAuthService implements IFirebaseAuthService {
  private googleProvider: GoogleAuthProvider;
  private microsoftProvider: OAuthProvider;

  constructor() {
    // Initialize OAuth providers
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.addScope('email');
    this.googleProvider.addScope('profile');

    this.microsoftProvider = new OAuthProvider('microsoft.com');
    this.microsoftProvider.addScope('email');
    this.microsoftProvider.addScope('profile');
  }

  /**
   * Register a new student with Firebase Auth
   */
  async registerStudent(data: StudentRegistrationData): Promise<FirebaseAuthResult> {
    try {
      // Create Firebase Auth account
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // Set initial custom claims for student
      await this.setCustomClaims(user.uid, {
        role: UserRole.STUDENT,
        permissions: [
          'view:student_dashboard',
          'join:study_groups',
          'book:tutoring',
          'enhance:profile'
        ],
        profileComplete: false,
        emailVerified: false
      });

      // Send email verification
      await this.sendEmailVerification(user);

      return {
        success: true,
        user,
        idToken: await getIdToken(user),
        needsEmailVerification: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.mapFirebaseError(error)
      };
    }
  }

  /**
   * Register a new teacher with Firebase Auth (pending approval)
   */
  async registerTeacher(data: TeacherRegistrationData): Promise<FirebaseAuthResult> {
    try {
      // Create Firebase Auth account
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // Set initial custom claims for pending teacher
      await this.setCustomClaims(user.uid, {
        role: UserRole.PENDING_TEACHER,
        permissions: [
          'view:application_status',
          'update:application'
        ],
        profileComplete: false,
        emailVerified: false
      });

      // Send email verification
      await this.sendEmailVerification(user);

      return {
        success: true,
        user,
        idToken: await getIdToken(user),
        needsEmailVerification: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.mapFirebaseError(error)
      };
    }
  }

  /**
   * Login static admin using environment credentials
   */
  async loginStaticAdmin(credentials: StaticAdminLoginData): Promise<FirebaseAuthResult> {
    try {
      // Validate against environment credentials
      const staticAdminEmail = process.env.STATIC_ADMIN_EMAIL;
      const staticAdminPassword = process.env.STATIC_ADMIN_PASSWORD;

      if (!staticAdminEmail || !staticAdminPassword) {
        throw new Error('Static admin credentials not configured');
      }

      if (credentials.email !== staticAdminEmail || credentials.password !== staticAdminPassword) {
        return {
          success: false,
          error: {
            code: AuthErrorCode.INVALID_CREDENTIALS,
            message: 'Invalid admin credentials'
          }
        };
      }

      // Try to sign in with Firebase Auth (admin account should exist)
      let userCredential: UserCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      } catch (firebaseError: any) {
        // If admin account doesn't exist in Firebase, create it
        if (firebaseError.code === 'auth/user-not-found') {
          userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
        } else {
          throw firebaseError;
        }
      }

      const user = userCredential.user;

      // Set admin custom claims
      await this.setCustomClaims(user.uid, {
        role: UserRole.ADMIN,
        permissions: [
          'view:admin_panel',
          'manage:users',
          'approve:teachers',
          'view:audit_logs',
          'manage:platform'
        ],
        profileComplete: true,
        emailVerified: true
      });

      return {
        success: true,
        user,
        idToken: await getIdToken(user)
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.mapFirebaseError(error)
      };
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginData): Promise<FirebaseAuthResult> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        return {
          success: false,
          error: {
            code: AuthErrorCode.EMAIL_NOT_VERIFIED,
            message: 'Please verify your email address before signing in'
          }
        };
      }

      return {
        success: true,
        user,
        idToken: await getIdToken(user)
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.mapFirebaseError(error)
      };
    }
  }

  /**
   * Social login with Google or Microsoft
   */
  async socialLogin(provider: 'google' | 'microsoft'): Promise<FirebaseAuthResult> {
    try {
      const authProvider = provider === 'google' ? this.googleProvider : this.microsoftProvider;
      const userCredential: UserCredential = await signInWithPopup(auth, authProvider);
      const user = userCredential.user;

      // For social login, email is automatically verified
      return {
        success: true,
        user,
        idToken: await getIdToken(user)
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.mapFirebaseError(error)
      };
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(user: FirebaseUser): Promise<void> {
    try {
      await sendEmailVerification(user);
    } catch (error: any) {
      throw this.mapFirebaseError(error);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw this.mapFirebaseError(error);
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
      throw this.mapFirebaseError(error);
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<FirebaseUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  /**
   * Get ID token for current user
   */
  async getIdToken(forceRefresh: boolean = false): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    return await getIdToken(user, forceRefresh);
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw this.mapFirebaseError(error);
    }
  }

  /**
   * Set custom claims for a user (server-side only)
   */
  async setCustomClaims(firebaseUid: string, claims: CustomClaims): Promise<void> {
    try {
      await adminAuth.setCustomUserClaims(firebaseUid, claims);
    } catch (error: any) {
      throw this.mapFirebaseError(error);
    }
  }

  /**
   * Get custom claims for a user
   */
  async getCustomClaims(firebaseUid: string): Promise<CustomClaims> {
    try {
      const user = await adminAuth.getUser(firebaseUid);
      return user.customClaims as CustomClaims || {
        role: UserRole.STUDENT,
        permissions: [],
        profileComplete: false,
        emailVerified: false
      };
    } catch (error: any) {
      throw this.mapFirebaseError(error);
    }
  }

  /**
   * Verify ID token and get user claims
   */
  async verifyIdToken(idToken: string): Promise<any> {
    try {
      return await adminAuth.verifyIdToken(idToken);
    } catch (error: any) {
      throw this.mapFirebaseError(error);
    }
  }

  /**
   * Map Firebase errors to application errors
   */
  private mapFirebaseError(error: any): AuthError {
    const errorCode = error.code || 'unknown';
    
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return {
          code: AuthErrorCode.INVALID_CREDENTIALS,
          message: 'Invalid email or password'
        };
      
      case 'auth/email-already-in-use':
        return {
          code: AuthErrorCode.ACCOUNT_NOT_FOUND,
          message: 'An account with this email already exists'
        };
      
      case 'auth/weak-password':
        return {
          code: AuthErrorCode.WEAK_PASSWORD,
          message: 'Password is too weak'
        };
      
      case 'auth/too-many-requests':
        return {
          code: AuthErrorCode.TOO_MANY_ATTEMPTS,
          message: 'Too many failed attempts. Please try again later.',
          retryAfter: 300 // 5 minutes
        };
      
      case 'auth/network-request-failed':
        return {
          code: AuthErrorCode.SERVICE_UNAVAILABLE,
          message: 'Network error. Please check your connection and try again.'
        };
      
      case 'auth/invalid-email':
        return {
          code: AuthErrorCode.INVALID_CREDENTIALS,
          message: 'Invalid email address'
        };
      
      case 'auth/user-disabled':
        return {
          code: AuthErrorCode.ACCOUNT_LOCKED,
          message: 'This account has been disabled'
        };
      
      default:
        return {
          code: AuthErrorCode.INTERNAL_ERROR,
          message: error.message || 'An unexpected error occurred'
        };
    }
  }
}
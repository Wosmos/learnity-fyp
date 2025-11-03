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
  getIdTokenResult,
  onIdTokenChanged,
  reload
} from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import { adminAuth } from '@/lib/config/firebase-admin';
import { appCheckService } from '@/lib/services/app-check.service';
import { tokenManager } from '@/lib/services/token-manager.service';
import { roleManager } from '@/lib/services/role-manager.service';
import { IFirebaseAuthService } from '@/lib/interfaces/auth';
import {
  FirebaseAuthResult,
  CustomClaims,
  AuthError,
  AuthErrorCode,
  UserRole,
  SecurityAction,
  Permission
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
  private tokenRefreshInterval: NodeJS.Timeout | null = null;
  private readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

  constructor() {
    // Initialize OAuth providers
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.addScope('email');
    this.googleProvider.addScope('profile');

    this.microsoftProvider = new OAuthProvider('microsoft.com');
    this.microsoftProvider.addScope('email');
    this.microsoftProvider.addScope('profile');

    // Initialize token refresh monitoring
    this.initializeTokenRefreshMonitoring();
  }

  /**
   * Register a new student with Firebase Auth
   */
  async registerStudent(data: StudentRegistrationData): Promise<FirebaseAuthResult> {
    return this.enhanceRegistrationWithSecurity(data, async (registrationData) => {
      try {
        // Create Firebase Auth account
        const userCredential: UserCredential = await createUserWithEmailAndPassword(
          auth,
          registrationData.email,
          registrationData.password
        );

        const user = userCredential.user;

        // Set initial custom claims for student
        await this.setCustomClaims(user.uid, {
          role: UserRole.STUDENT,
          permissions: [
            Permission.VIEW_STUDENT_DASHBOARD,
            Permission.JOIN_STUDY_GROUPS,
            Permission.BOOK_TUTORING,
            Permission.ENHANCE_PROFILE
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
    });
  }

  /**
   * Register a new teacher with Firebase Auth (pending approval)
   */
  async registerTeacher(data: TeacherRegistrationData): Promise<FirebaseAuthResult> {
    return this.enhanceRegistrationWithSecurity(data, async (registrationData) => {
      try {
        // Create Firebase Auth account
        const userCredential: UserCredential = await createUserWithEmailAndPassword(
          auth,
          registrationData.email,
          registrationData.password
        );

        const user = userCredential.user;

        // Set initial custom claims for pending teacher
        await this.setCustomClaims(user.uid, {
          role: UserRole.PENDING_TEACHER,
          permissions: [
            Permission.VIEW_APPLICATION_STATUS,
            Permission.UPDATE_APPLICATION
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
    });
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
          Permission.VIEW_ADMIN_PANEL,
          Permission.MANAGE_USERS,
          Permission.APPROVE_TEACHERS,
          Permission.VIEW_AUDIT_LOGS,
          Permission.MANAGE_PLATFORM
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
    return this.enhanceLoginWithSecurity(credentials, async (loginData) => {
      try {
        const userCredential: UserCredential = await signInWithEmailAndPassword(
          auth,
          loginData.email,
          loginData.password
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
    });
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
    
    // Use token manager for better caching and refresh logic
    return await tokenManager.getUserToken(user, forceRefresh);
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (user) {
        // Clear token cache for this user
        tokenManager.invalidateUserToken(user.uid);
      }
      
      await signOut(auth);
      this.clearTokenRefresh();
    } catch (error: any) {
      throw this.mapFirebaseError(error);
    }
  }

  /**
   * Set custom claims for a user (server-side only)
   */
  async setCustomClaims(firebaseUid: string, claims: CustomClaims): Promise<void> {
    try {
      // Use role manager for better validation and management
      await roleManager.setCustomClaims(firebaseUid, claims);
    } catch (error: any) {
      throw this.mapFirebaseError(error);
    }
  }

  /**
   * Get custom claims for a user
   */
  async getCustomClaims(firebaseUid: string): Promise<CustomClaims> {
    try {
      // Use role manager for consistent claims handling
      return await roleManager.getCustomClaims(firebaseUid);
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
   * Initialize token refresh monitoring
   */
  private initializeTokenRefreshMonitoring(): void {
    // Monitor ID token changes and set up automatic refresh
    onIdTokenChanged(auth, async (user) => {
      if (user) {
        await this.setupTokenRefresh(user);
      } else {
        this.clearTokenRefresh();
      }
    });
  }

  /**
   * Set up automatic token refresh for a user
   */
  private async setupTokenRefresh(user: FirebaseUser): Promise<void> {
    this.clearTokenRefresh();

    try {
      const tokenResult = await getIdTokenResult(user);
      const expirationTime = new Date(tokenResult.expirationTime).getTime();
      const currentTime = Date.now();
      const timeUntilRefresh = expirationTime - currentTime - this.TOKEN_REFRESH_THRESHOLD;

      if (timeUntilRefresh > 0) {
        this.tokenRefreshInterval = setTimeout(async () => {
          try {
            await this.refreshToken();
          } catch (error) {
            console.error('Automatic token refresh failed:', error);
          }
        }, timeUntilRefresh);
      }
    } catch (error) {
      console.error('Failed to setup token refresh:', error);
    }
  }

  /**
   * Clear token refresh interval
   */
  private clearTokenRefresh(): void {
    if (this.tokenRefreshInterval) {
      clearTimeout(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
    }
  }

  /**
   * Refresh the current user's ID token
   */
  async refreshToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user to refresh token for');
    }

    try {
      // Use token manager for refresh
      const newToken = await tokenManager.getUserToken(user, true);
      
      // Set up next refresh
      await this.setupTokenRefresh(user);
      
      return newToken;
    } catch (error: any) {
      throw this.mapFirebaseError(error);
    }
  }

  /**
   * Get token with automatic refresh if needed
   */
  async getTokenWithRefresh(): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // Token manager handles refresh logic automatically
      return await tokenManager.getUserToken(user, false);
    } catch (error: any) {
      throw this.mapFirebaseError(error);
    }
  }

  /**
   * Validate ID token and get decoded claims
   */
  async validateAndDecodeToken(idToken: string): Promise<any> {
    try {
      // Use token manager for validation with better error handling
      const validation = await tokenManager.validateToken(idToken);
      
      if (!validation.isValid) {
        throw new Error(validation.error?.message || 'Invalid token');
      }
      
      return validation.claims;
    } catch (error: any) {
      throw this.mapFirebaseError(error);
    }
  }

  /**
   * Check if current token is valid and not expired
   */
  async isTokenValid(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return false;
      }

      const tokenInfo = tokenManager.getTokenInfo(user.uid);
      if (!tokenInfo) {
        // No cached token, try to get one
        await tokenManager.getUserToken(user, false);
        return true;
      }

      const currentTime = Date.now();
      return tokenInfo.expirationTime.getTime() > currentTime;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user claims from current token
   */
  async getCurrentUserClaims(): Promise<CustomClaims | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return null;
      }

      // Use role manager for consistent claims
      return await roleManager.getCustomClaims(user.uid);
    } catch (error) {
      return null;
    }
  }

  /**
   * Force reload user to get updated claims
   */
  async reloadUserWithClaims(): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      await reload(user);
      // Force token refresh to get updated claims
      await getIdToken(user, true);
    } catch (error: any) {
      throw this.mapFirebaseError(error);
    }
  }

  /**
   * Enhanced registration with App Check integration
   */
  private async enhanceRegistrationWithSecurity<T extends StudentRegistrationData | TeacherRegistrationData>(
    data: T,
    registrationFn: (data: T) => Promise<FirebaseAuthResult>
  ): Promise<FirebaseAuthResult> {
    try {
      // Get App Check token for bot protection with risk assessment
      const appCheckResult = await appCheckService.getAppCheckTokenForAction(SecurityAction.REGISTER);
      
      if (!appCheckResult.success && process.env.NODE_ENV === 'production') {
        return {
          success: false,
          error: {
            code: AuthErrorCode.SERVICE_UNAVAILABLE,
            message: appCheckResult.error || 'Bot protection verification failed. Please try again.'
          }
        };
      }

      // If high risk, require additional verification
      if (appCheckResult.requiresAdditionalVerification && !data.hcaptchaToken) {
        return {
          success: false,
          error: {
            code: AuthErrorCode.RATE_LIMIT_EXCEEDED,
            message: 'Additional verification required. Please complete the captcha.'
          }
        };
      }

      // Proceed with registration
      return await registrationFn(data);
    } catch (error: any) {
      return {
        success: false,
        error: this.mapFirebaseError(error)
      };
    }
  }

  /**
   * Enhanced login with security checks
   */
  private async enhanceLoginWithSecurity(
    credentials: LoginData,
    loginFn: (credentials: LoginData) => Promise<FirebaseAuthResult>
  ): Promise<FirebaseAuthResult> {
    try {
      // Get App Check token with risk assessment for login
      const appCheckResult = await appCheckService.getAppCheckTokenForAction(SecurityAction.LOGIN);
      
      // For suspicious activity (when hcaptcha is required), enforce App Check
      if (credentials.hcaptchaToken && !appCheckResult.success && process.env.NODE_ENV === 'production') {
        return {
          success: false,
          error: {
            code: AuthErrorCode.SERVICE_UNAVAILABLE,
            message: appCheckResult.error || 'Security verification failed. Please try again.'
          }
        };
      }

      // Proceed with login
      return await loginFn(credentials);
    } catch (error: any) {
      return {
        success: false,
        error: this.mapFirebaseError(error)
      };
    }
  }

  /**
   * Map Firebase errors to application errors
   */
  private mapFirebaseError(error: unknown): AuthError {
    const firebaseError = error as { code?: string; message?: string };
    const errorCode = firebaseError.code || 'unknown';
    
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

      case 'auth/id-token-expired':
        return {
          code: AuthErrorCode.TOKEN_EXPIRED,
          message: 'Your session has expired. Please sign in again.'
        };

      case 'auth/id-token-revoked':
        return {
          code: AuthErrorCode.TOKEN_REVOKED,
          message: 'Your session has been revoked. Please sign in again.'
        };

      case 'auth/invalid-id-token':
        return {
          code: AuthErrorCode.TOKEN_INVALID,
          message: 'Invalid authentication token. Please sign in again.'
        };
      
      default:
        return {
          code: AuthErrorCode.INTERNAL_ERROR,
          message: firebaseError.message || 'An unexpected error occurred'
        };
    }
  }

  /**
   * Cleanup resources when service is destroyed
   */
  destroy(): void {
    this.clearTokenRefresh();
  }
}
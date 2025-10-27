import { User as FirebaseUser } from 'firebase/auth';
import {
  UserProfile,
  FirebaseAuthResult,
  CustomClaims,
  Permission,
  UserRole,
  SecurityRequest,
  SecurityAssessment,
  AuthError,
  ApplicationStatus
} from '@/types/auth';
import {
  StudentRegistrationData,
  TeacherRegistrationData,
  LoginData,
  StaticAdminLoginData,
  PasswordResetRequestData,
  PasswordResetData,
  StudentProfileEnhancementData,
  TeacherApplicationUpdateData,
  TeacherApprovalData,
  UserRoleUpdateData
} from '@/lib/validators/auth';

// Firebase Auth Service Interface
export interface IFirebaseAuthService {
  // Registration methods
  registerStudent(data: StudentRegistrationData): Promise<FirebaseAuthResult>;
  registerTeacher(data: TeacherRegistrationData): Promise<FirebaseAuthResult>;
  loginStaticAdmin(credentials: StaticAdminLoginData): Promise<FirebaseAuthResult>;
  
  // Login methods
  login(credentials: LoginData): Promise<FirebaseAuthResult>;
  socialLogin(provider: 'google' | 'microsoft'): Promise<FirebaseAuthResult>;
  
  // Account management
  sendEmailVerification(user: FirebaseUser): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  
  // Token management
  getCurrentUser(): Promise<FirebaseUser | null>;
  getIdToken(forceRefresh?: boolean): Promise<string>;
  refreshToken(): Promise<string>;
  getTokenWithRefresh(): Promise<string>;
  validateAndDecodeToken(idToken: string): Promise<any>;
  isTokenValid(): Promise<boolean>;
  signOut(): Promise<void>;
  
  // Custom claims management
  setCustomClaims(firebaseUid: string, claims: CustomClaims): Promise<void>;
  getCustomClaims(firebaseUid: string): Promise<CustomClaims>;
  getCurrentUserClaims(): Promise<CustomClaims | null>;
  reloadUserWithClaims(): Promise<void>;
}

// User Profile Service Interface (Neon DB Integration)
export interface IUserProfileService {
  // Profile management
  createUserProfile(firebaseUid: string, data: CreateProfileData): Promise<UserProfile>;
  getUserProfile(firebaseUid: string): Promise<UserProfile | null>;
  updateUserProfile(firebaseUid: string, data: UpdateProfileData): Promise<UserProfile>;
  
  // Role management
  getUserRole(firebaseUid: string): Promise<UserRole>;
  updateUserRole(firebaseUid: string, role: UserRole): Promise<void>;
  
  // Teacher application workflow
  submitTeacherApplication(firebaseUid: string, application: TeacherApplicationData): Promise<void>;
  getTeacherApplications(status?: ApplicationStatus): Promise<TeacherApplication[]>;
  reviewTeacherApplication(applicationId: string, decision: TeacherApprovalData): Promise<void>;
  
  // Student profile enhancement
  enhanceStudentProfile(firebaseUid: string, enhancements: StudentProfileEnhancementData): Promise<void>;
  getProfileCompletionStatus(firebaseUid: string): Promise<ProfileCompletion>;
}

// Role & Permission Manager Interface
export interface IRoleManager {
  // Permission checking
  hasPermission(firebaseUid: string, permission: Permission): Promise<boolean>;
  hasRole(firebaseUid: string, role: UserRole): Promise<boolean>;
  getUserPermissions(firebaseUid: string): Promise<Permission[]>;
  
  // Firebase custom claims management
  setCustomClaims(firebaseUid: string, claims: CustomClaims): Promise<void>;
  getCustomClaims(firebaseUid: string): Promise<CustomClaims>;
  
  // Route protection
  validateRouteAccess(firebaseUid: string, route: string): Promise<boolean>;
  requireRole(requiredRole: UserRole): (firebaseUid: string) => Promise<boolean>;
}

// Security Service Interface
export interface ISecurityService {
  // Firebase App Check integration
  verifyAppCheckToken(token: string): Promise<boolean>;
  generateAppCheckToken(): Promise<string>;
  
  // hCaptcha verification
  verifyHCaptcha(token: string, action: string): Promise<HCaptchaResult>;
  
  // Device and request analysis
  analyzeRequest(request: SecurityRequest): Promise<SecurityAssessment>;
  generateDeviceFingerprint(request: Request): string;
  
  // Fraud detection
  analyzeLoginAttempt(attempt: LoginAttempt): Promise<SecurityAssessment>;
  flagSuspiciousActivity(firebaseUid: string, activity: SecurityEvent): Promise<void>;
  
  // Audit logging
  logAuthEvent(event: AuthEvent): Promise<void>;
  logSecurityEvent(event: SecurityEvent): Promise<void>;
  getAuditLogs(filters: AuditFilters): Promise<AuditLog[]>;
}

// Fault Tolerance Service Interface
export interface IFaultToleranceService {
  // Graceful degradation strategies
  handleFirebaseDowntime(): Promise<DegradedAuthState>;
  handleNeonDBDowntime(): Promise<CachedAuthState>;
  
  // Retry mechanisms
  retryWithExponentialBackoff<T>(operation: () => Promise<T>): Promise<T>;
  
  // Circuit breaker pattern
  executeWithCircuitBreaker<T>(operation: () => Promise<T>): Promise<T>;
  
  // Data recovery
  recoverFromPartialFailure(failureType: FailureType): Promise<RecoveryResult>;
}

// Data Synchronization Service Interface
export interface ISyncService {
  // Sync Firebase user changes to Neon DB
  syncFirebaseUserToNeonDB(firebaseUser: FirebaseUser): Promise<void>;
  
  // Update Firebase custom claims from Neon DB data
  syncNeonDBToFirebaseClaims(firebaseUid: string): Promise<void>;
  
  // Handle email verification sync
  handleEmailVerificationSync(firebaseUid: string): Promise<void>;
  
  // Batch sync for data consistency
  performConsistencyCheck(): Promise<SyncReport>;
}

// Supporting Types
export interface CreateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  studentProfile?: Partial<StudentProfileEnhancementData>;
  teacherProfile?: Partial<TeacherApplicationUpdateData>;
  adminProfile?: {
    department?: string;
    isStatic?: boolean;
    createdBy?: string;
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  studentProfile?: Partial<StudentProfileEnhancementData>;
  teacherProfile?: Partial<TeacherApplicationUpdateData>;
}

export interface TeacherApplicationData {
  qualifications: string[];
  subjects: string[];
  experience: number;
  bio: string;
  hourlyRate?: number;
  documents: string[]; // Firebase Storage URLs
}

export interface TeacherApplication {
  id: string;
  userId: string;
  firebaseUid: string;
  applicantName: string;
  applicantEmail: string;
  applicationStatus: ApplicationStatus;
  qualifications: string[];
  subjects: string[];
  experience: number;
  bio: string;
  hourlyRate?: number;
  documents: string[];
  submittedAt: Date;
  reviewedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface ProfileCompletion {
  percentage: number;
  completedFields: string[];
  missingFields: string[];
  suggestions: string[];
}

export interface HCaptchaResult {
  success: boolean;
  score?: number;
  challenge_ts: string;
  hostname: string;
  error_codes?: string[];
}

export interface LoginAttempt {
  firebaseUid?: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  timestamp: Date;
  success: boolean;
  errorCode?: string;
}

export interface SecurityEvent {
  type: string;
  firebaseUid?: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  riskLevel: string;
  blocked: boolean;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface AuthEvent {
  type: string;
  firebaseUid?: string;
  action: string;
  resource?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface AuditFilters {
  userId?: string;
  firebaseUid?: string;
  eventType?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  limit?: number;
  offset?: number;
}

export interface AuditLog {
  id: string;
  userId?: string;
  firebaseUid?: string;
  eventType: string;
  action: string;
  resource?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface DegradedAuthState {
  mode: 'degraded';
  availableFeatures: string[];
  limitations: string[];
  estimatedRecoveryTime?: number;
}

export interface CachedAuthState {
  mode: 'cached';
  lastSyncTime: Date;
  queuedOperations: QueuedOperation[];
  limitations: string[];
}

export interface QueuedOperation {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: Date;
  retryCount: number;
}

export interface SyncReport {
  totalUsers: number;
  syncedUsers: number;
  failedUsers: number;
  inconsistencies: Inconsistency[];
  executionTime: number;
}

export interface Inconsistency {
  firebaseUid: string;
  field: string;
  firebaseValue: any;
  neonDBValue: any;
  resolved: boolean;
}

export enum FailureType {
  FIREBASE_DOWNTIME = 'FIREBASE_DOWNTIME',
  NEONDB_DOWNTIME = 'NEONDB_DOWNTIME',
  NETWORK_ISSUE = 'NETWORK_ISSUE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED'
}

export interface RecoveryResult {
  success: boolean;
  recoveredOperations: number;
  failedOperations: number;
  errors: string[];
}
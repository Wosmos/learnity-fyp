import { User as FirebaseUser } from 'firebase/auth';

// Firebase Auth Integration Types
export interface FirebaseAuthResult {
  success: boolean;
  user?: FirebaseUser;
  idToken?: string;
  needsEmailVerification?: boolean;
  error?: AuthError;
}

export interface CustomClaims {
  role: UserRole;
  permissions: Permission[];
  profileComplete: boolean;
  emailVerified: boolean;
}

// User Profile Types
export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified: boolean;
  profilePicture?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Role-specific data
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
  adminProfile?: AdminProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  gradeLevel: string;
  subjects: string[];
  learningGoals?: string[];
  interests?: string[];
  studyPreferences?: string[];
  profileCompletionPercentage: number;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  applicationStatus: ApplicationStatus;
  qualifications: string[];
  subjects: string[];
  experience: number;
  bio?: string;
  hourlyRate?: number;
  documents: string[]; // Firebase Storage URLs
  submittedAt: Date;
  reviewedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface AdminProfile {
  id: string;
  userId: string;
  department: string;
  isStatic: boolean;
  createdBy?: string;
}

// Enums
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
  PENDING_TEACHER = 'PENDING_TEACHER'
}

export enum Permission {
  // Student permissions
  VIEW_STUDENT_DASHBOARD = 'view:student_dashboard',
  JOIN_STUDY_GROUPS = 'join:study_groups',
  BOOK_TUTORING = 'book:tutoring',
  ENHANCE_PROFILE = 'enhance:profile',
  
  // Teacher permissions
  VIEW_TEACHER_DASHBOARD = 'view:teacher_dashboard',
  MANAGE_SESSIONS = 'manage:sessions',
  UPLOAD_CONTENT = 'upload:content',
  VIEW_STUDENT_PROGRESS = 'view:student_progress',
  
  // Pending teacher permissions
  VIEW_APPLICATION_STATUS = 'view:application_status',
  UPDATE_APPLICATION = 'update:application',
  
  // Admin permissions
  VIEW_ADMIN_PANEL = 'view:admin_panel',
  MANAGE_USERS = 'manage:users',
  APPROVE_TEACHERS = 'approve:teachers',
  VIEW_AUDIT_LOGS = 'view:audit_logs',
  MANAGE_PLATFORM = 'manage:platform'
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum AuthErrorCode {
  // Credential errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  
  // Password errors
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  PASSWORD_REUSED = 'PASSWORD_REUSED',
  INVALID_RESET_TOKEN = 'INVALID_RESET_TOKEN',
  
  // Rate limiting
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // MFA errors
  INVALID_MFA_CODE = 'INVALID_MFA_CODE',
  MFA_REQUIRED = 'MFA_REQUIRED',
  MFA_SETUP_REQUIRED = 'MFA_SETUP_REQUIRED',
  
  // Role/Permission errors
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ROLE_NOT_APPROVED = 'ROLE_NOT_APPROVED',
  INVALID_INVITE_CODE = 'INVALID_INVITE_CODE',
  
  // Token errors
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  
  // System errors
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, any>;
  retryAfter?: number;
}

// Security Types
export interface SecurityRequest {
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  timestamp: Date;
  action: SecurityAction;
  firebaseUid?: string;
}

export interface SecurityAssessment {
  riskLevel: RiskLevel;
  requiresAdditionalVerification: boolean;
  requiresCaptcha: boolean;
  blockedReasons: string[];
  allowedActions: SecurityAction[];
}

export enum SecurityAction {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  TEACHER_APPLICATION = 'TEACHER_APPLICATION'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum EventType {
  AUTH_LOGIN = 'AUTH_LOGIN',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
  AUTH_REGISTER = 'AUTH_REGISTER',
  AUTH_PASSWORD_RESET = 'AUTH_PASSWORD_RESET',
  AUTH_EMAIL_VERIFY = 'AUTH_EMAIL_VERIFY',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  ROLE_CHANGE = 'ROLE_CHANGE',
  TEACHER_APPLICATION_SUBMIT = 'TEACHER_APPLICATION_SUBMIT',
  TEACHER_APPLICATION_APPROVE = 'TEACHER_APPLICATION_APPROVE',
  TEACHER_APPLICATION_REJECT = 'TEACHER_APPLICATION_REJECT',
  ADMIN_ACTION = 'ADMIN_ACTION'
}

export enum SecurityEventType {
  SUSPICIOUS_LOGIN = 'SUSPICIOUS_LOGIN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  BOT_DETECTED = 'BOT_DETECTED',
  MULTIPLE_FAILED_ATTEMPTS = 'MULTIPLE_FAILED_ATTEMPTS',
  NEW_DEVICE_LOGIN = 'NEW_DEVICE_LOGIN',
  UNUSUAL_ACTIVITY = 'UNUSUAL_ACTIVITY'
}
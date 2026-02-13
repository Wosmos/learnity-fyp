/**
 * Database Synchronization Interfaces
 * Defines contracts for Firebase Auth + Neon DB synchronization
 */

import { User, UserRole, ApplicationStatus } from '@prisma/client';

export interface ISyncService {
  /**
   * Sync Firebase user changes to Neon DB
   */
  syncFirebaseUserToNeonDB(firebaseUser: FirebaseUser): Promise<void>;

  /**
   * Update Firebase custom claims from Neon DB data
   */
  syncNeonDBToFirebaseClaims(firebaseUid: string): Promise<void>;

  /**
   * Handle email verification sync
   */
  handleEmailVerificationSync(firebaseUid: string): Promise<void>;

  /**
   * Batch sync for data consistency
   */
  performConsistencyCheck(): Promise<SyncReport>;
}

export interface IUserProfileService {
  /**
   * Profile management
   */
  createUserProfile(
    firebaseUid: string,
    data: CreateProfileData
  ): Promise<User>;
  getUserProfile(firebaseUid: string): Promise<User | null>;
  updateUserProfile(
    firebaseUid: string,
    data: UpdateProfileData
  ): Promise<User>;

  /**
   * Role management
   */
  getUserRole(firebaseUid: string): Promise<UserRole>;
  updateUserRole(firebaseUid: string, role: UserRole): Promise<void>;

  /**
   * Teacher application workflow
   */
  submitTeacherApplication(
    firebaseUid: string,
    application: TeacherApplicationData
  ): Promise<void>;
  getTeacherApplications(
    status?: ApplicationStatus
  ): Promise<TeacherApplication[]>;
  reviewTeacherApplication(
    applicationId: string,
    decision: ApprovalDecision
  ): Promise<void>;

  /**
   * Student profile enhancement
   */
  enhanceStudentProfile(
    firebaseUid: string,
    enhancements: StudentEnhancements
  ): Promise<void>;
  getProfileCompletionStatus(firebaseUid: string): Promise<ProfileCompletion>;
}

// Firebase User interface
export interface FirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
}

// Profile data interfaces
export interface CreateProfileData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified?: boolean;
  profilePicture?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  emailVerified?: boolean;
  lastLoginAt?: Date;
}

export interface TeacherApplicationData {
  qualifications: string[];
  subjects: string[];
  experience: number;
  bio?: string;
  hourlyRate?: number;
  documents: string[]; // Firebase Storage URLs
}

export interface StudentEnhancements {
  learningGoals?: string[];
  interests?: string[];
  studyPreferences?: string[];
}

export interface TeacherApplication {
  id: string;
  userId: string;
  applicationStatus: ApplicationStatus;
  qualifications: string[];
  subjects: string[];
  experience: number;
  bio?: string;
  hourlyRate?: number;
  documents: string[];
  submittedAt: Date;
  reviewedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    firebaseUid: string;
  };
}

export interface ApprovalDecision {
  approved: boolean;
  approvedBy: string;
  rejectionReason?: string;
}

export interface ProfileCompletion {
  percentage: number;
  missingFields: string[];
  completedSections: string[];
}

export interface SyncReport {
  totalUsers: number;
  syncedUsers: number;
  failedSyncs: number;
  errors: SyncError[];
}

export interface SyncError {
  firebaseUid: string;
  error: string;
  timestamp: Date;
}

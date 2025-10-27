/**
 * Database Module Exports
 * Central export point for all database-related functionality
 */

// Services
export { DatabaseService } from '../services/database.service';
export { FirebaseSyncService } from '../services/firebase-sync.service';

// Interfaces
export type {
  ISyncService,
  IUserProfileService,
  FirebaseUser,
  CreateProfileData,
  UpdateProfileData,
  TeacherApplicationData,
  StudentEnhancements,
  TeacherApplication,
  ApprovalDecision,
  ProfileCompletion,
  SyncReport,
  SyncError
} from '../interfaces/database-sync.interface';

// Factory
export { DatabaseFactory } from '../factories/database.factory';

// Utils
export { DatabaseUtils } from '../utils/database.utils';

// Re-export Prisma types for convenience
export {
  User,
  UserRole,
  ApplicationStatus,
  EventType,
  SecurityEventType,
  RiskLevel
} from '@prisma/client';
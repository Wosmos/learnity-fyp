/**
 * Profile Enhancement Interfaces
 * Defines contracts for student profile customization and enhancement
 */

export interface IProfileEnhancementService {
  // Avatar management
  uploadAvatar(userId: string, file: File): Promise<string>;
  deleteAvatar(userId: string): Promise<void>;

  // Profile enhancement
  updateStudentProfile(
    userId: string,
    data: StudentProfileUpdateData
  ): Promise<void>;
  getProfileCompletion(userId: string): Promise<ProfileCompletionData>;

  // Privacy controls
  updatePrivacySettings(
    userId: string,
    settings: PrivacySettings
  ): Promise<void>;
  getPrivacySettings(userId: string): Promise<PrivacySettings>;
}

export interface StudentProfileUpdateData {
  firstName?: string;
  lastName?: string;
  learningGoals?: string[];
  interests?: string[];
  studyPreferences?: string[];
  subjects?: string[];
  gradeLevel?: string;
  bio?: string;
}

export interface ProfileCompletionData {
  percentage: number;
  completedSections: ProfileSection[];
  missingSections: ProfileSection[];
  nextSteps: string[];
  rewards: ProfileReward[];
}

export interface ProfileSection {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  weight: number; // Percentage contribution to overall completion
}

export interface ProfileReward {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  showEmail: boolean;
  showLearningGoals: boolean;
  showInterests: boolean;
  showProgress: boolean;
  allowMessages: boolean;
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibility: 'PUBLIC',
  showEmail: false,
  showLearningGoals: true,
  showInterests: true,
  showProgress: true,
  allowMessages: true,
};

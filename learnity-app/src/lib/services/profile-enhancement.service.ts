/**
 * Profile Enhancement Service
 * Handles student profile customization, avatar uploads, and completion tracking
 */

import { PrismaClient } from '@prisma/client';
import {
  IProfileEnhancementService,
  StudentProfileUpdateData,
  ProfileCompletionData,
  PrivacySettings,
  ProfileSection,
  ProfileReward,
  DEFAULT_PRIVACY_SETTINGS,
} from '@/lib/interfaces/profile.interface';

export class ProfileEnhancementService implements IProfileEnhancementService {
  private prisma: PrismaClient;
  private readonly STORAGE_PATHS = {
    AVATARS: 'avatars',
  } as const;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Upload user avatar - Store as base64 in Neon DB
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
      }

      // Validate file size (max 2MB for base64 storage)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size exceeds 2MB limit.');
      }

      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;

      // Update user profile with base64 image
      await this.prisma.user.update({
        where: { id: userId },
        data: { profilePicture: dataUrl },
      });

      return dataUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(userId: string): Promise<void> {
    try {
      // Simply remove the avatar from database (no Firebase Storage cleanup needed)
      await this.prisma.user.update({
        where: { id: userId },
        data: { profilePicture: null },
      });
    } catch (error) {
      console.error('Avatar deletion error:', error);
      throw error;
    }
  }

  /**
   * Update student profile with enhanced information
   */
  async updateStudentProfile(
    userId: string,
    data: StudentProfileUpdateData
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { studentProfile: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create student profile if it doesn't exist (migration for existing users)
      if (!user.studentProfile) {
        await this.prisma.studentProfile.create({
          data: {
            userId: user.id,
            gradeLevel: data.gradeLevel || 'Not specified',
            subjects: data.subjects || [],
            learningGoals: data.learningGoals || [],
            interests: data.interests || [],
            studyPreferences: data.studyPreferences || [],
            ...(data.bio && { bio: data.bio }),
            profileCompletionPercentage: 20,
          },
        });
        
        // Fetch the user again with the newly created profile
        const updatedUser = await this.prisma.user.findUnique({
          where: { id: userId },
          include: { studentProfile: true },
        });
        
        if (!updatedUser?.studentProfile) {
          throw new Error('Failed to create student profile');
        }
        
        return; // Profile created with initial data, no need to update
      }

      // Calculate new completion percentage
      const completionPercentage = this.calculateCompletionPercentage({
        ...user.studentProfile,
        ...data,
      });

      // Update student profile
      await this.prisma.studentProfile.update({
        where: { userId },
        data: {
          ...(data.learningGoals !== undefined && { learningGoals: data.learningGoals }),
          ...(data.interests !== undefined && { interests: data.interests }),
          ...(data.studyPreferences !== undefined && { studyPreferences: data.studyPreferences }),
          ...(data.subjects !== undefined && { subjects: data.subjects }),
          ...(data.gradeLevel !== undefined && { gradeLevel: data.gradeLevel }),
          ...(data.bio !== undefined && { bio: data.bio }),
          profileCompletionPercentage: completionPercentage,
        },
      });
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  /**
   * Calculate profile completion percentage
   */
  private calculateCompletionPercentage(profile: any): number {
    let percentage = 0;

    // Basic info (always present) - 15%
    percentage += 15;

    // Subjects - 20%
    if (profile.subjects && profile.subjects.length > 0) {
      percentage += 20;
    }

    // Learning goals - 20%
    if (profile.learningGoals && profile.learningGoals.length > 0) {
      percentage += 20;
    }

    // Interests - 15%
    if (profile.interests && profile.interests.length > 0) {
      percentage += 15;
    }

    // Study preferences - 15%
    if (profile.studyPreferences && profile.studyPreferences.length > 0) {
      percentage += 15;
    }

    // Bio - 15%
    if (profile.bio && profile.bio.trim().length > 0) {
      percentage += 15;
    }

    return Math.min(percentage, 100);
  }

  /**
   * Get profile completion data with gamification elements
   */
  async getProfileCompletion(userId: string): Promise<ProfileCompletionData> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { studentProfile: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create student profile if it doesn't exist (migration for existing users)
      if (!user.studentProfile) {
        await this.prisma.studentProfile.create({
          data: {
            userId: user.id,
            gradeLevel: 'Not specified',
            subjects: [],
            learningGoals: [],
            interests: [],
            studyPreferences: [],
            profileCompletionPercentage: 20,
          },
        });
        
        // Fetch the user again with the newly created profile
        const updatedUser = await this.prisma.user.findUnique({
          where: { id: userId },
          include: { studentProfile: true },
        });
        
        if (!updatedUser?.studentProfile) {
          throw new Error('Failed to create student profile');
        }
        
        const profile = updatedUser.studentProfile;
        const sections = this.getProfileSections(profile);
        const completedSections = sections.filter(s => s.completed);
        const missingSections = sections.filter(s => !s.completed);
        const percentage = profile.profileCompletionPercentage;

        return {
          percentage,
          completedSections,
          missingSections,
          nextSteps: this.generateNextSteps(missingSections),
          rewards: this.generateRewards(percentage),
        };
      }

      const profile = user.studentProfile;
      const sections = this.getProfileSections(profile);
      const completedSections = sections.filter(s => s.completed);
      const missingSections = sections.filter(s => !s.completed);
      const percentage = profile.profileCompletionPercentage;

      // Generate next steps
      const nextSteps = this.generateNextSteps(missingSections);

      // Generate rewards based on completion
      const rewards = this.generateRewards(percentage);

      return {
        percentage,
        completedSections,
        missingSections,
        nextSteps,
        rewards,
      };
    } catch (error) {
      console.error('Profile completion fetch error:', error);
      throw error;
    }
  }

  /**
   * Get profile sections with completion status
   */
  private getProfileSections(profile: any): ProfileSection[] {
    return [
      {
        id: 'basic-info',
        name: 'Basic Information',
        description: 'Name, email, and grade level',
        completed: true, // Always completed
        weight: 15,
      },
      {
        id: 'subjects',
        name: 'Subject Interests',
        description: 'Subjects you want to learn',
        completed: profile.subjects && profile.subjects.length > 0,
        weight: 20,
      },
      {
        id: 'learning-goals',
        name: 'Learning Goals',
        description: 'Your educational objectives',
        completed: profile.learningGoals && profile.learningGoals.length > 0,
        weight: 20,
      },
      {
        id: 'interests',
        name: 'Personal Interests',
        description: 'Hobbies and activities you enjoy',
        completed: profile.interests && profile.interests.length > 0,
        weight: 15,
      },
      {
        id: 'study-preferences',
        name: 'Study Preferences',
        description: 'How you prefer to learn',
        completed: profile.studyPreferences && profile.studyPreferences.length > 0,
        weight: 15,
      },
      {
        id: 'bio',
        name: 'Personal Bio',
        description: 'Tell us about yourself',
        completed: profile.bio && profile.bio.trim().length > 0,
        weight: 15,
      },
    ];
  }

  /**
   * Generate next steps for profile completion
   */
  private generateNextSteps(missingSections: ProfileSection[]): string[] {
    return missingSections.slice(0, 3).map(section => 
      `Complete your ${section.name.toLowerCase()}`
    );
  }

  /**
   * Generate rewards based on completion percentage
   */
  private generateRewards(percentage: number): ProfileReward[] {
    const rewards: ProfileReward[] = [
      {
        id: 'profile-starter',
        title: 'Profile Starter',
        description: 'Created your profile',
        icon: '🎯',
        unlocked: percentage >= 20,
        unlockedAt: percentage >= 20 ? new Date() : undefined,
      },
      {
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Completed 40% of your profile',
        icon: '🌟',
        unlocked: percentage >= 40,
        unlockedAt: percentage >= 40 ? new Date() : undefined,
      },
      {
        id: 'halfway-there',
        title: 'Halfway There',
        description: 'Completed 60% of your profile',
        icon: '🚀',
        unlocked: percentage >= 60,
        unlockedAt: percentage >= 60 ? new Date() : undefined,
      },
      {
        id: 'almost-done',
        title: 'Almost Done',
        description: 'Completed 80% of your profile',
        icon: '⭐',
        unlocked: percentage >= 80,
        unlockedAt: percentage >= 80 ? new Date() : undefined,
      },
      {
        id: 'profile-master',
        title: 'Profile Master',
        description: 'Completed 100% of your profile',
        icon: '🏆',
        unlocked: percentage >= 100,
        unlockedAt: percentage >= 100 ? new Date() : undefined,
      },
    ];

    return rewards;
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    userId: string,
    settings: PrivacySettings
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { studentProfile: true },
      });

      if (!user || !user.studentProfile) {
        throw new Error('Student profile not found');
      }

      // Update privacy settings in student profile
      await this.prisma.studentProfile.update({
        where: { userId },
        data: {
          profileVisibility: settings.profileVisibility,
          showEmail: settings.showEmail,
          showLearningGoals: settings.showLearningGoals,
          showInterests: settings.showInterests,
          showProgress: settings.showProgress,
          allowMessages: settings.allowMessages,
        },
      });
    } catch (error) {
      console.error('Privacy settings update error:', error);
      throw error;
    }
  }

  /**
   * Get privacy settings
   */
  async getPrivacySettings(userId: string): Promise<PrivacySettings> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { studentProfile: true },
      });

      if (!user || !user.studentProfile) {
        throw new Error('Student profile not found');
      }

      const profile = user.studentProfile as any; // TODO: Regenerate Prisma client
      
      return {
        profileVisibility: profile.profileVisibility,
        showEmail: profile.showEmail,
        showLearningGoals: profile.showLearningGoals,
        showInterests: profile.showInterests,
        showProgress: profile.showProgress,
        allowMessages: profile.allowMessages,
      };
    } catch (error) {
      console.error('Privacy settings fetch error:', error);
      return DEFAULT_PRIVACY_SETTINGS;
    }
  }

  /**
   * Cleanup database connections
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

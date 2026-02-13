/**
 * Gamification Service Interface
 * Defines the contract for gamification operations (XP, streaks, badges)
 *
 * Requirements covered:
 * - 5.4: Award 10 XP points when lesson is completed
 * - 6.7: Award 20 XP bonus points when quiz is passed
 * - 7.5: Update student's daily streak
 * - 7.6: Display total XP earned, level, streak, badges
 * - 10.4: Award 50 XP bonus for course completion
 * - 10.6: Unlock badges after achievements
 */

import {
  XPReason,
  UserProgress,
  UserBadge,
  Quest,
  UserQuest,
  QuestType,
  QuestFrequency,
  QuestStatus,
} from '@prisma/client';

// Badge type for the simplified badge object
export interface Badge {
  id: string;
  type: string;
  unlockedAt: Date;
}

// ============================================
// GAMIFICATION DTOs AND TYPES
// ============================================

/**
 * XP amounts for different activities
 */
export const XP_AMOUNTS = {
  LESSON_COMPLETE: 10,
  QUIZ_PASS: 20,
  COURSE_COMPLETE: 50,
  DAILY_LOGIN: 5,
  STREAK_BONUS_7: 25,
  STREAK_BONUS_30: 100,
  STREAK_BONUS_100: 500,
} as const;

/**
 * Level thresholds - XP required for each level
 */
export const LEVEL_THRESHOLDS = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  500, // Level 4
  1000, // Level 5
  2000, // Level 6
  3500, // Level 7
  5500, // Level 8
  8000, // Level 9
  11000, // Level 10
  15000, // Level 11+
] as const;

/**
 * Badge criteria definitions
 */
export const BADGE_CRITERIA = {
  FIRST_COURSE_COMPLETE: { coursesCompleted: 1 },
  FIVE_COURSES_COMPLETE: { coursesCompleted: 5 },
  TEN_COURSES_COMPLETE: { coursesCompleted: 10 },
  STREAK_7_DAYS: { streakDays: 7 },
  STREAK_30_DAYS: { streakDays: 30 },
  STREAK_100_DAYS: { streakDays: 100 },
  QUIZ_MASTER: { quizzesPassed: 50 },
  TOP_REVIEWER: { reviewsWritten: 10 },
} as const;

/**
 * Result of awarding XP
 */
export interface AwardXPResult {
  previousXP: number;
  newXP: number;
  xpAwarded: number;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
}

/**
 * Result of updating streak
 */
export interface StreakUpdateResult {
  previousStreak: number;
  currentStreak: number;
  longestStreak: number;
  streakIncremented: boolean;
  streakReset: boolean;
  bonusXPAwarded: number;
  badgeAwarded?: UserBadge;
}

/**
 * Student gamification progress summary
 */
export interface GamificationProgress {
  userId: string;
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: Date | null;
  badges: Badge[];
  recentXPActivities: XPActivitySummary[];
  dailyActivity: { date: Date; xp: number }[];
}

/**
 * XP activity summary for display
 */
export interface XPActivitySummary {
  id: string;
  amount: number;
  reason: XPReason;
  sourceId: string | null;
  createdAt: Date;
}

/**
 * Badge with metadata for display
 */
export interface BadgeWithMetadata {
  badge: Badge;
  name: string;
  description: string;
  icon: string;
}

// ============================================
// LEADERBOARD TYPES
// ============================================

/**
 * Leaderboard entry for ranking display
 */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  profilePicture?: string;
  totalXP: number;
  level: number;
  badgeCount: number;
  isCurrentUser?: boolean;
}

/**
 * Leaderboard response with pagination
 */
export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  totalUsers: number;
}

// ============================================
// QUEST TYPES
// ============================================

/**
 * Quest with user progress details
 */
export interface UserQuestWithDetails {
  id: string;
  quest: {
    id: string;
    key: string;
    title: string;
    description: string;
    type: QuestType;
    frequency: QuestFrequency;
    targetValue: number;
    xpReward: number;
    badgeReward?: string | null;
  };
  currentProgress: number;
  status: QuestStatus;
  progressPercentage: number;
  startedAt: Date;
  completedAt?: Date | null;
  timeRemaining?: number; // milliseconds until reset
}

/**
 * Result of completing a quest
 */
export interface CompletedQuest {
  questId: string;
  questTitle: string;
  xpAwarded: number;
  badgeAwarded?: string;
}

/**
 * Quest progress update result
 */
export interface QuestProgressResult {
  updatedQuests: UserQuestWithDetails[];
  completedQuests: CompletedQuest[];
}

// ============================================
// GAMIFICATION SERVICE INTERFACE
// ============================================

/**
 * IGamificationService - Gamification operations interface
 * Implements XP, streak, and badge management
 */
export interface IGamificationService {
  /**
   * Award XP to a user
   * @param userId - The user ID
   * @param amount - Amount of XP to award
   * @param reason - Reason for XP award
   * @param sourceId - Optional source ID (lessonId, quizId, courseId)
   * @returns Result with XP and level changes
   * Requirements: 5.4, 6.7, 10.4
   */
  awardXP(
    userId: string,
    amount: number,
    reason: XPReason,
    sourceId?: string
  ): Promise<AwardXPResult>;

  /**
   * Update user's daily streak
   * @param userId - The user ID
   * @returns Result with streak changes and any bonus XP
   * Requirements: 7.5
   */
  updateStreak(userId: string): Promise<StreakUpdateResult>;

  /**
   * Check and award a badge if criteria is met
   * @param userId - The user ID
   * @param badgeKey - Key of badge to check
   * @returns The awarded badge or null if not earned
   * Requirements: 10.6
   */
  checkAndAwardBadge(
    userId: string,
    badgeKey: string
  ): Promise<UserBadge | null>;

  /**
   * Get student's gamification progress
   * @param userId - The user ID
   * @returns Complete gamification progress summary
   * Requirements: 7.6
   */
  getStudentProgress(userId: string): Promise<GamificationProgress>;

  /**
   * Calculate level from total XP
   * @param totalXP - Total XP amount
   * @returns The calculated level
   */
  calculateLevel(totalXP: number): number;

  /**
   * Calculate XP needed for next level
   * @param currentLevel - Current level
   * @param totalXP - Total XP amount
   * @returns XP needed to reach next level
   */
  calculateXPToNextLevel(currentLevel: number, totalXP: number): number;

  /**
   * Get or create user progress record
   * @param userId - The user ID
   * @returns The user progress record
   */
  getOrCreateUserProgress(userId: string): Promise<UserProgress>;

  /**
   * Get all badges for a user
   * @param userId - The user ID
   * @returns Array of badges with metadata
   */
  getUserBadges(userId: string): Promise<BadgeWithMetadata[]>;

  // ============================================
  // QUEST METHODS
  // ============================================

  /**
   * Update quest progress when activities happen
   * @param userId - The user ID
   * @param questType - Type of quest to update
   * @param increment - Amount to increment (default 1)
   * @returns Quest progress result with any completed quests
   */
  updateQuestProgress(
    userId: string,
    questType: QuestType,
    increment?: number
  ): Promise<QuestProgressResult>;

  /**
   * Get active quests for user with progress
   * @param userId - The user ID
   * @returns Array of quests with progress details
   */
  getActiveQuests(userId: string): Promise<UserQuestWithDetails[]>;

  /**
   * Reset expired daily/weekly quests
   * @param userId - The user ID
   */
  resetExpiredQuests(userId: string): Promise<void>;

  // ============================================
  // LEADERBOARD METHODS
  // ============================================

  /**
   * Get global XP leaderboard
   * @param limit - Maximum entries to return (default 10)
   * @param userId - Optional current user ID to include their rank
   * @returns Leaderboard response with entries
   */
  getGlobalLeaderboard(
    limit?: number,
    userId?: string
  ): Promise<LeaderboardResponse>;

  /**
   * Get course-specific leaderboard
   * @param courseId - Course ID
   * @param limit - Maximum entries (default 10)
   * @param userId - Optional current user ID
   * @returns Leaderboard response for the course
   */
  getCourseLeaderboard(
    courseId: string,
    limit?: number,
    userId?: string
  ): Promise<LeaderboardResponse>;

  /**
   * Get user's rank in global leaderboard
   * @param userId - The user ID
   * @returns Rank and total users
   */
  getUserRank(userId: string): Promise<{ rank: number; total: number }>;

  // ============================================
  // DAILY LOGIN
  // ============================================

  /**
   * Award daily login XP (only once per calendar day)
   * @param userId - The user ID
   * @returns XP result if awarded, null if already claimed today
   */
  awardDailyLoginXP(userId: string): Promise<AwardXPResult | null>;

  /**
   * Check all relevant badges after an action
   * @param userId - The user ID
   * @returns Array of newly awarded badges
   */
  checkAllBadges(userId: string): Promise<UserBadge[]>;
}

// ============================================
// GAMIFICATION ERROR TYPES
// ============================================

/**
 * Gamification error codes for specific error handling
 */
export enum GamificationErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_XP_AMOUNT = 'INVALID_XP_AMOUNT',
  BADGE_ALREADY_EARNED = 'BADGE_ALREADY_EARNED',
  INVALID_BADGE_TYPE = 'INVALID_BADGE_TYPE',
  PROGRESS_NOT_FOUND = 'PROGRESS_NOT_FOUND',
}

/**
 * Custom error class for gamification-related errors
 */
export class GamificationError extends Error {
  constructor(
    message: string,
    public code: GamificationErrorCode,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'GamificationError';
  }
}

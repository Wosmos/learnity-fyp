/**
 * Gamification Service Implementation
 * Handles XP awards, streak tracking, and badge management
 * 
 * Requirements covered:
 * - 5.4: Award 10 XP points when lesson is completed
 * - 6.7: Award 20 XP bonus points when quiz is passed
 * - 7.5: Update student's daily streak
 * - 7.6: Display total XP earned, level, streak, badges
 * - 10.4: Award 50 XP bonus for course completion
 * - 10.6: Unlock badges after achievements
 */

import { PrismaClient, Badge, BadgeType, XPReason, UserProgress, EnrollmentStatus } from '@prisma/client';
import {
  IGamificationService,
  AwardXPResult,
  StreakUpdateResult,
  GamificationProgress,
  XPActivitySummary,
  BadgeWithMetadata,
  GamificationError,
  GamificationErrorCode,
  XP_AMOUNTS,
  LEVEL_THRESHOLDS,
  BADGE_CRITERIA,
} from '@/lib/interfaces/gamification.interface';
import { prisma as defaultPrisma } from '@/lib/prisma';

/**
 * Badge metadata for display purposes
 */
const BADGE_METADATA: Record<BadgeType, { name: string; description: string; icon: string }> = {
  FIRST_COURSE_COMPLETE: {
    name: 'First Steps',
    description: 'Completed your first course',
    icon: '🎓',
  },
  FIVE_COURSES_COMPLETE: {
    name: 'Dedicated Learner',
    description: 'Completed 5 courses',
    icon: '📚',
  },
  TEN_COURSES_COMPLETE: {
    name: 'Knowledge Seeker',
    description: 'Completed 10 courses',
    icon: '🏆',
  },
  STREAK_7_DAYS: {
    name: 'Week Warrior',
    description: 'Maintained a 7-day learning streak',
    icon: '🔥',
  },
  STREAK_30_DAYS: {
    name: 'Monthly Master',
    description: 'Maintained a 30-day learning streak',
    icon: '⚡',
  },
  STREAK_100_DAYS: {
    name: 'Century Champion',
    description: 'Maintained a 100-day learning streak',
    icon: '💎',
  },
  QUIZ_MASTER: {
    name: 'Quiz Master',
    description: 'Passed 50 quizzes',
    icon: '🧠',
  },
  TOP_REVIEWER: {
    name: 'Top Reviewer',
    description: 'Written 10 course reviews',
    icon: '⭐',
  },
};

/**
 * GamificationService - Implements gamification business logic
 * Uses dependency injection for PrismaClient
 */
export class GamificationService implements IGamificationService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || defaultPrisma;
  }

  /**
   * Award XP to a user
   * Requirements: 5.4, 6.7, 10.4
   */
  async awardXP(
    userId: string,
    amount: number,
    reason: XPReason,
    sourceId?: string
  ): Promise<AwardXPResult> {
    // Validate amount
    if (amount <= 0) {
      throw new GamificationError(
        'XP amount must be positive',
        GamificationErrorCode.INVALID_XP_AMOUNT,
        400
      );
    }

    // Get or create user progress
    const userProgress = await this.getOrCreateUserProgress(userId);
    
    const previousXP = userProgress.totalXP;
    const previousLevel = userProgress.currentLevel;
    const newXP = previousXP + amount;
    const newLevel = this.calculateLevel(newXP);
    const leveledUp = newLevel > previousLevel;

    // Update user progress and log activity in a transaction
    await this.prisma.$transaction([
      this.prisma.userProgress.update({
        where: { userId },
        data: {
          totalXP: newXP,
          currentLevel: newLevel,
          lastActivityAt: new Date(),
        },
      }),
      this.prisma.xPActivity.create({
        data: {
          userId,
          amount,
          reason,
          sourceId: sourceId || null,
        },
      }),
    ]);

    return {
      previousXP,
      newXP,
      xpAwarded: amount,
      previousLevel,
      newLevel,
      leveledUp,
    };
  }

  /**
   * Update user's daily streak
   * Requirements: 7.5
   */
  async updateStreak(userId: string): Promise<StreakUpdateResult> {
    const userProgress = await this.getOrCreateUserProgress(userId);
    
    const now = new Date();
    const lastActivity = userProgress.lastActivityAt;
    
    const previousStreak = userProgress.currentStreak;
    let currentStreak = previousStreak;
    let streakIncremented = false;
    let streakReset = false;
    let bonusXPAwarded = 0;
    let badgeAwarded: Badge | undefined;

    if (!lastActivity) {
      // First activity ever - start streak at 1
      currentStreak = 1;
      streakIncremented = true;
    } else {
      // Normalize dates to compare calendar days
      const lastActivityDate = new Date(lastActivity);
      lastActivityDate.setHours(0, 0, 0, 0);
      
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActivityDate.getTime() === yesterday.getTime()) {
        // Last activity was yesterday - increment streak
        currentStreak = previousStreak + 1;
        streakIncremented = true;
      } else if (lastActivityDate.getTime() === today.getTime()) {
        // Already active today - keep current streak
        currentStreak = previousStreak;
      } else {
        // Streak broken (more than 1 day gap) - reset to 1
        currentStreak = 1;
        streakReset = previousStreak > 0;
      }
    }

    // Calculate longest streak
    const longestStreak = Math.max(currentStreak, userProgress.longestStreak);

    // Update user progress
    await this.prisma.userProgress.update({
      where: { userId },
      data: {
        currentStreak,
        longestStreak,
        lastActivityAt: now,
      },
    });

    // Check for streak milestones and award bonus XP
    if (streakIncremented) {
      // Check for streak badges and bonus XP
      if (currentStreak === 7) {
        bonusXPAwarded = XP_AMOUNTS.STREAK_BONUS_7;
        await this.awardXP(userId, bonusXPAwarded, XPReason.STREAK_BONUS);
        badgeAwarded = await this.checkAndAwardBadge(userId, BadgeType.STREAK_7_DAYS) || undefined;
      } else if (currentStreak === 30) {
        bonusXPAwarded = XP_AMOUNTS.STREAK_BONUS_30;
        await this.awardXP(userId, bonusXPAwarded, XPReason.STREAK_BONUS);
        badgeAwarded = await this.checkAndAwardBadge(userId, BadgeType.STREAK_30_DAYS) || undefined;
      } else if (currentStreak === 100) {
        bonusXPAwarded = XP_AMOUNTS.STREAK_BONUS_100;
        await this.awardXP(userId, bonusXPAwarded, XPReason.STREAK_BONUS);
        badgeAwarded = await this.checkAndAwardBadge(userId, BadgeType.STREAK_100_DAYS) || undefined;
      }
    }

    return {
      previousStreak,
      currentStreak,
      longestStreak,
      streakIncremented,
      streakReset,
      bonusXPAwarded,
      badgeAwarded,
    };
  }

  /**
   * Check and award a badge if criteria is met
   * Requirements: 10.6
   */
  async checkAndAwardBadge(userId: string, badgeType: BadgeType): Promise<Badge | null> {
    // Check if badge already earned
    const existingBadge = await this.prisma.badge.findUnique({
      where: {
        userId_type: { userId, type: badgeType },
      },
    });

    if (existingBadge) {
      return null; // Already earned
    }

    // Check criteria based on badge type
    const criteriamet = await this.checkBadgeCriteria(userId, badgeType);
    
    if (!criteriamet) {
      return null;
    }

    // Award the badge
    const badge = await this.prisma.badge.create({
      data: {
        userId,
        type: badgeType,
      },
    });

    return badge;
  }

  /**
   * Get student's gamification progress
   * Requirements: 7.6
   */
  async getStudentProgress(userId: string): Promise<GamificationProgress> {
    const userProgress = await this.getOrCreateUserProgress(userId);
    
    // Get badges
    const badges = await this.prisma.badge.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
    });

    // Get recent XP activities (last 10)
    const xpActivities = await this.prisma.xPActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const recentXPActivities: XPActivitySummary[] = xpActivities.map(activity => ({
      id: activity.id,
      amount: activity.amount,
      reason: activity.reason,
      sourceId: activity.sourceId,
      createdAt: activity.createdAt,
    }));

    return {
      userId,
      totalXP: userProgress.totalXP,
      currentLevel: userProgress.currentLevel,
      xpToNextLevel: this.calculateXPToNextLevel(userProgress.currentLevel, userProgress.totalXP),
      currentStreak: userProgress.currentStreak,
      longestStreak: userProgress.longestStreak,
      lastActivityAt: userProgress.lastActivityAt,
      badges,
      recentXPActivities,
    };
  }

  /**
   * Calculate level from total XP
   */
  calculateLevel(totalXP: number): number {
    let level = 1;
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      if (totalXP >= LEVEL_THRESHOLDS[i]) {
        level = i + 1;
      } else {
        break;
      }
    }
    // For XP beyond the defined thresholds, continue incrementing
    if (totalXP >= LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) {
      const extraXP = totalXP - LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
      const extraLevels = Math.floor(extraXP / 5000); // 5000 XP per level after max defined
      level = LEVEL_THRESHOLDS.length + extraLevels;
    }
    return level;
  }

  /**
   * Calculate XP needed for next level
   */
  calculateXPToNextLevel(currentLevel: number, totalXP: number): number {
    if (currentLevel < LEVEL_THRESHOLDS.length) {
      return LEVEL_THRESHOLDS[currentLevel] - totalXP;
    }
    // For levels beyond defined thresholds
    const baseXP = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const extraLevels = currentLevel - LEVEL_THRESHOLDS.length;
    const nextLevelXP = baseXP + ((extraLevels + 1) * 5000);
    return nextLevelXP - totalXP;
  }

  /**
   * Get or create user progress record
   */
  async getOrCreateUserProgress(userId: string): Promise<UserProgress> {
    let userProgress = await this.prisma.userProgress.findUnique({
      where: { userId },
    });

    if (!userProgress) {
      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new GamificationError(
          'User not found',
          GamificationErrorCode.USER_NOT_FOUND,
          404
        );
      }

      userProgress = await this.prisma.userProgress.create({
        data: {
          userId,
          totalXP: 0,
          currentLevel: 1,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    }

    return userProgress;
  }

  /**
   * Get all badges for a user with metadata
   */
  async getUserBadges(userId: string): Promise<BadgeWithMetadata[]> {
    const badges = await this.prisma.badge.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
    });

    return badges.map(badge => ({
      badge,
      ...BADGE_METADATA[badge.type],
    }));
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Check if badge criteria is met
   * @private
   */
  private async checkBadgeCriteria(userId: string, badgeType: BadgeType): Promise<boolean> {
    switch (badgeType) {
      case BadgeType.FIRST_COURSE_COMPLETE:
        return this.checkCoursesCompleted(userId, BADGE_CRITERIA.FIRST_COURSE_COMPLETE.coursesCompleted);
      
      case BadgeType.FIVE_COURSES_COMPLETE:
        return this.checkCoursesCompleted(userId, BADGE_CRITERIA.FIVE_COURSES_COMPLETE.coursesCompleted);
      
      case BadgeType.TEN_COURSES_COMPLETE:
        return this.checkCoursesCompleted(userId, BADGE_CRITERIA.TEN_COURSES_COMPLETE.coursesCompleted);
      
      case BadgeType.STREAK_7_DAYS:
        return this.checkStreakDays(userId, BADGE_CRITERIA.STREAK_7_DAYS.streakDays);
      
      case BadgeType.STREAK_30_DAYS:
        return this.checkStreakDays(userId, BADGE_CRITERIA.STREAK_30_DAYS.streakDays);
      
      case BadgeType.STREAK_100_DAYS:
        return this.checkStreakDays(userId, BADGE_CRITERIA.STREAK_100_DAYS.streakDays);
      
      case BadgeType.QUIZ_MASTER:
        return this.checkQuizzesPassed(userId, BADGE_CRITERIA.QUIZ_MASTER.quizzesPassed);
      
      case BadgeType.TOP_REVIEWER:
        return this.checkReviewsWritten(userId, BADGE_CRITERIA.TOP_REVIEWER.reviewsWritten);
      
      default:
        return false;
    }
  }

  /**
   * Check if user has completed required number of courses
   * @private
   */
  private async checkCoursesCompleted(userId: string, requiredCount: number): Promise<boolean> {
    const completedCount = await this.prisma.enrollment.count({
      where: {
        studentId: userId,
        status: EnrollmentStatus.COMPLETED,
      },
    });
    return completedCount >= requiredCount;
  }

  /**
   * Check if user has achieved required streak days
   * @private
   */
  private async checkStreakDays(userId: string, requiredDays: number): Promise<boolean> {
    const userProgress = await this.prisma.userProgress.findUnique({
      where: { userId },
    });
    return (userProgress?.currentStreak ?? 0) >= requiredDays;
  }

  /**
   * Check if user has passed required number of quizzes
   * @private
   */
  private async checkQuizzesPassed(userId: string, requiredCount: number): Promise<boolean> {
    // Count unique quizzes passed (not total attempts)
    const passedQuizzes = await this.prisma.quizAttempt.findMany({
      where: {
        studentId: userId,
        passed: true,
      },
      distinct: ['quizId'],
    });
    return passedQuizzes.length >= requiredCount;
  }

  /**
   * Check if user has written required number of reviews
   * @private
   */
  private async checkReviewsWritten(userId: string, requiredCount: number): Promise<boolean> {
    const reviewCount = await this.prisma.review.count({
      where: {
        studentId: userId,
      },
    });
    return reviewCount >= requiredCount;
  }
}

// Export singleton instance
export const gamificationService = new GamificationService();

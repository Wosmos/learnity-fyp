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

import {
  PrismaClient,
  XPReason,
  UserProgress,
  EnrollmentStatus,
  UserBadge,
  QuestType,
  QuestFrequency,
  QuestStatus,
} from '@prisma/client';
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
  LeaderboardEntry,
  LeaderboardResponse,
  UserQuestWithDetails,
  CompletedQuest,
  QuestProgressResult,
} from '@/lib/interfaces/gamification.interface';
import { prisma as defaultPrisma } from '@/lib/prisma';

// Badge type keys for the system
type BadgeTypeKey =
  | 'FIRST_COURSE_COMPLETE'
  | 'FIVE_COURSES_COMPLETE'
  | 'TEN_COURSES_COMPLETE'
  | 'STREAK_7_DAYS'
  | 'STREAK_30_DAYS'
  | 'STREAK_100_DAYS'
  | 'QUIZ_MASTER'
  | 'TOP_REVIEWER';

/**
 * Badge metadata for display purposes
 */
const BADGE_METADATA: Record<
  BadgeTypeKey,
  { name: string; description: string; icon: string }
> = {
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
    let badgeAwarded: UserBadge | undefined;

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
        badgeAwarded =
          (await this.checkAndAwardBadge(userId, 'STREAK_7_DAYS')) || undefined;
      } else if (currentStreak === 30) {
        bonusXPAwarded = XP_AMOUNTS.STREAK_BONUS_30;
        await this.awardXP(userId, bonusXPAwarded, XPReason.STREAK_BONUS);
        badgeAwarded =
          (await this.checkAndAwardBadge(userId, 'STREAK_30_DAYS')) ||
          undefined;
      } else if (currentStreak === 100) {
        bonusXPAwarded = XP_AMOUNTS.STREAK_BONUS_100;
        await this.awardXP(userId, bonusXPAwarded, XPReason.STREAK_BONUS);
        badgeAwarded =
          (await this.checkAndAwardBadge(userId, 'STREAK_100_DAYS')) ||
          undefined;
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
  async checkAndAwardBadge(
    userId: string,
    badgeKey: BadgeTypeKey
  ): Promise<UserBadge | null> {
    // Find the badge definition
    const badgeDefinition = await this.prisma.badgeDefinition.findUnique({
      where: { key: badgeKey },
    });

    if (!badgeDefinition) {
      return null; // Badge definition not found
    }

    // Check if badge already earned
    const existingBadge = await this.prisma.userBadge.findUnique({
      where: {
        userId_badgeDefinitionId: {
          userId,
          badgeDefinitionId: badgeDefinition.id,
        },
      },
    });

    if (existingBadge) {
      return null; // Already earned
    }

    // Check criteria based on badge type
    const criteriaMet = await this.checkBadgeCriteria(userId, badgeKey);

    if (!criteriaMet) {
      return null;
    }

    // Award the badge
    const badge = await this.prisma.userBadge.create({
      data: {
        userId,
        badgeDefinitionId: badgeDefinition.id,
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

    // Get badges with definitions
    const userBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      include: { badgeDefinition: true },
      orderBy: { earnedAt: 'desc' },
    });

    // Get recent XP activities (last 10)
    const xpActivities = await this.prisma.xPActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const recentXPActivities: XPActivitySummary[] = xpActivities.map(
      activity => ({
        id: activity.id,
        amount: activity.amount,
        reason: activity.reason,
        sourceId: activity.sourceId,
        createdAt: activity.createdAt,
      })
    );

    // Transform badges to expected format
    const badges = userBadges.map(ub => ({
      id: ub.id,
      type: ub.badgeDefinition.key,
      unlockedAt: ub.earnedAt,
    }));

    return {
      userId,
      totalXP: userProgress.totalXP,
      currentLevel: userProgress.currentLevel,
      xpToNextLevel: this.calculateXPToNextLevel(
        userProgress.currentLevel,
        userProgress.totalXP
      ),
      currentStreak: userProgress.currentStreak,
      longestStreak: userProgress.longestStreak,
      lastActivityAt: userProgress.lastActivityAt,
      badges,
      recentXPActivities,
      dailyActivity: await this.getXPHistory(userId, 35),
    };
  }

  /**
   * Calculate daily XP history for the specified number of days
   */
  async getXPHistory(
    userId: string,
    days: number = 7
  ): Promise<{ date: Date; xp: number }[]> {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // Get all XP activities for the period
    const activities = await this.prisma.xPActivity.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: today,
        },
      },
    });

    // Initialize map for all days
    const activityMap = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      activityMap.set(dateStr, 0);
    }

    // Aggregate XP
    activities.forEach(activity => {
      const dateStr = activity.createdAt.toISOString().split('T')[0];
      if (activityMap.has(dateStr)) {
        activityMap.set(
          dateStr,
          (activityMap.get(dateStr) || 0) + activity.amount
        );
      }
    });

    // Convert to array
    return Array.from(activityMap.entries()).map(([dateStr, xp]) => ({
      date: new Date(dateStr),
      xp,
    }));
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
    const nextLevelXP = baseXP + (extraLevels + 1) * 5000;
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
    const userBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      include: { badgeDefinition: true },
      orderBy: { earnedAt: 'desc' },
    });

    return userBadges.map(ub => {
      const key = ub.badgeDefinition.key as BadgeTypeKey;
      const metadata = BADGE_METADATA[key] || {
        name: ub.badgeDefinition.name,
        description: ub.badgeDefinition.description,
        icon: ub.badgeDefinition.icon,
      };
      return {
        badge: {
          id: ub.id,
          type: key,
          unlockedAt: ub.earnedAt,
        },
        ...metadata,
      };
    });
  }

  // ============================================
  // QUEST METHODS
  // ============================================

  /**
   * Update quest progress when activities happen
   */
  async updateQuestProgress(
    userId: string,
    questType: QuestType,
    increment: number = 1
  ): Promise<QuestProgressResult> {
    // Reset any expired quests first
    await this.resetExpiredQuests(userId);

    // Find all active quests of this type
    const quests = await this.prisma.quest.findMany({
      where: {
        type: questType,
        isActive: true,
      },
    });

    const updatedQuests: UserQuestWithDetails[] = [];
    const completedQuests: CompletedQuest[] = [];

    for (const quest of quests) {
      // Get or create user quest progress
      let userQuest = await this.prisma.userQuest.findUnique({
        where: {
          userId_questId: { userId, questId: quest.id },
        },
      });

      if (!userQuest) {
        // Create new user quest entry
        userQuest = await this.prisma.userQuest.create({
          data: {
            userId,
            questId: quest.id,
            currentProgress: 0,
            status: QuestStatus.IN_PROGRESS,
          },
        });
      }

      // Skip if already completed
      if (userQuest.status === QuestStatus.COMPLETED) {
        continue;
      }

      // Update progress
      const newProgress = Math.min(
        userQuest.currentProgress + increment,
        quest.targetValue
      );

      const isCompleted = newProgress >= quest.targetValue;

      // Update the user quest
      const updated = await this.prisma.userQuest.update({
        where: { id: userQuest.id },
        data: {
          currentProgress: newProgress,
          status: isCompleted ? QuestStatus.COMPLETED : QuestStatus.IN_PROGRESS,
          completedAt: isCompleted ? new Date() : null,
        },
      });

      // If quest completed, award XP and optionally badge
      if (isCompleted) {
        // Award XP
        await this.awardXP(
          userId,
          quest.xpReward,
          XPReason.QUEST_COMPLETE,
          quest.id
        );

        // Award badge if specified
        let badgeAwarded: string | undefined;
        if (quest.badgeReward) {
          const badge = await this.checkAndAwardBadge(
            userId,
            quest.badgeReward as BadgeTypeKey
          );
          if (badge) {
            badgeAwarded = quest.badgeReward;
          }
        }

        completedQuests.push({
          questId: quest.id,
          questTitle: quest.title,
          xpAwarded: quest.xpReward,
          badgeAwarded,
        });
      }

      // Add to updated quests list
      updatedQuests.push({
        id: updated.id,
        quest: {
          id: quest.id,
          key: quest.key,
          title: quest.title,
          description: quest.description,
          type: quest.type,
          frequency: quest.frequency,
          targetValue: quest.targetValue,
          xpReward: quest.xpReward,
          badgeReward: quest.badgeReward,
        },
        currentProgress: updated.currentProgress,
        status: updated.status,
        progressPercentage: Math.round(
          (updated.currentProgress / quest.targetValue) * 100
        ),
        startedAt: updated.startedAt,
        completedAt: updated.completedAt,
        timeRemaining: this.calculateTimeRemaining(
          quest.frequency,
          updated.lastResetAt
        ),
      });
    }

    return { updatedQuests, completedQuests };
  }

  /**
   * Get active quests for user with progress
   */
  async getActiveQuests(userId: string): Promise<UserQuestWithDetails[]> {
    // Reset any expired quests first
    await this.resetExpiredQuests(userId);

    // Get all active quest definitions
    const quests = await this.prisma.quest.findMany({
      where: { isActive: true },
      orderBy: [{ frequency: 'asc' }, { xpReward: 'desc' }],
    });

    const result: UserQuestWithDetails[] = [];

    for (const quest of quests) {
      // Get user's progress on this quest
      let userQuest = await this.prisma.userQuest.findUnique({
        where: {
          userId_questId: { userId, questId: quest.id },
        },
      });

      // If no user quest exists, create one
      if (!userQuest) {
        userQuest = await this.prisma.userQuest.create({
          data: {
            userId,
            questId: quest.id,
            currentProgress: 0,
            status: QuestStatus.IN_PROGRESS,
          },
        });
      }

      result.push({
        id: userQuest.id,
        quest: {
          id: quest.id,
          key: quest.key,
          title: quest.title,
          description: quest.description,
          type: quest.type,
          frequency: quest.frequency,
          targetValue: quest.targetValue,
          xpReward: quest.xpReward,
          badgeReward: quest.badgeReward,
        },
        currentProgress: userQuest.currentProgress,
        status: userQuest.status,
        progressPercentage: Math.round(
          (userQuest.currentProgress / quest.targetValue) * 100
        ),
        startedAt: userQuest.startedAt,
        completedAt: userQuest.completedAt,
        timeRemaining: this.calculateTimeRemaining(
          quest.frequency,
          userQuest.lastResetAt
        ),
      });
    }

    return result;
  }

  /**
   * Reset expired daily/weekly quests
   */
  async resetExpiredQuests(userId: string): Promise<void> {
    const now = new Date();

    // Get user's quests with their quest definitions
    const userQuests = await this.prisma.userQuest.findMany({
      where: { userId },
      include: { quest: true },
    });

    for (const userQuest of userQuests) {
      const quest = userQuest.quest;
      let shouldReset = false;

      if (quest.frequency === QuestFrequency.DAILY) {
        // Reset if last reset was before today
        const lastReset = userQuest.lastResetAt || userQuest.startedAt;
        const lastResetDate = new Date(lastReset);
        lastResetDate.setHours(0, 0, 0, 0);

        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        shouldReset = lastResetDate.getTime() < today.getTime();
      } else if (quest.frequency === QuestFrequency.WEEKLY) {
        // Reset if last reset was more than 7 days ago
        const lastReset = userQuest.lastResetAt || userQuest.startedAt;
        const daysSinceReset = Math.floor(
          (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24)
        );
        shouldReset = daysSinceReset >= 7;
      }
      // Monthly and One-time quests don't reset automatically

      if (shouldReset && userQuest.status !== QuestStatus.EXPIRED) {
        await this.prisma.userQuest.update({
          where: { id: userQuest.id },
          data: {
            currentProgress: 0,
            status: QuestStatus.IN_PROGRESS,
            lastResetAt: now,
            completedAt: null,
          },
        });
      }
    }
  }

  // ============================================
  // LEADERBOARD METHODS
  // ============================================

  /**
   * Get global XP leaderboard
   */
  async getGlobalLeaderboard(
    limit: number = 10,
    currentUserId?: string
  ): Promise<LeaderboardResponse> {
    // Get top users by XP
    const topUsers = await this.prisma.userProgress.findMany({
      take: limit,
      orderBy: { totalXP: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
    });

    // Get total user count
    const totalUsers = await this.prisma.userProgress.count();

    // Get badge counts for each user
    const entries: LeaderboardEntry[] = await Promise.all(
      topUsers.map(async (up, index) => {
        const badgeCount = await this.prisma.userBadge.count({
          where: { userId: up.userId },
        });

        return {
          rank: index + 1,
          userId: up.userId,
          userName: `${up.user.firstName} ${up.user.lastName}`,
          profilePicture: up.user.profilePicture || undefined,
          totalXP: up.totalXP,
          level: up.currentLevel,
          badgeCount,
          isCurrentUser: currentUserId ? up.userId === currentUserId : false,
        };
      })
    );

    // Get current user's rank if provided
    let currentUserRank: number | undefined;
    if (currentUserId) {
      const userRank = await this.getUserRank(currentUserId);
      currentUserRank = userRank.rank;
    }

    return {
      entries,
      currentUserRank,
      totalUsers,
    };
  }

  /**
   * Get course-specific leaderboard
   */
  async getCourseLeaderboard(
    courseId: string,
    limit: number = 10,
    currentUserId?: string
  ): Promise<LeaderboardResponse> {
    // Get enrolled students with their progress
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        courseId,
        status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            userProgress: true,
          },
        },
      },
      orderBy: { progress: 'desc' },
      take: limit,
    });

    // Get total enrolled students
    const totalUsers = await this.prisma.enrollment.count({
      where: {
        courseId,
        status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
      },
    });

    // Build entries sorted by course progress and XP
    const entriesWithXP = await Promise.all(
      enrollments.map(async enrollment => {
        const badgeCount = await this.prisma.userBadge.count({
          where: { userId: enrollment.studentId },
        });

        return {
          progress: enrollment.progress,
          userId: enrollment.studentId,
          userName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
          profilePicture: enrollment.student.profilePicture || undefined,
          totalXP: enrollment.student.userProgress?.totalXP || 0,
          level: enrollment.student.userProgress?.currentLevel || 1,
          badgeCount,
          isCurrentUser: currentUserId
            ? enrollment.studentId === currentUserId
            : false,
        };
      })
    );

    // Sort by progress first, then XP
    entriesWithXP.sort((a, b) => {
      if (b.progress !== a.progress) return b.progress - a.progress;
      return b.totalXP - a.totalXP;
    });

    // Add ranks
    const entries: LeaderboardEntry[] = entriesWithXP.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    // Get current user's rank in this course
    let currentUserRank: number | undefined;
    if (currentUserId) {
      const userIndex = entries.findIndex(e => e.userId === currentUserId);
      currentUserRank = userIndex !== -1 ? userIndex + 1 : undefined;
    }

    return {
      entries,
      currentUserRank,
      totalUsers,
    };
  }

  /**
   * Get user's rank in global leaderboard
   */
  async getUserRank(userId: string): Promise<{ rank: number; total: number }> {
    // Get user's XP
    const userProgress = await this.prisma.userProgress.findUnique({
      where: { userId },
    });

    if (!userProgress) {
      return { rank: 0, total: 0 };
    }

    // Count users with more XP
    const usersAhead = await this.prisma.userProgress.count({
      where: {
        totalXP: { gt: userProgress.totalXP },
      },
    });

    const total = await this.prisma.userProgress.count();

    return {
      rank: usersAhead + 1,
      total,
    };
  }

  // ============================================
  // DAILY LOGIN
  // ============================================

  /**
   * Award daily login XP (only once per calendar day)
   */
  async awardDailyLoginXP(userId: string): Promise<AwardXPResult | null> {
    // Check if user already received daily login XP today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingDailyXP = await this.prisma.xPActivity.findFirst({
      where: {
        userId,
        reason: XPReason.DAILY_LOGIN,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingDailyXP) {
      // Already awarded today
      return null;
    }

    // Award daily login XP
    const result = await this.awardXP(
      userId,
      XP_AMOUNTS.DAILY_LOGIN,
      XPReason.DAILY_LOGIN
    );

    // Also update login streak quest if exists
    await this.updateQuestProgress(userId, QuestType.LOGIN_STREAK);

    return result;
  }

  /**
   * Check all relevant badges after an action
   */
  async checkAllBadges(userId: string): Promise<UserBadge[]> {
    const awardedBadges: UserBadge[] = [];
    const allBadgeKeys: BadgeTypeKey[] = [
      'FIRST_COURSE_COMPLETE',
      'FIVE_COURSES_COMPLETE',
      'TEN_COURSES_COMPLETE',
      'STREAK_7_DAYS',
      'STREAK_30_DAYS',
      'STREAK_100_DAYS',
      'QUIZ_MASTER',
      'TOP_REVIEWER',
    ];

    for (const badgeKey of allBadgeKeys) {
      const badge = await this.checkAndAwardBadge(userId, badgeKey);
      if (badge) {
        awardedBadges.push(badge);
      }
    }

    return awardedBadges;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Calculate time remaining until quest resets
   * @private
   */
  private calculateTimeRemaining(
    frequency: QuestFrequency,
    lastResetAt: Date | null
  ): number | undefined {
    if (
      frequency === QuestFrequency.ONE_TIME ||
      frequency === QuestFrequency.MONTHLY
    ) {
      return undefined;
    }

    const now = new Date();

    if (frequency === QuestFrequency.DAILY) {
      // Time until midnight
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow.getTime() - now.getTime();
    }

    if (frequency === QuestFrequency.WEEKLY) {
      // Time until 7 days from last reset
      const baseDate = lastResetAt || now;
      const resetDate = new Date(baseDate);
      resetDate.setDate(resetDate.getDate() + 7);
      resetDate.setHours(0, 0, 0, 0);
      return Math.max(0, resetDate.getTime() - now.getTime());
    }

    return undefined;
  }

  /**
   * Check if badge criteria is met
   * @private
   */
  private async checkBadgeCriteria(
    userId: string,
    badgeKey: BadgeTypeKey
  ): Promise<boolean> {
    switch (badgeKey) {
      case 'FIRST_COURSE_COMPLETE':
        return this.checkCoursesCompleted(
          userId,
          BADGE_CRITERIA.FIRST_COURSE_COMPLETE.coursesCompleted
        );

      case 'FIVE_COURSES_COMPLETE':
        return this.checkCoursesCompleted(
          userId,
          BADGE_CRITERIA.FIVE_COURSES_COMPLETE.coursesCompleted
        );

      case 'TEN_COURSES_COMPLETE':
        return this.checkCoursesCompleted(
          userId,
          BADGE_CRITERIA.TEN_COURSES_COMPLETE.coursesCompleted
        );

      case 'STREAK_7_DAYS':
        return this.checkStreakDays(
          userId,
          BADGE_CRITERIA.STREAK_7_DAYS.streakDays
        );

      case 'STREAK_30_DAYS':
        return this.checkStreakDays(
          userId,
          BADGE_CRITERIA.STREAK_30_DAYS.streakDays
        );

      case 'STREAK_100_DAYS':
        return this.checkStreakDays(
          userId,
          BADGE_CRITERIA.STREAK_100_DAYS.streakDays
        );

      case 'QUIZ_MASTER':
        return this.checkQuizzesPassed(
          userId,
          BADGE_CRITERIA.QUIZ_MASTER.quizzesPassed
        );

      case 'TOP_REVIEWER':
        return this.checkReviewsWritten(
          userId,
          BADGE_CRITERIA.TOP_REVIEWER.reviewsWritten
        );

      default:
        return false;
    }
  }

  /**
   * Check if user has completed required number of courses
   * @private
   */
  private async checkCoursesCompleted(
    userId: string,
    requiredCount: number
  ): Promise<boolean> {
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
  private async checkStreakDays(
    userId: string,
    requiredDays: number
  ): Promise<boolean> {
    const userProgress = await this.prisma.userProgress.findUnique({
      where: { userId },
    });
    return (userProgress?.currentStreak ?? 0) >= requiredDays;
  }

  /**
   * Check if user has passed required number of quizzes
   * @private
   */
  private async checkQuizzesPassed(
    userId: string,
    requiredCount: number
  ): Promise<boolean> {
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
  private async checkReviewsWritten(
    userId: string,
    requiredCount: number
  ): Promise<boolean> {
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

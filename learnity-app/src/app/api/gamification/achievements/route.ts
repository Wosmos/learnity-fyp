/**
 * Achievements API Route
 * GET /api/gamification/achievements - Get all achievements with unlock status
 */

import { NextRequest, NextResponse } from 'next/server';
import { EnrollmentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import {
  createSuccessResponse,
  createErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

// Badge type keys
type BadgeTypeKey =
  | 'FIRST_COURSE_COMPLETE'
  | 'FIVE_COURSES_COMPLETE'
  | 'TEN_COURSES_COMPLETE'
  | 'STREAK_7_DAYS'
  | 'STREAK_30_DAYS'
  | 'STREAK_100_DAYS'
  | 'QUIZ_MASTER'
  | 'TOP_REVIEWER';

// Achievement definitions with metadata
const ACHIEVEMENT_DEFINITIONS: Record<
  BadgeTypeKey,
  {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    xpReward: number;
    rarity: string;
    criteria: { type: string; target: number };
  }
> = {
  // Learning Milestones
  FIRST_COURSE_COMPLETE: {
    id: 'FIRST_COURSE_COMPLETE',
    name: 'First Steps',
    description: 'Complete your first course',
    icon: '🎓',
    category: 'learning',
    xpReward: 50,
    rarity: 'common',
    criteria: { type: 'courses_completed', target: 1 },
  },
  FIVE_COURSES_COMPLETE: {
    id: 'FIVE_COURSES_COMPLETE',
    name: 'Dedicated Learner',
    description: 'Complete 5 courses',
    icon: '📚',
    category: 'learning',
    xpReward: 150,
    rarity: 'uncommon',
    criteria: { type: 'courses_completed', target: 5 },
  },
  TEN_COURSES_COMPLETE: {
    id: 'TEN_COURSES_COMPLETE',
    name: 'Knowledge Seeker',
    description: 'Complete 10 courses',
    icon: '🏆',
    category: 'learning',
    xpReward: 300,
    rarity: 'rare',
    criteria: { type: 'courses_completed', target: 10 },
  },

  // Streak Achievements
  STREAK_7_DAYS: {
    id: 'STREAK_7_DAYS',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    category: 'streak',
    xpReward: 25,
    rarity: 'common',
    criteria: { type: 'streak_days', target: 7 },
  },
  STREAK_30_DAYS: {
    id: 'STREAK_30_DAYS',
    name: 'Monthly Master',
    description: 'Maintain a 30-day learning streak',
    icon: '⚡',
    category: 'streak',
    xpReward: 100,
    rarity: 'rare',
    criteria: { type: 'streak_days', target: 30 },
  },
  STREAK_100_DAYS: {
    id: 'STREAK_100_DAYS',
    name: 'Century Champion',
    description: 'Maintain a 100-day learning streak',
    icon: '💎',
    category: 'streak',
    xpReward: 500,
    rarity: 'legendary',
    criteria: { type: 'streak_days', target: 100 },
  },

  // Quiz Achievements
  QUIZ_MASTER: {
    id: 'QUIZ_MASTER',
    name: 'Quiz Master',
    description: 'Pass 50 quizzes',
    icon: '🧠',
    category: 'quiz',
    xpReward: 200,
    rarity: 'epic',
    criteria: { type: 'quizzes_passed', target: 50 },
  },

  // Community Achievements
  TOP_REVIEWER: {
    id: 'TOP_REVIEWER',
    name: 'Top Reviewer',
    description: 'Write 10 course reviews',
    icon: '⭐',
    category: 'community',
    xpReward: 100,
    rarity: 'uncommon',
    criteria: { type: 'reviews_written', target: 10 },
  },
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const authResult = await authMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.firebaseUid },
      select: { id: true },
    });

    if (!dbUser) {
      return createErrorResponse(
        'USER_NOT_FOUND',
        'User not found in database',
        undefined,
        401
      );
    }

    const userId = dbUser.id;

    // Get user's earned badges
    const earnedBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badgeDefinition: true },
    });
    const earnedBadgeKeys = new Set(
      earnedBadges.map(b => b.badgeDefinition.key)
    );

    // Get user stats for progress calculation
    const [completedCourses, userProgress, passedQuizzes, reviewsWritten] =
      await Promise.all([
        prisma.enrollment.count({
          where: { studentId: userId, status: EnrollmentStatus.COMPLETED },
        }),
        prisma.userProgress.findUnique({ where: { userId } }),
        prisma.quizAttempt.findMany({
          where: { studentId: userId, passed: true },
          distinct: ['quizId'],
        }),
        prisma.review.count({ where: { studentId: userId } }),
      ]);

    // Calculate progress for each achievement
    const achievements = Object.entries(ACHIEVEMENT_DEFINITIONS).map(
      ([key, def]) => {
        const badgeKey = key as BadgeTypeKey;
        const earnedBadge = earnedBadges.find(
          b => b.badgeDefinition.key === badgeKey
        );
        const unlocked = earnedBadgeKeys.has(badgeKey);

        // Calculate current progress
        let currentProgress = 0;
        switch (def.criteria.type) {
          case 'courses_completed':
            currentProgress = completedCourses;
            break;
          case 'streak_days':
            currentProgress = Math.max(
              userProgress?.currentStreak || 0,
              userProgress?.longestStreak || 0
            );
            break;
          case 'quizzes_passed':
            currentProgress = passedQuizzes.length;
            break;
          case 'reviews_written':
            currentProgress = reviewsWritten;
            break;
        }

        return {
          ...def,
          unlocked,
          unlockedAt: earnedBadge?.earnedAt || null,
          progress: {
            current: Math.min(currentProgress, def.criteria.target),
            target: def.criteria.target,
            percentage: Math.min(
              100,
              Math.round((currentProgress / def.criteria.target) * 100)
            ),
          },
        };
      }
    );

    // Group by category
    const achievementsByCategory = {
      learning: achievements.filter(a => a.category === 'learning'),
      streak: achievements.filter(a => a.category === 'streak'),
      quiz: achievements.filter(a => a.category === 'quiz'),
      community: achievements.filter(a => a.category === 'community'),
    };

    // Stats summary
    const totalAchievements = achievements.length;
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalXPFromAchievements = achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.xpReward, 0);

    return createSuccessResponse({
      achievements,
      achievementsByCategory,
      stats: {
        total: totalAchievements,
        unlocked: unlockedCount,
        locked: totalAchievements - unlockedCount,
        completionPercentage: Math.round(
          (unlockedCount / totalAchievements) * 100
        ),
        totalXPEarned: totalXPFromAchievements,
      },
    });
  } catch (error) {
    console.error('[GET /api/gamification/achievements] Error:', error);
    return createInternalErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch achievements'
    );
  }
}

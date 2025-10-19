import { prisma } from './prisma'
import { ActivityType } from '@prisma/client'

export interface XPReward {
  type: ActivityType
  baseXP: number
  description: string
}

export const XP_REWARDS: Record<ActivityType, XPReward> = {
  LOGIN: {
    type: 'LOGIN',
    baseXP: 5,
    description: 'Daily login bonus'
  },
  LESSON_COMPLETE: {
    type: 'LESSON_COMPLETE',
    baseXP: 15,
    description: 'Completed a lesson'
  },
  HELP_PEER: {
    type: 'HELP_PEER',
    baseXP: 20,
    description: 'Helped a fellow student'
  },
  SESSION_ATTEND: {
    type: 'SESSION_ATTEND',
    baseXP: 30,
    description: 'Attended tutoring session'
  },
  GROUP_JOIN: {
    type: 'GROUP_JOIN',
    baseXP: 10,
    description: 'Joined a study group'
  },
  STREAK_MILESTONE: {
    type: 'STREAK_MILESTONE',
    baseXP: 50,
    description: 'Reached streak milestone'
  }
}

export function calculateLevel(totalXP: number): number {
  // Level formula: level = floor(sqrt(totalXP / 100))
  return Math.floor(Math.sqrt(totalXP / 100)) + 1
}

export function getXPForNextLevel(currentLevel: number): number {
  // XP needed for next level: (level)^2 * 100
  return Math.pow(currentLevel, 2) * 100
}

export function calculateStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0
  if (streak >= 14) return 1.5
  if (streak >= 7) return 1.3
  if (streak >= 3) return 1.1
  return 1.0
}

export async function awardXP(
  userId: string, 
  activityType: ActivityType, 
  metadata?: any
): Promise<{
  xpEarned: number
  levelUp: boolean
  newLevel: number
  streakMaintained: boolean
  newStreak: number
}> {
  const reward = XP_REWARDS[activityType]
  
  // Get current user progress
  let userProgress = await prisma.userProgress.findUnique({
    where: { userId }
  })

  if (!userProgress) {
    // Create initial progress
    userProgress = await prisma.userProgress.create({
      data: {
        userId,
        totalXP: 0,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
      }
    })
  }

  const currentLevel = userProgress.currentLevel
  const streakMultiplier = calculateStreakMultiplier(userProgress.currentStreak)
  const xpEarned = Math.floor(reward.baseXP * streakMultiplier)

  // Check if this is a daily activity for streak
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const lastActivity = new Date(userProgress.lastActivity)
  lastActivity.setHours(0, 0, 0, 0)
  
  const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
  
  let newStreak = userProgress.currentStreak
  let streakMaintained = false
  
  // Update streak for daily activities
  if ([ActivityType.LOGIN, ActivityType.LESSON_COMPLETE].includes(activityType)) {
    if (daysDiff === 0) {
      // Same day, no streak change
      streakMaintained = false
    } else if (daysDiff === 1) {
      // Next day, continue streak
      newStreak = userProgress.currentStreak + 1
      streakMaintained = true
    } else {
      // Streak broken, reset to 1
      newStreak = 1
      streakMaintained = false
    }
  }

  const newTotalXP = userProgress.totalXP + xpEarned
  const newLevel = calculateLevel(newTotalXP)
  const levelUp = newLevel > currentLevel

  // Update user progress
  await prisma.userProgress.update({
    where: { userId },
    data: {
      totalXP: newTotalXP,
      currentLevel: newLevel,
      currentStreak: newStreak,
      longestStreak: Math.max(userProgress.longestStreak, newStreak),
      lastActivity: new Date(),
    }
  })

  // Record activity
  await prisma.activity.create({
    data: {
      userId,
      type: activityType,
      xpEarned,
      metadata: metadata || {}
    }
  })

  // Check for streak milestones and award badges
  if (streakMaintained && [7, 14, 30, 100, 365].includes(newStreak)) {
    await awardStreakBadge(userId, newStreak)
  }

  // Award level up badge
  if (levelUp) {
    await awardLevelBadge(userId, newLevel)
  }

  return {
    xpEarned,
    levelUp,
    newLevel,
    streakMaintained,
    newStreak
  }
}

async function awardStreakBadge(userId: string, streak: number) {
  const badgeName = `${streak}-day-streak`
  
  // Check if badge exists
  let badge = await prisma.badge.findUnique({
    where: { name: badgeName }
  })

  if (!badge) {
    // Create badge if it doesn't exist
    badge = await prisma.badge.create({
      data: {
        name: badgeName,
        description: `Maintained a ${streak}-day learning streak`,
        icon: '🔥',
        category: 'streak',
        xpReward: streak * 2
      }
    })
  }

  // Award badge to user (if not already earned)
  await prisma.userBadge.upsert({
    where: {
      userId_badgeId: {
        userId,
        badgeId: badge.id
      }
    },
    update: {},
    create: {
      userId,
      badgeId: badge.id
    }
  })
}

async function awardLevelBadge(userId: string, level: number) {
  const badgeName = `level-${level}`
  
  let badge = await prisma.badge.findUnique({
    where: { name: badgeName }
  })

  if (!badge) {
    badge = await prisma.badge.create({
      data: {
        name: badgeName,
        description: `Reached level ${level}`,
        icon: '⭐',
        category: 'level',
        xpReward: level * 10
      }
    })
  }

  await prisma.userBadge.upsert({
    where: {
      userId_badgeId: {
        userId,
        badgeId: badge.id
      }
    },
    update: {},
    create: {
      userId,
      badgeId: badge.id
    }
  })
}

export async function getUserProgress(userId: string) {
  const progress = await prisma.userProgress.findUnique({
    where: { userId },
    include: {
      user: {
        include: {
          badges: {
            include: {
              badge: true
            }
          }
        }
      }
    }
  })

  if (!progress) {
    return null
  }

  const xpForNextLevel = getXPForNextLevel(progress.currentLevel)
  const xpForCurrentLevel = progress.currentLevel > 1 ? getXPForNextLevel(progress.currentLevel - 1) : 0
  const progressToNextLevel = ((progress.totalXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100

  return {
    ...progress,
    xpForNextLevel,
    progressToNextLevel: Math.min(progressToNextLevel, 100)
  }
}
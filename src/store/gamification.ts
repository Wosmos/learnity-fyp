import { create } from 'zustand'
import { ActivityType } from '@prisma/client'

interface UserProgress {
  totalXP: number
  currentLevel: number
  currentStreak: number
  longestStreak: number
  xpForNextLevel: number
  progressToNextLevel: number
}

interface GamificationState {
  userProgress: UserProgress | null
  isLoading: boolean
  notifications: GamificationNotification[]
  
  // Actions
  setUserProgress: (progress: UserProgress) => void
  addNotification: (notification: GamificationNotification) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  awardXP: (activityType: ActivityType, metadata?: any) => Promise<void>
}

interface GamificationNotification {
  id: string
  type: 'xp' | 'levelUp' | 'streak' | 'badge'
  title: string
  description: string
  xpAmount?: number
  level?: number
  streak?: number
  badge?: string
  timestamp: Date
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  userProgress: null,
  isLoading: false,
  notifications: [],

  setUserProgress: (progress) => set({ userProgress: progress }),

  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, notification]
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  clearNotifications: () => set({ notifications: [] }),

  awardXP: async (activityType, metadata) => {
    try {
      const response = await fetch('/api/gamification/award-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityType, metadata })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update progress
        get().setUserProgress(result.progress)
        
        // Add notifications
        if (result.xpEarned > 0) {
          get().addNotification({
            id: Date.now().toString(),
            type: 'xp',
            title: `+${result.xpEarned} XP`,
            description: 'Experience points earned!',
            xpAmount: result.xpEarned,
            timestamp: new Date()
          })
        }

        if (result.levelUp) {
          get().addNotification({
            id: (Date.now() + 1).toString(),
            type: 'levelUp',
            title: 'Level Up!',
            description: `You reached level ${result.newLevel}!`,
            level: result.newLevel,
            timestamp: new Date()
          })
        }

        if (result.streakMaintained) {
          get().addNotification({
            id: (Date.now() + 2).toString(),
            type: 'streak',
            title: 'Streak Maintained!',
            description: `${result.newStreak} day streak! 🔥`,
            streak: result.newStreak,
            timestamp: new Date()
          })
        }
      }
    } catch (error) {
      console.error('Failed to award XP:', error)
    }
  }
}))
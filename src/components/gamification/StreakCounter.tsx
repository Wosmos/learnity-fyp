'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
  animated?: boolean
}

export function StreakCounter({ 
  currentStreak, 
  longestStreak, 
  animated = true 
}: StreakCounterProps) {
  const t = useTranslations('dashboard')

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="text-3xl"
            animate={animated && currentStreak > 0 ? { 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            } : {}}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              repeatDelay: 2
            }}
          >
            🔥
          </motion.div>
          <div>
            <motion.div
              className="text-2xl font-bold text-gamification-streak"
              animate={animated ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {currentStreak}
            </motion.div>
            <div className="text-sm text-gray-600">
              {t('currentStreak')}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-700">
            {longestStreak}
          </div>
          <div className="text-xs text-gray-500">
            {t('longestStreak')}
          </div>
        </div>
      </div>
      
      {currentStreak > 0 && (
        <div className="mt-3 pt-3 border-t border-orange-200">
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(currentStreak, 7) }).map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gamification-streak rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            ))}
            {currentStreak > 7 && (
              <span className="text-xs text-gray-500 ml-1">
                +{currentStreak - 7}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
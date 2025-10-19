'use client'

import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { useTranslations } from 'next-intl'

interface XPBarProps {
  currentXP: number
  totalXP: number
  level: number
  progressToNextLevel: number
  animated?: boolean
}

export function XPBar({ 
  currentXP, 
  totalXP, 
  level, 
  progressToNextLevel, 
  animated = true 
}: XPBarProps) {
  const t = useTranslations('gamification')

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"></div>     <motion.div
            className="bg-gradient-to-r from-gamification-level to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
            animate={animated ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {level}
          </motion.div>
          <span className="text-sm font-medium text-gray-600">
            Level {level}
          </span>
        </div>
        <div className="text-right">
          <motion.div
            className="text-lg font-bold text-gamification-xp"
            animate={animated ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.6 }}
          >
            {totalXP.toLocaleString()} XP
          </motion.div>
          <div className="text-xs text-gray-500">
            {currentXP} / {(currentXP + (100 - progressToNextLevel) * currentXP / progressToNextLevel).toFixed(0)} XP
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress 
          value={progressToNextLevel} 
          className="h-3 bg-gray-100"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Level {level}</span>
          <span>{progressToNextLevel.toFixed(1)}%</span>
          <span>Level {level + 1}</span>
        </div>
      </div>
    </div>
  )
}
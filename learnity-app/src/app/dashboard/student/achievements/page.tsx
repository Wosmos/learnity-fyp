'use client';

/**
 * Student Achievements Page
 * Gamification hub with badges, XP, levels, and streaks
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Flame,
  Zap,
  Lock,
  CheckCircle,
  TrendingUp,
  Calendar,
  BookOpen,
  Brain,
  Users,
  Sparkles,
  Crown,
  Award,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { EliteStreakCard } from '@/components/students/StreaksCard';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  rarity: string;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
}

interface GamificationData {
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: string | null;
  badges: Array<{ id: string; type: string; unlockedAt: string }>;
  badgesWithMetadata: Array<{
    badge: { id: string; type: string; unlockedAt: string };
    name: string;
    description: string;
    icon: string;
  }>;
  xpBreakdown: Array<{ reason: string; totalXP: number; count: number }>;
  weeklyXP: Array<{ date: string; xp: number }>;
  recentXPActivities: Array<{
    id: string;
    amount: number;
    reason: string;
    createdAt: string;
  }>;
}

interface AchievementsData {
  achievements: Achievement[];
  achievementsByCategory: {
    learning: Achievement[];
    streak: Achievement[];
    quiz: Achievement[];
    community: Achievement[];
  };
  stats: {
    total: number;
    unlocked: number;
    locked: number;
    completionPercentage: number;
    totalXPEarned: number;
  };
}

const rarityColors = {
  common: 'from-slate-400 to-slate-500',
  uncommon: 'from-emerald-400 to-emerald-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 to-orange-500',
};

const rarityBorders = {
  common: 'border-slate-200',
  uncommon: 'border-emerald-200',
  rare: 'border-blue-200',
  epic: 'border-purple-200',
  legendary: 'border-amber-200',
};

const xpReasonLabels: Record<string, string> = {
  LESSON_COMPLETE: 'Lessons',
  QUIZ_PASS: 'Quizzes',
  COURSE_COMPLETE: 'Courses',
  DAILY_LOGIN: 'Daily Login',
  STREAK_BONUS: 'Streak Bonus',
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const isUnlocked = achievement.unlocked;
  const rarity = achievement.rarity as keyof typeof rarityColors;

  return (
    <motion.div
      whileHover={{ scale: isUnlocked ? 1.02 : 1, y: isUnlocked ? -4 : 0 }}
      className={cn(
        'relative p-5 rounded-2xl border-2 transition-all',
        isUnlocked
          ? `bg-white shadow-lg ${rarityBorders[rarity]}`
          : 'bg-slate-50/50 border-slate-100 opacity-60'
      )}
    >
      {/* Rarity Glow for Unlocked */}
      {isUnlocked && (
        <div
          className={cn(
            'absolute inset-0 rounded-2xl opacity-10 bg-gradient-to-br',
            rarityColors[rarity]
          )}
        />
      )}

      <div className='relative'>
        {/* Icon & Status */}
        <div className='flex items-start justify-between mb-4'>
          <div
            className={cn(
              'text-4xl p-3 rounded-xl',
              isUnlocked ? 'bg-white shadow-sm' : 'bg-slate-100 grayscale'
            )}
          >
            {achievement.icon}
          </div>
          {isUnlocked ? (
            <Badge className='bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]'>
              <CheckCircle className='h-3 w-3 mr-1' />
              Unlocked
            </Badge>
          ) : (
            <Lock className='h-4 w-4 text-slate-300' />
          )}
        </div>

        {/* Info */}
        <h4
          className={cn(
            'font-bold mb-1',
            isUnlocked ? 'text-slate-900' : 'text-slate-400'
          )}
        >
          {achievement.name}
        </h4>
        <p
          className={cn(
            'text-xs mb-3',
            isUnlocked ? 'text-slate-500' : 'text-slate-400'
          )}
        >
          {achievement.description}
        </p>

        {/* Progress or Reward */}
        {isUnlocked ? (
          <div className='flex items-center gap-2'>
            <Zap className='h-3 w-3 text-amber-500' />
            <span className='text-xs font-bold text-amber-600'>
              +{achievement.xpReward} XP earned
            </span>
          </div>
        ) : (
          <div className='space-y-2'>
            <Progress
              value={achievement.progress.percentage}
              className='h-1.5'
            />
            <div className='flex items-center justify-between text-[10px]'>
              <span className='text-slate-400'>
                {achievement.progress.current}/{achievement.progress.target}
              </span>
              <span className='font-bold text-slate-500'>
                {achievement.progress.percentage}%
              </span>
            </div>
          </div>
        )}

        {/* Rarity Badge */}
        <div className='absolute top-4 right-4'>
          <span
            className={cn(
              'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full',
              isUnlocked
                ? `bg-gradient-to-r ${rarityColors[rarity]} text-white`
                : 'bg-slate-200 text-slate-400'
            )}
          >
            {achievement.rarity}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function AchievementsPage() {
  const api = useAuthenticatedApi();

  const [gamificationData, setGamificationData] =
    useState<GamificationData | null>(null);
  const [achievementsData, setAchievementsData] =
    useState<AchievementsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [gamificationRes, achievementsRes] = await Promise.all([
        api.get('/api/gamification/progress'),
        api.get('/api/gamification/achievements'),
      ]);

      setGamificationData(gamificationRes.data);
      setAchievementsData(achievementsRes.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load achievements';
      // If Forbidden, treat as empty results to avoid breaking the UI for newly registered users
      if (message.includes('Forbidden')) {
        console.warn(
          '[AchievementsPage] Access forbidden, showing empty state'
        );
        // Setting both as null or empty to prevent the error screen
        setGamificationData(null);
        setAchievementsData({
          achievements: [],
          achievementsByCategory: {
            learning: [],
            streak: [],
            quiz: [],
            community: [],
          },
          stats: {
            total: 0,
            unlocked: 0,
            locked: 0,
            completionPercentage: 0,
            totalXPEarned: 0,
          },
        });
      } else {
        setError(message);
      }
      console.error('[AchievementsPage] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className='flex-1 bg-slate-50 min-h-screen'>
        <div className='max-w-[1400px] mx-auto px-6 lg:px-10 py-10'>
          <Skeleton className='h-10 w-64 mb-8' />
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10'>
            <Skeleton className='h-48 rounded-2xl lg:col-span-2' />
            <Skeleton className='h-48 rounded-2xl' />
          </div>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className='h-48 rounded-2xl' />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex-1 bg-slate-50 min-h-screen flex items-center justify-center'>
        <Card className='max-w-md'>
          <CardContent className='pt-6 text-center'>
            <AlertCircle className='h-12 w-12 text-red-400 mx-auto mb-4' />
            <h3 className='text-lg font-bold text-slate-900 mb-2'>
              Failed to load achievements
            </h3>
            <p className='text-sm text-slate-500 mb-4'>{error}</p>
            <Button onClick={fetchData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gData = gamificationData;
  const aData = achievementsData;

  // Calculate level progress percentage
  const currentLevelXP = gData?.totalXP || 0;
  const xpForNextLevel = gData?.xpToNextLevel || 100;
  const levelProgress = Math.round(
    (currentLevelXP / (currentLevelXP + xpForNextLevel)) * 100
  );

  // Filter achievements by category
  const filteredAchievements =
    activeCategory === 'all'
      ? aData?.achievements || []
      : aData?.achievementsByCategory[
          activeCategory as keyof typeof aData.achievementsByCategory
        ] || [];

  // Get max XP for chart
  const maxWeeklyXP = Math.max(...(gData?.weeklyXP?.map(d => d.xp) || [1]), 1);

  return (
    <div className='flex-1 bg-slate-50 min-h-screen'>
      {/* Header */}
      <header className='sticky top-0 z-30 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60'>
        <div className='absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-amber-500 via-orange-500 to-red-500 opacity-60' />
        <div className='max-w-[1400px] mx-auto px-6 lg:px-10 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200'>
                <Trophy className='h-6 w-6' />
              </div>
              <div>
                <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
                  Achievements
                </h1>
                <p className='text-sm text-slate-500'>
                  {aData?.stats.unlocked || 0} of {aData?.stats.total || 0}{' '}
                  unlocked
                </p>
              </div>
            </div>
            <Link href='/dashboard/student/progress'>
              <Button variant='outline' className='rounded-xl'>
                <TrendingUp className='h-4 w-4 mr-2' />
                View Progress
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className='max-w-[1400px] mx-auto px-6 lg:px-10 py-10 space-y-10'>
        {/* Level & XP Hero Section */}
        <section className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Level Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='lg:col-span-2'
          >
            <Card className='relative border border-slate-800 bg-slate-950 text-white overflow-hidden rounded-2xl shadow-2xl'>
              {/* Grid Overlay for Technical Feel */}
              <div className='absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05]' />

              <CardContent className='p-8 md:p-10 relative'>
                <div className='relative flex flex-col md:flex-row items-center gap-10'>
                  {/* Level "Core" Visual */}
                  <div className='relative shrink-0'>
                    {/* Animated Background Pulse */}
                    <div className='absolute inset-0 bg-amber-500/20 rounded-full blur-2xl animate-pulse' />

                    <div className='relative w-32 h-32 rounded-full p-1 bg-gradient-to-b from-amber-400 to-slate-900 shadow-[0_0_30px_rgba(251,191,36,0.2)]'>
                      <div className='w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center border border-amber-500/50'>
                        <span className='text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/60 mb-1'>
                          Rank
                        </span>
                        <span className='text-5xl font-black tracking-tighter italic text-white leading-none'>
                          {gData?.currentLevel || 1}
                        </span>
                      </div>
                    </div>

                    {/* Floating Orbitals */}
                    <div className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 border-4 border-slate-950 shadow-lg' />
                  </div>

                  {/* System Intelligence Block */}
                  <div className='flex-1 w-full space-y-6'>
                    <div className='flex justify-between items-end'>
                      <div>
                        <p className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2'>
                          Accumulated Experience
                        </p>
                        <div className='flex items-baseline gap-2'>
                          <span className='text-5xl font-black tracking-tighter text-white'>
                            {gData?.totalXP?.toLocaleString() || 0}
                          </span>
                          <span className='text-sm font-black text-amber-500 uppercase tracking-widest italic'>
                            XP
                          </span>
                        </div>
                      </div>

                      <div className='hidden md:block text-right'>
                        <div className='px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                          Status:{' '}
                          <span className='text-emerald-500'>Optimizing</span>
                        </div>
                      </div>
                    </div>

                    {/* Tactical Progress HUD */}
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <Zap className='h-3 w-3 text-amber-400 fill-amber-400' />
                          <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                            Next Protocol: Lvl {(gData?.currentLevel || 1) + 1}
                          </span>
                        </div>
                        <span className='text-[10px] font-black text-amber-400 uppercase tracking-tighter bg-amber-400/10 px-2 py-0.5 rounded'>
                          -{gData?.xpToNextLevel?.toLocaleString() || 0} XP to
                          Sync
                        </span>
                      </div>

                      {/* The "Power-Up" Bar */}
                      <div className='relative h-4 bg-slate-900 rounded-lg p-1 border border-slate-800 shadow-inner overflow-hidden'>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${levelProgress}%` }}
                          transition={{ duration: 1.5, ease: 'circOut' }}
                          className='relative h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 rounded-sm shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                        >
                          {/* Scanning Light Effect */}
                          <div className='absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]' />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <EliteStreakCard />
          </motion.div>
        </section>

        {/* XP Breakdown & Weekly Activity */}
        <section className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* XP Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className='border-none shadow-sm h-full'>
              <CardHeader className='pb-2'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 rounded-xl bg-purple-50'>
                    <Zap className='h-4 w-4 text-purple-600' />
                  </div>
                  <CardTitle className='text-lg font-bold'>
                    XP Sources
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className='pt-4'>
                <div className='space-y-3'>
                  {(gData?.xpBreakdown || []).map(item => {
                    const totalXP = gData?.totalXP || 1;
                    const percentage = Math.round(
                      (item.totalXP / totalXP) * 100
                    );

                    return (
                      <div key={item.reason} className='space-y-1'>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='font-medium text-slate-700'>
                            {xpReasonLabels[item.reason] || item.reason}
                          </span>
                          <span className='font-bold text-slate-900'>
                            {item.totalXP.toLocaleString()} XP
                          </span>
                        </div>
                        <div className='h-2 bg-slate-100 rounded-full overflow-hidden'>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className='h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full'
                          />
                        </div>
                        <p className='text-[10px] text-slate-400'>
                          {item.count} activities • {percentage}% of total
                        </p>
                      </div>
                    );
                  })}
                  {(!gData?.xpBreakdown || gData.xpBreakdown.length === 0) && (
                    <p className='text-sm text-slate-400 text-center py-4'>
                      Complete activities to earn XP!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly XP Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className='border-none shadow-sm h-full'>
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 rounded-xl bg-indigo-50'>
                      <Calendar className='h-4 w-4 text-indigo-600' />
                    </div>
                    <CardTitle className='text-lg font-bold'>
                      Weekly XP
                    </CardTitle>
                  </div>
                  <Badge variant='secondary' className='text-xs'>
                    Last 7 days
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='pt-4'>
                <div className='flex items-end justify-between gap-2 h-32'>
                  {(gData?.weeklyXP || []).map((day, i) => {
                    const height =
                      day.xp > 0
                        ? Math.max(15, (day.xp / maxWeeklyXP) * 100)
                        : 5;
                    const isToday = i === (gData?.weeklyXP?.length || 0) - 1;

                    return (
                      <div
                        key={day.date}
                        className='flex-1 flex flex-col items-center gap-2'
                      >
                        <span className='text-xs font-bold text-slate-600'>
                          {day.xp > 0 ? `+${day.xp}` : '0'}
                        </span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                          className={cn(
                            'w-full rounded-t-lg',
                            day.xp > 0
                              ? isToday
                                ? 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                                : 'bg-gradient-to-t from-indigo-400 to-indigo-300'
                              : 'bg-slate-100'
                          )}
                        />
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase',
                            isToday ? 'text-indigo-600' : 'text-slate-400'
                          )}
                        >
                          {new Date(day.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Recent Activity */}
        {gData?.recentXPActivities && gData.recentXPActivities.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className='border-slate-200/60 shadow-sm bg-white rounded-[2.5rem] overflow-hidden'>
              <CardHeader className='pb-2 pt-8 px-8'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='p-2.5 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-100'>
                      <Sparkles className='h-4 w-4' />
                    </div>
                    <div>
                      <CardTitle className='text-sm font-black uppercase tracking-[0.2em] text-slate-900'>
                        System{' '}
                        <span className='text-slate-400 font-light italic'>
                          Logs
                        </span>
                      </CardTitle>
                      <p className='text-[9px] font-bold text-slate-400 uppercase tracking-tighter'>
                        Real-time Experience Inflow
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-100'>
                    <div className='h-1 w-1 rounded-full bg-emerald-500 animate-pulse' />
                    <span className='text-[9px] font-black text-slate-500 uppercase tracking-widest'>
                      Active Sync
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='p-8 pt-6'>
                <div className='relative space-y-1'>
                  {/* Vertical Timeline Thread */}
                  <div className='absolute left-[19px] top-2 bottom-2 w-[1px] bg-slate-100' />

                  {gData.recentXPActivities.slice(0, 5).map((activity, i) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className='relative flex items-center justify-between p-3 rounded-2xl transition-all hover:bg-slate-50 group'
                    >
                      <div className='flex items-center gap-4 relative z-10'>
                        {/* Node Icon */}
                        <div className='h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:border-emerald-200 transition-colors'>
                          <Zap
                            className={cn(
                              'h-4 w-4 transition-colors',
                              i === 0
                                ? 'text-emerald-500 fill-emerald-500/20'
                                : 'text-slate-400'
                            )}
                          />
                        </div>

                        <div>
                          <p className='text-xs font-black text-slate-900 uppercase tracking-tight'>
                            {xpReasonLabels[activity.reason] || activity.reason}
                          </p>
                          <div className='flex items-center gap-2 mt-0.5'>
                            <Clock className='h-3 w-3 text-slate-300' />
                            <p className='text-[9px] font-bold text-slate-400 uppercase tracking-tighter'>
                              {new Date(activity.createdAt).toLocaleTimeString(
                                'en-US',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false,
                                }
                              )}{' '}
                              //{' '}
                              {new Date(activity.createdAt).toLocaleDateString(
                                'en-US',
                                { month: 'short', day: 'numeric' }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className='text-right'>
                        <span className='text-sm font-black text-slate-900 tabular-nums'>
                          <span className='text-emerald-500 mr-0.5'>+</span>
                          {activity.amount}
                        </span>
                        <p className='text-[9px] font-black text-slate-300 uppercase tracking-widest'>
                          XP_GAIN
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Action Footer */}
                <button className='w-full mt-6 py-3 rounded-xl border border-dashed border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-slate-600 transition-all'>
                  View Full Activity Manifest
                </button>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Achievements Grid */}
        <section className='space-y-8 mt-12'>
          {/* Header: Tactical Readout */}
          <div className='flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 rounded-2xl bg-slate-900 shadow-xl shadow-slate-200'>
                <Award className='h-5 w-5 text-amber-400' />
              </div>
              <div>
                <h2 className='text-2xl font-black text-slate-900 tracking-tighter uppercase'>
                  Achievement{' '}
                  <span className='text-slate-400 font-light italic'>
                    Vault
                  </span>
                </h2>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1'>
                  System Milestone Tracking // Active
                </p>
              </div>
            </div>

            <div className='flex flex-col items-end gap-2'>
              <div className='flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  Global Completion
                </span>
                <span className='text-sm font-black text-slate-900 tracking-tighter italic'>
                  {aData?.stats.completionPercentage || 0}%
                </span>
              </div>
              <div className='w-48 h-1 bg-slate-100 rounded-full overflow-hidden'>
                <motion.div
                  className='h-full bg-indigo-600'
                  initial={{ width: 0 }}
                  animate={{
                    width: `${aData?.stats.completionPercentage || 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Terminal Tabs */}
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            className='w-full'
          >
            <TabsList className='h-14 bg-slate-50/50 p-1 border border-slate-200/60 rounded-2xl'>
              {[
                {
                  id: 'all',
                  label: 'All',
                  icon: Trophy,
                  count: aData?.stats.total,
                },
                { id: 'learning', label: 'Learning', icon: BookOpen },
                { id: 'streak', label: 'Streaks', icon: Flame },
                { id: 'quiz', label: 'Intelligence', icon: Brain },
                { id: 'community', label: 'Network', icon: Users },
              ].map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className='relative px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm border-transparent data-[state=active]:border-slate-200'
                >
                  <div className='flex items-center gap-2'>
                    <tab.icon className='h-3.5 w-3.5' />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className='ml-1 opacity-40'>[{tab.count}]</span>
                    )}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeCategory} className='mt-8 outline-none'>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                <AnimatePresence mode='popLayout'>
                  {filteredAchievements.map((achievement, i) => (
                    <motion.div
                      key={achievement.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <AchievementCard achievement={achievement} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredAchievements.length === 0 && (
                <div className='flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100'>
                  <div className='relative mb-4'>
                    <Trophy className='h-12 w-12 text-slate-200' />
                    <div className='absolute inset-0 bg-slate-200/20 blur-xl rounded-full' />
                  </div>
                  <p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]'>
                    No Records Found in This Sector
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}

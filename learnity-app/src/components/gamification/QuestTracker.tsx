'use client';

/**
 * QuestTracker Component
 * Displays active quests with progress and rewards
 */

import { useState } from 'react';
import {
  Target,
  Clock,
  Zap,
  CheckCircle,
  Flame,
  BookOpen,
  Brain,
  Star,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { frequencyColors, frequencyLabels, questTypeIcons } from './utils';
import { formatTimeRemaining } from './methods';

interface Quest {
  id: string;
  key: string;
  title: string;
  description: string;
  type: string;
  frequency: string;
  targetValue: number;
  xpReward: number;
  badgeReward?: string | null;
}

interface UserQuestWithDetails {
  id: string;
  quest: Quest;
  currentProgress: number;
  status: string;
  progressPercentage: number;
  startedAt: string;
  completedAt?: string | null;
  timeRemaining?: number;
}

export interface QuestsData {
  quests: UserQuestWithDetails[];
  questsByFrequency: {
    daily: UserQuestWithDetails[];
    weekly: UserQuestWithDetails[];
    monthly: UserQuestWithDetails[];
    oneTime: UserQuestWithDetails[];
  };
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    totalAvailableXP: number;
  };
}

interface QuestTrackerProps {
  /** Show compact version */
  compact?: boolean;
  /** Additional class name */
  className?: string;
  /** Filter by frequency */
  frequency?: 'all' | 'daily' | 'weekly' | 'monthly' | 'oneTime';
  /** Limit number of items shown */
  limit?: number;
  /** Show view all button */
  showViewAll?: boolean;
  /** Callback when view all is clicked */
  onViewAll?: () => void;
  /** Initial Data passed from server */
  initialData?: QuestsData | null;
}

function QuestCard({
  quest,
  compact = false,
}: {
  quest: UserQuestWithDetails;
  compact?: boolean;
}) {
  const isCompleted = quest.status === 'COMPLETED';
  const icon = questTypeIcons[quest.quest.type] || (
    <Target className='h-4 w-4' />
  );

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all',
        isCompleted
          ? 'bg-emerald-50/50 border-emerald-200'
          : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
      )}
    >
      <div className='flex items-start gap-3'>
        {/* Icon */}
        <div
          className={cn(
            'p-2.5 rounded-xl',
            isCompleted
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-slate-100 text-slate-600'
          )}
        >
          {isCompleted ? <CheckCircle className='h-4 w-4' /> : icon}
        </div>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2 mb-1'>
            <h4
              className={cn(
                'font-semibold text-sm',
                isCompleted ? 'text-emerald-700' : 'text-slate-900'
              )}
            >
              {quest.quest.title}
            </h4>
            <Badge
              variant='outline'
              className={cn(
                'text-[9px] shrink-0',
                frequencyColors[quest.quest.frequency]
              )}
            >
              {frequencyLabels[quest.quest.frequency]}
            </Badge>
          </div>

          {!compact && (
            <p className='text-xs text-slate-500 mb-3'>
              {quest.quest.description}
            </p>
          )}

          {/* Progress */}
          {!isCompleted && (
            <div className='space-y-1.5'>
              <Progress value={quest.progressPercentage} className='h-1.5' />
              <div className='flex items-center justify-between text-[10px]'>
                <span className='text-slate-400'>
                  {quest.currentProgress} / {quest.quest.targetValue}
                </span>
                {quest.timeRemaining !== undefined &&
                  quest.timeRemaining > 0 && (
                    <span className='flex items-center gap-1 text-slate-400'>
                      <Clock className='h-3 w-3' />
                      {formatTimeRemaining(quest.timeRemaining)}
                    </span>
                  )}
              </div>
            </div>
          )}

          {/* Rewards */}
          <div className='flex items-center gap-2 mt-2'>
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                isCompleted ? 'text-emerald-600' : 'text-amber-600'
              )}
            >
              <Zap className='h-3 w-3' />
              <span>
                {isCompleted ? 'Earned' : '+'}
                {quest.quest.xpReward} XP
              </span>
            </div>
            {quest.quest.badgeReward && (
              <Badge variant='secondary' className='text-[9px]'>
                + Badge
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuestTracker({
  compact = false,
  className,
  frequency = 'all',
  limit,
  showViewAll = false,
  onViewAll,
  initialData,
}: QuestTrackerProps) {
  const [activeTab, setActiveTab] = useState<string>('all');

  const getFilteredQuests = (): UserQuestWithDetails[] => {
    if (!initialData) return [];

    let quests: UserQuestWithDetails[];

    // If frequency prop is set, use it
    if (frequency !== 'all') {
      const frequencyMap: Record<
        string,
        keyof typeof initialData.questsByFrequency
      > = {
        daily: 'daily',
        weekly: 'weekly',
        monthly: 'monthly',
        oneTime: 'oneTime',
      };
      quests = initialData.questsByFrequency[frequencyMap[frequency]] || [];
    } else if (activeTab !== 'all') {
      // Otherwise use active tab
      const tabMap: Record<string, keyof typeof initialData.questsByFrequency> =
        {
          daily: 'daily',
          weekly: 'weekly',
          monthly: 'monthly',
          oneTime: 'oneTime',
        };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const key = tabMap[activeTab] as any;
      // Safe casting/access if possible
      quests =
        initialData.questsByFrequency[
          key as 'daily' | 'weekly' | 'monthly' | 'oneTime'
        ] || [];
    } else {
      quests = initialData.quests;
    }

    // Sort: in progress first, then by XP reward
    quests = [...quests].sort((a, b) => {
      if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
      if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1;
      return b.quest.xpReward - a.quest.xpReward;
    });

    if (limit) {
      quests = quests.slice(0, limit);
    }

    return quests;
  };

  const filteredQuests = getFilteredQuests();

  if (!initialData || filteredQuests.length === 0) {
    return (
      <Card className={cn('border-none shadow-sm', className)}>
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-indigo-50'>
              <Target className='h-4 w-4 text-indigo-600' />
            </div>
            <CardTitle className='text-lg font-bold'>Active Quests</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <Target className='h-10 w-10 text-slate-200 mx-auto mb-3' />
            <p className='text-sm text-slate-400'>No quests available</p>
            <p className='text-xs text-slate-300 mt-1'>
              Check back later for new challenges!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-none shadow-sm overflow-hidden', className)}>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-100'>
              <Target className='h-4 w-4' />
            </div>
            <div>
              <CardTitle className='text-lg font-bold'>Active Quests</CardTitle>
              {initialData && (
                <p className='text-xs text-slate-500'>
                  {initialData.stats.completed} / {initialData.stats.total}{' '}
                  completed
                </p>
              )}
            </div>
          </div>
          {initialData && initialData.stats.totalAvailableXP > 0 && (
            <Badge variant='secondary' className='text-[10px]'>
              <Zap className='h-3 w-3 mr-1 text-amber-500' />
              {initialData.stats.totalAvailableXP} XP available
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className='space-y-3'>
        {/* Tabs for filtering (only if not in compact mode and frequency is 'all') */}
        {!compact && frequency === 'all' && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className='mb-4'>
            <TabsList className='h-9 p-1'>
              <TabsTrigger value='all' className='text-xs'>
                All
              </TabsTrigger>
              <TabsTrigger value='daily' className='text-xs'>
                Daily
              </TabsTrigger>
              <TabsTrigger value='weekly' className='text-xs'>
                Weekly
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Quest List */}
        <div className='space-y-3'>
          {filteredQuests.map(quest => (
            <QuestCard key={quest.id} quest={quest} compact={compact} />
          ))}
        </div>

        {showViewAll && onViewAll && (
          <Button
            variant='ghost'
            className='w-full mt-2 text-slate-500 hover:text-slate-700'
            onClick={onViewAll}
          >
            View All Quests
            <ChevronRight className='h-4 w-4 ml-1' />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default QuestTracker;

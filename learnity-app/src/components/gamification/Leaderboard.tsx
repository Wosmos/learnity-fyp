'use client';

/**
 * Leaderboard Component
 * Displays XP rankings with user info and highlights current user
 */

import {
  Trophy,
  Medal,
  Crown,
  Zap,
  Users,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  profilePicture?: string;
  totalXP: number;
  level: number;
  badgeCount: number;
  isCurrentUser?: boolean;
}

export interface LeaderboardData {
  type: 'global' | 'course';
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  totalUsers: number;
  course?: {
    id: string;
    title: string;
  };
}

interface LeaderboardProps {
  /** Type of leaderboard */
  type?: 'global' | 'course';
  /** Course ID for course-specific leaderboard */
  courseId?: string;
  /** Maximum entries to display */
  limit?: number;
  /** Show compact version */
  compact?: boolean;
  /** Additional class name */
  className?: string;
  /** Show view all button */
  showViewAll?: boolean;
  /** Callback when view all is clicked */
  onViewAll?: () => void;
  /** Initial Data from server */
  initialData?: LeaderboardData | null;
}

const rankIcons: Record<number, React.ReactNode> = {
  1: <Crown className='h-5 w-5 text-yellow-500' />,
  2: <Medal className='h-5 w-5 text-slate-400' />,
  3: <Medal className='h-5 w-5 text-amber-600' />,
};

const rankColors: Record<number, string> = {
  1: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200',
  2: 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200',
  3: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200',
};

function LeaderboardEntryRow({
  entry,
  compact = false,
}: {
  entry: LeaderboardEntry;
  compact?: boolean;
}) {
  const isTopThree = entry.rank <= 3;
  const initials = entry.userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-all',
        isTopThree ? rankColors[entry.rank] : 'bg-white border-slate-100',
        entry.isCurrentUser &&
          'ring-2 ring-indigo-500 ring-offset-2 bg-indigo-50/50',
        !compact && 'hover:shadow-md'
      )}
    >
      {/* Rank */}
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full',
          isTopThree ? 'bg-white shadow-sm' : 'bg-slate-100'
        )}
      >
        {rankIcons[entry.rank] || (
          <span className='text-sm font-bold text-slate-600'>{entry.rank}</span>
        )}
      </div>

      {/* Avatar */}
      <Avatar
        className={cn(
          'border-2',
          isTopThree ? 'border-white shadow-md' : 'border-slate-100'
        )}
      >
        <AvatarImage src={entry.profilePicture} alt={entry.userName} />
        <AvatarFallback className='bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold'>
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* User Info */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <p
            className={cn(
              'font-semibold truncate',
              entry.isCurrentUser ? 'text-indigo-700' : 'text-slate-900'
            )}
          >
            {entry.userName}
          </p>
          {entry.isCurrentUser && (
            <Badge variant='secondary' className='text-[10px] px-1.5 py-0'>
              You
            </Badge>
          )}
        </div>
        {!compact && (
          <div className='flex items-center gap-2 text-xs text-slate-500'>
            <span>Level {entry.level}</span>
            <span>•</span>
            <span>{entry.badgeCount} badges</span>
          </div>
        )}
      </div>

      {/* XP */}
      <div className='text-right'>
        <div className='flex items-center gap-1'>
          <Zap className='h-4 w-4 text-amber-500 fill-amber-500' />
          <span className='font-bold text-slate-900'>
            {entry.totalXP.toLocaleString()}
          </span>
        </div>
        {!compact && <p className='text-[10px] text-slate-400 uppercase'>XP</p>}
      </div>
    </div>
  );
}

export function Leaderboard({
  type = 'global',
  limit = 10,
  compact = false,
  className,
  showViewAll = false,
  onViewAll,
  initialData,
}: LeaderboardProps) {
  if (!initialData || initialData.entries.length === 0) {
    return (
      <Card className={cn('border-none shadow-sm', className)}>
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-amber-50'>
              <Trophy className='h-4 w-4 text-amber-600' />
            </div>
            <CardTitle className='text-lg font-bold'>
              {type === 'course' ? 'Course Leaderboard' : 'Top Learners'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <Users className='h-10 w-10 text-slate-200 mx-auto mb-3' />
            <p className='text-sm text-slate-400'>No rankings yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use the limit from props to slice if necessary (though server should handle it)
  // But if server returned more, we adhere to limit prop
  const entries = initialData.entries.slice(0, limit);

  return (
    <Card className={cn('border-none shadow-sm overflow-hidden', className)}>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-100'>
              <Trophy className='h-4 w-4' />
            </div>
            <div>
              <CardTitle className='text-lg font-bold'>
                {type === 'course' ? 'Course Leaderboard' : 'Top Learners'}
              </CardTitle>
              {initialData.course && (
                <p className='text-xs text-slate-500 truncate max-w-[200px]'>
                  {initialData.course.title}
                </p>
              )}
            </div>
          </div>
          <Badge variant='secondary' className='text-[10px]'>
            {initialData.totalUsers}{' '}
            {initialData.totalUsers === 1 ? 'learner' : 'learners'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='space-y-2'>
        <div className='space-y-2'>
          {entries.map(entry => (
            <LeaderboardEntryRow
              key={entry.userId}
              entry={entry}
              compact={compact}
            />
          ))}
        </div>

        {/* Current user rank if not in top list */}
        {initialData.currentUserRank &&
          initialData.currentUserRank > entries.length && (
            <div className='pt-3 border-t border-dashed border-slate-200'>
              <div className='text-center text-xs text-slate-400 mb-2'>
                Your Position
              </div>
              <div className='flex items-center justify-center gap-2 text-sm'>
                <span className='font-bold text-indigo-600'>
                  #{initialData.currentUserRank}
                </span>
                <span className='text-slate-400'>
                  of {initialData.totalUsers}
                </span>
              </div>
            </div>
          )}

        {showViewAll && onViewAll && (
          <Button
            variant='ghost'
            className='w-full mt-2 text-slate-500 hover:text-slate-700'
            onClick={onViewAll}
          >
            View Full Leaderboard
            <ChevronRight className='h-4 w-4 ml-1' />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default Leaderboard;

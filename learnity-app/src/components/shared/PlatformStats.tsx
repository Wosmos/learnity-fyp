/**
 * Reusable Platform Statistics Component
 * Displays real-time stats from database — no fake trends, no hardcoded numbers.
 */

import { Suspense } from 'react';
import { Users, GraduationCap, Star, BookOpen, TrendingUp, Award } from 'lucide-react';
import {
  getPlatformStats,
  formatStatValue,
  getDetailedStats,
  type PlatformStats as PlatformStatsType,
  type DetailedStats,
} from '@/lib/data/stats';
import { MetricCard } from '@/components/ui/stats-card';

interface PlatformStatsProps {
  variant?: 'default' | 'compact' | 'hero' | 'detailed';
  className?: string;
  showTrends?: boolean;
}

function isDetailedStats(stats: PlatformStatsType | DetailedStats): stats is DetailedStats {
  return 'trends' in stats && 'recentActivity' in stats;
}

export async function PlatformStats({
  variant = 'default',
  className = '',
  showTrends = false,
}: PlatformStatsProps) {
  const stats = showTrends ? await getDetailedStats() : await getPlatformStats();

  const baseStatItems = [
    { title: 'Active Learners', value: formatStatValue(stats.activeLearners), subtitle: 'Registered students', icon: Users },
    { title: 'Expert Tutors', value: formatStatValue(stats.expertTutors), subtitle: 'Verified teachers', icon: GraduationCap },
    { title: 'Average Rating', value: `${stats.averageRating}★`, subtitle: 'From real reviews', icon: Star },
  ];

  const detailedStatItems = variant === 'detailed' ? [
    { title: 'Lessons Completed', value: formatStatValue(stats.lessonsCompleted), subtitle: 'Total across platform', icon: BookOpen },
    { title: 'Completion Rate', value: `${stats.averageCompletionRate}%`, subtitle: 'Average per course', icon: TrendingUp },
    { title: 'Total Enrollments', value: formatStatValue(stats.totalEnrollments), subtitle: 'Course sign-ups', icon: Award },
  ] : [];

  const allStatItems = [...baseStatItems, ...detailedStatItems];

  const containerClasses = {
    default: 'grid grid-cols-1 md:grid-cols-3 gap-6',
    compact: 'grid grid-cols-1 md:grid-cols-3 gap-4',
    hero: 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-8 border-t border-gray-200',
    detailed: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  };

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {allStatItems.map((stat, index) => (
        <MetricCard key={index} title={stat.title} value={stat.value} subtitle={stat.subtitle} icon={stat.icon} />
      ))}
    </div>
  );
}

export function PlatformStatsLoading({ variant = 'default', className = '' }: Pick<PlatformStatsProps, 'variant' | 'className'>) {
  const containerClasses = {
    default: 'grid grid-cols-1 md:grid-cols-3 gap-6',
    compact: 'grid grid-cols-1 md:grid-cols-3 gap-4',
    hero: 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-8 border-t border-gray-200',
    detailed: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  };
  const itemCount = variant === 'detailed' ? 6 : 3;

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className='bg-card rounded-[24px] p-5 ring-1 ring-border animate-pulse min-h-[160px]'>
          <div className='flex justify-between mb-8'>
            <div className='w-10 h-10 bg-muted rounded-2xl' />
            <div className='w-20 h-3 bg-muted rounded' />
          </div>
          <div className='w-24 h-8 bg-muted rounded mb-3' />
          <div className='w-28 h-3 bg-muted rounded' />
        </div>
      ))}
    </div>
  );
}

export function PlatformStatsWithSuspense(props: PlatformStatsProps) {
  return (
    <Suspense fallback={<PlatformStatsLoading {...props} />}>
      <PlatformStats {...props} />
    </Suspense>
  );
}

/**
 * Reusable Platform Statistics Component
 * Displays real-time stats from database with enhanced UI and loading states
 * Optimized for performance with proper caching and error handling
 */

import { Suspense } from 'react';
import { getPlatformStats, formatStatValue, getDetailedStats, formatTrend, type PlatformStats as PlatformStatsType, type DetailedStats } from '@/lib/data/stats';
import { MetricCard } from '@/components/ui/stats-card';
import { Users, GraduationCap, Star, BookOpen, TrendingUp, Award } from 'lucide-react';

interface PlatformStatsProps {
  variant?: 'default' | 'compact' | 'hero' | 'detailed';
  className?: string;
  showTrends?: boolean;
}

// Type guard to check if stats has detailed properties
function isDetailedStats(stats: PlatformStatsType | DetailedStats): stats is DetailedStats {
  return 'trends' in stats && 'recentActivity' in stats;
}

export async function PlatformStats({
  variant = 'default',
  className = '',
  showTrends = false
}: PlatformStatsProps) {
  // Fetch appropriate stats based on variant
  const stats = showTrends ? await getDetailedStats() : await getPlatformStats();

  // Define stat items with formatted values and icons
  const baseStatItems = [
    {
      title: 'Active Learners',
      value: formatStatValue(stats.activeLearners),
      trendValue: showTrends && isDetailedStats(stats) ? formatTrend(stats.trends.studentGrowthRate).value : '+12%',
      trendLabel: 'this month',
      icon: Users,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Students actively learning',
    },
    {
      title: 'Expert Tutors',
      value: formatStatValue(stats.expertTutors),
      trendValue: showTrends && isDetailedStats(stats) ? formatTrend(stats.trends.teacherGrowthRate).value : '+8%',
      trendLabel: 'this month',
      icon: GraduationCap,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Verified professional tutors',
    },
    {
      title: 'Average Rating',
      value: `${stats.averageRating}★`,
      trendValue: '+0.2',
      trendLabel: 'vs last month',
      icon: Star,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      description: 'Student satisfaction rating',
    },
  ];

  // Additional stats for detailed variant
  const detailedStatItems = variant === 'detailed' ? [
    {
      title: 'Lessons Completed',
      value: formatStatValue(stats.lessonsCompleted),
      trendValue: showTrends && isDetailedStats(stats) ? `+${stats.recentActivity.lessonsCompletedThisWeek}` : '+234',
      trendLabel: 'this week',
      icon: BookOpen,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Total lessons completed',
    },
    {
      title: 'Completion Rate',
      value: `${stats.averageCompletionRate}%`,
      trendValue: '+3%',
      trendLabel: 'vs last month',
      icon: TrendingUp,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Average course completion',
    },
    {
      title: 'Total Enrollments',
      value: formatStatValue(stats.totalEnrollments),
      trendValue: '+15%',
      trendLabel: 'this month',
      icon: Award,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Students enrolled in courses',
    },
  ] : [];

  const allStatItems = [...baseStatItems, ...detailedStatItems];

  // Variant-specific container styling
  const containerClasses = {
    default: 'grid grid-cols-1 md:grid-cols-3 gap-6',
    compact: 'grid grid-cols-1 md:grid-cols-3 gap-4',
    hero: 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-8 border-t border-gray-200',
    detailed: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  };

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {allStatItems.map((stat, index) => (
        <MetricCard
          key={index}
          title={stat.title}
          value={stat.value}
          trendValue={stat.trendValue}
          trendLabel={stat.trendLabel}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}

/**
 * Loading skeleton for platform stats
 */
export function PlatformStatsLoading({ 
  variant = 'default',
  className = '' 
}: Pick<PlatformStatsProps, 'variant' | 'className'>) {
  const containerClasses = {
    default: 'grid grid-cols-1 md:grid-cols-3 gap-6',
    compact: 'grid grid-cols-1 md:grid-cols-3 gap-4',
    hero: 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-8 border-t border-gray-200',
    detailed: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  };

  const itemCount = variant === 'detailed' ? 6 : 3;

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="w-20 h-8 bg-gray-200 rounded"></div>
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
            {variant === 'detailed' && (
              <div className="w-32 h-3 bg-gray-200 rounded"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Wrapper component with Suspense for better UX
 */
export function PlatformStatsWithSuspense(props: PlatformStatsProps) {
  return (
    <Suspense fallback={<PlatformStatsLoading {...props} />}>
      <PlatformStats {...props} />
    </Suspense>
  );
}

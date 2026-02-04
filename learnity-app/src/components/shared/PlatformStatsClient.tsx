/**
 * Client-side Platform Statistics Display Component
 * Receives pre-fetched stats data and renders them using MetricCard
 */

'use client';

import { Users, GraduationCap, Star } from 'lucide-react';
import { MetricCard } from '@/components/ui/stats-card';

interface PlatformStatsClientProps {
  stats: {
    activeLearners: string;
    expertTutors: string;
    averageRating: string;
  };
  variant?: 'default' | 'compact' | 'hero';
  className?: string;
}

export function PlatformStatsClient({
  stats,
  variant = 'default',
  className = '',
}: PlatformStatsClientProps) {
  // Define stat items with icons and styling
  const statItems = [
    {
      title: 'Active Learners',
      value: stats.activeLearners,
      trendValue: '+12%',
      trendLabel: 'this month',
      icon: Users,
      iconColor: 'text-blue-600',
      bgColor: 'bg-slate-100',
    },
    {
      title: 'Expert Tutors',
      value: stats.expertTutors,
      trendValue: '+8%',
      trendLabel: 'this month',
      icon: GraduationCap,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Average Rating',
      value: stats.averageRating,
      trendValue: '+0.2',
      trendLabel: 'vs last month',
      icon: Star,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
    },
  ];

  // Variant-specific container styling
  const containerClasses = {
    default: 'grid grid-cols-1 md:grid-cols-3 gap-6',
    compact: 'grid grid-cols-1 md:grid-cols-3 gap-4',
    hero: 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-8 border-t border-gray-200',
  };

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {statItems.map((stat, index) => (
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

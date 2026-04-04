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
      subtitle: 'Registered students',
      icon: Users,
    },
    {
      title: 'Expert Tutors',
      value: stats.expertTutors,
      subtitle: 'Verified teachers',
      icon: GraduationCap,
    },
    {
      title: 'Average Rating',
      value: stats.averageRating,
      subtitle: 'From real reviews',
      icon: Star,
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
          subtitle={stat.subtitle}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}

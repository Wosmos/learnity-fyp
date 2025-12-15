/**
 * Stats Component
 * Wrapper for stats display - can use HeroStatsClient or custom stats
 */

'use client';

import React from 'react';
import { HeroStatsClient } from '@/components/landing/HeroStatsClient';
import { MetricCard } from '@/components/ui/stats-card';
import { cn } from '@/lib/utils';

export interface StatItem {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

export interface StatsProps {
  // Use existing HeroStatsClient
  useClient?: boolean;

  // Or provide custom stats
  stats?: StatItem[];

  // Layout
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'minimal' | 'cards';
  className?: string;
}

const gridColsClasses = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
};

export function Stats({
  useClient = true,
  stats,
  columns = 4,
  className,
}: StatsProps) {
  // Use existing client component
  if (useClient && !stats) {
    return <HeroStatsClient />;
  }

  // Custom stats using MetricCard
  if (stats) {
    return (
      <div className={cn(
        'grid gap-6',
        gridColsClasses[columns],
        'max-w-5xl mx-auto pt-8 border-t border-gray-200',
        className
      )}>
        {stats.map((stat, index) => (
          <MetricCard
            key={index}
            title={stat.label}
            value={stat.value.toString()}
            trendValue=""
            trendLabel=""
            icon={stat.icon ? () => stat.icon : undefined}
            iconColor="text-blue-600"
            bgColor="bg-slate-100"
            className="border-0 shadow-sm"
          />
        ))}
      </div>
    );
  }

  return null;
}


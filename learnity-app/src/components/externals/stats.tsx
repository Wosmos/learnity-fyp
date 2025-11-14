/**
 * Stats Component
 * Wrapper for stats display - can use HeroStatsClient or custom stats
 */

'use client';

import React from 'react';
import { HeroStatsClient } from '@/components/landing/HeroStatsClient';
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

  // Custom stats
  if (stats) {
    return (
      <div className={cn(
        'grid gap-8',
        gridColsClasses[columns],
        'max-w-3xl mx-auto pt-8 border-t border-gray-200',
        className
      )}>
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            {stat.icon && (
              <div className="mb-3 flex justify-center">
                {stat.icon}
              </div>
            )}
            <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}


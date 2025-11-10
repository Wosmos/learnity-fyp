/**
 * Client-side Platform Statistics Display Component
 * Receives pre-fetched stats data and renders them
 */

'use client';

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
  className = '' 
}: PlatformStatsClientProps) {
  // Define stat items
  const statItems = [
    {
      value: stats.activeLearners,
      label: 'Active learners',
    },
    {
      value: stats.expertTutors,
      label: 'Expert tutors',
    },
    {
      value: stats.averageRating,
      label: 'Average rating',
    },
  ];

  // Variant-specific styling
  const variants = {
    default: {
      container: 'grid grid-cols-2 md:grid-cols-3 gap-8',
      valueClass: 'text-3xl md:text-4xl font-bold text-gray-900 mb-1',
      labelClass: 'text-sm text-gray-600 font-medium',
    },
    compact: {
      container: 'flex flex-wrap gap-6 justify-center',
      valueClass: 'text-2xl font-bold text-gray-900',
      labelClass: 'text-xs text-gray-500',
    },
    hero: {
      container: 'grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto pt-8 border-t border-gray-200',
      valueClass: 'text-3xl md:text-4xl font-bold text-gray-900 mb-1',
      labelClass: 'text-sm text-gray-600 font-medium',
    },
  };

  const style = variants[variant];

  return (
    <div className={`${style.container} ${className}`}>
      {statItems.map((stat, index) => (
        <div key={index} className="text-center">
          <div className={style.valueClass}>{stat.value}</div>
          <div className={style.labelClass}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

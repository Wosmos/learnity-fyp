/**
 * Client-side Hero Stats Component
 * Displays platform statistics in landing page hero section
 */

'use client';

import { useEffect, useState } from 'react';
import { PlatformStatsClient } from '@/components/shared/PlatformStatsClient';

function StatsLoading() {
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto pt-8 border-t border-gray-200'>
      {[1, 2, 3].map(i => (
        <div key={i} className='text-center animate-pulse'>
          <div className='h-10 bg-gray-200 rounded mb-2 w-24 mx-auto'></div>
          <div className='h-4 bg-gray-200 rounded w-20 mx-auto'></div>
        </div>
      ))}
    </div>
  );
}

export function HeroStatsClient() {
  const [stats, setStats] = useState<{
    activeLearners: string;
    expertTutors: string;
    averageRating: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set fallback values
        setStats({
          activeLearners: '1,000+',
          expertTutors: '500+',
          averageRating: '4.9',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <StatsLoading />;
  }

  if (!stats) {
    return null;
  }

  return <PlatformStatsClient stats={stats} variant='hero' />;
}

/**
 * Hero Stats Section - Server Component Wrapper
 * Fetches and displays platform statistics
 */

import { Suspense } from 'react';
import { PlatformStats } from '@/components/shared/PlatformStats';

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

export function HeroStatsSection() {
  return (
    <Suspense fallback={<StatsLoading />}>
      <PlatformStats variant='hero' />
    </Suspense>
  );
}

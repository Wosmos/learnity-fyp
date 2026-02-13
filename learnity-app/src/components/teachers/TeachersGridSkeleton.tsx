/**
 * Teachers Grid Skeleton
 * Loading state for teachers grid
 */

import React from 'react';

export function TeachersGridSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className='bg-white rounded-xl p-6 shadow-sm animate-pulse'
        >
          <div className='w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4'></div>
          <div className='h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4'></div>
          <div className='flex justify-center gap-4 mb-4'>
            <div className='h-4 bg-gray-200 rounded w-16'></div>
            <div className='h-4 bg-gray-200 rounded w-20'></div>
          </div>
          <div className='space-y-2'>
            <div className='h-3 bg-gray-200 rounded'></div>
            <div className='h-3 bg-gray-200 rounded w-5/6 mx-auto'></div>
          </div>
        </div>
      ))}
    </div>
  );
}

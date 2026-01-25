/**
 * Skeleton Loader Component
 * Provides loading placeholders for content
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

function SkeletonText({
  lines = 3,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 && 'w-3/4' // Last line is shorter
          )}
        />
      ))}
    </div>
  );
}

function SkeletonCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border bg-card p-6 space-y-4', className)}
      {...props}
    >
      <Skeleton className='h-6 w-1/2' />
      <SkeletonText lines={3} />
      <div className='flex space-x-2'>
        <Skeleton className='h-8 w-20' />
        <Skeleton className='h-8 w-20' />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard };

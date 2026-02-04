/**
 * Caching utilities for Learnity
 * Implements Next.js 15 caching strategies with proper invalidation
 */

import { cache } from 'react';
import { unstable_cache } from 'next/cache';

// Cache configuration
export const CACHE_TAGS = {
  TEACHERS: 'teachers',
  COURSES: 'courses',
  STATS: 'stats',
  USER_PROFILE: 'user-profile',
  LANDING_DATA: 'landing-data',
} as const;

export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Landing page data caching
export const getCachedLandingStats = unstable_cache(
  async () => {
    // This would connect to your database
    // For now, return static data
    return {
      activeLearners: '1,000+',
      verifiedTutors: '500+',
      lessonsCompleted: '10,000+',
    };
  },
  ['landing-stats'],
  {
    tags: [CACHE_TAGS.STATS, CACHE_TAGS.LANDING_DATA],
    revalidate: CACHE_DURATIONS.LONG,
  }
);

// Teachers data caching
export const getCachedTeachers = unstable_cache(
  async (_filters?: Record<string, unknown>) => {
    // This would connect to your database
    // For now, return empty array
    return {
      teachers: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    };
  },
  ['teachers-list'],
  {
    tags: [CACHE_TAGS.TEACHERS],
    revalidate: CACHE_DURATIONS.MEDIUM,
  }
);

// User profile caching with React cache
export const getCachedUserProfile = cache(async (userId: string) => {
  return unstable_cache(
    async () => {
      // This would fetch from your database
      return null;
    },
    [`user-profile-${userId}`],
    {
      tags: [CACHE_TAGS.USER_PROFILE, `user-${userId}`],
      revalidate: CACHE_DURATIONS.MEDIUM,
    }
  )();
});

// Cache invalidation utilities
export async function revalidateCache(tag: string) {
  const { revalidateTag } = await import('next/cache');
  (revalidateTag as any)(tag);
}

export async function revalidatePath(
  path: string,
  type: 'page' | 'layout' = 'page'
) {
  try {
    const nextCache = await import('next/cache');
    if ('revalidatePath' in nextCache) {
      (
        nextCache.revalidatePath as (
          path: string,
          type: 'page' | 'layout'
        ) => void
      )(path, type);
    }
  } catch (error) {
    console.error('Failed to revalidate path:', path, error);
  }
}

// Cache warming utilities
export async function warmCache() {
  try {
    // Pre-warm critical caches
    await Promise.all([
      getCachedLandingStats(),
      // Add other critical data here
    ]);
    console.log('✅ Cache warmed successfully');
  } catch (error) {
    console.error('❌ Cache warming failed:', error);
  }
}

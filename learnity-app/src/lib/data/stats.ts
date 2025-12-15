/**
 * Platform Statistics Data Layer
 * Fetches real-time stats from database with caching
 */

import { cache } from 'react';
import { prisma } from '@/lib/config/database';

export interface PlatformStats {
  activeLearners: number;
  expertTutors: number;
  averageRating: string;
}

/**
 * Get platform statistics from database
 * Uses React cache() for request deduplication
 * Can be called multiple times in a render tree without extra DB queries
 */
export const getPlatformStats = cache(async (): Promise<PlatformStats> => {
  try {
    // Fetch all stats in parallel for better performance
    const [studentCount, teacherCount, avgRating] = await Promise.all([
      // Count active students
      prisma.user.count({
        where: {
          role: 'STUDENT',
          isActive: true,
        },
      }),

      // Count approved active teachers
      prisma.user.count({
        where: {
          role: 'TEACHER',
          isActive: true,
          teacherProfile: {
            applicationStatus: 'APPROVED',
          },
        },
      }),

      // Calculate average rating from approved teachers
      prisma.teacherProfile.aggregate({
        where: {
          applicationStatus: 'APPROVED',
          user: {
            isActive: true,
          },
        },
        _avg: {
          rating: true,
        },
      }),
    ]);

    // Format average rating
    const averageRating = avgRating._avg.rating
      ? Number(avgRating._avg.rating).toFixed(1)
      : '0.0';

    return {
      activeLearners: studentCount,
      expertTutors: teacherCount,
      averageRating,
    };
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    
    // Return fallback values on error
    return {
      activeLearners: 0,
      expertTutors: 0,
      averageRating: '0.0',
    };
  }
});

/**
 * Format number with comma separators and optional suffix
 */
export function formatStatValue(value: number, suffix: string = '+'): string {
  if (value === 0) return '0';
  
  // Format with commas for thousands
  const formatted = value.toLocaleString('en-US');
  
  // Add suffix if value is greater than 0
  return value > 0 ? `${formatted}${suffix}` : formatted;
}

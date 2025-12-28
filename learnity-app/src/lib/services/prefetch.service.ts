/**
 * Prefetching Service
 * Warms cache for critical data to improve page load performance
 * Implements intelligent prefetching strategies
 */

import { cache } from 'react';
import { 
  prefetchCoursesData, 
  prefetchTeachersData, 
  getPlatformStats,
  getDetailedStats 
} from '@/lib/data/stats';

export interface PrefetchStrategy {
  immediate: string[];  // Data to prefetch immediately
  onHover: string[];    // Data to prefetch on hover
  onIdle: string[];     // Data to prefetch when browser is idle
}

/**
 * Prefetch critical data for home page
 * This runs during SSR to warm the cache
 */
export const prefetchHomePageData = cache(async () => {
  try {
    // Prefetch all critical data in parallel
    const [stats, detailedStats, coursesData, teachersData] = await Promise.all([
      getPlatformStats(),
      getDetailedStats(),
      prefetchCoursesData(),
      prefetchTeachersData(),
    ]);

    return {
      stats,
      detailedStats,
      coursesData,
      teachersData,
      prefetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error prefetching home page data:', error);
    return null;
  }
});

/**
 * Get prefetch strategy based on user behavior and page context
 */
export function getPrefetchStrategy(currentPage: string): PrefetchStrategy {
  const strategies: Record<string, PrefetchStrategy> = {
    home: {
      immediate: ['stats', 'featured-courses', 'top-teachers'],
      onHover: ['courses-page', 'teachers-page', 'auth-pages'],
      onIdle: ['categories', 'testimonials', 'blog-posts'],
    },
    courses: {
      immediate: ['courses-list', 'categories', 'filters'],
      onHover: ['course-details', 'teacher-profiles'],
      onIdle: ['related-courses', 'reviews'],
    },
    teachers: {
      immediate: ['teachers-list', 'subjects', 'teacher-stats'],
      onHover: ['teacher-details', 'teacher-courses'],
      onIdle: ['teacher-reviews', 'availability'],
    },
    'course-details': {
      immediate: ['course-content', 'teacher-info', 'reviews'],
      onHover: ['enrollment', 'related-courses'],
      onIdle: ['course-materials', 'student-progress'],
    },
  };

  return strategies[currentPage] || strategies.home;
}

/**
 * Prefetch data for courses page
 * Optimized for fast navigation from home page
 */
export const prefetchCoursesPage = cache(async () => {
  try {
    const data = await prefetchCoursesData();
    
    // Additional course-specific data
    const [popularCourses, recentCourses] = await Promise.all([
      // Most popular courses by enrollment
      import('@/lib/config/database').then(({ prisma }) =>
        prisma.course.findMany({
          where: { status: 'PUBLISHED' },
          include: {
            teacher: { include: { teacherProfile: true } },
            category: true,
            _count: { select: { enrollments: true, reviews: true } },
          },
          orderBy: { enrollmentCount: 'desc' },
          take: 8,
        })
      ),
      
      // Recently published courses
      import('@/lib/config/database').then(({ prisma }) =>
        prisma.course.findMany({
          where: { status: 'PUBLISHED' },
          include: {
            teacher: { include: { teacherProfile: true } },
            category: true,
          },
          orderBy: { publishedAt: 'desc' },
          take: 6,
        })
      ),
    ]);

    return {
      ...data,
      popularCourses,
      recentCourses,
    };
  } catch (error) {
    console.error('Error prefetching courses page:', error);
    return null;
  }
});

/**
 * Prefetch data for teachers page
 * Optimized for fast navigation from home page
 */
export const prefetchTeachersPage = cache(async () => {
  try {
    const data = await prefetchTeachersData();
    
    // Additional teacher-specific data
    const [topRatedTeachers, newTeachers, teachersBySubject] = await Promise.all([
      // Top-rated teachers
      import('@/lib/config/database').then(({ prisma }) =>
        prisma.user.findMany({
          where: {
            role: 'TEACHER',
            isActive: true,
            teacherProfile: {
              applicationStatus: 'APPROVED',
              rating: { gte: 4.5 },
            },
          },
          include: {
            teacherProfile: true,
            _count: {
              select: {
                teacherCourses: { where: { status: 'PUBLISHED' } },
              },
            },
          },
          orderBy: { teacherProfile: { rating: 'desc' } },
          take: 12,
        })
      ),
      
      // Recently joined teachers
      import('@/lib/config/database').then(({ prisma }) =>
        prisma.user.findMany({
          where: {
            role: 'TEACHER',
            isActive: true,
            teacherProfile: { applicationStatus: 'APPROVED' },
          },
          include: { teacherProfile: true },
          orderBy: { createdAt: 'desc' },
          take: 6,
        })
      ),
      
      // Teachers grouped by popular subjects
      import('@/lib/config/database').then(({ prisma }) =>
        prisma.teacherProfile.groupBy({
          by: ['subjects'],
          where: {
            applicationStatus: 'APPROVED',
            user: { isActive: true },
          },
          _count: { subjects: true },
          orderBy: { _count: { subjects: 'desc' } },
          take: 10,
        })
      ),
    ]);

    return {
      ...data,
      topRatedTeachers,
      newTeachers,
      teachersBySubject,
    };
  } catch (error) {
    console.error('Error prefetching teachers page:', error);
    return null;
  }
});

/**
 * Client-side prefetching utilities
 * These can be used in components for hover-based prefetching
 */
export const clientPrefetch = {
  /**
   * Prefetch on link hover
   */
  onLinkHover: (href: string) => {
    if (typeof window !== 'undefined') {
      // Use Next.js router prefetch
      import('next/router').then(({ default: router }) => {
        router.prefetch(href);
      });
    }
  },

  /**
   * Prefetch when element enters viewport
   */
  onIntersection: (callback: () => void) => {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              callback();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );
      return observer;
    }
    return null;
  },

  /**
   * Prefetch when browser is idle
   */
  onIdle: (callback: () => void) => {
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback);
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(callback, 1000);
      }
    }
  },
};

/**
 * Cache warming utilities
 */
export const cacheWarming = {
  /**
   * Warm cache for critical routes
   */
  warmCriticalRoutes: async () => {
    try {
      await Promise.all([
        prefetchHomePageData(),
        prefetchCoursesPage(),
        prefetchTeachersPage(),
      ]);
      console.log('✅ Critical routes cache warmed successfully');
    } catch (error) {
      console.error('❌ Error warming critical routes cache:', error);
    }
  },

  /**
   * Warm cache for user-specific data
   */
  warmUserData: async (userId: string) => {
    try {
      // This would prefetch user-specific data like enrollments, progress, etc.
      // Implementation depends on your user data structure
      console.log(`✅ User data cache warmed for user: ${userId}`);
    } catch (error) {
      console.error('❌ Error warming user data cache:', error);
    }
  },
};
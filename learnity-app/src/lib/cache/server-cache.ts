import { unstable_cache } from 'next/cache';

/**
 * Server-side cache helpers using Next.js unstable_cache.
 * Each cached function gets a tag for on-demand revalidation.
 *
 * Invalidate with: revalidateTag('admin-stats') in mutation API routes.
 */

// Cache admin dashboard stats for 60s
export const getCachedAdminStats = unstable_cache(
  async () => {
    const { getAdminStats } = await import('@/lib/services/admin-stats.service');
    return getAdminStats();
  },
  ['admin-stats'],
  { revalidate: 60, tags: ['admin-stats'] }
);

// Cache course catalog for 5 min (public data)
export const getCachedCourses = unstable_cache(
  async (status?: string) => {
    const { prisma } = await import('@/lib/prisma');
    return prisma.course.findMany({
      where: status ? { status: status as any } : { status: 'PUBLISHED' },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  },
  ['courses'],
  { revalidate: 300, tags: ['courses'] }
);

// Cache categories (rarely change)
export const getCachedCategories = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/prisma');
    return prisma.category.findMany({
      include: { _count: { select: { courses: true } } },
      orderBy: { name: 'asc' },
    });
  },
  ['categories'],
  { revalidate: 600, tags: ['categories'] }
);

// Cache leaderboard for 5 min
export const getCachedLeaderboard = unstable_cache(
  async (limit = 20) => {
    const { prisma } = await import('@/lib/prisma');
    return prisma.userProgress.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } },
      },
      orderBy: { totalXP: 'desc' },
      take: limit,
    });
  },
  ['leaderboard'],
  { revalidate: 300, tags: ['leaderboard'] }
);

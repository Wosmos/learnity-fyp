import { unstable_cache } from 'next/cache';

/**
 * Safe ISO string conversion — unstable_cache serializes Dates to strings,
 * so on cache HIT, values are already strings. This handles both cases.
 */
export function toISO(val: Date | string | null | undefined): string | null {
  if (!val) return null;
  if (typeof val === 'string') return val;
  return val.toISOString();
}

/**
 * Server-side cache helpers using Next.js unstable_cache.
 * All caches use on-demand revalidation only (no TTL).
 * Invalidate via revalidateTag() in mutation API routes.
 *
 * Setting revalidate to `false` means the cache lives forever
 * until explicitly busted by a revalidateTag() call.
 */

// ─── Global caches (same data for all users) ────────────────

export const getCachedAdminStats = unstable_cache(
  async () => {
    const { getAdminStats } = await import('@/lib/services/admin-stats.service');
    return getAdminStats();
  },
  ['admin-stats'],
  { revalidate: false, tags: ['admin-stats'] }
);

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
  { revalidate: false, tags: ['courses'] }
);

export const getCachedCategories = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/prisma');
    return prisma.category.findMany({
      include: { _count: { select: { courses: true } } },
      orderBy: { name: 'asc' },
    });
  },
  ['categories'],
  { revalidate: false, tags: ['categories'] }
);

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
  { revalidate: false, tags: ['leaderboard'] }
);

// ─── Per-user caches (keyed by userId) ──────────────────────

/**
 * Cache a student's dashboard data. Busted by `user-{userId}` tag
 * when the student completes a lesson, enrolls, earns XP, etc.
 */
export function getCachedStudentDashboard(userId: string) {
  return unstable_cache(
    async () => {
      const { prisma } = await import('@/lib/prisma');
      const { EnrollmentStatus } = await import('@prisma/client');

      const [profile, enrollmentStats, badgeCount, completedCount, totalWatchTime] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true, firstName: true, lastName: true, email: true,
            profilePicture: true, role: true, emailVerified: true, createdAt: true,
            studentProfile: {
              select: {
                gradeLevel: true, subjects: true, learningGoals: true,
                interests: true, studyPreferences: true, bio: true,
                profileCompletionPercentage: true,
              },
            },
          },
        }),
        prisma.enrollment.aggregate({
          where: { studentId: userId, status: { not: EnrollmentStatus.UNENROLLED } },
          _count: { _all: true },
          _avg: { progress: true },
        }),
        prisma.badge.count({ where: { userId } }).catch(() => 0),
        prisma.enrollment.count({
          where: { studentId: userId, status: EnrollmentStatus.COMPLETED },
        }),
        prisma.lessonProgress.aggregate({
          where: { studentId: userId },
          _sum: { watchedSeconds: true },
        }),
      ]);

      return { profile, enrollmentStats, badgeCount, completedCount, totalWatchTime };
    },
    [`student-dashboard-${userId}`],
    { revalidate: false, tags: [`user-${userId}`] }
  )();
}

/**
 * Cache a student's enrolled courses. Busted by `user-{userId}` tag.
 */
export function getCachedStudentCourses(userId: string) {
  return unstable_cache(
    async () => {
      const { prisma } = await import('@/lib/prisma');
      const { EnrollmentStatus } = await import('@prisma/client');

      return prisma.enrollment.findMany({
        where: { studentId: userId, status: { not: EnrollmentStatus.UNENROLLED } },
        include: {
          course: {
            select: {
              id: true, title: true, description: true, thumbnailUrl: true,
              difficulty: true, totalDuration: true, averageRating: true,
              reviewCount: true, lessonCount: true,
              teacher: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
              category: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { lastAccessedAt: 'desc' },
        take: 50,
      });
    },
    [`student-courses-${userId}`],
    { revalidate: false, tags: [`user-${userId}`] }
  )();
}

/**
 * Cache a student's wallet + transactions. Busted by `user-{userId}` tag.
 */
export function getCachedUserWallet(userId: string) {
  return unstable_cache(
    async () => {
      const { prisma } = await import('@/lib/prisma');

      const [wallet, transactions] = await Promise.all([
        prisma.wallet.findUnique({
          where: { userId },
          select: { balance: true, currency: true },
        }),
        prisma.walletTransaction.findMany({
          where: { userId },
          select: {
            id: true, amount: true, type: true, status: true,
            description: true, createdAt: true, referenceId: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
      ]);

      return { wallet, transactions };
    },
    [`user-wallet-${userId}`],
    { revalidate: false, tags: [`user-${userId}`] }
  )();
}

/**
 * Cache a student's sessions. Busted by `user-{userId}` tag.
 */
export function getCachedStudentSessions(userId: string, firebaseUid: string) {
  return unstable_cache(
    async () => {
      const { prisma } = await import('@/lib/prisma');

      return prisma.tutoringSession.findMany({
        where: {
          OR: [{ studentId: userId }, { student: { firebaseUid } }],
        },
        include: {
          teacher: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
        },
        orderBy: { scheduledAt: 'desc' },
        take: 50,
      });
    },
    [`student-sessions-${userId}`],
    { revalidate: false, tags: [`user-${userId}`] }
  )();
}

/**
 * Cache a teacher's dashboard data. Busted by `user-{userId}` tag.
 */
export function getCachedTeacherDashboard(userId: string) {
  return unstable_cache(
    async () => {
      const { prisma } = await import('@/lib/prisma');

      const [courses, recentEnrollments, recentReviews] = await Promise.all([
        prisma.course.findMany({
          where: { teacherId: userId },
          select: {
            id: true, title: true, status: true, enrollmentCount: true,
            lessonCount: true, averageRating: true, reviewCount: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.enrollment.findMany({
          where: { course: { teacherId: userId } },
          select: {
            id: true, enrolledAt: true,
            student: { select: { firstName: true, lastName: true } },
            course: { select: { title: true } },
          },
          orderBy: { enrolledAt: 'desc' },
          take: 5,
        }),
        prisma.review.findMany({
          where: { course: { teacherId: userId } },
          select: {
            id: true, rating: true, createdAt: true,
            student: { select: { firstName: true, lastName: true } },
            course: { select: { title: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

      return { courses, recentEnrollments, recentReviews };
    },
    [`teacher-dashboard-${userId}`],
    { revalidate: false, tags: [`user-${userId}`] }
  )();
}

/**
 * Cache a teacher's sessions. Busted by `user-{userId}` tag.
 */
export function getCachedTeacherSessions(userId: string) {
  return unstable_cache(
    async () => {
      const { prisma } = await import('@/lib/prisma');

      return prisma.tutoringSession.findMany({
        where: { teacherId: userId },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
        },
        orderBy: { scheduledAt: 'desc' },
        take: 50,
      });
    },
    [`teacher-sessions-${userId}`],
    { revalidate: false, tags: [`user-${userId}`] }
  )();
}

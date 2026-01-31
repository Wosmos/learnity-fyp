import { prisma } from '@/lib/prisma';
import { UserRole as PrismaUserRole, ApplicationStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';

export interface UserManagementOptions {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  status?: string;
}

/**
 * Core user fetching logic (Internal)
 */
async function fetchUsersFromDb(options: UserManagementOptions) {
  const { page = 1, limit = 50, role, search, status } = options;

  const where: Prisma.UserWhereInput = {};

  // Role Filtering
  if (role && role !== 'all') {
    where.role = role.toUpperCase() as PrismaUserRole;
  }

  // Search filtering
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Status filtering (mainly for teachers)
  if (status && status !== 'all' && (role === 'teacher' || !role)) {
    where.teacherProfile = {
      applicationStatus: status.toUpperCase() as ApplicationStatus,
    };
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        profilePicture: true,
        studentProfile: {
          select: {
            gradeLevel: true,
            subjects: true,
          },
        },
        teacherProfile: {
          select: {
            bio: true,
            subjects: true,
            experience: true,
            hourlyRate: true,
            rating: true,
            lessonsCompleted: true,
            applicationStatus: true,
            submittedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  // Transform data to plain objects
  const transformedUsers = users.map(user => {
    const teacherProfile = user.teacherProfile;
    const studentProfile = user.studentProfile;

    // Convert Decimal types for Next.js Client Components
    const hourlyRate =
      teacherProfile?.hourlyRate != null
        ? typeof teacherProfile.hourlyRate === 'object'
          ? (teacherProfile.hourlyRate as any).toString()
          : String(teacherProfile.hourlyRate)
        : null;

    const rating =
      teacherProfile?.rating != null
        ? typeof teacherProfile.rating === 'object'
          ? Number((teacherProfile.rating as any).toString())
          : Number(teacherProfile.rating)
        : 0;

    return {
      ...user,
      // Metadata fields for unified table
      bio: teacherProfile?.bio || studentProfile?.bio || null,
      expertise: teacherProfile?.subjects || studentProfile?.subjects || [],
      experience: teacherProfile?.experience || null,
      hourlyRate,
      rating,
      totalSessions: teacherProfile?.lessonsCompleted || 0,
      applicationStatus: teacherProfile?.applicationStatus || null,
      submittedAt: teacherProfile?.submittedAt?.toISOString() || null,
      studentData: studentProfile
        ? {
            gradeLevel: studentProfile.gradeLevel,
          }
        : null,
      teacherProfile: undefined, // Remove nested profile to keep it flat-ish
      studentProfile: undefined,
    };
  });

  // Global counts for tabs
  const [studentCount, teacherCount, pendingTeacherCount, adminCount] =
    await Promise.all([
      prisma.user.count({ where: { role: PrismaUserRole.STUDENT } }),
      prisma.user.count({ where: { role: PrismaUserRole.TEACHER } }),
      prisma.user.count({ where: { role: PrismaUserRole.PENDING_TEACHER } }),
      prisma.user.count({ where: { role: PrismaUserRole.ADMIN } }),
    ]);

  return {
    users: transformedUsers,
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
    },
    stats: {
      studentCount,
      teacherCount,
      pendingTeacherCount,
      adminCount,
      totalUsers:
        studentCount + teacherCount + pendingTeacherCount + adminCount,
    },
  };
}

/**
 * Cached version of user fetching
 */
export async function getUsers(options: UserManagementOptions = {}) {
  const cacheKey = `users-${JSON.stringify(options)}`;

  return unstable_cache(async () => fetchUsersFromDb(options), [cacheKey], {
    tags: ['users', 'user-management'],
    revalidate: 3600, // 1 hour stale-while-revalidate
  })();
}

/**
 * On-demand revalidation
 */
export async function revalidateUsersCache() {
  const { revalidateTag } = await import('next/cache');
  (revalidateTag as any)('users');
  (revalidateTag as any)('user-management');
}

import { prisma } from '@/lib/prisma';
import { UserRole as PrismaUserRole, ApplicationStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

export interface GetTeachersOptions {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export async function getTeachers({
  page = 1,
  limit = 50,
  status,
  search,
}: GetTeachersOptions = {}) {
  // Build where clause for teachers
  const where: Prisma.UserWhereInput = {
    role: {
      in: [
        PrismaUserRole.TEACHER,
        PrismaUserRole.PENDING_TEACHER,
        PrismaUserRole.REJECTED_TEACHER,
      ],
    },
  };

  if (status && status !== 'all') {
    switch (status) {
      case 'pending':
        where.role = PrismaUserRole.PENDING_TEACHER;
        break;
      case 'approved':
        where.role = PrismaUserRole.TEACHER;
        break;
      case 'rejected':
        where.role = PrismaUserRole.REJECTED_TEACHER;
        break;
    }
  }

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Fetch teachers with their profiles
  const [teachers, totalCount] = await Promise.all([
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
        // Include teacher profile if exists
        teacherProfile: {
          select: {
            bio: true,
            subjects: true,
            experience: true,
            education: true,
            certifications: true,
            hourlyRate: true,
            availability: true,
            rating: true,
            lessonsCompleted: true,
            applicationStatus: true,
            submittedAt: true,
            reviewedAt: true,
            approvedBy: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  // Flatten teacher data with profile information
  const teachersWithProfiles = teachers.map(teacher => {
  const profile = teacher.teacherProfile;

  // Safely convert Decimal fields to plain numbers or strings
  const hourlyRate =
    profile?.hourlyRate != null
      ? typeof profile.hourlyRate === 'object'
        ? (profile.hourlyRate as any).toString()
        : profile.hourlyRate
      : null;

  const rating =
    profile?.rating != null
      ? typeof profile.rating === 'object'
        ? Number((profile.rating as any).toString())
        : Number(profile.rating)
      : 0;

  return {
    ...teacher,
    bio: profile?.bio,
    expertise: profile?.subjects || [],
    experience: profile?.experience,
    education: profile?.education,
    certifications: profile?.certifications || [],
    hourlyRate, // ← now safe
    availability: profile?.availability,
    rating, // ← now safe
    totalSessions: profile?.lessonsCompleted || 0,
    applicationStatus: profile?.applicationStatus,
    applicationDate: profile?.submittedAt,
    reviewedAt: profile?.reviewedAt,
    reviewedBy: profile?.approvedBy,
  };
});

  // Calculate statistics
  const [
    pendingApplications,
    approvedTeachers,
    rejectedApplications,
    averageRatingResult,
    totalSessionsResult,
  ] = await Promise.all([
    prisma.user.count({ where: { role: PrismaUserRole.PENDING_TEACHER } }),
    prisma.user.count({ where: { role: PrismaUserRole.TEACHER } }),
    prisma.user.count({ where: { role: PrismaUserRole.REJECTED_TEACHER } }),
    prisma.teacherProfile.aggregate({
      where: { user: { role: PrismaUserRole.TEACHER } },
      _avg: { rating: true },
    }),
    prisma.teacherProfile.aggregate({
      where: { user: { role: PrismaUserRole.TEACHER } },
      _sum: { lessonsCompleted: true },
    }),
  ]);

  const averageRatingValue = averageRatingResult._avg.rating
  ? Number(averageRatingResult._avg.rating.toString?.() || averageRatingResult._avg.rating)
  : 0;

const totalSessionsValue = totalSessionsResult._sum.lessonsCompleted
  ? Number(totalSessionsResult._sum.lessonsCompleted.toString?.() || totalSessionsResult._sum.lessonsCompleted)
  : 0;

  const stats = {
    totalTeachers:
      pendingApplications + approvedTeachers + rejectedApplications,
    pendingApplications,
    approvedTeachers,
    rejectedApplications,
    averageRating: averageRatingValue,
    totalSessions: totalSessionsValue,
  };

  return {
    teachers: teachersWithProfiles,
    stats,
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
    },
  };
}

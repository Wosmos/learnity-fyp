import { Metadata } from 'next';
import { getUsers } from '@/lib/services/user-management.service';
import { prisma } from '@/lib/prisma';
import { PeopleClient } from './PeopleClient';

export const metadata: Metadata = {
  title: 'People | Admin',
  description: 'Manage users and teacher applications.',
};

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    role?: string;
    search?: string;
    page?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const tab = params.tab || 'users';

  // Fetch users data
  const usersData = await getUsers({
    role: params.role || 'all',
    search: params.search || '',
    page: parseInt(params.page || '1'),
    status: params.status || 'all',
    limit: 50,
  });

  // Fetch teacher applications with stats
  const [teachers, teacherStats] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: { in: ['PENDING_TEACHER', 'TEACHER', 'REJECTED_TEACHER'] },
      },
      include: {
        teacherProfile: {
          select: {
            id: true,
            applicationStatus: true,
            qualifications: true,
            subjects: true,
            experience: true,
            bio: true,
            hourlyRate: true,
            submittedAt: true,
            reviewedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.user.groupBy({
      by: ['role'],
      where: {
        role: { in: ['PENDING_TEACHER', 'TEACHER', 'REJECTED_TEACHER'] },
      },
      _count: true,
    }),
  ]);

  const statsMap = Object.fromEntries(teacherStats.map(s => [s.role, s._count]));

  const serializedTeachers = teachers.map(t => ({
    id: t.id,
    firebaseUid: t.firebaseUid,
    email: t.email,
    firstName: t.firstName,
    lastName: t.lastName,
    role: t.role,
    profilePicture: t.profilePicture,
    isActive: t.isActive,
    createdAt: t.createdAt.toISOString(),
    teacherProfile: t.teacherProfile ? {
      id: t.teacherProfile.id,
      applicationStatus: t.teacherProfile.applicationStatus,
      qualifications: t.teacherProfile.qualifications,
      subjects: t.teacherProfile.subjects,
      experience: t.teacherProfile.experience,
      bio: t.teacherProfile.bio,
      hourlyRate: t.teacherProfile.hourlyRate ? Number(t.teacherProfile.hourlyRate) : null,
      submittedAt: t.teacherProfile.submittedAt?.toISOString() ?? null,
      reviewedAt: t.teacherProfile.reviewedAt?.toISOString() ?? null,
    } : null,
  }));

  return (
    <PeopleClient
      activeTab={tab}
      usersData={usersData}
      teachers={serializedTeachers}
      teacherCounts={{
        pending: statsMap['PENDING_TEACHER'] || 0,
        approved: statsMap['TEACHER'] || 0,
        rejected: statsMap['REJECTED_TEACHER'] || 0,
        total: (statsMap['PENDING_TEACHER'] || 0) + (statsMap['TEACHER'] || 0) + (statsMap['REJECTED_TEACHER'] || 0),
      }}
    />
  );
}

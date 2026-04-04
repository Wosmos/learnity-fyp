import { prisma } from '@/lib/prisma';
import { requireServerUser } from '@/lib/auth/server';
import { EnrollmentStatus } from '@prisma/client';
import { StudentDashboardClient } from './StudentDashboardClient';

export default async function StudentDashboard() {
  const user = await requireServerUser();

  // Fetch all data in parallel
  const [profile, enrollmentStats, badgeCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePicture: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        studentProfile: {
          select: {
            gradeLevel: true,
            subjects: true,
            learningGoals: true,
            interests: true,
            studyPreferences: true,
            bio: true,
            profileCompletionPercentage: true,
          },
        },
      },
    }),
    prisma.enrollment.aggregate({
      where: { studentId: user.id, status: { not: EnrollmentStatus.UNENROLLED } },
      _count: { _all: true },
      _avg: { progress: true },
    }),
    prisma.badge.count({ where: { userId: user.id } }).catch(() => 0),
  ]);

  const [completedCount, totalWatchTime] = await Promise.all([
    prisma.enrollment.count({
      where: { studentId: user.id, status: EnrollmentStatus.COMPLETED },
    }),
    prisma.lessonProgress.aggregate({
      where: { studentId: user.id },
      _sum: { watchedSeconds: true },
    }),
  ]);

  // Profile completion sections
  const completionPercentage = profile?.studentProfile?.profileCompletionPercentage || 0;
  const missingSections: { id: string; name: string }[] = [];
  if (!profile?.studentProfile?.bio) missingSections.push({ id: 'bio', name: 'Bio' });
  if (!profile?.studentProfile?.subjects?.length) missingSections.push({ id: 'subjects', name: 'Subjects' });
  if (!profile?.studentProfile?.learningGoals?.length) missingSections.push({ id: 'goals', name: 'Learning Goals' });
  if (!profile?.studentProfile?.interests?.length) missingSections.push({ id: 'interests', name: 'Interests' });

  const profileData = profile ? {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    profilePicture: profile.profilePicture ?? undefined,
    role: profile.role,
    emailVerified: profile.emailVerified,
    createdAt: profile.createdAt.toISOString(),
    studentProfile: profile.studentProfile ? {
      gradeLevel: profile.studentProfile.gradeLevel ?? 'Not specified',
      subjects: profile.studentProfile.subjects,
      learningGoals: profile.studentProfile.learningGoals,
      interests: profile.studentProfile.interests,
      studyPreferences: profile.studentProfile.studyPreferences,
      bio: profile.studentProfile.bio ?? undefined,
      profileCompletionPercentage: profile.studentProfile.profileCompletionPercentage,
    } : undefined,
  } : null;

  const stats = {
    enrolledCourses: enrollmentStats._count._all,
    completedCourses: completedCount,
    totalWatchTime: totalWatchTime._sum.watchedSeconds || 0,
    badgeCount,
    averageProgress: Math.round(enrollmentStats._avg.progress || 0),
  };

  const completion = {
    percentage: completionPercentage,
    completedSections: [] as { id: string; name: string }[],
    missingSections,
    nextSteps: missingSections.map(s => `Complete your ${s.name}`),
    rewards: [] as { id: string; name: string }[],
  };

  return (
    <StudentDashboardClient
      profileData={profileData}
      stats={stats}
      completion={completion}
    />
  );
}

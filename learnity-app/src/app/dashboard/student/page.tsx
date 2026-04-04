import { requireServerUser } from '@/lib/auth/server';
import { getCachedStudentDashboard, toISO } from '@/lib/cache/server-cache';
import { StudentDashboardClient } from './StudentDashboardClient';

export default async function StudentDashboard() {
  const user = await requireServerUser();

  const { profile, enrollmentStats, badgeCount, completedCount, totalWatchTime } =
    await getCachedStudentDashboard(user.id);

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
    createdAt: toISO(profile.createdAt)!,
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

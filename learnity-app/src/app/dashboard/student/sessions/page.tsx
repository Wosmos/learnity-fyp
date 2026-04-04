import { requireServerUser } from '@/lib/auth/server';
import { getCachedStudentSessions, toISO } from '@/lib/cache/server-cache';
import { StudentSessionsClient } from './StudentSessionsClient';

export default async function StudentSessionsPage() {
  const user = await requireServerUser();

  const sessions = await getCachedStudentSessions(user.id, user.firebaseUid);

  const serialized = sessions.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    scheduledAt: toISO(s.scheduledAt)!,
    duration: s.duration,
    status: s.status,
    teacher: {
      id: s.teacher.id,
      firstName: s.teacher.firstName,
      lastName: s.teacher.lastName,
      profilePicture: s.teacher.profilePicture,
    },
    rejectionReason: s.rejectionReason,
    cancellationReason: s.cancellationReason,
  }));

  return <StudentSessionsClient sessions={serialized} />;
}

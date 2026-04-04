import { requireServerUser } from '@/lib/auth/server';
import { getCachedTeacherSessions, toISO } from '@/lib/cache/server-cache';
import { TeacherSessionsClient } from './TeacherSessionsClient';

export default async function TeacherSessionsPage() {
  const user = await requireServerUser();

  const sessions = await getCachedTeacherSessions(user.id);

  const serialized = sessions.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    scheduledAt: toISO(s.scheduledAt)!,
    duration: s.duration,
    status: s.status,
    student: {
      id: s.student.id,
      firstName: s.student.firstName,
      lastName: s.student.lastName,
      profilePicture: s.student.profilePicture,
    },
  }));

  return <TeacherSessionsClient sessions={serialized} />;
}

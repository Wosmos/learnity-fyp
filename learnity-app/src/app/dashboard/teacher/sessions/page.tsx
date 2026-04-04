import { prisma } from '@/lib/prisma';
import { requireServerUser } from '@/lib/auth/server';
import { TeacherSessionsClient } from './TeacherSessionsClient';

export default async function TeacherSessionsPage() {
  const user = await requireServerUser();

  const sessions = await prisma.tutoringSession.findMany({
    where: { teacherId: user.id },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
        },
      },
    },
    orderBy: { scheduledAt: 'desc' },
    take: 50,
  });

  const serialized = sessions.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    scheduledAt: s.scheduledAt.toISOString(),
    duration: s.duration,
    status: s.status,
    student: {
      id: s.student.id,
      firstName: s.student.firstName,
      lastName: s.student.lastName,
      profilePicture: s.student.profilePicture,
    },
    rejectionReason: s.rejectionReason,
  }));

  return <TeacherSessionsClient sessions={serialized} />;
}

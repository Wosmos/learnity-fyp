import { prisma } from '@/lib/prisma';
import { requireServerUser } from '@/lib/auth/server';
import { StudentSessionsClient } from './StudentSessionsClient';

export default async function StudentSessionsPage() {
  const user = await requireServerUser();

  const sessions = await prisma.tutoringSession.findMany({
    where: {
      OR: [
        { studentId: user.id },
        { student: { firebaseUid: user.firebaseUid } },
      ],
    },
    include: {
      teacher: {
        select: { id: true, firstName: true, lastName: true, profilePicture: true },
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

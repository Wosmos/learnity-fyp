import { prisma } from '@/lib/prisma';
import { requireServerUser } from '@/lib/auth/server';
import { EnrollmentStatus } from '@prisma/client';
import { StudentCoursesClient } from './StudentCoursesClient';

export default async function MyCoursesPage() {
  const user = await requireServerUser();

  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId: user.id,
      status: { not: EnrollmentStatus.UNENROLLED },
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          difficulty: true,
          totalDuration: true,
          averageRating: true,
          reviewCount: true,
          lessonCount: true,
          teacher: {
            select: { id: true, firstName: true, lastName: true, profilePicture: true },
          },
          category: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { lastAccessedAt: 'desc' },
    take: 50,
  });

  // Serialize dates for client component
  const serialized = enrollments.map(e => ({
    id: e.id,
    status: e.status,
    progress: e.progress,
    enrolledAt: e.enrolledAt.toISOString(),
    lastAccessedAt: e.lastAccessedAt.toISOString(),
    completedAt: e.completedAt?.toISOString() ?? null,
    course: {
      id: e.course.id,
      title: e.course.title,
      description: e.course.description,
      thumbnailUrl: e.course.thumbnailUrl,
      difficulty: e.course.difficulty,
      totalDuration: e.course.totalDuration,
      averageRating: Number(e.course.averageRating),
      reviewCount: e.course.reviewCount,
      lessonCount: e.course.lessonCount,
      teacher: {
        id: e.course.teacher.id,
        name: `${e.course.teacher.firstName} ${e.course.teacher.lastName}`,
        avatarUrl: e.course.teacher.profilePicture,
      },
      category: e.course.category ? { id: e.course.category.id, name: e.course.category.name } : null,
    },
  }));

  return <StudentCoursesClient enrollments={serialized} />;
}

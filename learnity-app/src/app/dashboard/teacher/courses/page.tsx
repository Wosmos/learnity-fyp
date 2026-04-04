import { prisma } from '@/lib/prisma';
import { requireServerUser } from '@/lib/auth/server';
import { toISO } from '@/lib/cache/server-cache';
import { TeacherCoursesClient } from './TeacherCoursesClient';

export default async function TeacherCoursesPage() {
  const user = await requireServerUser();

  const courses = await prisma.course.findMany({
    where: { teacherId: user.id },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      thumbnailUrl: true,
      status: true,
      difficulty: true,
      isFree: true,
      price: true,
      enrollmentCount: true,
      averageRating: true,
      reviewCount: true,
      lessonCount: true,
      totalDuration: true,
      createdAt: true,
      publishedAt: true,
      category: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const serialized = courses.map(c => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    description: c.description,
    thumbnailUrl: c.thumbnailUrl,
    status: c.status as 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED',
    difficulty: c.difficulty as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    isFree: c.isFree,
    price: c.price ? Number(c.price) : null,
    enrollmentCount: c.enrollmentCount,
    averageRating: Number(c.averageRating),
    reviewCount: c.reviewCount,
    lessonCount: c.lessonCount,
    totalDuration: c.totalDuration,
    createdAt: toISO(c.createdAt)!,
    publishedAt: toISO(c.publishedAt),
    category: c.category,
  }));

  return <TeacherCoursesClient courses={serialized} />;
}

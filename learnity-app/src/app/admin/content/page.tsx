import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { toISO } from '@/lib/cache/server-cache';
import { ContentClient } from './ContentClient';

export const metadata: Metadata = {
  title: 'Content | Admin',
  description: 'Manage courses, categories, and reviews.',
};

const getContentData = unstable_cache(
  async () => {
    return Promise.all([
      prisma.course.findMany({
        include: {
          teacher: { select: { id: true, firstName: true, lastName: true } },
          category: { select: { id: true, name: true } },
          _count: { select: { enrollments: true, reviews: true, sections: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.category.findMany({
        include: { _count: { select: { courses: true } } },
        orderBy: { name: 'asc' },
      }),
      prisma.review.findMany({
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
          course: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.course.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);
  },
  ['admin-content'],
  { revalidate: false, tags: ['courses', 'categories'] }
);

export default async function ContentPage() {
  const [courses, categories, recentReviews, courseStats] = await getContentData();

  const statsMap = Object.fromEntries(courseStats.map(s => [s.status, s._count]));

  const serializedCourses = courses.map(c => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    status: c.status,
    isFree: c.isFree,
    price: c.price ? Number(c.price) : null,
    averageRating: Number(c.averageRating),
    isFeatured: false,
    createdAt: toISO(c.createdAt)!,
    publishedAt: toISO(c.publishedAt),
    teacher: { id: c.teacher.id, name: `${c.teacher.firstName} ${c.teacher.lastName}` },
    category: c.category ? { id: c.category.id, name: c.category.name } : null,
    counts: { enrollments: c._count.enrollments, reviews: c._count.reviews, lessons: c.lessonCount },
  }));

  const serializedCategories = categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    courseCount: c._count.courses,
  }));

  const serializedReviews = recentReviews.map(r => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: toISO(r.createdAt)!,
    student: { id: r.student.id, name: `${r.student.firstName} ${r.student.lastName}` },
    course: { id: r.course.id, title: r.course.title },
  }));

  return (
    <ContentClient
      courses={serializedCourses}
      categories={serializedCategories}
      reviews={serializedReviews}
      courseStats={{
        published: statsMap['PUBLISHED'] || 0,
        draft: statsMap['DRAFT'] || 0,
        archived: statsMap['ARCHIVED'] || 0,
        total: courses.length,
      }}
    />
  );
}

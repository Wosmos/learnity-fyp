import { requireServerUser } from '@/lib/auth/server';
import { getCachedStudentCourses, toISO } from '@/lib/cache/server-cache';
import { StudentCoursesClient } from './StudentCoursesClient';

export default async function MyCoursesPage() {
  const user = await requireServerUser();

  const enrollments = await getCachedStudentCourses(user.id);

  const serialized = enrollments.map(e => ({
    id: e.id,
    status: e.status,
    progress: e.progress,
    enrolledAt: toISO(e.enrolledAt)!,
    lastAccessedAt: toISO(e.lastAccessedAt)!,
    completedAt: toISO(e.completedAt),
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

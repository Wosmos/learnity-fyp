import { prisma } from '@/lib/prisma';
import { requireServerUser } from '@/lib/auth/server';
import { TeacherDashboardClient } from './TeacherDashboardClient';

export default async function TeacherDashboardPage() {
  const user = await requireServerUser();

  // Fetch courses with counts for stats computation
  const courses = await prisma.course.findMany({
    where: { teacherId: user.id },
    select: {
      id: true,
      title: true,
      status: true,
      enrollmentCount: true,
      lessonCount: true,
      averageRating: true,
      reviewCount: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // Compute stats from courses
  const totalStudents = courses.reduce((sum, c) => sum + c.enrollmentCount, 0);
  const totalLessons = courses.reduce((sum, c) => sum + c.lessonCount, 0);
  const publishedCourses = courses.filter(c => c.status === 'PUBLISHED').length;
  const ratedCourses = courses.filter(c => Number(c.averageRating) > 0);
  const averageRating =
    ratedCourses.length > 0
      ? ratedCourses.reduce((sum, c) => sum + Number(c.averageRating), 0) / ratedCourses.length
      : 0;
  const totalReviews = courses.reduce((sum, c) => sum + c.reviewCount, 0);

  const stats = {
    totalStudents,
    totalCourses: courses.length,
    publishedCourses,
    totalLessons,
    averageRating,
    totalReviews,
  };

  // Recent courses (top 4)
  const recentCourses = courses.slice(0, 4).map(c => ({
    id: c.id,
    title: c.title,
    status: c.status as 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED',
    enrollmentCount: c.enrollmentCount,
    lessonCount: c.lessonCount,
  }));

  // Fetch recent activity (enrollments + reviews as activity items)
  const [recentEnrollments, recentReviews] = await Promise.all([
    prisma.enrollment.findMany({
      where: { course: { teacherId: user.id } },
      select: {
        id: true,
        enrolledAt: true,
        student: { select: { firstName: true, lastName: true } },
        course: { select: { title: true } },
      },
      orderBy: { enrolledAt: 'desc' },
      take: 5,
    }),
    prisma.review.findMany({
      where: { course: { teacherId: user.id } },
      select: {
        id: true,
        rating: true,
        createdAt: true,
        student: { select: { firstName: true, lastName: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  // Build activity feed
  const activityItems = [
    ...recentEnrollments.map(e => ({
      id: e.id,
      type: 'new_enrollment',
      message: `${e.student.firstName} ${e.student.lastName} enrolled in ${e.course.title}`,
      time: e.enrolledAt.toISOString(),
      sortDate: e.enrolledAt,
    })),
    ...recentReviews.map(r => ({
      id: r.id,
      type: 'review_received',
      message: `${r.student.firstName} ${r.student.lastName} left a ${r.rating}-star review on ${r.course.title}`,
      time: r.createdAt.toISOString(),
      sortDate: r.createdAt,
    })),
  ]
    .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
    .slice(0, 8)
    .map(({ sortDate, ...rest }) => rest);

  const displayName = user.firstName || 'Teacher';

  return (
    <TeacherDashboardClient
      displayName={displayName}
      stats={stats}
      recentCourses={recentCourses}
      recentActivity={activityItems}
    />
  );
}

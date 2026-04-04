import { prisma } from '@/lib/prisma';
import { requireServerUser } from '@/lib/auth/server';
import { toISO } from '@/lib/cache/server-cache';
import { TeacherStudentsClient } from './TeacherStudentsClient';

export default async function TeacherStudentsPage() {
  const user = await requireServerUser();

  // Fetch all data in parallel (replicating the 4 API calls)
  const [coursesWithEnrollments, allCourses, teacherProfile] = await Promise.all([
    // For students data
    prisma.course.findMany({
      where: { teacherId: user.id },
      include: {
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePicture: true,
              },
            },
          },
          take: 50,
          orderBy: { enrolledAt: 'desc' },
        },
      },
      take: 50,
    }),
    // For courses data (curriculum view)
    prisma.course.findMany({
      where: { teacherId: user.id },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { sections: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    // For stats
    prisma.teacherProfile.findUnique({
      where: { userId: user.id },
      select: { rating: true, reviewCount: true },
    }),
  ]);

  // --- Build students data ---
  const studentMap = new Map<string, {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string | null;
    enrolledCourses: Array<{
      courseId: string;
      courseTitle: string;
      progress: number;
      enrolledAt: string;
      lastAccessedAt: string;
      status: string;
    }>;
    totalProgress: number;
    lastActive: string;
    totalCoursesEnrolled: number;
  }>();

  coursesWithEnrollments.forEach(course => {
    course.enrollments.forEach(enrollment => {
      const existing = studentMap.get(enrollment.student.id) || {
        id: enrollment.student.id,
        firstName: enrollment.student.firstName,
        lastName: enrollment.student.lastName,
        email: enrollment.student.email,
        profilePicture: enrollment.student.profilePicture,
        enrolledCourses: [],
        totalProgress: 0,
        lastActive: toISO(enrollment.lastAccessedAt)!,
        totalCoursesEnrolled: 0,
      };

      existing.enrolledCourses.push({
        courseId: course.id,
        courseTitle: course.title,
        progress: enrollment.progress,
        enrolledAt: toISO(enrollment.enrolledAt)!,
        lastAccessedAt: toISO(enrollment.lastAccessedAt)!,
        status: enrollment.status,
      });
      existing.totalCoursesEnrolled += 1;

      // Keep most recent activity
      if (
        new Date(enrollment.lastAccessedAt).getTime() >
        new Date(existing.lastActive).getTime()
      ) {
        existing.lastActive = toISO(enrollment.lastAccessedAt)!;
      }

      studentMap.set(enrollment.student.id, existing);
    });
  });

  const allStudents = Array.from(studentMap.values()).map(student => {
    const totalProgress = student.enrolledCourses.reduce(
      (acc, course) => acc + course.progress,
      0
    );
    student.totalProgress =
      student.enrolledCourses.length > 0
        ? Math.round(totalProgress / student.enrolledCourses.length)
        : 0;
    return student;
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const activeCount = allStudents.filter(
    student => new Date(student.lastActive) > sevenDaysAgo
  ).length;

  const totalCohortProgress = allStudents.reduce(
    (acc, student) => acc + student.totalProgress,
    0
  );
  const averageProgress =
    allStudents.length > 0
      ? Math.round(totalCohortProgress / allStudents.length)
      : 0;

  const studentsData = {
    students: allStudents,
    total: allStudents.length,
    activeCount,
    completedCount: 0,
    averageProgress,
  };

  // --- Build courses data ---
  const publishedCount = allCourses.filter(c => c.status === 'PUBLISHED').length;
  const draftCount = allCourses.filter(c => c.status === 'DRAFT').length;
  const totalEnrollments = allCourses.reduce(
    (acc, c) => acc + c.enrollmentCount,
    0
  );

  const coursesData = {
    courses: allCourses.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      thumbnailUrl: c.thumbnailUrl,
      status: c.status,
      difficulty: c.difficulty,
      lessonCount: c.lessonCount,
      sectionCount: c._count.sections,
      enrollmentCount: c.enrollmentCount,
      averageRating: Number(c.averageRating),
      totalDuration: c.totalDuration,
      category: c.category,
    })),
    total: allCourses.length,
    publishedCount,
    draftCount,
    totalEnrollments,
  };

  // --- Build schedule data (mock, same as API) ---
  const scheduleData = {
    events: [
      {
        id: '1',
        title: 'Office Hours: Algebra',
        description: null,
        type: 'office_hours',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        isLive: true,
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        courseId: 'course_1',
        courseName: 'Mastering Algebra',
        attendeeCount: 5,
        maxAttendees: 20,
      },
      {
        id: '2',
        title: 'Weekly Review: Calculus',
        description: null,
        type: 'lecture',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 90000000).toISOString(),
        isLive: false,
        meetingLink: null,
        courseId: 'course_2',
        courseName: 'Calculus I',
        attendeeCount: 12,
        maxAttendees: null,
      },
    ],
    upcomingCount: 2,
    todayCount: 1,
    thisWeekCount: 2,
  };

  // --- Build stats ---
  const totalCourseCount = allCourses.length;
  const publishedCourseCount = publishedCount;
  const totalEnrollmentCount = await prisma.enrollment.count({
    where: { course: { teacherId: user.id } },
  });
  const activeEnrollmentCount = await prisma.enrollment.count({
    where: { course: { teacherId: user.id }, status: 'ACTIVE' },
  });

  const statsData = {
    totalCourses: totalCourseCount,
    publishedCourses: publishedCourseCount,
    totalEnrollments: totalEnrollmentCount,
    activeEnrollments: activeEnrollmentCount,
    averageRating: teacherProfile ? Number(teacherProfile.rating) : 0,
    totalReviews: teacherProfile?.reviewCount || 0,
  };

  return (
    <TeacherStudentsClient
      studentsData={studentsData}
      coursesData={coursesData}
      scheduleData={scheduleData}
      stats={statsData}
    />
  );
}

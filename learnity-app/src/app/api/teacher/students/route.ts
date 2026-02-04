import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';

interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string | null;
  enrolledCourses: Array<{
    courseId: string;
    courseTitle: string;
    progress: number;
    enrolledAt: Date;
    lastAccessedAt: Date;
    status: string;
  }>;
  totalProgress: number;
  lastActive: Date;
  totalCoursesEnrolled: number;
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    const teacher = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Fetch all courses for the teacher
    const courses = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      include: {
        enrollments: {
          include: {
            student: true, // Include student details
          },
        },
      },
    });

    // Flatten enrollments to get a list of students
    const studentMap = new Map<string, StudentData>();

    courses.forEach(course => {
      course.enrollments.forEach(enrollment => {
        const existingStudent = studentMap.get(enrollment.student.id) || {
          id: enrollment.student.id,
          firstName: enrollment.student.firstName,
          lastName: enrollment.student.lastName,
          email: enrollment.student.email,
          profilePicture: enrollment.student.profilePicture,
          enrolledCourses: [],
          totalProgress: 0,
          lastActive: enrollment.lastAccessedAt,
          totalCoursesEnrolled: 0,
        };

        existingStudent.enrolledCourses.push({
          courseId: course.id,
          courseTitle: course.title,
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
          lastAccessedAt: enrollment.lastAccessedAt,
          status: enrollment.status,
        });
        existingStudent.totalCoursesEnrolled += 1;

        // Keep most recent activity
        if (
          new Date(enrollment.lastAccessedAt).getTime() >
          new Date(existingStudent.lastActive).getTime()
        ) {
          existingStudent.lastActive = enrollment.lastAccessedAt;
        }

        studentMap.set(enrollment.student.id, existingStudent);
      });
    });

    const students = Array.from(studentMap.values()).map(student => {
      // Calculate average progress across enrolled courses
      const totalProgress = student.enrolledCourses.reduce(
        (acc: number, course) => acc + course.progress,
        0
      );
      student.totalProgress = Math.round(
        totalProgress / student.enrolledCourses.length
      );
      return student;
    });

    const activeCount = students.filter(student => {
      // Active if last login within 7 days
      const lastActive = new Date(student.lastActive);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return lastActive > sevenDaysAgo;
    }).length;

    // Avg progress for entire cohort
    const totalCohortProgress = students.reduce(
      (acc, student) => acc + student.totalProgress,
      0
    );
    const averageProgress =
      students.length > 0
        ? Math.round(totalCohortProgress / students.length)
        : 0;

    return NextResponse.json({
      data: {
        students,
        total: students.length,
        activeCount,
        completedCount: 0, // Placeholder
        averageProgress,
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

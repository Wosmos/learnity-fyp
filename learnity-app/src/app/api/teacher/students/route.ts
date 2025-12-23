import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';
import { EnrollmentStatus } from '@prisma/client';

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
                user: true // Determine student details
            }
        }
      }
    });

    // Flatten enrollments to get a list of students
    const studentMap = new Map<string, any>();

    courses.forEach(course => {
        course.enrollments.forEach(enrollment => {
            const updateStudent = studentMap.get(enrollment.user.id) || {
                id: enrollment.user.id,
                firstName: enrollment.user.firstName,
                lastName: enrollment.user.lastName,
                email: enrollment.user.email,
                profilePicture: enrollment.user.profilePicture,
                enrolledCourses: [],
                totalProgress: 0,
                lastActive: enrollment.lastAccessedAt,
                totalCoursesEnrolled: 0,
            };

            updateStudent.enrolledCourses.push({
                courseId: course.id,
                courseTitle: course.title,
                progress: enrollment.progress,
                enrolledAt: enrollment.enrolledAt,
                lastAccessedAt: enrollment.lastAccessedAt,
                status: enrollment.status
            });
            updateStudent.totalCoursesEnrolled += 1;
            
            // Keep most recent activity
            if (new Date(enrollment.lastAccessedAt).getTime() > new Date(updateStudent.lastActive).getTime()) {
                updateStudent.lastActive = enrollment.lastAccessedAt;
            }

            studentMap.set(enrollment.user.id, updateStudent);
        });
    });

    const students = Array.from(studentMap.values()).map(s => {
        // Calculate average progress across enrolled courses
        const totalP = s.enrolledCourses.reduce((acc: number, curr: any) => acc + curr.progress, 0);
        s.totalProgress = Math.round(totalP / s.enrolledCourses.length);
        return s;
    });

    const activeCount = students.filter(s => {
        // Active if last login within 7 days
        const lastActive = new Date(s.lastActive);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return lastActive > sevenDaysAgo;
    }).length;

    // Avg progress for entire cohort
    const totalCohortProgress = students.reduce((acc, s) => acc + s.totalProgress, 0);
    const averageProgress = students.length > 0 ? Math.round(totalCohortProgress / students.length) : 0;

    return NextResponse.json({
      data: {
        students,
        total: students.length,
        activeCount,
        completedCount: 0, // Placeholder
        averageProgress
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';

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
      include: {
        teacherProfile: true
      }
    });

    if (!teacher || !teacher.teacherProfile) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const profile = teacher.teacherProfile;

    return NextResponse.json({
      data: {
        totalCourses: await prisma.course.count({ where: { teacherId: teacher.id } }),
        publishedCourses: await prisma.course.count({ where: { teacherId: teacher.id, status: 'PUBLISHED' } }),
        totalEnrollments: await prisma.enrollment.count({ where: { course: { teacherId: teacher.id } } }),
        activeEnrollments: await prisma.enrollment.count({ where: { course: { teacherId: teacher.id }, status: 'ACTIVE' } }),
        averageRating: Number(profile.rating),
        totalReviews: profile.reviewCount
      }
    });
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

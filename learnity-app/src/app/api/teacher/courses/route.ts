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
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const courses = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const publishedCount = courses.filter(c => c.status === 'PUBLISHED').length;
    const draftCount = courses.filter(c => c.status === 'DRAFT').length;
    const totalEnrollments = courses.reduce((acc, c) => acc + c.enrollmentCount, 0);

    return NextResponse.json({
      data: {
        courses,
        total: courses.length,
        publishedCount,
        draftCount,
        totalEnrollments
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

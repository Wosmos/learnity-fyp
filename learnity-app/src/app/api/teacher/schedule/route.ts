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
        teacherProfile: true,
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Mock Schedule Data for now (until we have a real Schedule/Event model)
    // In a real app, we would fetch from prisma.event or similar
    const events = [
      {
        id: '1',
        title: 'Office Hours: Algebra',
        type: 'office_hours',
        startTime: new Date().toISOString(), // Today now
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
        type: 'lecture',
        startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 90000000).toISOString(),
        isLive: false,
        meetingLink: null,
        courseId: 'course_2',
        courseName: 'Calculus I',
        attendeeCount: 12,
        maxAttendees: null,
      },
    ];

    return NextResponse.json({
      data: {
        events,
        upcomingCount: events.length,
        todayCount: 1,
        thisWeekCount: 2,
      },
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

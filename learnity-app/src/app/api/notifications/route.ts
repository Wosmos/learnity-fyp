/**
 * Notifications API
 * GET /api/notifications - Get user notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await authMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.firebaseUid },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = { userId: dbUser.id };
    if (unreadOnly) {
      where.read = false;
    }

    const notifications = await prisma.sessionNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        session: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

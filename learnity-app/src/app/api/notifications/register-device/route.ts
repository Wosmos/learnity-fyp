/**
 * Device Token Registration API
 * POST /api/notifications/register-device - Register FCM/APNs token
 */

import { NextRequest, NextResponse } from 'next/server';
import { pushNotificationService } from '@/lib/services/push-notification.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Platform } from '@prisma/client';

// Validation schema
const RegisterDeviceSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['WEB', 'ANDROID', 'IOS']),
});

/**
 * POST /api/notifications/register-device
 * Register device token for push notifications
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const authResult = await authMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: user.firebaseUid },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = RegisterDeviceSchema.parse(body);

    // Register device token
    await pushNotificationService.registerDeviceToken(
      dbUser.id,
      validatedData.token,
      validatedData.platform as Platform
    );

    return NextResponse.json({
      success: true,
      message: 'Device registered successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to register device:', error);
    return NextResponse.json(
      { error: 'Failed to register device' },
      { status: 500 }
    );
  }
}

/**
 * Leaderboard API Route
 * GET /api/gamification/leaderboard - Get leaderboard data
 */

import { NextRequest, NextResponse } from 'next/server';
import { gamificationService } from '@/lib/services/gamification.service';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import {
  createSuccessResponse,
  createErrorResponse,
  createInternalErrorResponse,
} from '@/lib/utils/api-response.utils';

/**
 * GET /api/gamification/leaderboard
 * Get leaderboard data
 * Query params:
 * - type: 'global' | 'course' (default: 'global')
 * - courseId: string (required if type is 'course')
 * - limit: number (default: 10, max: 50)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user (optional - leaderboard can be public)
    const authResult = await authMiddleware(request, {
      skipEmailVerification: true,
    });

    let currentUserId: string | undefined;

    if (!(authResult instanceof NextResponse)) {
      const { user } = authResult;
      const dbUser = await prisma.user.findUnique({
        where: { firebaseUid: user.firebaseUid },
        select: { id: true },
      });
      currentUserId = dbUser?.id;
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'global';
    const courseId = searchParams.get('courseId');
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(parseInt(limitParam || '10', 10), 1), 50);

    if (type === 'course') {
      // Course-specific leaderboard
      if (!courseId) {
        return createErrorResponse(
          'INVALID_PARAMS',
          'courseId is required for course leaderboard',
          undefined,
          400
        );
      }

      // Verify course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, title: true },
      });

      if (!course) {
        return createErrorResponse(
          'COURSE_NOT_FOUND',
          'Course not found',
          undefined,
          404
        );
      }

      const leaderboard = await gamificationService.getCourseLeaderboard(
        courseId,
        limit,
        currentUserId
      );

      return createSuccessResponse({
        type: 'course',
        course: {
          id: course.id,
          title: course.title,
        },
        ...leaderboard,
      });
    }

    // Global leaderboard
    const leaderboard = await gamificationService.getGlobalLeaderboard(
      limit,
      currentUserId
    );

    return createSuccessResponse({
      type: 'global',
      ...leaderboard,
    });
  } catch (error) {
    console.error('[GET /api/gamification/leaderboard] Error:', error);
    return createInternalErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch leaderboard'
    );
  }
}

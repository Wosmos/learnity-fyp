import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { withAdminApiAuth } from '@/lib/utils/api-auth.utils';

type AuthenticatedAdmin = {
  firebaseUid: string;
};

/**
 * Admin Statistics API
 * GET: Fetch platform statistics and metrics
 */

async function handleGetStats(
  request: NextRequest,
  user: AuthenticatedAdmin
): Promise<NextResponse> {
  try {
    console.debug('[AdminStats] request received', {
      url: request.url,
      admin: user.firebaseUid,
    });

    // Use the shared service to get stats
    const { getAdminStats } =
      await import('@/lib/services/admin-stats.service');
    const data = await getAdminStats();

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Admin stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform statistics' },
      { status: 500 }
    );
  }
}

export const GET = withAdminApiAuth(handleGetStats);

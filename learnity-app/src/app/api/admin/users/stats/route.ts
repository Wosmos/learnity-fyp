/**
 * Admin User Statistics API
 * Provides detailed user statistics for admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { withAdminApiAuth } from '@/lib/utils/api-auth.utils';

/**
 * GET /api/admin/users/stats
 * Fetch user statistics and metrics
 */
async function handleGetUserStats(request: NextRequest): Promise<NextResponse> {
  try {
    console.debug('[AdminUserStats] request received', { url: request.url });

    // Get current date for calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch comprehensive user statistics
    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      pendingVerifications,
      studentCount,
      teacherCount,
      adminCount,
      pendingTeacherCount,
      rejectedTeacherCount,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active users (logged in within last 30 days)
      prisma.user.count({
        where: {
          isActive: true,
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // New users this month
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),

      // Pending email verifications
      prisma.user.count({
        where: {
          emailVerified: false,
          isActive: true,
        },
      }),

      // Students
      prisma.user.count({
        where: { role: UserRole.STUDENT },
      }),

      // Teachers
      prisma.user.count({
        where: { role: UserRole.TEACHER },
      }),

      // Admins
      prisma.user.count({
        where: { role: UserRole.ADMIN },
      }),

      // Pending teachers
      prisma.user.count({
        where: { role: UserRole.PENDING_TEACHER },
      }),

      // Rejected teachers
      prisma.user.count({
        where: { role: UserRole.REJECTED_TEACHER },
      }),
    ]);

    // Calculate additional metrics
    const inactiveUsers = totalUsers - activeUsers;
    const verifiedUsers = totalUsers - pendingVerifications;
    const verificationRate =
      totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0;

    // User distribution by role
    const roleDistribution = {
      students: studentCount,
      teachers: teacherCount,
      admins: adminCount,
      pendingTeachers: pendingTeacherCount,
      rejectedTeachers: rejectedTeacherCount,
    };

    // Growth metrics (last 7 days vs previous 7 days)
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const previous7Days = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [recentSignups, previousSignups] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: last7Days,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: previous7Days,
            lt: last7Days,
          },
        },
      }),
    ]);

    const signupGrowthRate =
      previousSignups > 0
        ? ((recentSignups - previousSignups) / previousSignups) * 100
        : 0;

    const stats = {
      // Core metrics
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsersThisMonth,
      pendingVerifications,
      verifiedUsers,
      verificationRate: Math.round(verificationRate * 100) / 100,

      // Role counts
      studentCount,
      teacherCount,
      adminCount,
      pendingTeacherCount,
      rejectedTeacherCount,

      // Role distribution
      roleDistribution,

      // Growth metrics
      recentSignups,
      previousSignups,
      signupGrowthRate: Math.round(signupGrowthRate * 100) / 100,

      // Additional insights
      teacherApprovalRate:
        pendingTeacherCount + teacherCount > 0
          ? (teacherCount /
              (pendingTeacherCount + teacherCount + rejectedTeacherCount)) *
            100
          : 0,

      userEngagementRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
    };

    return NextResponse.json({
      success: true,
      stats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin user stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}

export const GET = withAdminApiAuth(handleGetUserStats);

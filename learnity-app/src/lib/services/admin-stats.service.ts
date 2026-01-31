import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

export interface AdminStatsData {
  stats: {
    totalUsers: number;
    pendingTeachers: number;
    approvedTeachers: number;
    totalStudents: number;
    activeSessions: number;
    totalRevenue: number;
    monthlyGrowth: number;
    platformRating: number;
    newUsersThisMonth: number;
    newUsersLastMonth: number;
    userGrowthRate: number;
    recentSignups: number;
    sessionCompletionRate: number;
    teacherRetentionRate: number;
    revenueGrowth: number;
    monthlyRevenue: number;
    systemStatus: string;
    uptime: string;
    responseTime: string;
  };
  platformMetrics: {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'stable';
  }[];
  lastUpdated: string;
}

/**
 * Fetch platform statistics and metrics for the admin dashboard
 */
export async function getAdminStats(): Promise<AdminStatsData> {
  // Get current date ranges
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Fetch user statistics
  const [
    totalUsers,
    pendingTeachers,
    approvedTeachers,
    totalStudents,
    newUsersThisMonth,
    newUsersLastMonth,
  ] = await Promise.all([
    // Total users
    prisma.user.count(),

    // Pending teachers
    prisma.user.count({
      where: { role: UserRole.PENDING_TEACHER },
    }),

    // Approved teachers
    prisma.user.count({
      where: { role: UserRole.TEACHER },
    }),

    // Total students
    prisma.user.count({
      where: { role: UserRole.STUDENT },
    }),

    // New users this month
    prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    }),

    // New users last month
    prisma.user.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    }),
  ]);

  // Calculate growth metrics
  const userGrowthRate =
    newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
      : 0;

  // Fetch session statistics (if sessions table exists)
  let activeSessions = 0;
  let sessionCompletionRate = 0;

  try {
    // These would be actual queries if session tables exist
    // For now, using placeholders as in the original route
    activeSessions = Math.floor(Math.random() * 100);
    sessionCompletionRate = 94.2;
  } catch {
    // Sessions table might not exist yet
  }

  // Fetch revenue statistics (placeholder for now)
  const totalRevenue = 45680;
  const monthlyRevenue = 12450;
  const revenueGrowth = 12.5;

  // Platform rating (would come from reviews table)
  const platformRating = 4.7;

  // Recent activity metrics
  const recentSignups = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
  });

  // Teacher retention rate (placeholder calculation)
  const teacherRetentionRate = 89.5;

  const stats = {
    // Core metrics
    totalUsers,
    pendingTeachers,
    approvedTeachers,
    totalStudents,
    activeSessions,
    totalRevenue,
    monthlyGrowth: userGrowthRate,
    platformRating,

    // Growth metrics
    newUsersThisMonth,
    newUsersLastMonth,
    userGrowthRate: Math.round(userGrowthRate * 100) / 100,
    recentSignups,

    // Performance metrics
    sessionCompletionRate,
    teacherRetentionRate,
    revenueGrowth,
    monthlyRevenue,

    // Platform health
    systemStatus: 'operational',
    uptime: '99.9%',
    responseTime: '120ms',
  };

  // Platform metrics for dashboard
  const platformMetrics = [
    {
      label: 'New Signups',
      value: recentSignups.toString(),
      change: `+${Math.round(userGrowthRate)}%`,
      trend: (userGrowthRate > 0
        ? 'up'
        : userGrowthRate < 0
          ? 'down'
          : 'stable') as 'up' | 'down' | 'stable',
    },
    {
      label: 'Session Completion',
      value: `${sessionCompletionRate}%`,
      change: '+2.1%',
      trend: 'up' as const,
    },
    {
      label: 'Teacher Retention',
      value: `${teacherRetentionRate}%`,
      change: '-1.2%',
      trend: 'down' as const,
    },
    {
      label: 'Revenue Growth',
      value: `${revenueGrowth}%`,
      change: '+3.2%',
      trend: 'up' as const,
    },
  ];

  return {
    stats,
    platformMetrics,
    lastUpdated: new Date().toISOString(),
  };
}

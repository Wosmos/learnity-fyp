import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { EngagementClient } from './EngagementClient';

export const metadata: Metadata = {
  title: 'Engagement | Admin',
  description: 'Manage gamification, sessions, and certificates.',
};

export default async function EngagementPage() {
  const [
    leaderboard,
    xpStats,
    badgeStats,
    sessions,
    sessionCounts,
    certificates,
  ] = await Promise.all([
    // Top 20 leaderboard
    prisma.userProgress.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } },
      },
      orderBy: { totalXP: 'desc' },
      take: 20,
    }),
    // XP aggregate stats
    prisma.userProgress.aggregate({
      _sum: { totalXP: true },
      _avg: { totalXP: true, currentLevel: true, currentStreak: true },
      _max: { totalXP: true, currentStreak: true, longestStreak: true },
      _count: true,
    }),
    // Badge distribution
    prisma.badge.groupBy({
      by: ['type'],
      _count: true,
      orderBy: { _count: { type: 'desc' } },
    }),
    // Recent sessions
    prisma.tutoringSession.findMany({
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { scheduledAt: 'desc' },
      take: 50,
    }),
    // Session status counts
    prisma.tutoringSession.groupBy({
      by: ['status'],
      _count: true,
    }),
    // Recent certificates
    prisma.certificate.findMany({
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { issuedAt: 'desc' },
      take: 50,
    }),
  ]);

  const sessionStatusMap = Object.fromEntries(sessionCounts.map(s => [s.status, s._count]));

  return (
    <EngagementClient
      leaderboard={leaderboard.map((p, i) => ({
        rank: i + 1,
        userId: p.user.id,
        name: `${p.user.firstName} ${p.user.lastName}`,
        email: p.user.email,
        profilePicture: p.user.profilePicture,
        totalXP: p.totalXP,
        level: p.currentLevel,
        streak: p.currentStreak,
      }))}
      xpStats={{
        totalXPAwarded: xpStats._sum.totalXP || 0,
        avgXP: Math.round(xpStats._avg.totalXP || 0),
        avgLevel: Math.round((xpStats._avg.currentLevel || 0) * 10) / 10,
        avgStreak: Math.round((xpStats._avg.currentStreak || 0) * 10) / 10,
        maxXP: xpStats._max.totalXP || 0,
        maxStreak: xpStats._max.longestStreak || 0,
        totalPlayers: xpStats._count,
      }}
      badgeStats={badgeStats.map(b => ({ type: b.type, count: b._count }))}
      sessions={sessions.map(s => ({
        id: s.id,
        title: s.title,
        status: s.status,
        scheduledAt: s.scheduledAt.toISOString(),
        duration: s.duration,
        student: { id: s.student.id, name: `${s.student.firstName} ${s.student.lastName}` },
        teacher: { id: s.teacher.id, name: `${s.teacher.firstName} ${s.teacher.lastName}` },
      }))}
      sessionStats={{
        pending: sessionStatusMap['PENDING'] || 0,
        scheduled: sessionStatusMap['SCHEDULED'] || 0,
        completed: sessionStatusMap['COMPLETED'] || 0,
        cancelled: sessionStatusMap['CANCELLED'] || 0,
        total: sessions.length,
      }}
      certificates={certificates.map(c => ({
        id: c.id,
        certificateId: c.certificateId,
        issuedAt: c.issuedAt.toISOString(),
        student: { id: c.student.id, name: `${c.student.firstName} ${c.student.lastName}` },
        course: { id: c.course.id, title: c.course.title },
      }))}
    />
  );
}

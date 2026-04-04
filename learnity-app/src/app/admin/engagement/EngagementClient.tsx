'use client';

import {
  Trophy, Flame, Zap, Video, Award, Calendar, Clock,
  CheckCircle, XCircle, Users, Star,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/stats-card';
import { DataGrid, type ColumnDef } from '@/components/ui/data-grid';
import { Badge } from '@/components/ui/badge';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  email: string;
  profilePicture: string | null;
  totalXP: number;
  level: number;
  streak: number;
}

interface Session {
  id: string;
  title: string;
  status: string;
  scheduledAt: string;
  duration: number;
  student: { id: string; name: string };
  teacher: { id: string; name: string };
}

interface Certificate {
  id: string;
  certificateId: string;
  issuedAt: string;
  student: { id: string; name: string };
  course: { id: string; title: string };
}

interface Props {
  leaderboard: LeaderboardEntry[];
  xpStats: {
    totalXPAwarded: number;
    avgXP: number;
    avgLevel: number;
    avgStreak: number;
    maxXP: number;
    maxStreak: number;
    totalPlayers: number;
  };
  badgeStats: { type: string; count: number }[];
  sessions: Session[];
  sessionStats: { pending: number; scheduled: number; completed: number; cancelled: number; total: number };
  certificates: Certificate[];
}

const sessionStatusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  LIVE: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
  REJECTED: 'bg-red-100 text-red-700',
};

const leaderboardColumns: ColumnDef<LeaderboardEntry>[] = [
  {
    key: 'rank', header: '#',
    render: (e) => <span className='font-bold'>{e.rank <= 3 ? ['🥇', '🥈', '🥉'][e.rank - 1] : e.rank}</span>,
  },
  {
    key: 'name', header: 'Student',
    render: (e) => (
      <div>
        <p className='font-medium'>{e.name}</p>
        <p className='text-xs text-muted-foreground'>{e.email}</p>
      </div>
    ),
  },
  { key: 'level', header: 'Level', align: 'center', render: (e) => <Badge variant='outline'>Lv {e.level}</Badge> },
  {
    key: 'streak', header: 'Streak', align: 'center',
    render: (e) => e.streak > 0
      ? <span className='flex items-center justify-center gap-1 text-sm'><Flame className='h-3 w-3 text-orange-500' />{e.streak}d</span>
      : null,
  },
  {
    key: 'totalXP', header: 'XP', align: 'right', className: 'font-bold text-amber-600',
    render: (e) => e.totalXP.toLocaleString(),
  },
];

const sessionColumns: ColumnDef<Session>[] = [
  { key: 'title', header: 'Title', className: 'font-medium', maxWidth: 'max-w-[200px]' },
  { key: 'student', header: 'Student', className: 'text-muted-foreground', render: (s) => s.student.name },
  { key: 'teacher', header: 'Teacher', className: 'text-muted-foreground', render: (s) => s.teacher.name },
  {
    key: 'status', header: 'Status',
    render: (s) => <Badge className={`${sessionStatusColors[s.status] || ''} border-0 text-xs`}>{s.status}</Badge>,
  },
  { key: 'duration', header: 'Duration', className: 'text-sm', render: (s) => `${s.duration}min` },
  {
    key: 'scheduledAt', header: 'Scheduled', align: 'right', className: 'text-sm text-muted-foreground',
    render: (s) => new Date(s.scheduledAt).toLocaleDateString(),
  },
];

const certificateColumns: ColumnDef<Certificate>[] = [
  { key: 'certificateId', header: 'Certificate ID', className: 'font-mono text-sm' },
  { key: 'student', header: 'Student', className: 'font-medium', render: (c) => c.student.name },
  { key: 'course', header: 'Course', className: 'text-muted-foreground', maxWidth: 'max-w-[250px]', render: (c) => c.course.title },
  {
    key: 'issuedAt', header: 'Issued', align: 'right', className: 'text-sm text-muted-foreground',
    render: (c) => new Date(c.issuedAt).toLocaleDateString(),
  },
];

export function EngagementClient({ leaderboard, xpStats, badgeStats, sessions, sessionStats, certificates }: Props) {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight text-foreground'>Engagement</h1>
        <p className='text-muted-foreground'>Gamification, tutoring sessions, and certificates.</p>
      </div>

      {/* Top Stats */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <MetricCard title='Total XP Awarded' value={xpStats.totalXPAwarded.toLocaleString()} icon={Zap} subtitle='Platform-wide' />
        <MetricCard title='Active Players' value={xpStats.totalPlayers} icon={Users} subtitle='With XP activity' />
        <MetricCard title='Avg Level' value={xpStats.avgLevel} icon={Trophy} subtitle='Across all users' />
        <MetricCard title='Max Streak' value={`${xpStats.maxStreak} days`} icon={Flame} subtitle='Longest streak' />
      </div>

      <Tabs defaultValue='gamification'>
        <TabsList className='h-11'>
          <TabsTrigger value='gamification' className='gap-2'>
            <Trophy className='h-4 w-4' />Gamification
          </TabsTrigger>
          <TabsTrigger value='sessions' className='gap-2'>
            <Video className='h-4 w-4' />Sessions
            <Badge variant='secondary'>{sessionStats.total}</Badge>
          </TabsTrigger>
          <TabsTrigger value='certificates' className='gap-2'>
            <Award className='h-4 w-4' />Certificates
            <Badge variant='secondary'>{certificates.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Gamification Tab */}
        <TabsContent value='gamification' className='mt-6 space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Trophy className='h-5 w-5 text-amber-500' />Top 20 Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <DataGrid columns={leaderboardColumns} data={leaderboard} rowKey={(e) => e.userId} emptyMessage='No leaderboard data yet.' />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Star className='h-5 w-5 text-purple-500' />Badge Distribution
                </CardTitle>
                <CardDescription>How many of each badge type have been awarded</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {badgeStats.length > 0 ? badgeStats.map(b => (
                    <div key={b.type} className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
                      <span className='font-medium text-sm'>{b.type.replace(/_/g, ' ')}</span>
                      <Badge variant='secondary'>{b.count} awarded</Badge>
                    </div>
                  )) : (
                    <p className='text-muted-foreground text-center py-8'>No badges awarded yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value='sessions' className='mt-6'>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <MetricCard title='Pending' value={sessionStats.pending} icon={Clock} subtitle='Awaiting confirmation' />
            <MetricCard title='Scheduled' value={sessionStats.scheduled} icon={Calendar} subtitle='Upcoming' />
            <MetricCard title='Completed' value={sessionStats.completed} icon={CheckCircle} subtitle='Finished' />
            <MetricCard title='Cancelled' value={sessionStats.cancelled} icon={XCircle} subtitle='Dropped' />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>All tutoring sessions across the platform</CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              <DataGrid columns={sessionColumns} data={sessions} emptyMessage='No sessions yet.' pageSize={20} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value='certificates' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Award className='h-5 w-5 text-green-600' />Issued Certificates
              </CardTitle>
              <CardDescription>{certificates.length} certificates issued</CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              <DataGrid columns={certificateColumns} data={certificates} emptyMessage='No certificates issued yet.' pageSize={20} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

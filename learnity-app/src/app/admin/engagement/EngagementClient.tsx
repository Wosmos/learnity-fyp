'use client';

import {
  Trophy, Flame, Zap, Video, Award, Calendar, Clock,
  CheckCircle, XCircle, Users, Star, FileText,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

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

export function EngagementClient({ leaderboard, xpStats, badgeStats, sessions, sessionStats, certificates }: Props) {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight text-foreground'>Engagement</h1>
        <p className='text-muted-foreground'>Gamification, tutoring sessions, and certificates.</p>
      </div>

      {/* Top Stats */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {[
          { label: 'Total XP Awarded', value: xpStats.totalXPAwarded.toLocaleString(), icon: Zap, color: 'text-amber-600 bg-amber-50' },
          { label: 'Active Players', value: String(xpStats.totalPlayers), icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Avg Level', value: String(xpStats.avgLevel), icon: Trophy, color: 'text-purple-600 bg-purple-50' },
          { label: 'Max Streak', value: `${xpStats.maxStreak} days`, icon: Flame, color: 'text-red-600 bg-red-50' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-2xl font-bold'>{s.value}</p>
                  <p className='text-sm text-muted-foreground'>{s.label}</p>
                </div>
                <div className={`p-2 rounded-lg ${s.color}`}>
                  <s.icon className='h-5 w-5' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Trophy className='h-5 w-5 text-amber-500' />Top 20 Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='pl-6 w-12'>#</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead className='text-center'>Level</TableHead>
                      <TableHead className='text-center'>Streak</TableHead>
                      <TableHead className='text-right pr-6'>XP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map(entry => (
                      <TableRow key={entry.userId}>
                        <TableCell className='pl-6 font-bold'>
                          {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                        </TableCell>
                        <TableCell>
                          <p className='font-medium'>{entry.name}</p>
                          <p className='text-xs text-muted-foreground'>{entry.email}</p>
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge variant='outline'>Lv {entry.level}</Badge>
                        </TableCell>
                        <TableCell className='text-center'>
                          {entry.streak > 0 && (
                            <span className='flex items-center justify-center gap-1 text-sm'>
                              <Flame className='h-3 w-3 text-orange-500' />{entry.streak}d
                            </span>
                          )}
                        </TableCell>
                        <TableCell className='text-right pr-6 font-bold text-amber-600'>
                          {entry.totalXP.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Badge Distribution */}
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
            {[
              { label: 'Pending', value: sessionStats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
              { label: 'Scheduled', value: sessionStats.scheduled, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
              { label: 'Completed', value: sessionStats.completed, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
              { label: 'Cancelled', value: sessionStats.cancelled, icon: XCircle, color: 'text-slate-600 bg-slate-50' },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-2xl font-bold'>{s.value}</p>
                      <p className='text-sm text-muted-foreground'>{s.label}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${s.color}`}>
                      <s.icon className='h-5 w-5' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>All tutoring sessions across the platform</CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='pl-6'>Title</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className='text-right pr-6'>Scheduled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className='pl-6 font-medium max-w-[200px] truncate'>{s.title}</TableCell>
                      <TableCell className='text-muted-foreground'>{s.student.name}</TableCell>
                      <TableCell className='text-muted-foreground'>{s.teacher.name}</TableCell>
                      <TableCell>
                        <Badge className={`${sessionStatusColors[s.status] || ''} border-0 text-xs`}>{s.status}</Badge>
                      </TableCell>
                      <TableCell className='text-sm'>{s.duration}min</TableCell>
                      <TableCell className='text-right pr-6 text-sm text-muted-foreground'>
                        {new Date(s.scheduledAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center py-8 text-muted-foreground'>No sessions yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='pl-6'>Certificate ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className='text-right pr-6'>Issued</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className='pl-6 font-mono text-sm'>{c.certificateId}</TableCell>
                      <TableCell className='font-medium'>{c.student.name}</TableCell>
                      <TableCell className='text-muted-foreground max-w-[250px] truncate'>{c.course.title}</TableCell>
                      <TableCell className='text-right pr-6 text-sm text-muted-foreground'>
                        {new Date(c.issuedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {certificates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className='text-center py-8 text-muted-foreground'>No certificates issued yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Video,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  X,
} from 'lucide-react';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface TutoringSession {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  duration: number;
  status: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
  rejectionReason?: string | null;
  cancellationReason?: string | null;
}

export default function StudentSessionsPage() {
  const { user, loading, isAuthenticated } = useClientAuth();
  const router = useRouter();
  const authenticatedFetch = useAuthenticatedFetch();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard/student/sessions');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoadingData(true);
        const response = await authenticatedFetch('/api/tutoring-sessions');

        if (response.ok) {
          const data = await response.json();
          setSessions(data.data?.sessions || []);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated, authenticatedFetch]);

  const handleCancelSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to cancel this session?')) return;

    try {
      const response = await authenticatedFetch(
        `/api/tutoring-sessions/${sessionId}/cancel`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Cancelled by student' }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Session Cancelled',
          description: 'The tutoring session has been cancelled.',
        });
        // Refresh sessions
        setSessions(prev =>
          prev.map(s =>
            s.id === sessionId ? { ...s, status: 'CANCELLED' } : s
          )
        );
      } else {
        toast({
          title: 'Error',
          description: 'Failed to cancel session',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      const response = await authenticatedFetch(
        `/api/tutoring-sessions/${sessionId}/join`
      );

      if (response.ok) {
        const data = await response.json();
        // In production, redirect to 100ms room with token
        toast({
          title: 'Joining Session',
          description: 'Opening video conference...',
        });
        // TODO: Integrate with 100ms SDK
        console.log('Room credentials:', data.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to join session',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
      ACCEPTED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      SCHEDULED: { bg: 'bg-green-100', text: 'text-green-700', icon: Calendar },
      LIVE: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Video },
      COMPLETED: { bg: 'bg-slate-100', text: 'text-slate-700', icon: CheckCircle },
      CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-700', icon: XCircle },
    };

    const style = styles[status as keyof typeof styles] || styles.PENDING;
    const Icon = style.icon;

    return (
      <Badge className={`${style.bg} ${style.text} border-0 text-xs`}>
        <Icon className='h-3 w-3 mr-1' />
        {status}
      </Badge>
    );
  };

  const filteredSessions = sessions.filter(session => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming')
      return ['PENDING', 'ACCEPTED', 'SCHEDULED'].includes(session.status);
    if (activeTab === 'completed') return session.status === 'COMPLETED';
    if (activeTab === 'cancelled')
      return ['REJECTED', 'CANCELLED'].includes(session.status);
    return true;
  });

  if (loading) return null;

  return (
    <div className='min-h-screen bg-slate-50/50'>
      <PageHeader
        title='My Tutoring Sessions'
        subtitle='Manage your one-on-one learning sessions'
        icon={Video}
      />

      <div className='max-w-[1400px] mx-auto px-4 sm:px-6 py-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-4 mb-6'>
            <TabsTrigger value='all'>All Sessions</TabsTrigger>
            <TabsTrigger value='upcoming'>Upcoming</TabsTrigger>
            <TabsTrigger value='completed'>Completed</TabsTrigger>
            <TabsTrigger value='cancelled'>Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoadingData ? (
              <div className='space-y-4'>
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className='p-6'>
                      <Skeleton className='h-24 w-full' />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredSessions.length > 0 ? (
              <div className='space-y-4'>
                {filteredSessions.map(session => (
                  <Card key={session.id} className='border shadow-sm'>
                    <CardContent className='p-6'>
                      <div className='flex flex-col md:flex-row gap-6'>
                        {/* Teacher Info */}
                        <div className='flex items-start gap-4 flex-1'>
                          <div className='w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0'>
                            {session.teacher.profilePicture ? (
                              <img
                                src={session.teacher.profilePicture}
                                alt={`${session.teacher.firstName} ${session.teacher.lastName}`}
                                className='w-full h-full rounded-full object-cover'
                              />
                            ) : (
                              `${session.teacher.firstName[0]}${session.teacher.lastName[0]}`
                            )}
                          </div>

                          <div className='flex-1 min-w-0'>
                            <div className='flex items-start justify-between gap-2 mb-2'>
                              <div>
                                <h3 className='font-bold text-lg text-slate-900'>
                                  {session.title}
                                </h3>
                                <p className='text-sm text-slate-600 flex items-center gap-1'>
                                  <User className='h-3 w-3' />
                                  with {session.teacher.firstName}{' '}
                                  {session.teacher.lastName}
                                </p>
                              </div>
                              {getStatusBadge(session.status)}
                            </div>

                            {session.description && (
                              <p className='text-sm text-slate-600 mb-3'>
                                {session.description}
                              </p>
                            )}

                            <div className='flex flex-wrap gap-4 text-sm text-slate-500'>
                              <div className='flex items-center gap-1'>
                                <Calendar className='h-4 w-4' />
                                {new Date(session.scheduledAt).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  }
                                )}
                              </div>
                              <div className='flex items-center gap-1'>
                                <Clock className='h-4 w-4' />
                                {new Date(session.scheduledAt).toLocaleTimeString(
                                  'en-US',
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                              </div>
                              <div className='flex items-center gap-1'>
                                <Video className='h-4 w-4' />
                                {session.duration} minutes
                              </div>
                            </div>

                            {session.rejectionReason && (
                              <div className='mt-3 p-3 bg-red-50 border border-red-200 rounded-lg'>
                                <p className='text-sm text-red-700 flex items-start gap-2'>
                                  <AlertCircle className='h-4 w-4 mt-0.5 flex-shrink-0' />
                                  <span>
                                    <strong>Rejected:</strong>{' '}
                                    {session.rejectionReason}
                                  </span>
                                </p>
                              </div>
                            )}

                            {session.cancellationReason && (
                              <div className='mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg'>
                                <p className='text-sm text-slate-700'>
                                  <strong>Cancelled:</strong>{' '}
                                  {session.cancellationReason}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className='flex md:flex-col gap-2 md:w-32'>
                          {session.status === 'LIVE' && (
                            <Button
                              onClick={() => handleJoinSession(session.id)}
                              className='flex-1 md:flex-none bg-green-600 hover:bg-green-700'
                            >
                              <Play className='h-4 w-4 mr-2' />
                              Join
                            </Button>
                          )}

                          {['PENDING', 'ACCEPTED', 'SCHEDULED'].includes(
                            session.status
                          ) && (
                            <Button
                              onClick={() => handleCancelSession(session.id)}
                              variant='outline'
                              className='flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50'
                            >
                              <X className='h-4 w-4 mr-2' />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className='p-12 text-center'>
                  <Video className='h-16 w-16 text-slate-300 mx-auto mb-4' />
                  <h3 className='text-lg font-semibold text-slate-900 mb-2'>
                    No Sessions Found
                  </h3>
                  <p className='text-slate-600 mb-6'>
                    You haven't booked any tutoring sessions yet.
                  </p>
                  <Button
                    onClick={() => router.push('/teachers')}
                    className='bg-indigo-600 hover:bg-indigo-700'
                  >
                    Browse Teachers
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

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
  Check,
  X as XIcon,
} from 'lucide-react';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TutoringSession {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  duration: number;
  status: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
  rejectionReason?: string | null;
}

export default function TeacherSessionsPage() {
  const { user, loading, isAuthenticated } = useClientAuth();
  const router = useRouter();
  const authenticatedFetch = useAuthenticatedFetch();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard/teacher/sessions');
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

  const handleAcceptSession = async (sessionId: string) => {
    try {
      setIsProcessing(true);
      const response = await authenticatedFetch(
        `/api/tutoring-sessions/${sessionId}/accept`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        toast({
          title: 'Session Accepted',
          description: 'The tutoring session has been scheduled.',
        });
        setSessions(prev =>
          prev.map(s => (s.id === sessionId ? { ...s, status: 'ACCEPTED' } : s))
        );
      } else {
        toast({
          title: 'Error',
          description: 'Failed to accept session',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error accepting session:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSession = async () => {
    if (!selectedSession) return;

    try {
      setIsProcessing(true);
      const response = await authenticatedFetch(
        `/api/tutoring-sessions/${selectedSession}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Session Rejected',
          description: 'The student has been notified.',
        });
        setSessions(prev =>
          prev.map(s =>
            s.id === selectedSession
              ? { ...s, status: 'REJECTED', rejectionReason }
              : s
          )
        );
        setRejectDialogOpen(false);
        setRejectionReason('');
        setSelectedSession(null);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to reject session',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error rejecting session:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      const response = await authenticatedFetch(
        `/api/tutoring-sessions/${sessionId}/join`
      );

      if (response.ok) {
        const data = await response.json();
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
    if (activeTab === 'pending') return session.status === 'PENDING';
    if (activeTab === 'scheduled')
      return ['ACCEPTED', 'SCHEDULED'].includes(session.status);
    if (activeTab === 'completed') return session.status === 'COMPLETED';
    if (activeTab === 'rejected')
      return ['REJECTED', 'CANCELLED'].includes(session.status);
    return true;
  });

  if (loading) return null;

  return (
    <div className='min-h-screen bg-slate-50/50'>
      <PageHeader
        title='Tutoring Sessions'
        subtitle='Manage your student session requests'
        icon={Video}
      />

      <div className='max-w-[1400px] mx-auto px-4 sm:px-6 py-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-4 mb-6'>
            <TabsTrigger value='pending'>
              Pending{' '}
              {sessions.filter(s => s.status === 'PENDING').length > 0 && (
                <span className='ml-2 bg-amber-500 text-white text-xs rounded-full px-2 py-0.5'>
                  {sessions.filter(s => s.status === 'PENDING').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value='scheduled'>Scheduled</TabsTrigger>
            <TabsTrigger value='completed'>Completed</TabsTrigger>
            <TabsTrigger value='rejected'>Rejected</TabsTrigger>
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
                        {/* Student Info */}
                        <div className='flex items-start gap-4 flex-1'>
                          <div className='w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0'>
                            {session.student.profilePicture ? (
                              <img
                                src={session.student.profilePicture}
                                alt={`${session.student.firstName} ${session.student.lastName}`}
                                className='w-full h-full rounded-full object-cover'
                              />
                            ) : (
                              `${session.student.firstName[0]}${session.student.lastName[0]}`
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
                                  {session.student.firstName}{' '}
                                  {session.student.lastName}
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
                                <p className='text-sm text-red-700'>
                                  <strong>Rejection Reason:</strong>{' '}
                                  {session.rejectionReason}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className='flex md:flex-col gap-2 md:w-40'>
                          {session.status === 'PENDING' && (
                            <>
                              <Button
                                onClick={() => handleAcceptSession(session.id)}
                                disabled={isProcessing}
                                className='flex-1 md:flex-none bg-green-600 hover:bg-green-700'
                              >
                                <Check className='h-4 w-4 mr-2' />
                                Accept
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedSession(session.id);
                                  setRejectDialogOpen(true);
                                }}
                                disabled={isProcessing}
                                variant='outline'
                                className='flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50'
                              >
                                <XIcon className='h-4 w-4 mr-2' />
                                Reject
                              </Button>
                            </>
                          )}

                          {session.status === 'LIVE' && (
                            <Button
                              onClick={() => handleJoinSession(session.id)}
                              className='flex-1 md:flex-none bg-purple-600 hover:bg-purple-700'
                            >
                              <Play className='h-4 w-4 mr-2' />
                              Join
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
                  <p className='text-slate-600'>
                    {activeTab === 'pending'
                      ? 'No pending session requests at the moment.'
                      : `No ${activeTab} sessions.`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Session Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this session request.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 mt-4'>
            <Textarea
              placeholder='e.g., Schedule conflict, not my area of expertise...'
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={4}
            />
            <div className='flex gap-3'>
              <Button
                variant='outline'
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectionReason('');
                  setSelectedSession(null);
                }}
                className='flex-1'
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectSession}
                disabled={isProcessing || !rejectionReason.trim()}
                className='flex-1 bg-red-600 hover:bg-red-700'
              >
                {isProcessing ? 'Rejecting...' : 'Reject Session'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

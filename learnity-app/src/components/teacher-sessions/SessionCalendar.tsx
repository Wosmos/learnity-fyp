'use client';

import React from 'react';
import { Calendar, Clock, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface SessionCalendarProps {
  sessions: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function SessionCalendar({ sessions, loading, onRefresh }: SessionCalendarProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      SCHEDULED: 'bg-blue-100 text-blue-700',
      LIVE: 'bg-green-100 text-green-700',
      COMPLETED: 'bg-slate-100 text-slate-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return (
      <Badge className={`${styles[status as keyof typeof styles] || ''} border-0`}>
        {status}
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className='space-y-3'>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className='h-24 w-full' />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4'>
          <Calendar className='h-8 w-8 text-slate-400' />
        </div>
        <p className='text-slate-500 mb-2'>No sessions scheduled</p>
        <p className='text-sm text-slate-400'>
          Schedule a session to start teaching live
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {sessions.map((session) => (
        <div
          key={session.id}
          className='p-4 border rounded-lg hover:border-purple-300 transition-colors'
        >
          <div className='flex items-start justify-between mb-3'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                <Video className='h-4 w-4 text-purple-600' />
                <h3 className='font-semibold text-slate-900'>{session.title}</h3>
              </div>
              {session.description && (
                <p className='text-sm text-slate-500 mb-2'>{session.description}</p>
              )}
            </div>
            {getStatusBadge(session.status)}
          </div>

          <div className='flex items-center gap-4 text-sm text-slate-600'>
            <div className='flex items-center gap-1'>
              <Clock className='h-4 w-4' />
              <span>{formatDate(session.scheduledAt)}</span>
            </div>
            <div className='flex items-center gap-1'>
              <Users className='h-4 w-4' />
              <span>{session.participants?.length || 0} participants</span>
            </div>
          </div>

          {session.status === 'SCHEDULED' && (
            <div className='mt-3 flex gap-2'>
              <Button size='sm' variant='outline' className='text-xs'>
                Edit
              </Button>
              <Button size='sm' className='text-xs bg-purple-600 hover:bg-purple-700'>
                Start Session
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

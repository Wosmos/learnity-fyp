'use client';

import React from 'react';
import { Clock, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface UpcomingSessionsWidgetProps {
  sessions: any[];
  loading: boolean;
}

export function UpcomingSessionsWidget({ sessions, loading }: UpcomingSessionsWidgetProps) {
  const formatTimeUntil = (date: string) => {
    const now = new Date();
    const sessionDate = new Date(date);
    const diff = sessionDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 1) {
      return `in ${minutes}m`;
    } else if (hours < 24) {
      return `in ${hours}h`;
    } else {
      const days = Math.floor(hours / 24);
      return `in ${days}d`;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base'>
          <Clock className='h-5 w-5 text-purple-600' />
          Upcoming Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className='space-y-3'>
            {[1, 2].map((i) => (
              <Skeleton key={i} className='h-20 w-full' />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className='text-center py-8'>
            <Calendar className='h-12 w-12 text-slate-300 mx-auto mb-3' />
            <p className='text-sm text-slate-500'>No upcoming sessions</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {sessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className='p-3 border rounded-lg hover:border-purple-300 transition-colors'
              >
                <div className='flex items-start justify-between mb-2'>
                  <h4 className='font-medium text-sm text-slate-900 line-clamp-1'>
                    {session.title}
                  </h4>
                  <span className='text-xs text-purple-600 font-medium whitespace-nowrap ml-2'>
                    {formatTimeUntil(session.scheduledAt)}
                  </span>
                </div>
                <div className='flex items-center gap-3 text-xs text-slate-500'>
                  <span className='flex items-center gap-1'>
                    <Calendar className='h-3 w-3' />
                    {formatDate(session.scheduledAt)}
                  </span>
                  <span className='flex items-center gap-1'>
                    <Users className='h-3 w-3' />
                    {session.participants?.length || 0}
                  </span>
                </div>
                <Button
                  size='sm'
                  className='w-full mt-2 h-7 text-xs bg-purple-600 hover:bg-purple-700'
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

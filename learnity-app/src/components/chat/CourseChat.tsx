'use client';

/**
 * Course Chat Component
 * Displays the chat room for a specific course
 */

import { useEffect, useState } from 'react';
import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from 'stream-chat-react';
import { Channel as StreamChannel } from 'stream-chat';
import {
  MessageCircle,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChatClient } from './ChatProvider';

// Import Stream Chat CSS
import 'stream-chat-react/dist/css/v2/index.css';

interface CourseChatProps {
  courseId: string;
  courseName: string;
  className?: string;
}

export function CourseChat({
  courseId,
  courseName,
  className,
}: CourseChatProps) {
  const {
    client,
    isConnected,
    isLoading: clientLoading,
    error: clientError,
  } = useChatClient();
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    if (!client || !isConnected) return;

    let chatChannel: StreamChannel | null = null;

    const initChannel = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const channelId = `course_${courseId}`;
        chatChannel = client.channel('messaging', channelId);

        await chatChannel.watch();

        setChannel(chatChannel);
        setMemberCount(
          chatChannel.state.members
            ? Object.keys(chatChannel.state.members).length
            : 0
        );
      } catch (err) {
        console.error('Failed to initialize course channel:', err);
        setError(
          'Failed to load chat. You may not have access to this course chat.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    initChannel();

    return () => {
      if (chatChannel) {
        chatChannel.stopWatching().catch(console.error);
      }
    };
  }, [client, isConnected, courseId]);

  // Loading state
  if (clientLoading || isLoading) {
    return (
      <Card className={className}>
        <CardContent className='flex flex-col items-center justify-center h-96 gap-4'>
          <Loader2 className='h-8 w-8 animate-spin text-indigo-600' />
          <p className='text-slate-500'>Loading chat...</p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (clientError || error) {
    return (
      <Card className={className}>
        <CardContent className='flex flex-col items-center justify-center h-96 gap-4 bg-black'>
          <AlertCircle className='h-12 w-12 text-amber-500' />
          <p className='text-slate-700 font-medium'>Chat Unavailable</p>
          <p className='text-sm text-slate-500 text-center max-w-xs'>
            {clientError || error}
          </p>
          <Button
            variant='outline'
            onClick={() => window.location.reload()}
            className='gap-2'
          >
            <RefreshCw className='h-4 w-4' /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Not connected
  if (!client || !channel) {
    return (
      <Card className={className}>
        <CardContent className='flex flex-col items-center justify-center h-96 gap-4'>
          <MessageCircle className='h-12 w-12 text-slate-300' />
          <p className='text-slate-500'>Chat not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className='border-b bg-slate-50/50 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center'>
              <MessageCircle className='h-5 w-5 text-indigo-600' />
            </div>
            <div>
              <CardTitle className='text-base'>{courseName}</CardTitle>
              <p className='text-xs text-slate-500'>Course Chat</p>
            </div>
          </div>
          <Badge variant='secondary' className='gap-1'>
            <Users className='h-3 w-3' />
            {memberCount} members
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='p-0 h-[500px]'>
        <Chat client={client} theme='str-chat__theme-light'>
          <Channel channel={channel}>
            <Window>
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </CardContent>
    </Card>
  );
}

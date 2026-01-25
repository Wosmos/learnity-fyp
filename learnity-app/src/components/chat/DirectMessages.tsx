'use client';

/**
 * Direct Messages Component
 * Displays private conversations between users (student-teacher)
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
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  User,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/lib/stores/auth.store';
import { cn } from '@/lib/utils';
import { useChatClient } from './ChatProvider';

import 'stream-chat-react/dist/css/v2/index.css';

interface DMChannel {
  id: string;
  streamChannelId: string;
  lastMessageAt: string | null;
  otherUser: {
    id: string;
    name: string;
    profilePicture: string | null;
    role: string;
  } | null;
}

interface DirectMessagesProps {
  className?: string;
  onClose?: () => void;
}

export function DirectMessages({ className, onClose }: DirectMessagesProps) {
  const { user } = useAuthStore();
  const { client, isConnected, isLoading: clientLoading } = useChatClient();

  const [channels, setChannels] = useState<DMChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<StreamChannel | null>(
    null
  );
  const [selectedUser, setSelectedUser] =
    useState<DMChannel['otherUser']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch DM channels
  useEffect(() => {
    const fetchChannels = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const token = await user.getIdToken();
        const response = await fetch('/api/chat/direct', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setChannels(data.data.channels || []);
        }
      } catch (error) {
        console.error('Failed to fetch DM channels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [user]);

  // Select a channel
  const handleSelectChannel = async (dmChannel: DMChannel) => {
    if (!client || !isConnected) return;

    try {
      const channel = client.channel('messaging', dmChannel.streamChannelId);
      await channel.watch();
      setSelectedChannel(channel);
      setSelectedUser(dmChannel.otherUser);
    } catch (error) {
      console.error('Failed to open channel:', error);
    }
  };

  // Filter channels by search
  const filteredChannels = channels.filter(ch =>
    ch.otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (clientLoading || isLoading) {
    return (
      <Card className={className}>
        <CardContent className='flex flex-col items-center justify-center h-96 gap-4'>
          <Loader2 className='h-8 w-8 animate-spin text-indigo-600' />
          <p className='text-slate-500'>Loading messages...</p>
        </CardContent>
      </Card>
    );
  }

  // Channel list view
  if (!selectedChannel) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className='border-b bg-slate-50/50 py-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg flex items-center gap-2'>
              <MessageCircle className='h-5 w-5 text-indigo-600' />
              Messages
            </CardTitle>
            <Badge variant='secondary'>{channels.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          {/* Search */}
          <div className='p-3 border-b'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
              <Input
                placeholder='Search conversations...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>
          </div>

          {/* Channel list */}
          <ScrollArea className='h-[400px]'>
            {filteredChannels.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-64 gap-3 text-slate-500'>
                <MessageCircle className='h-10 w-10 text-slate-300' />
                <p className='text-sm'>No conversations yet</p>
              </div>
            ) : (
              <div className='divide-y'>
                {filteredChannels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => handleSelectChannel(channel)}
                    className='w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left'
                  >
                    {channel.otherUser?.profilePicture ? (
                      <img
                        src={channel.otherUser.profilePicture}
                        alt={channel.otherUser.name}
                        className='h-10 w-10 rounded-full object-cover'
                      />
                    ) : (
                      <div className='h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center'>
                        <User className='h-5 w-5 text-indigo-600' />
                      </div>
                    )}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <p className='font-medium text-slate-900 truncate'>
                          {channel.otherUser?.name || 'Unknown User'}
                        </p>
                        {channel.otherUser?.role === 'TEACHER' && (
                          <GraduationCap className='h-3 w-3 text-indigo-600' />
                        )}
                      </div>
                      <p className='text-xs text-slate-500'>
                        {channel.lastMessageAt
                          ? new Date(channel.lastMessageAt).toLocaleDateString()
                          : 'No messages yet'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  // Chat view
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className='border-b bg-slate-50/50 py-3'>
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              setSelectedChannel(null);
              setSelectedUser(null);
            }}
          >
            <ChevronLeft className='h-5 w-5' />
          </Button>
          {selectedUser?.profilePicture ? (
            <img
              src={selectedUser.profilePicture}
              alt={selectedUser.name}
              className='h-8 w-8 rounded-full object-cover'
            />
          ) : (
            <div className='h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center'>
              <User className='h-4 w-4 text-indigo-600' />
            </div>
          )}
          <div>
            <CardTitle className='text-base'>{selectedUser?.name}</CardTitle>
            <p className='text-xs text-slate-500 capitalize'>
              {selectedUser?.role?.toLowerCase()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-0 h-[450px]'>
        {client ? (
          <Chat client={client} theme='str-chat__theme-light'>
            <Channel channel={selectedChannel}>
              <Window>
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        ) : (
          <div className='flex flex-col items-center justify-center h-full gap-4'>
            <AlertCircle className='h-8 w-8 text-amber-500' />
            <p className='text-slate-500'>Chat client not available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

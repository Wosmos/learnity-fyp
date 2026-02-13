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
  type: 'dm' | 'group';
  name?: string;
  description?: string;
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
  initialOtherUserId?: string;
  initialChannelId?: string;
}

export function DirectMessages({
  className,
  onClose,
  initialOtherUserId,
  initialChannelId,
}: DirectMessagesProps) {
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
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchChannels = async () => {
      try {
        setIsLoading(true);
        const token = await user.getIdToken();
        const response = await fetch('/api/chat/direct', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const channelList = data.data.channels || [];
          setChannels(channelList);

          if (initialOtherUserId) {
            handleInitialUser(initialOtherUserId, channelList, token);
          }
        }
      } catch (error) {
        console.error('Failed to fetch DM channels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [user]); // Removed initialOtherUserId from deps to prevent loop if it changes, though usually it's stable.

  // Helper to handle initial selection or creation
  const handleInitialUser = async (
    targetUserId: string,
    currentChannels: DMChannel[],
    token: string
  ) => {
    // 1. Check if channel already exists locally
    const existing = currentChannels.find(
      c => c.otherUser?.id === targetUserId
    );

    if (existing) {
      handleSelectChannel(existing);
      return;
    }

    // 2. If not, create it via API
    try {
      const res = await fetch('/api/chat/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: targetUserId }),
      });

      if (res.ok) {
        const data = await res.json();
        const newChannel = data.data;
        // Add to list and select
        setChannels(prev => [newChannel, ...prev]);

        // We need to wait for client to be ready? client is dependency of handleInitialUser via closure if used there?
        // Actually handleSelectChannel uses `client`.
        // If client is not ready, this might fail.
        // We should probably useEffect on `isConnected` to trigger this too if pending.
      }
    } catch (err) {
      console.error('Error creating initial chat:', err);
    }
  };

  // Effect to sync selection when client becomes ready or channel is added
  useEffect(() => {
    if (!client || !isConnected || !initialOtherUserId) return;

    // Attempt to find the channel corresponding to initialOtherUserId
    // This is a bit tricky because we need the streamChannelId.
    // We rely on `channels` state being populated.

    if (channels.length > 0 && !selectedChannel) {
      const target = channels.find(c => c.otherUser?.id === initialOtherUserId);
      if (target) {
        handleSelectChannel(target);
      }
    }
  }, [client, isConnected, channels, initialOtherUserId]);

  // Effect to sync selection when initialChannelId is provided
  useEffect(() => {
    if (!client || !isConnected || !initialChannelId) return;

    // Prevent re-watching if already selected
    if (selectedChannel?.id === initialChannelId) return;

    const selectInitialChannel = async () => {
      try {
        const channel = client.channel('messaging', initialChannelId);
        await channel.watch();
        setSelectedChannel(channel);

        // Enrichment: search in loaded channels
        const existing = channels.find(
          c => c.streamChannelId === initialChannelId
        );
        if (existing) {
          setSelectedUser(existing.otherUser);
        } else {
          // If not in our list (e.g. it's a group chat not returned by api/chat/direct yet)
          // we rely on channel.data.name in the UI header
          setSelectedUser(null);
        }
      } catch (error) {
        console.error('Failed to open initial channel:', error);
      }
    };

    selectInitialChannel();
  }, [client, isConnected, initialChannelId, channels, selectedChannel?.id]);

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
  const filteredChannels = channels.filter(ch => {
    const searchLower = searchQuery.toLowerCase();
    const otherUserName = ch.otherUser?.name?.toLowerCase() || '';
    const groupName = ch.name?.toLowerCase() || '';
    return (
      otherUserName.includes(searchLower) || groupName.includes(searchLower)
    );
  });

  // Loading state
  // Only block if we don't have a selected channel yet, or if the client itself is still loading
  // Also block if we have a deep link target but haven't loaded it yet to prevent flashing the list
  const isTransitioningDeepLink = !!initialChannelId && !selectedChannel;

  if (
    clientLoading ||
    (isLoading && !selectedChannel) ||
    isTransitioningDeepLink
  ) {
    return (
      <Card className={className}>
        <CardContent className='flex flex-col items-center justify-center h-96 gap-4'>
          <Loader2 className='h-8 w-8 animate-spin text-indigo-600' />
          <p className='text-slate-500'>
            {clientLoading
              ? 'Connecting to chat...'
              : isTransitioningDeepLink
                ? 'Opening chat...'
                : 'Loading conversations...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Channel list view
  if (!selectedChannel) {
    return (
      <Card
        className={cn('overflow-hidden flex flex-col h-[600px]', className)}
      >
        <CardHeader className='border-b bg-slate-50/50 py-3 shrink-0'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-lg flex items-center gap-2'>
              <MessageCircle className='h-5 w-5 text-indigo-600' />
              Messages
            </CardTitle>
            <Badge variant='secondary'>{channels.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className='p-0 flex-1 flex flex-col min-h-0'>
          {/* Search */}
          <div className='p-3 border-b shrink-0'>
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
          <ScrollArea className='flex-1'>
            {filteredChannels.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-64 gap-3 text-slate-500'>
                <MessageCircle className='h-10 w-10 text-slate-300' />
                <p className='text-sm'>No conversations found</p>
              </div>
            ) : (
              <div className='divide-y'>
                {filteredChannels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => handleSelectChannel(channel)}
                    className='w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left'
                  >
                    {channel.type === 'dm' ? (
                      channel.otherUser?.profilePicture ? (
                        <img
                          src={channel.otherUser.profilePicture}
                          alt={channel.otherUser.name}
                          className='h-10 w-10 rounded-full object-cover'
                        />
                      ) : (
                        <div className='h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center'>
                          <User className='h-5 w-5 text-indigo-600' />
                        </div>
                      )
                    ) : (
                      <div className='h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center'>
                        <MessageCircle className='h-5 w-5 text-violet-600' />
                      </div>
                    )}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <p className='font-medium text-slate-900 truncate'>
                          {channel.type === 'dm'
                            ? channel.otherUser?.name || 'Unknown User'
                            : channel.name || 'Group Chat'}
                        </p>
                        {channel.otherUser?.role === 'TEACHER' && (
                          <GraduationCap className='h-3 w-3 text-indigo-600' />
                        )}
                        {channel.type === 'group' && (
                          <Badge
                            variant='outline'
                            className='text-[10px] h-4 px-1 bg-violet-50 text-violet-600 border-violet-100'
                          >
                            Group
                          </Badge>
                        )}
                      </div>
                      <p className='text-xs text-slate-500 truncate'>
                        {channel.type === 'group' && channel.description
                          ? channel.description
                          : channel.lastMessageAt
                            ? new Date(
                                channel.lastMessageAt
                              ).toLocaleDateString()
                            : 'Start a conversation'}
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
    <Card className={cn('overflow-hidden flex flex-col h-[600px]', className)}>
      <CardHeader className='border-b bg-slate-50/50 py-3 shrink-0'>
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
          {selectedUser?.profilePicture ||
          (selectedChannel?.data as any)?.image ? (
            <img
              src={
                selectedUser?.profilePicture ||
                (selectedChannel?.data as any)?.image
              }
              alt={selectedUser?.name || (selectedChannel?.data as any)?.name}
              className='h-8 w-8 rounded-full object-cover'
            />
          ) : (
            <div className='h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center'>
              <MessageCircle className='h-4 w-4 text-indigo-600' />
            </div>
          )}
          <div>
            <CardTitle className='text-base'>
              {selectedUser?.name ||
                (selectedChannel?.data as any)?.name ||
                'Chat'}
            </CardTitle>
            <p className='text-xs text-slate-500 capitalize'>
              {selectedUser?.role?.toLowerCase() ||
                ((selectedChannel?.data as any)?.name ? 'Group Chat' : '')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-0 flex-1 min-h-0 relative'>
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

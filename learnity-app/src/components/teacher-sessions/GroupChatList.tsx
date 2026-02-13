'use client';

import React from 'react';
import { MessageSquare, Users, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface GroupChatListProps {
  groupChats: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function GroupChatList({
  groupChats,
  loading,
  onRefresh,
}: GroupChatListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this group chat?')) return;

    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/teacher/group-chats/${chatId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Group chat deleted successfully',
        });
        onRefresh();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete group chat',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className='space-y-3'>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className='h-20 w-full' />
        ))}
      </div>
    );
  }

  if (groupChats.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4'>
          <MessageSquare className='h-8 w-8 text-slate-400' />
        </div>
        <p className='text-slate-500 mb-2'>No group chats yet</p>
        <p className='text-sm text-slate-400'>
          Create a group chat to start communicating with students
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {groupChats.map(chat => (
        <div
          key={chat.id}
          className='p-4 border rounded-lg hover:border-indigo-300 transition-colors'
        >
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                <MessageSquare className='h-4 w-4 text-indigo-600' />
                <h3 className='font-semibold text-slate-900'>{chat.name}</h3>
              </div>
              {chat.description && (
                <p className='text-sm text-slate-500 mb-3'>
                  {chat.description}
                </p>
              )}
              <div className='flex items-center gap-2 text-sm text-slate-400'>
                <Users className='h-4 w-4' />
                <span>{chat.members?.length || 0} members</span>
              </div>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleDelete(chat.id)}
                className='text-red-600 hover:text-red-700 hover:bg-red-50'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='gap-2'
                onClick={() =>
                  router.push(
                    `/dashboard/teacher/chat?channelId=${chat.streamChannelId}`
                  )
                }
              >
                <ExternalLink className='h-4 w-4' />
                Open Chat
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

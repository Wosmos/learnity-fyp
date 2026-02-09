'use client';

import { useClientAuth } from '@/hooks/useClientAuth';
import { UserRole } from '@/types/auth';
import { TeacherLayoutClient } from '@/components/layout/TeacherLayoutClient';
import { StudentLayoutClient } from '@/components/layout/StudentLayoutClient';
import { AdminAuthenticatedLayout } from '@/components/layout/AppLayout';
import { ChatProvider } from '@/components/chat/ChatProvider';
import { Loader2 } from 'lucide-react';

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { claims, loading, isAuthenticated } = useClientAuth();

  if (loading) {
    return (
      <div className='flex h-screen w-full items-center justify-center bg-slate-50'>
        <Loader2 className='h-10 w-10 animate-spin text-indigo-600' />
      </div>
    );
  }

  // If not authenticated, we'll let the layout clients handle redirection
  // or wrap in a basic layout if needed. But usually messages are protected.
  const role = claims?.role as UserRole;

  const content = (
    <ChatProvider>
      <div className='w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        {children}
      </div>
    </ChatProvider>
  );

  if (role === UserRole.TEACHER) {
    return <TeacherLayoutClient>{content}</TeacherLayoutClient>;
  }

  if (role === UserRole.ADMIN) {
    return <AdminAuthenticatedLayout>{content}</AdminAuthenticatedLayout>;
  }

  // Default to student layout or if someone is logged in without specific role (shouldn't happen)
  return <StudentLayoutClient>{content}</StudentLayoutClient>;
}

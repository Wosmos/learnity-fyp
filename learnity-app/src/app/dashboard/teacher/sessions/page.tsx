'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  MessageSquare,
  Users,
  Zap,
  VideoIcon,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// Import components
import {
  CreateGroupChatModal,
  ScheduleSessionModal,
  GroupChatList,
  SessionCalendar,
  UpcomingSessionsWidget,
} from '@/components/teacher-sessions';

export default function TeacherSessionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [showScheduleSession, setShowScheduleSession] = useState(false);
  const [groupChats, setGroupChats] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await user?.getIdToken();

      // Fetch group chats and sessions in parallel
      const [chatsRes, sessionsRes] = await Promise.all([
        fetch('/api/teacher/group-chats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/teacher/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const chatsData = await chatsRes.json();
      const sessionsData = await sessionsRes.json();

      if (chatsData.success) setGroupChats(chatsData.groupChats);
      if (sessionsData.success) setSessions(sessionsData.sessions);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className='min-h-screen bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white pb-20'>
      {/* Top Navigation */}
      <div className='w-full bg-white/60 backdrop-blur-md border-b border-slate-200 py-3 mb-8'>
        <div className='container mx-auto px-4 max-w-7xl'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-4 text-sm font-medium'>
              <Link href='/dashboard/teacher'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='gap-2 text-slate-500 hover:text-indigo-600'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className='flex items-center gap-2'>
              <Badge className='bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1'>
                <Zap className='h-3 w-3 mr-1 fill-green-700' /> Live
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 max-w-7xl'>
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className='space-y-8'
        >
          {/* Header with Quick Actions */}
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <div>
              <h1 className='text-3xl font-bold text-slate-900'>
                Sessions & Communication
              </h1>
              <p className='text-slate-500 mt-1'>
                Manage your group chats and video sessions
              </p>
            </div>
            <div className='flex gap-3'>
              <Button
                onClick={() => setShowCreateChat(true)}
                className='gap-2 bg-indigo-600 hover:bg-indigo-700'
              >
                <MessageSquare className='h-4 w-4' />
                Create Group Chat
              </Button>
              <Button
                onClick={() => setShowScheduleSession(true)}
                className='gap-2 bg-purple-600 hover:bg-purple-700'
              >
                <Calendar className='h-4 w-4' />
                Schedule Session
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Left Column - Group Chats */}
            <div className='lg:col-span-2 space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Users className='h-5 w-5' />
                    Group Chats
                  </CardTitle>
                  <CardDescription>
                    Manage your student group chats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GroupChatList
                    groupChats={groupChats}
                    loading={loading}
                    onRefresh={loadData}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Calendar className='h-5 w-5' />
                    Session Calendar
                  </CardTitle>
                  <CardDescription>
                    View and manage your scheduled sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SessionCalendar
                    sessions={sessions}
                    loading={loading}
                    onRefresh={loadData}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Upcoming Sessions */}
            <div className='space-y-6'>
              <UpcomingSessionsWidget
                sessions={sessions.filter((s: any) => s.status === 'SCHEDULED')}
                loading={loading}
              />

              {/* Stats Card */}
              <Card className='bg-linear-to-br from-indigo-600 to-purple-700 text-white border-none'>
                <CardContent className='p-6'>
                  <h4 className='font-bold mb-4 flex items-center gap-2'>
                    <VideoIcon className='h-4 w-4' /> Session Stats
                  </h4>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='p-4 rounded-2xl bg-white/10 backdrop-blur'>
                      <div className='text-2xl font-black'>
                        {groupChats.length}
                      </div>
                      <div className='text-[10px] uppercase font-bold text-indigo-100 tracking-tighter'>
                        Group Chats
                      </div>
                    </div>
                    <div className='p-4 rounded-2xl bg-white/10 backdrop-blur'>
                      <div className='text-2xl font-black'>
                        {sessions.length}
                      </div>
                      <div className='text-[10px] uppercase font-bold text-indigo-100 tracking-tighter'>
                        Total Sessions
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <CreateGroupChatModal
        open={showCreateChat}
        onClose={() => setShowCreateChat(false)}
        onSuccess={loadData}
      />
      <ScheduleSessionModal
        open={showScheduleSession}
        onClose={() => setShowScheduleSession(false)}
        onSuccess={loadData}
      />
    </div>
  );
}

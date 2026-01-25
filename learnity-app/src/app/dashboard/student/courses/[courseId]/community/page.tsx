'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MessageCircle,
  Video,
  Users,
  Calendar,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  Play,
  Sparkles,
  Zap,
  LayoutDashboard,
  GraduationCap,
  Share2,
} from 'lucide-react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useToast } from '@/hooks/use-toast';
import { ChatProvider } from '@/components/chat/ChatProvider';
import { CourseChat } from '@/components/chat/CourseChat';
import { cn } from '@/lib/utils';
import { VideoRoom } from '@/components/video/VideoRoom';

interface CourseData {
  id: string;
  title: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string | null;
  };
}

interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  duration: number;
  status: string;
  isHost: boolean;
}

interface CourseRoom {
  exists: boolean;
  chatEnabled: boolean;
  videoEnabled: boolean;
  isTeacher: boolean;
}

export default function CourseCommunityPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseData | null>(null);
  const [room, setRoom] = useState<CourseRoom | null>(null);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [showVideoRoom, setShowVideoRoom] = useState(false);

  // Fetch course and room data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const token = await user.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch course details
        const courseRes = await fetch(`/api/courses/${courseId}`, { headers });
        if (courseRes.ok) {
          const data = await courseRes.json();
          setCourse(data.data);
        }

        // Fetch room details
        const roomRes = await fetch(`/api/courses/${courseId}/room`, {
          headers,
        });
        if (roomRes.ok) {
          const data = await roomRes.json();
          setRoom(data.data);
        }

        // Fetch upcoming sessions
        const sessionsRes = await fetch(
          `/api/video/sessions?courseId=${courseId}`,
          { headers }
        );
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessions(data.data.sessions || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load community data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, courseId, toast]);

  const formatSessionTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (isToday) return `Today at ${timeStr}`;
    if (isTomorrow) return `Tomorrow at ${timeStr}`;
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4'>
        <div className='relative'>
          <div className='h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin' />
          <Users className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-600' />
        </div>
        <p className='text-slate-500 font-medium animate-pulse'>
          Entering community space...
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <Card className='max-w-md border-none shadow-xl'>
          <CardContent className='flex flex-col items-center py-8 gap-4'>
            <div className='h-20 w-20 rounded-full bg-red-50 flex items-center justify-center'>
              <AlertCircle className='h-10 w-10 text-red-500' />
            </div>
            <p className='text-slate-700 font-bold text-lg'>
              Course content unavailable
            </p>
            <Button
              variant='outline'
              onClick={() => router.back()}
              className='rounded-xl'
            >
              <ArrowLeft className='h-4 w-4 mr-2' /> Return safely
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show video room if active
  if (showVideoRoom) {
    return (
      <ChatProvider>
        <div className='min-h-screen bg-slate-950'>
          <VideoRoom
            courseId={courseId}
            courseName={course.title}
            onLeave={() => setShowVideoRoom(false)}
            className='h-screen w-screen rounded-none border-none'
          />
        </div>
      </ChatProvider>
    );
  }

  return (
    <ChatProvider>
      <div className='min-h-screen bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white pb-20'>
        {/* Header Section */}
        <div className='w-full bg-white/60 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 transition-all duration-200'>
          <div className='max-w-7xl mx-auto px-4 py-4'>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => router.back()}
                className='hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors'
              >
                <ArrowLeft className='h-5 w-5' />
              </Button>
              <div>
                <div className='flex items-center gap-2'>
                  <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
                    {course.title}
                  </h1>
                  <Badge
                    variant='secondary'
                    className='bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none'
                  >
                    Community
                  </Badge>
                </div>
                <div className='flex items-center gap-2 text-sm text-slate-500 font-medium'>
                  <span className='flex items-center gap-1'>
                    <GraduationCap className='h-4 w-4 text-indigo-500' />
                    {course.teacher.firstName} {course.teacher.lastName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='max-w-7xl mx-auto px-4 py-8'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-8'
          >
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
              <TabsList className='bg-white/50 backdrop-blur p-1 rounded-2xl border border-slate-200/60 h-auto self-start'>
                <TabsTrigger
                  value='chat'
                  className='data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-200 rounded-xl px-6 py-2.5 transition-all duration-300 gap-2 font-bold'
                >
                  <MessageCircle className='h-4 w-4' />
                  Discussion
                </TabsTrigger>
                <TabsTrigger
                  value='sessions'
                  className='data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-200 rounded-xl px-6 py-2.5 transition-all duration-300 gap-2 font-bold'
                >
                  <Video className='h-4 w-4' />
                  Live Sessions
                </TabsTrigger>
              </TabsList>

              {activeTab === 'sessions' && room?.videoEnabled && (
                <Button
                  onClick={() => setShowVideoRoom(true)}
                  className='bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-200 font-bold px-6 h-11 animate-pulse'
                >
                  <Video className='h-4 w-4 mr-2' />
                  Join Live Room
                </Button>
              )}
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
              {/* Main Content Area */}
              <div className='lg:col-span-8'>
                <TabsContent value='chat' className='mt-0 focus-visible:ring-0'>
                  {room?.chatEnabled ? (
                    <Card className='border-none shadow-2xl shadow-indigo-100/40 overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl'>
                      <CourseChat
                        courseId={courseId}
                        courseName={course.title}
                        className='h-[650px] border-none shadow-none'
                      />
                    </Card>
                  ) : (
                    <Card className='border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none'>
                      <CardContent className='flex flex-col items-center py-16 gap-6 text-center'>
                        <div className='h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center'>
                          <MessageCircle className='h-10 w-10 text-slate-300' />
                        </div>
                        <div>
                          <h3 className='text-xl font-bold text-slate-700'>
                            Chat Unavailable
                          </h3>
                          <p className='text-slate-500 max-w-xs mx-auto mt-2'>
                            The discussion board for this course hasn't been
                            enabled by your instructor yet.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent
                  value='sessions'
                  className='mt-0 focus-visible:ring-0 space-y-6'
                >
                  {/* Hero Card for Sessions */}
                  <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-2xl shadow-indigo-200 p-8'>
                    <div className='absolute top-0 right-0 p-8 opacity-10'>
                      <Video className='h-32 w-32' />
                    </div>
                    <div className='relative z-10 space-y-4 max-w-xl'>
                      <Badge className='bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm'>
                        Interactive Learning
                      </Badge>
                      <h2 className='text-3xl font-black tracking-tight'>
                        Virtual Classroom
                      </h2>
                      <p className='text-indigo-100 text-lg leading-relaxed'>
                        Join live sessions to interact with your instructor and
                        classmates in real-time. Ask questions, participate in
                        discussions, and learn together.
                      </p>
                      {room?.videoEnabled && (
                        <Button
                          onClick={() => setShowVideoRoom(true)}
                          className='bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl h-12 px-8 shadow-xl border-none mt-4'
                        >
                          <Play className='h-4 w-4 mr-2' /> Enter Classroom
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Upcoming Sessions List */}
                  <div>
                    <h3 className='text-lg font-bold text-slate-900 mb-4 flex items-center gap-2'>
                      <Calendar className='h-5 w-5 text-indigo-600' />
                      Upcoming Sessions
                    </h3>

                    {sessions.length === 0 ? (
                      <Card className='border-none shadow-lg bg-white/60 backdrop-blur'>
                        <CardContent className='flex flex-col items-center py-12 gap-4 text-center'>
                          <div className='h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-300 flex items-center justify-center'>
                            <Clock className='h-8 w-8' />
                          </div>
                          <div>
                            <p className='font-bold text-slate-700 text-lg'>
                              No sessions scheduled
                            </p>
                            <p className='text-slate-500'>
                              Check back later for upcoming live classes
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className='space-y-4'>
                        {sessions.map(session => (
                          <div
                            key={session.id}
                            className='group flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/40 transition-all duration-300'
                          >
                            <div className='flex items-center gap-5'>
                              <div
                                className={cn(
                                  'h-16 w-16 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm',
                                  session.status === 'LIVE'
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-indigo-50 text-indigo-600'
                                )}
                              >
                                <span className='text-xs uppercase opacity-60'>
                                  {new Date(
                                    session.scheduledAt
                                  ).toLocaleDateString('en-US', {
                                    month: 'short',
                                  })}
                                </span>
                                <span className='text-xl'>
                                  {new Date(session.scheduledAt).getDate()}
                                </span>
                              </div>
                              <div>
                                <h4 className='text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors'>
                                  {session.title}
                                </h4>
                                <div className='flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-1 font-medium'>
                                  <span className='flex items-center gap-1.5'>
                                    <Clock className='h-4 w-4 text-slate-400' />
                                    {formatSessionTime(session.scheduledAt)}
                                  </span>
                                  <span className='flex items-center gap-1.5'>
                                    <Users className='h-4 w-4 text-slate-400' />
                                    {session.duration} minutes
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className='mt-4 md:mt-0 flex items-center gap-3 w-full md:w-auto'>
                              {session.status === 'LIVE' ? (
                                <Button
                                  onClick={() => setShowVideoRoom(true)}
                                  className='bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-200 font-bold flex-1 md:flex-none animate-pulse'
                                >
                                  <Video className='h-4 w-4 mr-2' />
                                  Join Live
                                </Button>
                              ) : (
                                <Badge
                                  variant='secondary'
                                  className='px-3 py-1 bg-slate-100 text-slate-500'
                                >
                                  Scheduled
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>

              {/* Sidebar */}
              <div className='lg:col-span-4 space-y-6'>
                {/* AI Insight Card */}
                <Card className='bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden rounded-3xl'>
                  <div className='absolute top-0 right-0 p-4 opacity-10'>
                    <Sparkles className='h-32 w-32' />
                  </div>
                  <CardContent className='p-8 relative z-10 space-y-4'>
                    <div className='flex items-center gap-2 text-amber-400 mb-2'>
                      <Zap className='h-4 w-4 fill-amber-400' />
                      <span className='text-xs font-black uppercase tracking-widest'>
                        Studymate AI
                      </span>
                    </div>
                    <h3 className='text-xl font-bold'>Stay Connected</h3>
                    <p className='text-slate-400 text-sm leading-relaxed'>
                      Engaging in community discussions can increase your
                      retention rate by up to 60%. Don't be shy to ask!
                    </p>
                  </CardContent>
                </Card>

                {/* About Card */}
                <Card className='border-none shadow-lg shadow-indigo-100/20 rounded-3xl overflow-hidden bg-white/70 backdrop-blur'>
                  <CardHeader className='bg-indigo-50/50 border-b border-indigo-50 px-6 py-4'>
                    <CardTitle className='text-base font-bold text-indigo-900 flex items-center gap-2'>
                      <Users className='h-4 w-4' /> Community Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-6 space-y-4'>
                    <div className='flex gap-4'>
                      <div className='h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0'>
                        <MessageCircle className='h-5 w-5' />
                      </div>
                      <div>
                        <h4 className='font-bold text-slate-900 text-sm'>
                          Be Respectful
                        </h4>
                        <p className='text-xs text-slate-500 mt-1'>
                          Treat your peers and instructor with kindness and
                          respect.
                        </p>
                      </div>
                    </div>
                    <div className='flex gap-4'>
                      <div className='h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0'>
                        <AlertCircle className='h-5 w-5' />
                      </div>
                      <div>
                        <h4 className='font-bold text-slate-900 text-sm'>
                          Stay on Topic
                        </h4>
                        <p className='text-xs text-slate-500 mt-1'>
                          Keep discussions relevant to the course material.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className='border-none shadow-lg shadow-indigo-100/20 rounded-3xl overflow-hidden bg-white'>
                  <CardHeader className='px-6 py-4'>
                    <CardTitle className='text-base font-bold'>
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-2'>
                    <Button
                      variant='ghost'
                      className='w-full justify-start h-12 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 font-medium'
                      onClick={() =>
                        router.push(
                          `/dashboard/student/courses/${courseId}/learn`
                        )
                      }
                    >
                      <LayoutDashboard className='h-4 w-4 mr-3' />
                      Go to Course Content
                    </Button>
                    <Button
                      variant='ghost'
                      className='w-full justify-start h-12 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 font-medium'
                      onClick={() =>
                        toast({
                          title: 'Shared!',
                          description: 'Course link copied to clipboard',
                        })
                      }
                    >
                      <Share2 className='h-4 w-4 mr-3' />
                      Share Course
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </ChatProvider>
  );
}

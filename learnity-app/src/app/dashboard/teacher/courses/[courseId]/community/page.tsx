'use client'
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MessageCircle, Video, Users, Calendar, ArrowLeft,
  Loader2, AlertCircle, Clock, Play, Plus, Settings,
  Trash2, MoreVertical, LayoutDashboard, Share2
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useToast } from '@/hooks/use-toast';
import { ChatProvider } from '@/components/chat/ChatProvider';
import { CourseChat } from '@/components/chat/CourseChat';

import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VideoRoom } from '@/components/video/VideoRoom';

interface CourseData {
  id: string;
  title: string;
  enrollmentCount: number;
}

interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  duration: number;
  status: string;
  maxParticipants: number;
}

interface CourseRoom {
  exists: boolean;
  chatEnabled: boolean;
  videoEnabled: boolean;
  isTeacher: boolean;
}

export default function TeacherCourseCommunityPage() {
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
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  // New session form
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
    maxParticipants: 50,
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const token = await user.getIdToken();
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch course
        const courseRes = await fetch(`/api/courses/${courseId}`, { headers });
        if (courseRes.ok) {
          const data = await courseRes.json();
          setCourse(data.data);
        }

        // Fetch room
        const roomRes = await fetch(`/api/courses/${courseId}/room`, { headers });
        if (roomRes.ok) {
          const data = await roomRes.json();
          setRoom(data.data);
        }

        // Fetch sessions
        const sessionsRes = await fetch(`/api/video/sessions?courseId=${courseId}`, { headers });
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessions(data.data.sessions || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, courseId]);

  // Enable room if not exists
  const enableRoom = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/courses/${courseId}/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ enableChat: true, enableVideo: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setRoom(data.data);
        toast({ title: 'Success', description: 'Community features enabled!' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to enable community', variant: 'destructive' });
    }
  };

  // Schedule new session
  const scheduleSession = async () => {
    if (!user || !newSession.title || !newSession.scheduledAt) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    try {
      setIsScheduling(true);
      const token = await user.getIdToken();
      const response = await fetch('/api/video/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          ...newSession,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessions([...sessions, data.data]);
        setShowScheduleDialog(false);
        setNewSession({ title: '', description: '', scheduledAt: '', duration: 60, maxParticipants: 50 });
        toast({ title: 'Success', description: 'Session scheduled!' });
      } else {
        await response.json();
        throw new Error('Failed to schedule session');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to schedule session',
        variant: 'destructive'
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const formatSessionTime = (dateString: string) => {
    const date = new Date(dateString);
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <Settings className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-600 animate-spin-slow" />
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Loading command center...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md border-none shadow-xl">
          <CardContent className="flex flex-col items-center py-8 gap-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p>Course not found</p>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showVideoRoom) {
    return (
      <ChatProvider>
        <div className="min-h-screen bg-slate-950">
          <VideoRoom
            courseId={courseId}
            courseName={course.title}
            onLeave={() => setShowVideoRoom(false)}
            className="h-screen w-screen rounded-none border-none"
          />
        </div>
      </ChatProvider>
    );
  }

  // Room not enabled state
  if (!room?.exists) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-none shadow-2xl bg-white/80 backdrop-blur">
          <CardContent className="flex flex-col items-center py-16 gap-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Users className="h-64 w-64" />
            </div>

            <div className="relative z-10">
              <div className="h-24 w-24 rounded-3xl bg-indigo-50 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Users className="h-12 w-12 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Activate Community</h2>
              <p className="text-slate-600 mt-3 max-w-md mx-auto text-lg leading-relaxed">
                Unlock the power of social learning. Enable chat and live video sessions to engage with your students.
              </p>
            </div>

            <div className="flex gap-4 relative z-10 w-full max-w-sm">
              <Button variant="ghost" onClick={() => router.back()} className="flex-1 h-12 rounded-xl text-slate-500 hover:text-slate-900">
                Cancel
              </Button>
              <Button onClick={enableRoom} className="flex-[2] h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200">
                <Plus className="h-5 w-5 mr-2" />
                Enable Features
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white pb-20">

        {/* Header */}
        <div className="w-full bg-white/60 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 transition-all duration-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight line-clamp-1">{course.title}</h1>
                    <Badge variant="outline" className="border-indigo-100 bg-indigo-50 text-indigo-700">Manager</Badge>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    {course.enrollmentCount} Active Students
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowVideoRoom(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 font-bold rounded-xl h-10"
              >
                <Video className="h-4 w-4 mr-2" />
                Start Live
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <TabsList className="bg-white/50 backdrop-blur p-1 rounded-2xl border border-slate-200/60 h-auto self-start">
                <TabsTrigger className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-2.5 font-bold gap-2" value="chat">
                  <MessageCircle className="h-4 w-4" /> Chat
                </TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl px-6 py-2.5 font-bold gap-2" value="sessions">
                  <Calendar className="h-4 w-4" /> Schedule
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8">
                <TabsContent value="chat" className="mt-0">
                  <Card className="border-none shadow-2xl shadow-indigo-100/40 overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl">
                    <CourseChat
                      courseId={courseId}
                      courseName={course.title}
                      className="h-[650px] border-none shadow-none"
                    />
                  </Card>
                </TabsContent>

                <TabsContent value="sessions" className="mt-0 space-y-6">
                  {/* Schedule Button Card */}
                  <Card className="border-none shadow-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-3xl p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                          <Calendar className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Plan Your Next Class</h3>
                          <p className="text-indigo-100">Schedule live sessions to notify students.</p>
                        </div>
                      </div>

                      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                        <DialogTrigger asChild>
                          <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl shadow-lg border-none h-12 px-8 w-full md:w-auto">
                            <Plus className="h-5 w-5 mr-2" />
                            New Session
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                          <DialogHeader className="p-6 bg-slate-50 border-b">
                            <DialogTitle className="text-xl font-black text-slate-900">Schedule Live Session</DialogTitle>
                            <DialogDescription>
                              Set up a new virtual classroom event.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 p-6 bg-white">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700">Topic</label>
                              <Input
                                value={newSession.title}
                                onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                                placeholder="e.g., Week 3 Review & Q&A"
                                className="rounded-xl bg-slate-50 border-slate-200"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700">Description</label>
                              <Textarea
                                value={newSession.description}
                                onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                                placeholder="What will students learn?"
                                className="rounded-xl bg-slate-50 border-slate-200 resize-none h-24"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700">When?</label>
                              <Input
                                type="datetime-local"
                                value={newSession.scheduledAt}
                                onChange={(e) => setNewSession({ ...newSession, scheduledAt: e.target.value })}
                                className="rounded-xl bg-slate-50 border-slate-200"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Duration (min)</label>
                                <Input
                                  type="number"
                                  value={newSession.duration}
                                  onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value) })}
                                  className="rounded-xl bg-slate-50 border-slate-200"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Max Students</label>
                                <Input
                                  type="number"
                                  value={newSession.maxParticipants}
                                  onChange={(e) => setNewSession({ ...newSession, maxParticipants: parseInt(e.target.value) })}
                                  className="rounded-xl bg-slate-50 border-slate-200"
                                />
                              </div>
                            </div>
                          </div>
                          <DialogFooter className="p-4 bg-slate-50 border-t gap-2">
                            <Button variant="ghost" onClick={() => setShowScheduleDialog(false)} className="rounded-xl font-bold">
                              Cancel
                            </Button>
                            <Button onClick={scheduleSession} disabled={isScheduling} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold px-6">
                              {isScheduling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                              Schedule Event
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>

                  {/* Sessions List */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 text-lg px-2">Scheduled Events</h3>

                    {sessions.length === 0 ? (
                      <Card className="border-none shadow-lg bg-white/60 backdrop-blur">
                        <CardContent className="flex flex-col items-center py-12 gap-4 text-center">
                          <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-300 flex items-center justify-center">
                            <Calendar className="h-8 w-8" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 text-lg">No sessions scheduled</p>
                            <p className="text-slate-500">Your planned events will appear here</p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {sessions.map((session) => (
                          <div
                            key={session.id}
                            className="group flex flex-col md:flex-row items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-center gap-5 w-full md:w-auto">
                              <div className={cn(
                                "h-14 w-14 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm",
                                session.status === 'LIVE' ? "bg-red-50 text-red-600 ring-1 ring-red-100" : "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100"
                              )}>
                                <span className="text-[10px] uppercase font-bold opacity-60">
                                  {new Date(session.scheduledAt).toLocaleDateString('en-US', { day: 'numeric' })}
                                </span>
                                <span className="text-lg leading-none">
                                  {new Date(session.scheduledAt).toLocaleDateString('en-US', { month: 'short' })}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{session.title}</h4>
                                <div className="flex items-center gap-3 text-sm text-slate-500 font-medium mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                                  <span>{session.duration} min</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto justify-end">
                              <Badge variant={session.status === 'LIVE' ? 'destructive' : 'secondary'} className="rounded-lg h-9 px-3">
                                {session.status}
                              </Badge>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-indigo-50 hover:text-indigo-600">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl">
                                  <DropdownMenuItem className="gap-2 font-medium" onClick={() => setShowVideoRoom(true)}>
                                    <Play className="h-4 w-4" /> Start Session
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2 font-medium text-red-600 focus:text-red-700 focus:bg-red-50">
                                    <Trash2 className="h-4 w-4" /> Cancel Session
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="border-none shadow-lg shadow-indigo-100/20 rounded-3xl overflow-hidden bg-white">
                  <CardHeader className="border-b border-slate-50 px-6 py-4">
                    <CardTitle className="text-base font-bold">Community Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                          <Users className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-600">Students</span>
                      </div>
                      <span className="font-black text-lg text-slate-800">{course.enrollmentCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-600">Sessions</span>
                      </div>
                      <span className="font-black text-lg text-slate-800">{sessions.length}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Chat Status</span>
                        <Badge variant={room?.chatEnabled ? 'default' : 'secondary'} className={room?.chatEnabled ? "bg-emerald-500" : ""}>
                          {room?.chatEnabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Video Status</span>
                        <Badge variant={room?.videoEnabled ? 'default' : 'secondary'} className={room?.videoEnabled ? "bg-emerald-500" : ""}>
                          {room?.videoEnabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg shadow-indigo-100/20 rounded-3xl overflow-hidden bg-white">
                  <CardHeader className="border-b border-slate-50 px-6 py-4">
                    <CardTitle className="text-base font-bold">Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start rounded-xl h-12 font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50">
                      <MessageCircle className="h-4 w-4 mr-3" /> Mute Chat
                    </Button>
                    <Button variant="ghost" className="w-full justify-start rounded-xl h-12 font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50">
                      <Share2 className="h-4 w-4 mr-3" /> Share Course Link
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

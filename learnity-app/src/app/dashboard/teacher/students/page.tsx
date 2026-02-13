'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Calendar,
  BookOpen,
  Zap,
  Plus,
  Filter,
  BarChart3,
  GraduationCap,
  Sparkles,
  ChevronRight,
  FileText,
  Mail,
  Layers,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useToast } from '@/hooks/use-toast';
import AnalyticsView from '@/components/teachers/AnalyticsView';

// --- Types ---
type ViewState = 'roster' | 'curriculum' | 'analytics' | 'schedule';

interface EnrolledCourse {
  courseId: string;
  courseTitle: string;
  progress: number;
  enrolledAt: string;
  lastAccessedAt: string;
  status: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string | null;
  enrolledCourses: EnrolledCourse[];
  totalProgress: number;
  lastActive: string;
  totalCoursesEnrolled: number;
}

interface StudentsData {
  students: Student[];
  total: number;
  activeCount: number;
  completedCount: number;
  averageProgress: number;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  status: string;
  difficulty: string;
  lessonCount: number;
  sectionCount: number;
  enrollmentCount: number;
  averageRating: number;
  totalDuration: number;
  category: { id: string; name: string };
}

interface CoursesData {
  courses: Course[];
  total: number;
  publishedCount: number;
  draftCount: number;
  totalEnrollments: number;
}

interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  type: string;
  startTime: string;
  endTime: string;
  isLive: boolean;
  meetingLink: string | null;
  courseId: string | null;
  courseName: string | null;
  attendeeCount: number;
  maxAttendees: number | null;
}

interface ScheduleData {
  events: ScheduleEvent[];
  upcomingCount: number;
  todayCount: number;
  thisWeekCount: number;
}

interface TeacherStats {
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  averageRating: number;
  totalReviews: number;
}

export default function TeacherCommandCenter() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ViewState>('roster');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [studentsData, setStudentsData] = useState<StudentsData | null>(null);
  const [coursesData, setCoursesData] = useState<CoursesData | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [stats, setStats] = useState<TeacherStats | null>(null);

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const token = await user.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all data in parallel
        const [studentsRes, coursesRes, scheduleRes, statsRes] =
          await Promise.all([
            fetch('/api/teacher/students', { headers }),
            fetch('/api/teacher/courses', { headers }),
            fetch('/api/teacher/schedule', { headers }),
            fetch('/api/teacher/stats', { headers }),
          ]);

        if (studentsRes.ok) {
          const data = await studentsRes.json();
          setStudentsData(data.data);
        }

        if (coursesRes.ok) {
          const data = await coursesRes.json();
          setCoursesData(data.data);
        }

        if (scheduleRes.ok) {
          const data = await scheduleRes.json();
          setScheduleData(data.data);
        }

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!studentsData?.students) return [];
    if (!searchQuery) return studentsData.students;

    const query = searchQuery.toLowerCase();
    return studentsData.students.filter(
      student =>
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.enrolledCourses.some(c =>
          c.courseTitle.toLowerCase().includes(query)
        )
    );
  }, [studentsData, searchQuery]);

  const handleSendNudge = () => {
    toast({
      title: 'Reminder Sent',
      description: 'Students have been notified about their pending lessons.',
    });
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4'>
        <div className='relative'>
          <div className='h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin' />
          <GraduationCap className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-600' />
        </div>
        <p className='text-slate-500 font-medium animate-pulse'>
          Syncing your command center...
        </p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white pb-20'>
      {/* Top Status Banner */}
      <div className='w-full bg-white/60 backdrop-blur-md border-b border-slate-200 py-3 mb-8 sticky top-0 z-50'>
        <div className='container mx-auto px-4 max-w-7xl flex justify-between items-center'>
          <div className='flex items-center gap-8 text-sm font-medium'>
            <div className='flex items-center gap-2 text-indigo-600'>
              <CheckCircle2 className='h-4 w-4' /> System Online
            </div>
            <div className='hidden md:flex items-center gap-2 text-emerald-600'>
              <Users className='h-4 w-4' /> {studentsData?.activeCount || 0}{' '}
              Students Active
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Badge className='bg-indigo-50 text-indigo-700 border-none px-3 py-1'>
              <Sparkles className='h-3 w-3 mr-1' /> Premium Educator
            </Badge>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 max-w-7xl'>
        {/* Hero / Header Section */}
        <header className='flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6'>
          <div className='space-y-2'>
            <h1 className='text-4xl font-extrabold text-slate-900 tracking-tight'>
              Command <span className='text-indigo-600'>Center</span>
            </h1>
            <p className='text-slate-500 font-medium leading-relaxed max-w-xl'>
              Manage your academic ecosystem, track student growth, and refine
              your curriculum from one dashboard.
            </p>
          </div>

          <nav className='flex items-center bg-white/50 backdrop-blur p-1.5 rounded-xl ring-1 ring-slate-200 shadow-sm gap-1'>
            {[
              { id: 'roster', label: 'Roster', icon: Users },
              { id: 'curriculum', label: 'Course', icon: BookOpen },
              { id: 'analytics', label: 'Insights', icon: BarChart3 },
              { id: 'schedule', label: 'Events', icon: Calendar },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ViewState)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all',
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-slate-500 hover:bg-white hover:text-indigo-600'
                )}
              >
                <tab.icon className='h-4 w-4' />
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
          {/* Main Dynamic Content */}
          <div className='lg:col-span-8 space-y-8'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='space-y-6'
              >
                {activeTab === 'roster' && (
                  <RosterView
                    students={filteredStudents}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    total={studentsData?.total || 0}
                  />
                )}
                {activeTab === 'curriculum' && (
                  <CurriculumView
                    courses={coursesData?.courses || []}
                    onCreateCourse={() =>
                      router.push('/dashboard/teacher/courses/new')
                    }
                  />
                )}
                {activeTab === 'analytics' && <AnalyticsView />}
                {activeTab === 'schedule' && (
                  <ScheduleView events={scheduleData?.events || []} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar - Contextual Intelligence */}
          <aside className='lg:col-span-4 space-y-8'>
            {/* AI Recommendation Card */}
            <Card className='bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative'>
              <div className='absolute top-0 right-0 p-4 opacity-10'>
                <Zap className='h-24 w-24' />
              </div>
              <CardContent className='p-8 space-y-6 relative z-10'>
                <div className='flex items-center gap-2 text-amber-400'>
                  <Sparkles className='h-5 w-5 fill-amber-400' />
                  <span className='text-xs font-black uppercase tracking-widest'>
                    AI Suggestion
                  </span>
                </div>
                <div className='space-y-2'>
                  <h3 className='text-2xl font-bold'>Improve Engagement</h3>
                  <p className='text-slate-400 text-sm'>
                    {studentsData &&
                    studentsData.students.filter(s => s.totalProgress < 50)
                      .length > 0
                      ? `${studentsData.students.filter(s => s.totalProgress < 50).length} students have less than 50% progress. Send a group reminder?`
                      : 'All students are making great progress! Keep up the good work.'}
                  </p>
                </div>
                <Button
                  onClick={handleSendNudge}
                  className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black h-12 rounded-xl shadow-lg shadow-indigo-900'
                >
                  Send Nudge
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats Panel */}
            <div className='space-y-4'>
              <h4 className='text-sm font-bold text-slate-500 uppercase px-2 tracking-widest'>
                Performance Snapshot
              </h4>
              <div className='grid grid-cols-2 gap-4'>
                <div className='p-4 rounded-xl bg-white border border-slate-100 shadow-sm'>
                  <div className='text-2xl font-black text-indigo-600'>
                    {studentsData?.averageProgress || 0}%
                  </div>
                  <div className='text-[10px] uppercase font-bold text-slate-400'>
                    Avg Progress
                  </div>
                </div>
                <div className='p-4 rounded-xl bg-white border border-slate-100 shadow-sm'>
                  <div className='text-2xl font-black text-emerald-600'>
                    {stats?.averageRating?.toFixed(1) || '0.0'}
                  </div>
                  <div className='text-[10px] uppercase font-bold text-slate-400'>
                    Avg Rating
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Reports */}
            <div className='space-y-4'>
              <h4 className='text-sm font-bold text-slate-500 uppercase px-2 tracking-widest'>
                Quick Actions
              </h4>
              {[
                {
                  name: 'Export Student Data',
                  action: 'export',
                  icon: Download,
                },
                { name: 'View All Reviews', action: 'reviews', icon: FileText },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() =>
                    toast({
                      title: 'Coming Soon',
                      description: `${item.name} feature is under development.`,
                    })
                  }
                  className='flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-500 transition-all cursor-pointer group shadow-sm'
                >
                  <div className='flex items-center gap-4'>
                    <div className='h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors'>
                      <item.icon className='h-5 w-5' />
                    </div>
                    <div>
                      <p className='text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors'>
                        {item.name}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className='h-4 w-4 text-slate-200' />
                </div>
              ))}
            </div>

            {/* Contact Support Button */}
            <Button
              variant='outline'
              className='w-full h-12 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 font-bold shadow-sm'
              onClick={() =>
                (window.location.href = 'mailto:learnity.lms@gmail.com')
              }
            >
              <Mail className='h-4 w-4' /> Reach Support
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
}

// --- View Components ---

interface RosterViewProps {
  students: Student[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  total: number;
}

function RosterView({
  students,
  searchQuery,
  onSearchChange,
  total,
}: RosterViewProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <p className='text-sm text-slate-500'>
          Showing {students.length} of {total} students
        </p>
      </div>

      <div className='flex items-center gap-4 bg-white/70 backdrop-blur p-2 rounded-xl shadow-xl shadow-indigo-100/20 border border-slate-200/60'>
        <Search className='ml-4 h-4 w-4 text-slate-400' />
        <Input
          placeholder='Find a student...'
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className='border-none bg-transparent focus-visible:ring-0 text-sm font-medium'
        />
        <Button
          size='icon'
          variant='ghost'
          className='text-slate-400 hover:text-indigo-600'
        >
          <Filter className='h-4 w-4' />
        </Button>
      </div>

      <div className='grid gap-3'>
        {students.length === 0 ? (
          <Card className='p-8 text-center'>
            <div className='flex flex-col items-center gap-4'>
              <Users className='h-12 w-12 text-slate-300' />
              <div>
                <h3 className='font-bold text-slate-700'>No students found</h3>
                <p className='text-sm text-slate-500'>
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Students will appear here once they enroll in your courses'}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          students.map(student => (
            <div
              key={student.id}
              className='group flex items-center justify-between p-5 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-indigo-300 transition-all hover:shadow-lg hover:shadow-indigo-50 cursor-pointer'
            >
              <div className='flex items-center gap-4'>
                {student.profilePicture ? (
                  <Image
                    src={student.profilePicture}
                    alt={`${student.firstName} ${student.lastName}`}
                    width={48}
                    height={48}
                    className='h-12 w-12 rounded-xl object-cover'
                  />
                ) : (
                  <div className='h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 uppercase text-xs'>
                    {getInitials(student.firstName, student.lastName)}
                  </div>
                )}
                <div>
                  <h4 className='font-bold text-slate-800 group-hover:text-indigo-600 transition-colors'>
                    {student.firstName} {student.lastName}
                  </h4>
                  <p className='text-xs text-slate-500 font-medium italic'>
                    {student.enrolledCourses[0]?.courseTitle || 'No courses'}
                    {student.totalCoursesEnrolled > 1 &&
                      ` +${student.totalCoursesEnrolled - 1} more`}
                    {' • '}Active {getTimeAgo(student.lastActive)}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-6'>
                <div className='text-right'>
                  <p className='text-[10px] font-black text-slate-300 uppercase'>
                    Progress
                  </p>
                  <p className='font-bold text-indigo-600'>
                    {student.totalProgress}%
                  </p>
                </div>
                <ChevronRight className='h-5 w-5 text-slate-200 group-hover:text-indigo-400 transition-all group-hover:translate-x-1' />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface CurriculumViewProps {
  courses: Course[];
  onCreateCourse: () => void;
}

function CurriculumView({ courses, onCreateCourse }: CurriculumViewProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center px-2'>
        <h2 className='text-xl font-bold'>Your Courses ({courses.length})</h2>
        <Button
          onClick={onCreateCourse}
          className='bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2 font-bold shadow-lg shadow-indigo-100'
        >
          <Plus className='h-4 w-4' /> New Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card className='p-8 text-center'>
          <div className='flex flex-col items-center gap-4'>
            <BookOpen className='h-12 w-12 text-slate-300' />
            <div>
              <h3 className='font-bold text-slate-700'>No courses yet</h3>
              <p className='text-sm text-slate-500'>
                Create your first course to start teaching
              </p>
            </div>
            <Button onClick={onCreateCourse} className='mt-2'>
              <Plus className='h-4 w-4 mr-2' /> Create Course
            </Button>
          </div>
        </Card>
      ) : (
        courses.map(course => (
          <Card
            key={course.id}
            className='overflow-hidden border-none shadow-xl shadow-indigo-100/50 bg-white/80 backdrop-blur group'
          >
            <div
              className={cn(
                'h-1.5 w-full transition-colors',
                course.status === 'PUBLISHED'
                  ? 'bg-emerald-500'
                  : 'bg-amber-400'
              )}
            />
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-5'>
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      width={56}
                      height={56}
                      className='h-14 w-14 rounded-xl object-cover'
                    />
                  ) : (
                    <div className='h-14 w-14 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center'>
                      <Layers className='h-7 w-7' />
                    </div>
                  )}
                  <div>
                    <div className='flex items-center gap-2'>
                      <h3 className='text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors'>
                        {course.title}
                      </h3>
                      <Badge
                        variant={
                          course.status === 'PUBLISHED'
                            ? 'default'
                            : 'secondary'
                        }
                        className='text-[10px]'
                      >
                        {course.status}
                      </Badge>
                    </div>
                    <p className='text-xs text-slate-500 font-medium mt-1'>
                      {course.lessonCount} Lessons •{' '}
                      {formatDuration(course.totalDuration)} •{' '}
                      {course.enrollmentCount} Students
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Button variant='ghost' className='rounded-xl text-slate-500'>
                    Edit
                  </Button>
                  <Button
                    variant='outline'
                    className='rounded-xl border-indigo-100 text-indigo-600'
                  >
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

interface ScheduleViewProps {
  events: ScheduleEvent[];
}

function ScheduleView({ events }: ScheduleViewProps) {
  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatEventDay = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='space-y-6'>
      {events.length === 0 ? (
        <Card className='p-8 text-center'>
          <div className='flex flex-col items-center gap-4'>
            <Calendar className='h-12 w-12 text-slate-300' />
            <div>
              <h3 className='font-bold text-slate-700'>No upcoming events</h3>
              <p className='text-sm text-slate-500'>
                Schedule live sessions to engage with your students
              </p>
            </div>
          </div>
        </Card>
      ) : (
        events.map(event => (
          <div
            key={event.id}
            className={cn(
              'flex gap-6 p-6 rounded-4xl border transition-all',
              event.isLive
                ? 'bg-indigo-50 border-indigo-200 shadow-xl shadow-indigo-100/50'
                : 'bg-white border-slate-100 shadow-sm'
            )}
          >
            <div className='w-16 text-center'>
              <p className='text-[10px] font-black text-slate-400 uppercase'>
                {formatEventDay(event.startTime)}
              </p>
              <p className='text-xl font-black text-slate-900'>
                {formatEventTime(event.startTime)}
              </p>
            </div>
            <div className='flex-1 flex items-center justify-between'>
              <div>
                <div className='flex items-center gap-2'>
                  <h4 className='font-bold text-slate-900'>{event.title}</h4>
                  {event.isLive && (
                    <Badge className='bg-red-500 text-white animate-pulse'>
                      LIVE
                    </Badge>
                  )}
                </div>
                <p className='text-xs text-slate-500 font-medium'>
                  {event.attendeeCount} attendees
                  {event.maxAttendees && ` / ${event.maxAttendees} max`}
                  {event.courseName && ` • ${event.courseName}`}
                </p>
              </div>
              <Button
                className={cn(
                  'rounded-xl font-bold',
                  event.isLive
                    ? 'bg-indigo-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {event.isLive ? 'Start Now' : 'Details'}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Video,
  ArrowLeft,
  Calendar,
  MessageSquare,
  ExternalLink,
  BookOpen,
  Sparkles,
  Zap,
  Clock,
  ChevronRight,
  ShieldCheck,
  VideoOff,
  Link as LinkIcon,
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

export default function TeacherSessionsPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className='min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white pb-20'>
      {/* 1. TOP NAVIGATION BANNER */}
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
              <Badge className='bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-3 py-1'>
                <Zap className='h-3 w-3 mr-1 fill-purple-700' /> Beta Feature
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 max-w-7xl'>
        {/* 2. HERO SECTION */}
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'
        >
          {/* 3. MAIN CONTENT: INTEGRATION CARDS */}
          <div className='lg:col-span-8 space-y-8'>
            {/* FEATURED: NATIVE SESSIONS STATUS */}
            <Card className='overflow-hidden border-none shadow-xl shadow-purple-100/50 bg-white/80 backdrop-blur'>
              <div className='h-2 w-full bg-gradient-to-r from-purple-500 to-indigo-600' />
              <CardContent className='p-8'>
                <div className='flex flex-col md:flex-row items-center gap-8'>
                  <div className='relative'>
                    <div className='h-24 w-24 rounded-3xl bg-purple-50 flex items-center justify-center'>
                      <VideoOff className='h-10 w-10 text-purple-400' />
                    </div>
                    <div className='absolute -bottom-2 -right-2 h-8 w-8 bg-white rounded-full shadow-md flex items-center justify-center'>
                      <Clock className='h-4 w-4 text-amber-500 animate-spin-slow' />
                    </div>
                  </div>
                  <div className='flex-1 text-center md:text-left'>
                    <h3 className='text-xl font-bold text-slate-900 mb-2'>
                      Native Sessions are in Development
                    </h3>
                    <p className='text-slate-500 text-sm leading-relaxed mb-4'>
                      Direct integration with whiteboard tools, student polls,
                      and automated attendance is currently in alpha testing.
                      You will be notified the moment it goes live.
                    </p>
                    <div className='flex flex-wrap gap-3 justify-center md:justify-start'>
                      <Badge
                        variant='outline'
                        className='border-slate-200 text-slate-500'
                      >
                        HD Video
                      </Badge>
                      <Badge
                        variant='outline'
                        className='border-slate-200 text-slate-500'
                      >
                        Whiteboard
                      </Badge>
                      <Badge
                        variant='outline'
                        className='border-slate-200 text-slate-500'
                      >
                        Recording
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* EXTERNAL TOOLS GRID */}
            <div className='space-y-4'>
              <h3 className='text-sm font-bold uppercase tracking-wider text-slate-400 px-2'>
                Verified Connections
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Google Meet Card */}
                <Card className='group hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer border-none shadow-lg bg-white'>
                  <CardHeader className='pb-2'>
                    <div className='h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2'>
                      <Video className='h-6 w-6' />
                    </div>
                    <CardTitle className='text-lg'>Google Meet</CardTitle>
                    <CardDescription className='text-xs'>
                      Best for live lectures and presentations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <ul className='text-xs text-slate-500 space-y-2'>
                      <li className='flex items-center gap-2'>
                        <div className='h-1 w-1 bg-blue-400 rounded-full' />{' '}
                        Create a recurring link
                      </li>
                      <li className='flex items-center gap-2'>
                        <div className='h-1 w-1 bg-blue-400 rounded-full' />{' '}
                        Share in course description
                      </li>
                    </ul>
                    <Button
                      variant='outline'
                      className='w-full border-blue-100 text-blue-600 hover:bg-blue-50 gap-2 font-bold rounded-xl'
                    >
                      <ExternalLink className='h-4 w-4' /> Open Meet
                    </Button>
                  </CardContent>
                </Card>

                {/* WhatsApp Card */}
                <Card className='group hover:ring-2 hover:ring-emerald-500 transition-all cursor-pointer border-none shadow-lg bg-white'>
                  <CardHeader className='pb-2'>
                    <div className='h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2'>
                      <MessageSquare className='h-6 w-6' />
                    </div>
                    <CardTitle className='text-lg'>
                      WhatsApp Community
                    </CardTitle>
                    <CardDescription className='text-xs'>
                      Best for daily Q&A and quick updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <ul className='text-xs text-slate-500 space-y-2'>
                      <li className='flex items-center gap-2'>
                        <div className='h-1 w-1 bg-emerald-400 rounded-full' />{' '}
                        Invite students via link
                      </li>
                      <li className='flex items-center gap-2'>
                        <div className='h-1 w-1 bg-emerald-400 rounded-full' />{' '}
                        Build student community
                      </li>
                    </ul>
                    <Button
                      variant='outline'
                      className='w-full border-emerald-100 text-emerald-600 hover:bg-emerald-50 gap-2 font-bold rounded-xl'
                    >
                      <LinkIcon className='h-4 w-4' /> Manage Links
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* 4. SIDEBAR: TIPS & STATS */}
          <aside className='lg:col-span-4 space-y-8'>
            {/* SUCCESS GUIDE CARD */}
            <Card className='bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative'>
              <div className='absolute top-0 right-0 p-4 opacity-10'>
                <ShieldCheck className='h-24 w-24' />
              </div>
              <CardContent className='p-8 space-y-6 relative z-10'>
                <div className='space-y-2'>
                  <h3 className='text-2xl font-bold'>Session Mastery</h3>
                  <p className='text-slate-400 text-sm'>
                    Effective live sessions increase course ratings by up to
                    45%.
                  </p>
                </div>

                <div className='space-y-4'>
                  <div className='flex justify-between text-xs font-bold uppercase tracking-tighter'>
                    <span>Live Engagement Score</span>
                    <span className='text-purple-400'>Target: 90%</span>
                  </div>
                  <div className='h-2 bg-white/10 rounded-full overflow-hidden'>
                    <div className='h-full bg-purple-500 w-[75%]' />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur'>
                    <div className='text-2xl font-black text-purple-400'>
                      1.2k
                    </div>
                    <div className='text-[10px] uppercase font-bold text-slate-500 tracking-tighter'>
                      Daily Sessions
                    </div>
                  </div>
                  <div className='p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur'>
                    <div className='text-2xl font-black text-amber-400'>
                      98%
                    </div>
                    <div className='text-[10px] uppercase font-bold text-slate-500 tracking-tighter'>
                      Uptime goal
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QUICK TIPS LIST */}
            <div className='space-y-4'>
              <h4 className='text-sm font-bold text-slate-500 uppercase px-2 tracking-widest'>
                Teaching Best Practices
              </h4>
              <div className='space-y-3'>
                {[
                  {
                    title: 'Always record sessions',
                    desc: 'Students value re-watching',
                    icon: Video,
                  },
                  {
                    title: 'Set regular office hours',
                    desc: 'Builds student consistency',
                    icon: Calendar,
                  },
                  {
                    title: 'Interactive Q&A',
                    desc: 'Improves learning retention',
                    icon: Sparkles,
                  },
                ].map((tip, i) => (
                  <div
                    key={i}
                    className='w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-purple-500 hover:shadow-lg transition-all group'
                  >
                    <div className='h-10 w-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors'>
                      <tip.icon className='h-5 w-5' />
                    </div>
                    <div className='flex-1'>
                      <div className='text-sm font-bold text-slate-900'>
                        {tip.title}
                      </div>
                      <div className='text-[10px] text-slate-500'>
                        {tip.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CALL TO ACTION */}
            <Card className='border-none shadow-lg bg-gradient-to-br from-indigo-600 to-purple-700 text-white'>
              <CardContent className='p-6'>
                <h4 className='font-bold mb-2 flex items-center gap-2'>
                  <BookOpen className='h-4 w-4' /> Ready to Update?
                </h4>
                <p className='text-xs text-indigo-100 mb-4 leading-relaxed'>
                  Go to your course settings to add meeting links directly to
                  your curriculum modules.
                </p>
                <Link href='/dashboard/teacher/courses'>
                  <Button className='w-full bg-white text-indigo-700 hover:bg-slate-50 font-black h-10 rounded-xl'>
                    Edit My Courses
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </aside>
        </motion.div>
      </div>
    </div>
  );
}

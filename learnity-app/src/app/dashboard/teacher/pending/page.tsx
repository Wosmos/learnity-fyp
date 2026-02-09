import { addBusinessDays, format } from 'date-fns';
import {
  ShieldCheck,
  Clock,
  Mail,
  Info,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CountdownCard } from '@/components/teachers/countdown-card';
import { ProfileActionGrid } from '@/components/teachers/profile-action-grid';

import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/config/firebase-admin';
import { ServiceFactory } from '@/lib/factories/service.factory';
import { redirect } from 'next/navigation';

async function getApplicationStatus() {
  const cookieStore = cookies();
  const session = (await cookieStore).get('session')?.value;

  if (!session) {
    redirect('/auth/login');
  }

  try {
    // 1. Verify session and get user UID
    const decodedToken = await adminAuth.verifyIdToken(session);
    const firebaseUid = decodedToken.uid;

    // 2. Get user profile from database
    const databaseService = ServiceFactory.getDatabaseService();
    const user = await databaseService.getUserProfile(firebaseUid);

    if (!user || !user.teacherProfile) {
      // If user isn't a teacher or profile missing, they shouldn't be here
      redirect('/dashboard');
    }

    const profile = user.teacherProfile;

    // 3. Define real completion items based on DB fields
    const completionItems = [
      {
        id: 'video',
        title: 'Video Introduction',
        description: 'Introduce yourself to students',
        completed: !!profile.videoIntroUrl,
        impact: 'High',
        category: 'recommended',
      },
      {
        id: 'bio',
        title: 'Professional Bio',
        description: 'Write about your teaching style',
        completed: !!profile.bio,
        impact: 'Medium',
        category: 'required',
      },
      {
        id: 'qualifications',
        title: 'Qualifications',
        description: 'Verify your teaching credentials',
        completed: profile.qualifications && profile.qualifications.length > 0,
        impact: 'High',
        category: 'required',
      },
      {
        id: 'availability',
        title: 'Availability',
        description: 'Set your teaching hours',
        completed:
          !!profile.availability ||
          (profile.availableDays && profile.availableDays.length > 0),
        impact: 'Medium',
        category: 'required',
      },
    ];

    // Calculate real completion percentage
    const completedCount = completionItems.filter(
      item => item.completed
    ).length;
    const profileCompletion = (completedCount / completionItems.length) * 100;

    return {
      applicationStatus: profile.applicationStatus,
      submittedAt: profile.submittedAt || user.createdAt,
      profileCompletion,
      completionItems,
      profile: {
        firstName: user.firstName,
        email: user.email,
        id: user.id,
      },
    };
  } catch (error) {
    console.error('Error fetching teacher application status:', error);
    redirect('/auth/login');
  }
}

export default async function PendingTeacherDashboard() {
  const data = await getApplicationStatus();

  // Calculate Dates
  const submittedDate = new Date(data.submittedAt);
  const expectedDate = addBusinessDays(submittedDate, 3);
  const formattedExpectedDate = format(expectedDate, 'EEEE, MMMM do');

  return (
    <div className='bg-slate-50/50 text-slate-900 pb-20 selection:bg-slate-900 selection:text-white'>
      <main className='px-4 md:px-8 max-w-6xl mx-auto pt-10'>
        {/* Header Section */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12'>
          <div className='space-y-4'>
            <Badge
              variant='outline'
              className='rounded-full px-4 py-1 border-slate-200 text-slate-500 bg-white shadow-sm font-semibold'
            >
              <span className='relative flex h-2 w-2 mr-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2 w-2 bg-amber-500'></span>
              </span>
              Application Under Review
            </Badge>
            <h1 className='text-4xl md:text-5xl font-black tracking-tight text-slate-900'>
              Profile in progress, <br />
              <span className='text-slate-400'>{data.profile.firstName}</span>
            </h1>
          </div>

          <div className='flex gap-3'>
            <Button
              variant='outline'
              className='border-slate-200 hover:bg-white text-slate-600 font-bold'
            >
              Preview Profile
            </Button>
            <Button className='bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 font-bold'>
              Priority Support
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* LEFT COLUMN: Main Status */}
          <div className='lg:col-span-8 space-y-8'>
            {/* The Status Card */}
            <Card className='border border-slate-200 shadow-sm bg-white overflow-hidden relative'>
              <div className='absolute top-0 left-0 w-1.5 h-full bg-indigo-600' />
              <CardContent className='p-8'>
                <div className='flex flex-col md:flex-row gap-10 items-start'>
                  {/* Countdown Visual */}
                  <CountdownCard targetDate={expectedDate.toISOString()} />

                  <div className='space-y-6 flex-1'>
                    <div>
                      <h3 className='text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2'>
                        Verification Timeline
                        <Info className='h-3.5 w-3.5' />
                      </h3>
                      <p className='text-3xl font-black tracking-tight text-slate-900 mt-2'>
                        {formattedExpectedDate}
                      </p>
                      <p className='text-sm text-slate-500 mt-2 font-medium bg-slate-50 inline-block px-2 py-1 rounded'>
                        Targeting 3 business days for verification
                      </p>
                    </div>

                    <div className='h-px w-full bg-slate-100' />

                    <div className='flex gap-4 text-sm text-slate-600 leading-relaxed'>
                      <div className='p-2 bg-indigo-50 rounded-lg shrink-0'>
                        <ShieldCheck className='h-5 w-5 text-indigo-600' />
                      </div>
                      <p className='pt-1'>
                        Our admissions team is manually verifying your
                        credentials. Watch your inbox at{' '}
                        <span className='font-bold text-slate-900'>
                          {data.profile.email}
                        </span>
                        for any follow-up requests.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Grid (Client Component) */}
            <div className='space-y-4'>
              <div className='flex justify-between items-center px-1'>
                <h3 className='text-xs font-black uppercase tracking-[0.2em] text-slate-400'>
                  Verification Checklist
                </h3>
                <span className='text-[10px] font-black bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-indigo-600 uppercase tracking-wider'>
                  {Math.round(data.profileCompletion)}% Processed
                </span>
              </div>
              <ProfileActionGrid items={data.completionItems} />
            </div>
          </div>

          {/* RIGHT COLUMN: Support & Info */}
          <aside className='lg:col-span-4 space-y-6'>
            {/* Help Block */}
            <div className='bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6'>
              <div className='space-y-4'>
                <div className='h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center'>
                  <Mail className='h-6 w-6 text-slate-900' />
                </div>
                <div>
                  <h3 className='font-black text-slate-900 text-lg'>
                    Need faster review?
                  </h3>
                  <p className='text-sm text-slate-500 leading-relaxed mt-2'>
                    If your application has been pending for more than 5
                    business days, please contact our verification team
                    directly.
                  </p>
                </div>
              </div>

              <a
                href='mailto:learnity.lms@gmail.com'
                className='flex items-center justify-between w-full p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all group'
              >
                <span className='text-sm font-bold text-slate-700'>
                  learnity.lms@gmail.com
                </span>
                <ArrowRight className='h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-all' />
              </a>
            </div>

            {/* Tip Card */}
            <div className='bg-slate-900 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden'>
              {/* Decorative Gradient */}
              <div className='absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl' />

              <div className='relative z-10 space-y-5'>
                <div className='flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]'>
                  <CheckCircle2 className='h-3.5 w-3.5' />
                  Professional Tip
                </div>
                <h3 className='font-black text-xl leading-tight'>
                  Get approved 2x faster with Video
                </h3>
                <p className='text-slate-400 text-sm leading-relaxed'>
                  Our review board prioritizes teachers who have a clear,
                  high-quality introduction video. It helps us verify your
                  communication skills immediately.
                </p>
                <Button className='w-full bg-white text-slate-900 hover:bg-slate-100 font-black mt-2 h-12 text-xs uppercase tracking-widest'>
                  Edit Video Intro
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

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

// MOCK DATA FETCHING FUNCTION
// In a real app, replace this with your DB call (e.g., Prisma or API fetch with server headers)
async function getApplicationStatus() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return mock data matching your interface
  return {
    applicationStatus: 'PENDING',
    submittedAt: new Date().toISOString(), // Simulating submitted just now
    profileCompletion: 65,
    completionItems: [
      {
        id: 'video',
        title: 'Video Intro',
        description: 'Add a video',
        completed: false,
        impact: 'High',
        category: 'recommended',
      },
      {
        id: 'bio',
        title: 'Biography',
        description: 'Edit bio',
        completed: true,
        impact: 'Medium',
        category: 'required',
      },
      {
        id: 'cert',
        title: 'Certifications',
        description: 'Upload docs',
        completed: false,
        impact: 'High',
        category: 'required',
      },
      {
        id: 'avail',
        title: 'Availability',
        description: 'Set hours',
        completed: false,
        impact: 'Medium',
        category: 'required',
      },
    ],
    profile: {
      firstName: 'Alex',
      email: 'alex@example.com',
    },
  };
}

export default async function PendingTeacherDashboard() {
  const data = await getApplicationStatus();

  // Calculate Dates
  const submittedDate = new Date(data.submittedAt);
  const expectedDate = addBusinessDays(submittedDate, 3);
  const formattedExpectedDate = format(expectedDate, 'EEEE, MMMM do');

  return (
    <div className='min-h-screen bg-[#F9FAFB] text-slate-900 pb-20 selection:bg-slate-900 selection:text-white'>
      {/* Navbar Placeholder (Onyx Style) */}
      <div className='border-b border-slate-200 bg-white sticky top-0 z-50'>
        <div className='container mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='font-bold text-xl tracking-tight flex items-center gap-2'>
            <div className='h-6 w-6 bg-slate-900 rounded-md' />
            Learnity
          </div>
          <div className='text-xs font-mono text-slate-400'>
            APPLICATION ID: #TR-8823
          </div>
        </div>
      </div>

      <main className='container mx-auto px-6 max-w-6xl mt-12'>
        {/* Header Section */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12'>
          <div className='space-y-4'>
            <Badge
              variant='outline'
              className='rounded-full px-4 py-1 border-slate-300 text-slate-600 bg-white shadow-sm font-medium'
            >
              <span className='relative flex h-2 w-2 mr-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2 w-2 bg-amber-500'></span>
              </span>
              Under Review
            </Badge>
            <h1 className='text-4xl md:text-5xl font-bold tracking-tight text-slate-900'>
              Good things take time, <br />
              <span className='text-slate-400'>{data.profile.firstName}.</span>
            </h1>
          </div>

          <div className='flex gap-3'>
            <Button
              variant='outline'
              className='border-slate-200 hover:bg-slate-50 text-slate-600'
            >
              View Profile
            </Button>
            <Button className='bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200'>
              Contact Support
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* LEFT COLUMN: Main Status */}
          <div className='lg:col-span-8 space-y-6'>
            {/* The "Onyx" Status Card */}
            <Card className='border border-slate-200 shadow-sm bg-white overflow-hidden relative group'>
              <div className='absolute top-0 left-0 w-1 h-full bg-slate-900' />
              <CardContent className='p-8'>
                <div className='flex flex-col md:flex-row gap-8 items-start'>
                  {/* Countdown Visual */}
                  <CountdownCard targetDate={expectedDate.toISOString()} />

                  <div className='space-y-4 flex-1'>
                    <div>
                      <h3 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
                        Estimated Decision
                        <Info className='h-4 w-4 text-slate-400' />
                      </h3>
                      <p className='text-3xl font-light tracking-tight text-slate-900 mt-1'>
                        {formattedExpectedDate}
                      </p>
                      <p className='text-sm text-slate-500 mt-2 font-medium'>
                        (Approx. 3 Business Days)
                      </p>
                    </div>

                    <div className='h-px w-full bg-slate-100' />

                    <div className='flex gap-4 text-sm text-slate-600 leading-relaxed'>
                      <ShieldCheck className='h-5 w-5 shrink-0 text-slate-900' />
                      <p>
                        Our team is currently verifying your credentials. If we
                        need more documents, we will email you at{' '}
                        <span className='font-semibold text-slate-900'>
                          {data.profile.email}
                        </span>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Grid (Client Component) */}
            <div className='space-y-4'>
              <div className='flex justify-between items-center px-1'>
                <h3 className='text-sm font-bold uppercase tracking-widest text-slate-400'>
                  Required Actions
                </h3>
                <span className='text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500'>
                  {Math.round(data.profileCompletion)}% Complete
                </span>
              </div>
              <ProfileActionGrid items={data.completionItems} />
            </div>
          </div>

          {/* RIGHT COLUMN: Support & Info */}
          <aside className='lg:col-span-4 space-y-6'>
            {/* Help Block */}
            <div className='bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6'>
              <div className='space-y-2'>
                <div className='h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center mb-4'>
                  <Mail className='h-5 w-5 text-slate-900' />
                </div>
                <h3 className='font-bold text-slate-900'>
                  Taking longer than expected?
                </h3>
                <p className='text-sm text-slate-500 leading-relaxed'>
                  If you haven't heard back by{' '}
                  {format(addBusinessDays(expectedDate, 1), 'MMMM do')}, please
                  reach out to our priority admission team.
                </p>
              </div>

              <a
                href='mailto:learnity@gmail.com'
                className='flex items-center justify-between w-full p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all group'
              >
                <span className='text-sm font-semibold text-slate-700'>
                  learnity@gmail.com
                </span>
                <ArrowRight className='h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors' />
              </a>
            </div>

            {/* Tip Card */}
            <div className='bg-slate-900 text-white rounded-xl p-6 shadow-xl relative overflow-hidden'>
              {/* Decorative Circle */}
              <div className='absolute -top-10 -right-10 w-32 h-32 bg-slate-800 rounded-full blur-2xl opacity-50' />

              <div className='relative z-10 space-y-4'>
                <div className='flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest'>
                  <Clock className='h-3 w-3' />
                  Pro Tip
                </div>
                <h3 className='font-bold text-lg leading-snug'>
                  Increase your approval speed
                </h3>
                <p className='text-slate-400 text-sm leading-relaxed'>
                  Teachers with a high-quality video introduction are processed
                  2x faster by our review board.
                </p>
                <Button
                  variant='secondary'
                  className='w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold mt-2 h-10 text-xs uppercase tracking-wide'
                >
                  Upload Video
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

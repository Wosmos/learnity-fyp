'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  RefreshCw,
  BookOpen,
  FileText,
  Mail,
  Star,
  ArrowRight,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Video,
  Award,
  Calendar,
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
import { useAuthStore } from '@/lib/stores/auth.store';
import { useToast } from '@/hooks/use-toast';

interface ProfileCompletionItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  impact: string;
  category: 'required' | 'recommended' | 'optional';
}

interface ApplicationStatusData {
  applicationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  profileCompletion: number;
  completionItems: ProfileCompletionItem[];
  canReapply: boolean;
  reapplyDate: string | null;
  improvementAreas: string[];
  estimatedReviewTime: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    bio: string | null;
    qualifications: string[];
    subjects: string[];
    experience: number;
    documents: string[];
    videoIntroUrl: string | null;
    profilePicture: string | null;
  };
}

const improvementResources = [
  {
    title: 'Teaching Certification Programs',
    description: 'Enhance your qualifications with recognized certifications',
    icon: Award,
    link: '#',
    category: 'Certification',
  },
  {
    title: 'Creating Professional Teaching Videos',
    description: 'Learn to create engaging introduction videos',
    icon: Video,
    link: '#',
    category: 'Video Skills',
  },
  {
    title: 'Building Your Teaching Portfolio',
    description: 'Showcase your experience and achievements effectively',
    icon: BookOpen,
    link: '#',
    category: 'Portfolio',
  },
  {
    title: 'Online Teaching Best Practices',
    description: 'Master the art of virtual education',
    icon: Calendar,
    link: '#',
    category: 'Teaching Skills',
  },
];

export default function RejectedTeacherDashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<ApplicationStatusData | null>(
    null
  );

  useEffect(() => {
    const fetchApplicationStatus = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const token = await user.getIdToken();
        const response = await fetch('/api/teacher/application-status', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setStatusData(data.data);
        } else {
          // Fallback data if API fails
          setStatusData({
            applicationStatus: 'REJECTED',
            submittedAt: new Date().toISOString(),
            reviewedAt: new Date().toISOString(),
            rejectionReason: 'Incomplete Documentation',
            profileCompletion: 45,
            completionItems: [],
            canReapply: true,
            reapplyDate: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toLocaleDateString(),
            improvementAreas: [
              'Upload missing certificates',
              'Add professional references',
              'Create video introduction',
            ],
            estimatedReviewTime: '2-3 business days',
            profile: {
              firstName: user.displayName?.split(' ')[0] || 'Teacher',
              lastName: user.displayName?.split(' ')[1] || '',
              email: user.email || '',
              bio: null,
              qualifications: [],
              subjects: [],
              experience: 0,
              documents: [],
              videoIntroUrl: null,
              profilePicture: null,
            },
          });
        }
      } catch (error) {
        console.error('Error fetching application status:', error);
        toast({
          title: 'Error',
          description: 'Failed to load rejection details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationStatus();
  }, [user, toast]);

  const handleReapply = () => {
    router.push('/auth/register/teacher');
  };

  const handleSupportAction = () => {
    window.location.href =
      'mailto:learnity.lms@gmail.com?subject=Teacher Application Support';
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4'>
        <div className='relative'>
          <div className='h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin' />
          <GraduationCap className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-600' />
        </div>
        <p className='text-slate-500 font-medium animate-pulse'>
          Personalizing your growth plan...
        </p>
      </div>
    );
  }

  const rejectionReason =
    statusData?.rejectionReason || 'Application Under Review';
  const improvementAreas = statusData?.improvementAreas || [];
  const canReapply = statusData?.canReapply ?? true;
  const reapplyDate = statusData?.reapplyDate;
  const reviewedAt = statusData?.reviewedAt
    ? new Date(statusData.reviewedAt).toLocaleDateString()
    : 'Recently';

  // Generate feedback message based on rejection reason
  const getFeedbackMessage = (reason: string) => {
    const feedbackMap: Record<string, string> = {
      'Incomplete Documentation':
        'Your application was missing some required documents. Please ensure all certifications and qualifications are properly uploaded.',
      'Insufficient Experience':
        'We require a minimum level of teaching experience. Consider gaining more experience or highlighting relevant experience you may have.',
      'Profile Incomplete':
        'Your profile needs more information to help students understand your expertise. Please complete all required sections.',
      'Video Introduction Missing':
        'A video introduction helps students connect with you. Please add a professional video introduction.',
      'Qualifications Not Verified':
        'We were unable to verify your qualifications. Please ensure your documents are clear and valid.',
    };
    return (
      feedbackMap[reason] ||
      'Please review the improvement areas below and resubmit your application when ready.'
    );
  };

  return (
    <div className='min-h-screen bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white pb-20'>
      {/* Top Progress Banner */}
      <div className='w-full bg-white/60 backdrop-blur-md border-b border-slate-200 py-3 mb-8'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-wrap justify-center items-center gap-4 text-sm font-medium text-slate-400 md:gap-8'>
            <div className='flex items-center gap-2 text-indigo-600'>
              <CheckCircle2 className='h-4 w-4' /> Application Sent
            </div>
            <div className='hidden md:block h-px w-6 md:w-12 bg-slate-200' />
            <div className='flex items-center gap-2 text-amber-600'>
              <AlertCircle className='h-4 w-4' /> Review Feedback
            </div>
            <div className='hidden md:block h-px w-6 md:w-12 bg-slate-200' />
            <div className='flex items-center gap-2'>
              <RefreshCw className='h-4 w-4' /> Re-apply
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 max-w-7xl'>
        {/* Hero Section */}
        <header className='text-center mb-12 space-y-4'>
          <div className='inline-flex p-3 rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200 mb-2'>
            <Lightbulb className='h-8 w-8' />
          </div>
          <h1 className='text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight'>
            Refine Your <span className='text-indigo-600'>Teacher Profile</span>
          </h1>
          <p className='text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed'>
            While your current application wasn&apos;t approved, we see your
            potential. Use this feedback to strengthen your profile and join our
            elite educator community.
          </p>
        </header>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
          {/* Main Feedback Path */}
          <div className='lg:col-span-8 space-y-8'>
            {/* Feedback Detail Card */}
            <Card className='overflow-hidden border-none shadow-xl shadow-indigo-100/50 bg-white/80 backdrop-blur'>
              <div className='h-2 w-full bg-gradient-to-r from-amber-400 to-orange-500' />
              <CardHeader>
                <div className='flex justify-between items-start'>
                  <div>
                    <CardTitle className='text-2xl font-bold text-slate-800'>
                      Reviewer Insights
                    </CardTitle>
                    <CardDescription className='text-slate-500 mt-2'>
                      Reviewed on {reviewedAt}
                    </CardDescription>
                  </div>
                  <Badge className='bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1'>
                    Action Required
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='rounded-xl bg-slate-50 p-6 border border-slate-100'>
                  <h4 className='flex items-center gap-2 font-bold text-slate-900 mb-2'>
                    <span className='h-2 w-2 rounded-full bg-amber-500' />
                    Focus Area: {rejectionReason}
                  </h4>
                  <p className='text-slate-600 leading-relaxed text-sm'>
                    {getFeedbackMessage(rejectionReason)}
                  </p>
                </div>

                {improvementAreas.length > 0 && (
                  <div className='space-y-4'>
                    <h4 className='text-sm font-bold uppercase tracking-wider text-slate-400'>
                      Step-by-Step Improvements
                    </h4>
                    <div className='grid gap-3'>
                      {improvementAreas.map((area, index) => (
                        <div
                          key={index}
                          className='group flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50 transition-all'
                        >
                          <div className='flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors'>
                            {index + 1}
                          </div>
                          <span className='text-slate-700 font-medium'>
                            {area}
                          </span>
                          <ArrowRight className='ml-auto h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1' />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {canReapply && (
                  <div className='pt-6 border-t border-slate-100'>
                    <div className='flex flex-col md:flex-row items-center gap-6 bg-indigo-50/50 p-6 rounded-2xl ring-1 ring-indigo-100'>
                      <div className='flex-1 text-center md:text-left'>
                        <h4 className='text-lg font-bold text-indigo-900'>
                          Ready to try again?
                        </h4>
                        <p className='text-sm text-indigo-700 mt-1'>
                          {reapplyDate ? (
                            <>
                              Apply anytime after{' '}
                              <span className='underline font-bold'>
                                {reapplyDate}
                              </span>
                              .
                            </>
                          ) : (
                            "You can reapply once you've addressed the feedback above."
                          )}
                        </p>
                      </div>
                      <Button
                        onClick={handleReapply}
                        className='w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 px-8 h-12 rounded-xl text-md font-bold'
                      >
                        <RefreshCw className='mr-2 h-5 w-5' /> Start New
                        Application
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className='lg:col-span-4 space-y-8'>
            {/* Status Snapshot */}
            <Card className='bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative'>
              <div className='absolute top-0 right-0 p-4 opacity-10'>
                <ShieldCheck className='h-24 w-24' />
              </div>
              <CardContent className='p-8 space-y-6 relative z-10'>
                <div className='space-y-2'>
                  <h3 className='text-2xl font-bold'>Stay Inspired</h3>
                  <p className='text-slate-400 text-sm'>
                    Great teachers are built through persistence and constant
                    learning.
                  </p>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur'>
                    <div className='text-2xl font-black text-indigo-400'>
                      85%
                    </div>
                    <div className='text-[10px] uppercase font-bold text-slate-500 tracking-tighter'>
                      Re-apply success
                    </div>
                  </div>
                  <div className='p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur'>
                    <div className='text-2xl font-black text-amber-400'>
                      24/7
                    </div>
                    <div className='text-[10px] uppercase font-bold text-slate-500 tracking-tighter'>
                      Support Access
                    </div>
                  </div>
                </div>

                <div className='pt-4 border-t border-white/10 italic text-slate-400 text-xs text-center'>
                  &quot;The expert in anything was once a beginner.&quot;
                </div>
              </CardContent>
            </Card>

            {/* Support Options */}
            <div className='space-y-4'>
              <h4 className='text-sm font-bold text-slate-500 uppercase px-2 tracking-widest'>
                Need personalized help?
              </h4>
              <div className='space-y-3'>
                <button
                  onClick={handleSupportAction}
                  className='w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-500 hover:shadow-lg transition-all text-left group'
                >
                  <div className='h-10 w-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors'>
                    <Mail className='h-5 w-5' />
                  </div>
                  <div>
                    <div className='text-sm font-bold text-slate-900'>
                      Email Support
                    </div>
                    <div className='text-xs text-slate-500'>
                      Send us your questions and concerns
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Testimonials */}
            <Card className='border-none shadow-lg bg-gradient-to-br from-green-500 via-green-600 to-yellow-700 text-white'>
              <CardHeader>
                <div className='flex gap-1'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className='h-3 w-3 fill-amber-400 text-amber-400'
                    />
                  ))}
                </div>
                <CardTitle className='text-lg'>Teacher Success</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-green-50 italic leading-relaxed'>
                  &ldquo;I was rejected initially but used the feedback to
                  improve. Now I&apos;m a top-rated teacher with 50+
                  students!&rdquo;
                </p>
                <div className='mt-4 flex items-center gap-3'>
                  <div className='h-8 w-8 rounded-full bg-white/20' />
                  <span className='text-xs font-bold'>
                    Sarah M., Math Expert
                  </span>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* Resources Section */}
        <div className='space-y-4 mt-8'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {improvementResources.map((res, i) => (
              <Card
                key={i}
                className='group hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer border-none shadow-lg'
              >
                <CardContent className='p-4 flex gap-4'>
                  <div className='h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform'>
                    <res.icon className='h-6 w-6' />
                  </div>
                  <div className='space-y-1'>
                    <h4 className='font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors'>
                      {res.title}
                    </h4>
                    <p className='text-xs text-slate-500 line-clamp-2 leading-relaxed'>
                      {res.description}
                    </p>
                    <div className='pt-2 flex items-center text-indigo-600 text-[10px] font-bold uppercase tracking-widest'>
                      Explore Resource <ArrowRight className='ml-1 h-3 w-3' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

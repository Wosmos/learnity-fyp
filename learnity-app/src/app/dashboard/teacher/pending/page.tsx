'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Clock, FileText, Video, Award, BookOpen, TrendingUp,
  Mail, Calendar, Star, GraduationCap, Sparkles, 
  ChevronRight, CheckCircle2, ShieldCheck, Lightbulb, Plus, Edit
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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

export default function PendingTeacherDashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<ApplicationStatusData | null>(null);

  useEffect(() => {
    const fetchApplicationStatus = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const token = await user.getIdToken();
        const response = await fetch('/api/teacher/application-status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setStatusData(data.data);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load application status',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching application status:', error);
        toast({
          title: 'Error',
          description: 'Failed to load application status',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationStatus();
  }, [user, toast]);

  const handleEnhanceProfile = () => {
    router.push('/dashboard/teacher/profile/enhance');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@learnity.com?subject=Teacher Application Inquiry';
  };

  // Get icon for completion item
  const getItemIcon = (id: string) => {
    const icons: Record<string, React.ElementType> = {
      bio: Edit,
      video: Video,
      documents: FileText,
      qualifications: Award,
      subjects: BookOpen,
      availability: Calendar,
      profilePicture: GraduationCap,
      experience: TrendingUp,
    };
    return icons[id] || CheckCircle2;
  };

  // Get color for completion item
  const getItemColor = (id: string) => {
    const colors: Record<string, string> = {
      bio: 'amber',
      video: 'indigo',
      documents: 'emerald',
      qualifications: 'purple',
      subjects: 'blue',
      availability: 'rose',
      profilePicture: 'cyan',
      experience: 'orange',
    };
    return colors[id] || 'slate';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <GraduationCap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-600" />
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Loading your application status...</p>
      </div>
    );
  }

  const firstName = statusData?.profile.firstName || user?.displayName?.split(' ')[0] || 'Teacher';
  const profileCompletion = statusData?.profileCompletion || 0;
  const estimatedReviewTime = statusData?.estimatedReviewTime || '2-3 business days';
  const incompleteItems = statusData?.completionItems.filter(item => !item.completed) || [];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white pb-20">
      
      {/* Top Progress Banner */}
      <div className="w-full bg-white/60 backdrop-blur-md border-b border-slate-200 py-3 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm font-medium text-slate-400 md:gap-8">
            <div className="flex items-center gap-2 text-indigo-600">
              <CheckCircle2 className="h-4 w-4" /> Application Sent
            </div>
            <div className="hidden md:block h-px w-6 md:w-12 bg-slate-200" />
            <div className="flex items-center gap-2 text-indigo-600">
              <Clock className="h-4 w-4 animate-pulse" /> Admin Review
            </div>
            <div className="hidden md:block h-px w-6 md:w-12 bg-slate-200" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Final Approval
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Hero Section */}
        <header className="text-center mb-12 space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 mb-2"
          >
            <Sparkles className="h-8 w-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Almost There, <span className="text-indigo-600">{firstName}!</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Your application is currently being reviewed by our team. Use this time to boost your visibility and prepare for your first students.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content: Status & Quests */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Journey Tracker Card */}
            <Card className="overflow-hidden border-none shadow-xl shadow-indigo-100/50 bg-white/80 backdrop-blur">
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-600" />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-800">Application Journey</CardTitle>
                    <CardDescription className="text-slate-500 mt-2">
                      Estimated response: {estimatedReviewTime}
                    </CardDescription>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1 animate-pulse">
                    Under Review
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                <div className="relative space-y-8">
                  <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100" />
                  
                  {[
                    { 
                      title: "Application Received", 
                      desc: statusData?.submittedAt 
                        ? `Submitted on ${new Date(statusData.submittedAt).toLocaleDateString()}`
                        : "Your profile is safely in our database.", 
                      status: "completed", 
                      icon: CheckCircle2 
                    },
                    { 
                      title: "Review Board Evaluation", 
                      desc: "Our experts are looking at your credentials.", 
                      status: "current", 
                      icon: Clock 
                    },
                    { 
                      title: "Teacher Onboarding", 
                      desc: "Get access to your student dashboard.", 
                      status: "pending", 
                      icon: Award 
                    }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-6 relative">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center z-10 ring-4 ring-white transition-all
                        ${step.status === 'completed' ? 'bg-emerald-500 text-white' : 
                          step.status === 'current' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 
                          'bg-slate-100 text-slate-400'}`}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>
                          {step.title}
                        </h4>
                        <p className="text-sm text-slate-500">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4 items-center">
                  <Lightbulb className="h-6 w-6 text-indigo-600 shrink-0" />
                  <p className="text-sm text-indigo-900 font-medium">
                    Pro tip: Teachers who upload a <span className="font-bold underline">video introduction</span> are 3x more likely to be approved faster!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Profile Boosters Grid */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 px-2">
                Profile Boosters ({incompleteItems.length} remaining)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incompleteItems.slice(0, 4).map((item) => {
                  const Icon = getItemIcon(item.id);
                  return (
                    <Card 
                      key={item.id} 
                      onClick={handleEnhanceProfile}
                      className="group hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer border-none shadow-lg"
                    >
                      <CardContent className="p-4 flex gap-4 items-center">
                        <div className={`h-12 w-12 rounded-2xl bg-${getItemColor(item.id)}-50 text-${getItemColor(item.id)}-600 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-tight">
                            {item.impact}
                          </p>
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-full">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar: Stats & Resources */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Success Probability Card */}
            <Card className="bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="h-24 w-24" />
              </div>
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Profile Strength</h3>
                  <p className="text-slate-400 text-sm">Improve your profile to rank higher once approved.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                    <span>Completion</span>
                    <span className="text-indigo-400">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2 bg-white/10" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
                    <div className="text-2xl font-black text-indigo-400">
                      {statusData?.profile.subjects.length || 0}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">Subjects</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
                    <div className="text-2xl font-black text-amber-400">
                      {statusData?.profile.experience || 0}yr
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">Experience</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prepare for Success - Resource List */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-500 uppercase px-2 tracking-widest">Prepare for Success</h4>
              <div className="space-y-3">
                {[
                  { title: 'Create Great Lesson Plans', duration: '5 min', icon: BookOpen },
                  { title: 'Hourly Pricing Guide', duration: '3 min', icon: TrendingUp },
                  { title: 'First Session Checklist', duration: '2 min', icon: CheckCircle2 }
                ].map((res, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-500 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <res.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">{res.title}</div>
                      <div className="text-[10px] uppercase font-black text-slate-400">{res.duration} read</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <CardHeader>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                </div>
                <CardTitle className="text-lg">Join the Elite</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-indigo-50 italic leading-relaxed">
                  &ldquo;I spent my waiting time refining my bio and introduction video. The day I was approved, I got 3 student requests!&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">JD</div>
                  <span className="text-xs font-bold">James D., Physics Tutor</span>
                </div>
              </CardContent>
            </Card>

            {/* Support Action */}
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
              onClick={handleContactSupport}
            >
              <Mail className="h-4 w-4" /> Contact Support
            </Button>
            
          </aside>
        </div>
      </div>
    </div>
  );
}

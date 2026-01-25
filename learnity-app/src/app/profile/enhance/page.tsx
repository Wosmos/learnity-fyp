'use client';

/**
 * Profile Enhancement Page - Unified Bento Grid Layout
 * Compact, modern profile customization interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  User,
  Shield,
  ArrowLeft,
  Sparkles,
  Award,
  AlertTriangle,
  Camera,
  Lock,
  CheckCircle2,
  Edit3,
  Globe,
  Activity,
  Fingerprint,
  Mail,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Target,
  Heart,
  Settings,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { ProfileEnhancementForm } from '@/components/profile/ProfileEnhancementForm';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { PrivacySettingsForm } from '@/components/profile/PrivacySettingsForm';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { EnhanceHeader } from '@/components/profile/EnhanceHeader';
import { ProfileSkeleton } from '@/components/profile/EnhanceSkeletons';

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string | null;
  studentProfile?: {
    gradeLevel: string;
    subjects: string[];
    learningGoals: string[];
    interests: string[];
    studyPreferences: string[];
    bio?: string;
    profileCompletionPercentage: number;
    profileVisibility: string;
    showEmail: boolean;
    showLearningGoals: boolean;
    showInterests: boolean;
    showProgress: boolean;
    allowMessages: boolean;
  };
}

interface ProfileError {
  message: string;
  timestamp: number;
}

export default function ProfileEnhancePage() {
  const { user, loading: authLoading } = useClientAuth();
  const api = useAuthenticatedApi();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<ProfileError | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'privacy'>(
    'profile'
  );

  // Handle authentication redirection
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth/login');
      return;
    }
  }, [user, authLoading, router]);

  const fetchProfileData = useCallback(
    async (showLoading = true) => {
      if (!user || authLoading) return;

      try {
        setIsFetching(true);
        if (showLoading) setLoadingProfile(true);

        const response = await api.get('/api/auth/profile');
        setProfileData(response.data);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load profile';
        setError({ message: errorMessage, timestamp: Date.now() });
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoadingProfile(false);
        setIsFetching(false);
      }
    },
    [user, authLoading, api]
  );

  // Initial fetch when component mounts and auth is ready
  useEffect(() => {
    if (!authLoading && user) {
      fetchProfileData();
    }
  }, [authLoading, user, fetchProfileData]);

  // Handle back navigation with fallback
  const handleBack = useCallback(() => {
    if (window.history.state && window.history.state.idx > 0) {
      router.back();
    } else {
      router.push('/dashboard/student');
    }
  }, [router]);

  const getInitials = () => {
    if (profileData) {
      return `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase();
    }
    return 'ST';
  };

  const completionPercentage =
    profileData?.studentProfile?.profileCompletionPercentage || 0;

  // Show full page skeleton during initial auth loading
  if (authLoading || (loadingProfile && !profileData)) {
    return <ProfileSkeleton />;
  }

  // Handle unauthenticated state
  if (!user) {
    return null;
  }

  // Error state UI
  if (error && !loadingProfile) {
    return (
      <div className='min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4'>
        <Card className='w-full max-w-md border border-red-200'>
          <CardHeader>
            <div className='flex items-center gap-2 text-red-600'>
              <AlertTriangle className='h-5 w-5' />
              <CardTitle>Profile Loading Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-600'>{error.message}</p>
            <Button
              onClick={() => fetchProfileData(true)}
              disabled={isFetching}
              className='w-full'
            >
              {isFetching ? 'Retrying...' : 'Try Again'}
            </Button>
            <p className='text-xs text-gray-500 text-center'>
              Last attempt: {new Date(error.timestamp).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  console.log(profileData, 'this is  profileData');

  return (
    <div className='min-h-screen bg-[#F8FAFC]'>
      {/* Header */}

      <header className='sticky top-0 z-40'>
        <EnhanceHeader
          firstName={profileData?.firstName}
          completionPercentage={
            profileData?.studentProfile?.profileCompletionPercentage
          }
          onBack={handleBack}
        />
      </header>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 p-6'>
        {[
          {
            label: 'Academic Focus',
            value: profileData?.studentProfile?.subjects?.length || 0,
            suffix: 'Subjects',
            icon: BookOpen,
            color: 'emerald',
            delay: 0.1,
          },
          {
            label: 'Future Goals',
            value: profileData?.studentProfile?.learningGoals?.length || 0,
            suffix: 'Milestones',
            icon: Target,
            color: 'indigo',
            delay: 0.2,
          },
          {
            label: 'Profile Growth',
            value: `${profileData?.studentProfile?.profileCompletionPercentage || 0}%`,
            suffix: 'Complete',
            icon: Activity,
            color: 'amber',
            delay: 0.3,
          },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: item.delay }}
          >
            <Card className='relative overflow-hidden border border-slate-200/50 bg-white shadow-sm rounded-2xl group transition-all duration-500 hover:shadow-md py-1 px-2'>
              <CardContent className='p-6'>
                <div className='flex flex-col gap-4'>
                  <div className='flex items-center justify-between'>
                    <div
                      className={cn(
                        'h-10 w-10 rounded-xl flex items-center justify-center border',
                        item.color === 'emerald'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : item.color === 'indigo'
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                      )}
                    >
                      <item.icon className='h-5 w-5' />
                    </div>
                  </div>

                  <div>
                    <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1'>
                      {item.label}
                    </p>
                    <div className='flex items-baseline gap-2'>
                      <p className='text-3xl font-black text-slate-900 tracking-tighter'>
                        {item.value}
                      </p>
                      <span className='text-[9px] font-bold text-slate-500 uppercase'>
                        {item.suffix}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <main className='max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8 '>
        {/* Bento Grid Layout */}
        <div className='flex flex-col gap-6'>
          {/* Profile Identity Card - Large */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='w-full max-w-2xl mx-auto'
          >
            <div className='relative group bg-white border border-slate-200/50 rounded-[32px] shadow-2xl shadow-indigo-100/50 overflow-hidden'>
              {/* Cold Gradient SVG Background */}
              <div className='absolute inset-0 opacity-40 pointer-events-none'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='100%'
                  height='100%'
                >
                  <defs>
                    <linearGradient
                      id='coldGrad'
                      x1='0%'
                      y1='0%'
                      x2='100%'
                      y2='100%'
                    >
                      <stop offset='0%' stopColor='#eef2ff' />
                      <stop offset='50%' stopColor='#f8fafc' />
                      <stop offset='100%' stopColor='#e0e7ff' />
                    </linearGradient>
                  </defs>
                  <rect width='100%' height='100%' fill='url(#coldGrad)' />
                  <circle
                    cx='80%'
                    cy='20%'
                    r='30%'
                    fill='#818cf8'
                    fillOpacity='0.05'
                  />
                  <circle
                    cx='10%'
                    cy='80%'
                    r='40%'
                    fill='#c7d2fe'
                    fillOpacity='0.1'
                  />
                </svg>
              </div>

              <div className='relative flex flex-col md:flex-row min-h-[320px]'>
                {/* LEFT SIDE: Identity Focus */}
                <div className='flex-1 p-8 flex flex-col items-center justify-center space-y-5 border-b md:border-b-0 md:border-r border-slate-100/80'>
                  <div className='relative'>
                    <div className='absolute -inset-4 bg-indigo-500/5 rounded-full blur-2xl' />
                    <Avatar className='h-36 w-36 rounded-3xl ring-4 ring-white shadow-xl relative z-10 transition-transform duration-700 group-hover:scale-[1.03]'>
                      <AvatarUpload
                        currentAvatar={profileData?.profilePicture || ''}
                        onUploadSuccess={() => fetchProfileData(false)}
                        onDeleteSuccess={() => fetchProfileData(false)}
                      />
                      <AvatarFallback className='bg-slate-900 text-white font-black italic'>
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>{' '}
                    <div className='absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-white rounded-full z-20' />
                  </div>

                  <div className='text-center space-y-2'>
                    <h3 className='text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none'>
                      {profileData?.firstName}{' '}
                      <span className='text-indigo-600'>
                        {profileData?.lastName}
                      </span>
                    </h3>
                    <div className='inline-flex items-center px-3 py-1 bg-white/60 backdrop-blur-md rounded-full border border-slate-200/50 shadow-sm'>
                      <Mail className='h-3 w-3 text-indigo-500 mr-2' />
                      <span className='text-[10px] font-bold text-slate-600 uppercase tracking-tight'>
                        {profileData?.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE: Smooth Vertical Tabs */}
                <div className='w-full md:w-[240px] p-6 bg-slate-50/30 backdrop-blur-sm flex flex-col justify-center'>
                  <div className='space-y-2'>
                    {[
                      { id: 'profile', icon: User, label: 'Profile' },
                      { id: 'privacy', icon: Shield, label: 'Security' },
                    ].map(tab => {
                      const isActive = activeSection === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveSection(tab.id as any)}
                          className={cn(
                            'relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-500 group/item',
                            isActive
                              ? 'text-slate-900'
                              : 'text-slate-400 hover:text-slate-600'
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId='activeTabVertical'
                              className='absolute inset-0 bg-white shadow-md border border-slate-200/50 rounded-2xl'
                              transition={{
                                type: 'spring',
                                bounce: 0.15,
                                duration: 0.6,
                              }}
                            />
                          )}
                          <tab.icon
                            className={cn(
                              'h-4 w-4 relative z-10 transition-colors',
                              isActive ? 'text-indigo-600' : 'text-slate-400'
                            )}
                          />
                          <span className='text-[11px] font-black uppercase tracking-widest relative z-10'>
                            {tab.label}
                          </span>
                          <ChevronRight
                            className={cn(
                              'ml-auto h-3 w-3 relative z-10 transition-transform opacity-0 group-hover/item:opacity-100',
                              isActive && 'opacity-100'
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Subtle Footer ID */}
                  <div className='mt-8 pt-6 border-t border-slate-200/50 flex items-center justify-between px-2'>
                    <span className='text-[9px] font-bold text-slate-400'>
                      NODE_REF
                    </span>
                    <span className='text-[9px] font-black text-slate-900 tracking-widest'>
                      #{profileData?.id?.slice(-4) || '8821'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Active Form Section - Large */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='lg:col-span-7 lg:row-span-2 h-full'
          >
            <Card className='h-full border border-slate-200/60 bg-white/80 backdrop-blur-xl  shadow-2xl shadow-slate-200/50 rounded-[32px] overflow-hidden flex flex-col'>
              {/* Header with Dynamic Subtitle */}
              <CardHeader className='border-b border-slate-50 pb-6'>
                <div className='flex flex-col gap-1'>
                  <div className='flex items-center gap-2'>
                    <div className='p-2 rounded-xl bg-slate-900 shadow-lg shadow-slate-200'>
                      {activeSection === 'profile' && (
                        <BookOpen className='h-4 w-4 text-indigo-400' />
                      )}
                      {activeSection === 'privacy' && (
                        <Shield className='h-4 w-4 text-emerald-400' />
                      )}
                    </div>
                    <div>
                      <CardTitle className='text-xl font-black text-slate-900 italic uppercase tracking-tighter leading-none'>
                        {activeSection === 'profile' && 'Academic Profile'}
                        {activeSection === 'privacy' && 'Security Matrix'}
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='flex-1 overflow-y-auto custom-scrollbar -mt-4  -mx-12'>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                    transition={{ duration: 0.3 }}
                    className='h-full'
                  >
                    {activeSection === 'profile' && (
                      <div className='relative '>
                        <ProfileEnhancementForm
                          initialData={{
                            ...profileData?.studentProfile,
                            firstName: profileData?.firstName,
                            lastName: profileData?.lastName,
                          }}
                          onSuccess={() => fetchProfileData(false)}
                        />
                      </div>
                    )}

                    {activeSection === 'privacy' && (
                      <div className=''>
                        <PrivacySettingsForm
                          onSuccess={() => fetchProfileData(false)}
                        />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

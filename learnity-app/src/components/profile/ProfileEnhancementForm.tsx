'use client';

/**
 * Profile Enhancement Form Component
 * Style: Ultra-Sleek Command Center, High Density, Bento Grid
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Heart,
  BookOpen,
  Clock,
  Check,
  Plus,
  X,
  User,
  Zap,
  Sparkles,
  ArrowUpRight,
  Fingerprint,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/shared/LoadingButton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { useClientAuth } from '@/hooks/useClientAuth';

interface ProfileEnhancementFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export function ProfileEnhancementForm({
  initialData,
  onSuccess,
}: ProfileEnhancementFormProps) {
  const { toast } = useToast();
  const { user: authUser, loading: authLoading } = useClientAuth();
  const api = useAuthenticatedApi();
  const [loading, setLoading] = useState(false);
  const [completion, setCompletion] = useState<any>(null);

  // Identity state
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [gradeLevel, setGradeLevel] = useState(
    initialData?.gradeLevel || 'Not specified'
  );

  // Profile state
  const [learningGoals, setLearningGoals] = useState<string[]>(
    initialData?.learningGoals || []
  );
  const [interests, setInterests] = useState<string[]>(
    initialData?.interests || []
  );
  const [studyPreferences, setStudyPreferences] = useState<string[]>(
    initialData?.studyPreferences || []
  );
  const [subjects, setSubjects] = useState<string[]>(
    initialData?.subjects || []
  );
  const [bio, setBio] = useState<string>(initialData?.bio || '');

  const [newGoal, setNewGoal] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const subjectOptions = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'History',
    'Geography',
    'Literature',
    'Economics',
    'Psychology',
    'Art History',
    'Philosophy',
  ];

  const gradeOptions = [
    'Middle School',
    'High School',
    'Undergraduate',
    'Graduate',
    'Professional',
    'Other',
  ];

  const studyPreferenceOptions = [
    'Visual',
    'Auditory',
    'Kinesthetic',
    'Group Work',
    'Solo',
    'Morning',
    'Night',
    'Pomodoro',
    'Deep Work',
  ];

  const fetchCompletionData = useCallback(async () => {
    if (authLoading) return;
    try {
      const data = await api.get('/api/profile/enhance');
      setCompletion(data.completion);
    } catch (error) {
      console.error('Failed to fetch completion data:', error);
    }
  }, [api, authLoading]);

  useEffect(() => {
    if (!authLoading) fetchCompletionData();
  }, [fetchCompletionData, authLoading]);

  // Sync initialData when it changes
  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName || '');
      setLastName(initialData.lastName || '');
      setGradeLevel(initialData.gradeLevel || 'Not specified');
      setLearningGoals(initialData.learningGoals || []);
      setInterests(initialData.interests || []);
      setStudyPreferences(initialData.studyPreferences || []);
      setSubjects(initialData.subjects || []);
      setBio(initialData.bio || '');
    }
  }, [initialData]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put('/api/profile/enhance', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gradeLevel,
        learningGoals,
        interests,
        studyPreferences,
        subjects,
        bio: bio.trim(),
      });
      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });
      fetchCompletionData();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (
    val: string,
    setter: any,
    list: string[],
    listSetter: any
  ) => {
    if (val.trim() && !list.includes(val.trim())) {
      listSetter([...list, val.trim()]);
      setter('');
    }
  };

  const toggleItem = (item: string, list: string[], listSetter: any) => {
    listSetter(
      list.includes(item) ? list.filter(i => i !== item) : [...list, item]
    );
  };

  return (
    <div className='flex flex-col gap-8 pb-10'>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* LEFT COLUMN: Identity & Bio */}
        <div className='lg:col-span-8 space-y-8'>
          {/* 1. Basic Information */}
          <section className='bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2.5 bg-indigo-50 rounded-2xl border border-indigo-100'>
                <User className='w-5 h-5 text-indigo-600' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-slate-800'>
                  Basic Information
                </h3>
                <p className='text-xs text-slate-500'>
                  Update your name and academic level
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
              <div className='space-y-2'>
                <label className='text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>
                  First Name
                </label>
                <Input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder='John'
                  className='rounded-xl border-slate-200 focus:ring-indigo-500'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>
                  Last Name
                </label>
                <Input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder='Doe'
                  className='rounded-xl border-slate-200 focus:ring-indigo-500'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1'>
                Grade Level
              </label>
              <div className='flex flex-wrap gap-2'>
                {gradeOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setGradeLevel(opt)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      gradeLevel === opt
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 2. Bio Section */}
          <section className='bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2.5 bg-blue-50 rounded-2xl border border-blue-100'>
                <Fingerprint className='w-5 h-5 text-blue-600' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-slate-800'>About Me</h3>
                <p className='text-xs text-slate-500'>
                  Tell us a bit about your academic journey
                </p>
              </div>
            </div>
            <Textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={500}
              className='min-h-[140px] bg-slate-50/50 border border-slate-100 focus-visible:ring-1 focus-visible:ring-indigo-500 rounded-2xl p-4 text-sm text-slate-600 leading-relaxed resize-none'
              placeholder='Write a short summary about yourself...'
            />
          </section>

          {/* 3. Subjects */}
          <section className='bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2.5 bg-amber-50 rounded-2xl border border-amber-100'>
                <BookOpen className='w-5 h-5 text-amber-600' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-slate-800'>
                  Subjects I Study
                </h3>
                <p className='text-xs text-slate-500'>
                  Pick the areas you're currently focused on
                </p>
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              {subjectOptions.map(subject => {
                const active = subjects.includes(subject);
                return (
                  <button
                    key={subject}
                    onClick={() => toggleItem(subject, subjects, setSubjects)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900 scale-[1.02]'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Goals & Preferences */}
        <div className='lg:col-span-4 space-y-8'>
          {/* Progress & Save */}
          <section className='bg-slate-900 p-8 rounded-[32px] text-white shadow-xl shadow-slate-200 group relative overflow-hidden'>
            <div className='relative z-10'>
              <div className='flex justify-between items-start mb-10'>
                <div>
                  <h4 className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1'>
                    Profile Complete
                  </h4>
                  <div className='text-5xl font-black italic tracking-tighter text-indigo-400'>
                    {completion?.percentage || 0}%
                  </div>
                </div>
                <div className='p-3 bg-white/10 rounded-2xl'>
                  <Sparkles className='w-5 h-5 text-amber-400' />
                </div>
              </div>

              <LoadingButton
                onClick={handleSubmit}
                isLoading={loading}
                loadingText='Updating...'
                className='w-full bg-white text-slate-900 hover:bg-indigo-500 hover:text-white h-16 rounded-2xl font-black uppercase italic tracking-widest transition-all duration-300'
              >
                Save Changes <ArrowUpRight className='w-4 h-4 ml-2' />
              </LoadingButton>
            </div>
          </section>

          {/* 4. Learning Goals */}
          <section className='bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100'>
                <Target className='w-5 h-5 text-emerald-600' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-slate-800'>
                  Learning Goals
                </h3>
                <p className='text-xs text-slate-500'>
                  What are you aiming to achieve?
                </p>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='flex gap-2'>
                <Input
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  onKeyPress={e =>
                    e.key === 'Enter' &&
                    handleAddItem(
                      newGoal,
                      setNewGoal,
                      learningGoals,
                      setLearningGoals
                    )
                  }
                  placeholder='e.g. Master Calculus'
                  className='rounded-xl border-slate-100 bg-slate-50/50 text-sm'
                />
                <Button
                  size='icon'
                  onClick={() =>
                    handleAddItem(
                      newGoal,
                      setNewGoal,
                      learningGoals,
                      setLearningGoals
                    )
                  }
                  className='h-10 w-10 bg-slate-900 rounded-xl shrink-0'
                >
                  <Plus className='w-4 h-4' />
                </Button>
              </div>
              <div className='space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar'>
                <AnimatePresence>
                  {learningGoals.map(goal => (
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={goal}
                      className='flex items-center justify-between p-3 bg-slate-50/80 rounded-xl group/item'
                    >
                      <span className='text-[11px] font-medium text-slate-600'>
                        {goal}
                      </span>
                      <X
                        className='w-3.5 h-3.5 text-slate-300 cursor-pointer hover:text-red-500 transition-colors'
                        onClick={() =>
                          setLearningGoals(
                            learningGoals.filter(g => g !== goal)
                          )
                        }
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* 5. Study Preferences */}
          <section className='bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2.5 bg-indigo-50 rounded-2xl border border-indigo-100'>
                <Zap className='w-5 h-5 text-indigo-600' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-slate-800'>
                  Study Style
                </h3>
                <p className='text-xs text-slate-500'>How do you learn best?</p>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-2'>
              {studyPreferenceOptions.map(pref => {
                const active = studyPreferences.includes(pref);
                return (
                  <button
                    key={pref}
                    onClick={() =>
                      toggleItem(pref, studyPreferences, setStudyPreferences)
                    }
                    className={`text-[10px] font-bold py-2.5 px-3 rounded-xl border transition-all ${
                      active
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {pref}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 6. Interests */}
          <section className='bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2.5 bg-rose-50 rounded-2xl border border-rose-100'>
                <Heart className='w-5 h-5 text-rose-600' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-slate-800'>Interests</h3>
                <p className='text-xs text-slate-500'>
                  What do you enjoy outside study?
                </p>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='flex gap-2'>
                <Input
                  value={newInterest}
                  onChange={e => setNewInterest(e.target.value)}
                  onKeyPress={e =>
                    e.key === 'Enter' &&
                    handleAddItem(
                      newInterest,
                      setNewInterest,
                      interests,
                      setInterests
                    )
                  }
                  placeholder='e.g. Chess, Coding'
                  className='rounded-xl border-slate-100 bg-slate-50/50 text-sm'
                />
                <Button
                  size='icon'
                  onClick={() =>
                    handleAddItem(
                      newInterest,
                      setNewInterest,
                      interests,
                      setInterests
                    )
                  }
                  className='h-10 w-10 bg-slate-900 rounded-xl shrink-0'
                >
                  <Plus className='w-4 h-4' />
                </Button>
              </div>
              <div className='flex flex-wrap gap-2'>
                {interests.map(interest => (
                  <Badge
                    key={interest}
                    variant='secondary'
                    className='px-3 py-1.5 bg-slate-100 text-slate-600 border-none rounded-lg text-[11px]'
                  >
                    {interest}
                    <X
                      className='w-3 h-3 ml-2 cursor-pointer hover:text-red-500'
                      onClick={() =>
                        setInterests(interests.filter(i => i !== interest))
                      }
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

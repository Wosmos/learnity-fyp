'use client';

/**
 * Profile Enhancement Form Component
 * Style: Ultra-Sleek Command Center, High Density, Bento Grid
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/shared/LoadingButton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { useClientAuth } from '@/hooks/useClientAuth';
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
  Layers
} from 'lucide-react';

interface ProfileEnhancementFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export function ProfileEnhancementForm({ initialData, onSuccess }: ProfileEnhancementFormProps) {
  const { toast } = useToast();
  const { loading: authLoading } = useClientAuth();
  const api = useAuthenticatedApi();
  const [loading, setLoading] = useState(false);
  const [completion, setCompletion] = useState<any>(null);

  // Form state
  const [learningGoals, setLearningGoals] = useState<string[]>(initialData?.learningGoals || []);
  const [interests, setInterests] = useState<string[]>(initialData?.interests || []);
  const [studyPreferences, setStudyPreferences] = useState<string[]>(initialData?.studyPreferences || []);
  const [subjects, setSubjects] = useState<string[]>(initialData?.subjects || []);
  const [bio, setBio] = useState<string>(initialData?.bio || '');

  const [newGoal, setNewGoal] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'Computer Science', 'History', 'Geography', 'Literature',
    'Economics', 'Psychology', 'Art History', 'Philosophy'
  ];

  const studyPreferenceOptions = [
    'Visual', 'Auditory', 'Kinesthetic',
    'Group Work', 'Solo', 'Morning', 'Night',
    'Pomodoro', 'Deep Work'
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put('/api/profile/enhance', {
        learningGoals, interests, studyPreferences, subjects, bio: bio.trim() || undefined,
      });
      const updatedData = await api.get('/api/profile/enhance');
      setCompletion(updatedData.completion);
      toast({ title: 'System Synced', description: 'Profile vectors updated.' });
      onSuccess?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (val: string, setter: any, list: string[], listSetter: any) => {
    if (val.trim() && !list.includes(val.trim())) {
      listSetter([...list, val.trim()]);
      setter('');
    }
  };

  const toggleItem = (item: string, list: string[], listSetter: any) => {
    listSetter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans selection:bg-black selection:text-white">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* --- LEFT: MAIN CONFIGURATION (8 COLS) --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header Block */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-black text-[10px] text-white font-bold uppercase tracking-tighter rounded">v2.0 Beta</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Core Interface</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900 italic uppercase">Enhancement <span className="text-gray-300">Module</span></h1>
            </div>
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">+12</div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Bio Section - Bento Style */}
            <section className="md:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100"><Fingerprint className="w-5 h-5 text-gray-900" /></div>
                  <h3 className="font-bold text-sm uppercase tracking-widest">Academic Bio</h3>
                </div>
              </div>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                className="min-h-[120px] bg-[#fdfdfd] border-none focus-visible:ring-1 focus-visible:ring-black rounded-2xl p-2 text-sm italic text-gray-600 leading-relaxed shadow-inner"
                placeholder="Initialize your story..."
              />
            </section>

            {/* 2. Subjects Selection */}
            <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-xl border border-blue-100"><BookOpen className="w-5 h-5 text-blue-600" /></div>
                <h3 className="font-bold text-sm uppercase tracking-widest">Focus Areas</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {subjectOptions.map(subject => {
                  const active = subjects.includes(subject);
                  return (
                    <button
                      key={subject}
                      onClick={() => toggleItem(subject, subjects, setSubjects)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-300 border ${
                        active ? 'bg-black text-white border-black scale-105' : 'bg-transparent text-gray-400 border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {subject}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 3. Goals Section */}
            <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100"><Target className="w-5 h-5 text-emerald-600" /></div>
                <h3 className="font-bold text-sm uppercase tracking-widest">Objectives</h3>
              </div>
              <div className="space-y-4">
                <div className="group flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100 focus-within:border-black transition-all">
                  <Input
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem(newGoal, setNewGoal, learningGoals, setLearningGoals)}
                    placeholder="New milestone..."
                    className="border-none bg-transparent focus-visible:ring-0 text-xs"
                  />
                  <Button size="icon" onClick={() => handleAddItem(newGoal, setNewGoal, learningGoals, setLearningGoals)} className="h-8 w-8 bg-black hover:bg-emerald-600 rounded-lg shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence>
                    {learningGoals.map(goal => (
                      <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} key={goal} className="flex items-center justify-between group p-3 bg-[#fdfdfd] border border-gray-50 rounded-xl">
                        <span className="text-xs font-medium text-gray-600">{goal}</span>
                        <X className="w-3 h-3 text-gray-300 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setLearningGoals(learningGoals.filter(g => g !== goal))} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* --- RIGHT: ANALYTICS & ACTION (4 COLS) --- */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Progress Card */}
          <Card className="bg-zinc-950 border-none p-8 rounded-2xl text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-12">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">Completion Stats</h4>
                  <div className="text-6xl font-black italic tracking-tighter">{completion?.percentage || 0}%</div>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                  <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Study DNA</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {studyPreferenceOptions.map(pref => {
                      const active = studyPreferences.includes(pref);
                      return (
                        <button
                          key={pref}
                          onClick={() => toggleItem(pref, studyPreferences, setStudyPreferences)}
                          className={`text-[9px] font-black uppercase tracking-tighter py-2 px-3 rounded-lg border transition-all ${
                            active ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-transparent border-zinc-800 text-zinc-500'
                          }`}
                        >
                          {pref}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <LoadingButton
                  onClick={handleSubmit}
                  isLoading={loading}
                  loadingText="Syncing..."
                  className="w-full bg-white text-black hover:bg-indigo-400 hover:text-white h-14 rounded-2xl font-black uppercase italic tracking-widest shadow-lg shadow-black/20"
                >
                  Sync Profile <ArrowUpRight className="w-4 h-4 ml-2" />
                </LoadingButton>
              </div>
            </div>
          </Card>

          {/* Interests Mini-Bento */}
          <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-rose-50 rounded-xl border border-rose-100"><Heart className="w-5 h-5 text-rose-500" /></div>
                <h3 className="font-bold text-sm uppercase tracking-widest">Personal</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem(newInterest, setNewInterest, interests, setInterests)}
                placeholder="Add hobby..."
                className="w-full bg-gray-50 border-none rounded-xl text-xs mb-4"
              />
              <AnimatePresence>
                {interests.map(interest => (
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} key={interest}>
                    <Badge variant="outline" className="px-3 py-1 bg-white text-gray-500 border-gray-100 rounded-lg text-[10px] uppercase font-bold">
                      {interest}
                      <X className="w-2.5 h-2.5 ml-2 cursor-pointer" onClick={() => setInterests(interests.filter(i => i !== interest))} />
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
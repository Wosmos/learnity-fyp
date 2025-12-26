'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Zap, 
  UserCircle, 
  BarChart3, 
  MessageSquare, 
  BookOpenCheck 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LedtSideSection() {
  const [view, setView] = useState<'student' | 'teacher'>('student');

  // Subtle auto-switch effect to showcase dynamism
  useEffect(() => {
    const interval = setInterval(() => {
      setView((prev) => (prev === 'student' ? 'teacher' : 'student'));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:flex w-1/2 bg-[#050608] relative overflow-hidden flex-col justify-between p-16 text-white border-r border-white/[0.05]">
      
      {/* 1. Background Logic */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Dynamic Glow: Switches color based on perspective */}
      <div className={cn(
        "absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 transition-colors duration-1000",
        view === 'student' ? "bg-indigo-600/10" : "bg-emerald-600/10"
      )} />

      {/* 2. Top Navigation */}
      <div className="relative z-20 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-4 group">
          <div className="w-12 h-12 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center group-hover:border-white/20 transition-all">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black uppercase italic tracking-tighter">Learnity</span>
        </Link>
        
        {/* Manual Perspective Switcher */}
        <div className="bg-white/5 border border-white/10 p-1 rounded-xl flex gap-1 backdrop-blur-md">
          <button 
            onClick={() => setView('student')}
            className={cn("px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all", view === 'student' ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300")}
          >
            Student
          </button>
          <button 
            onClick={() => setView('teacher')}
            className={cn("px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all", view === 'teacher' ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300")}
          >
            Teacher
          </button>
        </div>
      </div>

      {/* 3. Center Piece: Dynamic Interface Mockup */}
      <div className="relative z-10 flex flex-col items-center justify-center py-10">
        <div className="relative w-full max-w-sm">
          
          {/* Main Perspective Card */}
          <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl transition-all duration-700">
            {view === 'student' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <BookOpenCheck className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight">Advanced Calculus</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black italic tracking-widest">Next Lesson: 2:00 PM</p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  "Your progress is consistent. You've mastered 4/6 core concepts this week."
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight">Active Engagement</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black italic tracking-widest">Global Reach: +12%</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  "Your students are responding well to the new Logic module. 92% completion rate."
                </p>
              </div>
            )}
          </div>

          {/* Decorative Floating Elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 p-4 bg-white/5 border border-white/5 backdrop-blur-xl rounded-2xl rotate-[-6deg] transition-all duration-1000 group-hover:rotate-0">
             <MessageSquare className="w-5 h-5 text-slate-500" />
          </div>
        </div>

        {/* Dynamic Title */}
        <div className="mt-16 text-center">
          <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-4 transition-all duration-700">
            {view === 'student' ? "Forge Your Path" : "Scale Your Impact"}
          </h2>
          <p className="text-slate-500 font-medium italic max-w-xs mx-auto text-sm">
            {view === 'student' 
              ? "Access elite-tier mentorship designed to accelerate your growth." 
              : "Architect your curriculum and reach the next generation of global talent."}
          </p>
        </div>
      </div>

      {/* 4. Footer Metadata */}
      <div className="relative z-10 pt-8 border-t border-white/5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Architecture</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-400 tabular-nums">Multi-Role Syncing</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em]">
          &copy; Learnity 2025
        </span>
      </div>
    </div>
  );
}
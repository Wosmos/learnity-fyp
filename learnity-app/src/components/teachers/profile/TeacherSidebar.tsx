'use client';

import {
  ShieldCheck,
  Globe2,
  CheckCircle2,
  CalendarCheck,
  Flame,
  Zap
} from 'lucide-react';
import { TeacherData } from './types';
import { SimilarTeachers } from './SimilarTeachers';

interface TeacherSidebarProps {
  teacher: TeacherData;
}

export function TeacherSidebar({ teacher }: TeacherSidebarProps) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className='flex flex-col gap-5 sticky top-6'>

      {/* 1. Identity Card: Professional Minimalist */}
      {teacher.trustBadges.length > 0 && (
        <div className='p-5 bg-white border border-slate-100 rounded-xl shadow-sm'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='flex items-center justify-center h-8 w-8 bg-emerald-50 rounded-lg'>
              <ShieldCheck className='h-4 w-4 text-emerald-600' />
            </div>
            <div>
              <h3 className='text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1'>Identity</h3>
              <p className='text-xs font-bold text-slate-900'>Verified Mentor</p>
            </div>
          </div>
          <div className='space-y-2'>
            {teacher.trustBadges.map((badge, i) => (
              <div key={i} className='flex items-center gap-2 text-[11px] font-medium text-slate-500'>
                <CheckCircle2 className='h-3 w-3 text-emerald-500' />
                {badge}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Availability: Emerald Tech Card */}
      <div className='bg-slate-950 rounded-xl p-6 text-white relative overflow-hidden'>
        {/* Subtle Background Icon */}
        <Zap className='absolute -bottom-4 -right-4 w-20 h-20 text-emerald-500 opacity-[0.03] rotate-12' />

        <div className='relative z-10'>
          <div className='flex justify-between items-start mb-6'>
            <div className='space-y-1'>
              <div className='flex items-center gap-1.5'>
                <Flame className='h-3.5 w-3.5 text-orange-500 animate-pulse' />
                <span className='text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/80'>Availability</span>
              </div>
              <h4 className='text-lg font-bold tracking-tight'>Weekly Slots</h4>
            </div>
            <div className='flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-md'>
              <div className='h-1 w-1 rounded-full bg-emerald-500 animate-ping' />
              <span className='text-[9px] font-bold text-slate-300 uppercase'>Live</span>
            </div>
          </div>

          {/* Availability Grid - Smaller Typography */}
          <div className='grid grid-cols-7 gap-4 mb-6'>
            {days.map((day, i) => {
              const isAvailable = teacher.availableDays.some(d => d.startsWith(dayNames[i]));
              return (
                <div key={i} className='flex flex-col items-center gap-2'>
                  <span className={`text-[8px] font-black ${isAvailable ? 'text-slate-200' : 'text-slate-700'}`}>
                    {day}
                  </span>
                  <div
                    className={`w-full aspect-[2/3] rounded-md transition-all duration-300 border ${isAvailable
                        ? 'bg-emerald-500 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'bg-slate-900 border-slate-800'
                      }`}
                  >
                    {isAvailable && (
                      <div className='flex flex-col items-center justify-center h-full gap-1 opacity-30'>
                        <div className='w-0.5 h-0.5 rounded-full bg-white' />
                        <div className='w-0.5 h-0.5 rounded-full bg-white' />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Footer Info */}
          <div className='space-y-3 pt-4 border-t border-white/5'>
            <div className='flex items-center justify-between text-[10px]'>
              <span className='text-slate-500 font-bold uppercase tracking-tighter italic flex items-center gap-1'>
                <Zap className='h-3 w-3 text-emerald-400' />
                High Booking Rate
              </span>
              <span className='text-slate-400 flex items-center gap-1 font-medium'>
                <Globe2 className='h-2.5 w-2.5' />
                UTC+5
              </span>
            </div>

            {/* Response Time Pill */}
            <div className='bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5 flex items-center justify-between'>
              <p className='text-[10px] font-bold text-slate-400'>
                Response <span className='text-emerald-400 ml-1'>~{teacher.responseTime}</span>
              </p>
              <div className='flex -space-x-1'>
                {[1, 2].map(i => (
                  <div key={i} className='h-3.5 w-3.5 rounded-full border border-slate-950 bg-slate-800' />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <SimilarTeachers
        teacherId={teacher.id}
        subjects={teacher.subjects}
        teacherName={teacher.name}
      />
    </div>
  );
}
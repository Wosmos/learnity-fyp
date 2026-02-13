
import { Play, Sparkles, Quote, GraduationCap } from 'lucide-react';
import { TeacherData } from './types';

interface TeacherAboutProps {
  teacher: TeacherData;
}

export function TeacherAbout({ teacher }: TeacherAboutProps) {
  return (
    <div className='space-y-16 max-w-4xl'>
      
      {/* 1. Cinematic Video Introduction */}
      {teacher.videoIntroUrl && (
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3'>
              <span className='h-8 w-1 bg-emerald-500 rounded-full' />
              Introduction
            </h2>
            <div className='hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full'>
              <div className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
              <span className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>Video Profile</span>
            </div>
          </div>
          
          <div className='group relative aspect-video rounded-xl overflow-hidden bg-slate-950 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] ring-1 ring-slate-200'>
            {/* Background Glow */}
            <div className='absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
            
            <iframe
              className='absolute inset-0 w-full h-full'
              src={teacher.videoIntroUrl}
              title={`${teacher.name} Introduction`}
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* 2. The Narrative (Bio) */}
      <div className='relative'>
        <div className='absolute -left-4 top-0 bottom-0 w-[1px] bg-gradient-to-b from-slate-200 via-transparent to-transparent hidden lg:block' />
        
        <div className='space-y-6'>
          <h2 className='text-2xl md:text-3xl font-black text-slate-900 tracking-tight'>
            The Journey
          </h2>
          <div className='max-w-3xl'>
            <p className='text-slate-600 leading-relaxed whitespace-pre-line text-lg font-medium selection:bg-emerald-100 selection:text-emerald-900'>
              {teacher.bio}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Methodology Card: Premium Execution */}
      {teacher.teachingApproach && (
        <div className='relative group'>
          {/* Decorative Elements */}
          <div className='absolute inset-0 bg-gradient-to-br from-emerald-50 to-slate-50 rounded-2xl -rotate-1 transition-transform group-hover:rotate-0 duration-500' />
          
          <div className='relative p-8 md:p-10 bg-white border border-slate-200/60 rounded-2xl shadow-sm'>
            <div className='flex items-start justify-between mb-6'>
              <div className='p-3 bg-slate-950 rounded-2xl'>
                <GraduationCap className='h-6 w-6 text-emerald-400' />
              </div>
              <Quote className='h-10 w-10 text-slate-100' />
            </div>

            <h2 className='text-2xl font-black text-slate-900 tracking-tight mb-4'>
              Teaching Methodology
            </h2>
            
            <div className='relative'>
              <p className='text-slate-600 leading-relaxed font-semibold text-lg italic'>
                "{teacher.teachingApproach}"
              </p>
            </div>

            <div className='mt-8 flex flex-wrap gap-3'>
               <div className='flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl'>
                  <Sparkles className='h-3.5 w-3.5 text-emerald-600' />
                  <span className='text-[10px] font-bold text-emerald-700 uppercase'>Student-Centric</span>
               </div>
               <div className='flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl'>
                  <span className='text-[10px] font-bold text-slate-600 uppercase tracking-tight'>Results Driven</span>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Mini Call to Action / Footer */}
      <div className='pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6'>
        <div className='flex flex-col text-center sm:text-left'>
          <p className='text-slate-400 text-sm font-medium'>Questions about the curriculum?</p>
          <p className='text-slate-900 font-bold'>Message {teacher.name.split(' ')[0]} directly</p>
        </div>
        <button className='px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-colors duration-300 shadow-xl shadow-slate-200'>
          Send a Message
        </button>
      </div>
    </div>
  );
}
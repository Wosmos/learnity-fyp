'use client';

import { CheckCircle, Award, TrendingUp, Target, Sparkles, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeacherData } from './types';

interface TeacherEducationProps {
  teacher: TeacherData;
}

export function TeacherEducation({ teacher }: TeacherEducationProps) {
  return (
    <div className='space-y-12'>
      {/* Subjects & Specialties */}
      <div>
        <h2 className='text-xl md:text-2xl font-black text-slate-900 mb-6 tracking-tight'>
          Expertise & Focus
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <div className='bg-slate-50 p-6 rounded-[2rem] border border-slate-100'>
            <h3 className='text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4'>
              Subjects Taught
            </h3>
            <div className='flex flex-wrap gap-2'>
              {teacher.subjects.map((subject, index) => (
                <Badge
                  key={index}
                  className='px-4 py-1.5 bg-white text-slate-900 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-bold transition-colors'
                >
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
          {teacher.specialties.length > 0 && (
            <div className='bg-slate-50 p-6 rounded-[2rem] border border-slate-100'>
              <h3 className='text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4'>
                Specialties
              </h3>
              <div className='flex flex-wrap gap-2'>
                {teacher.specialties.map((specialty, index) => (
                  <Badge
                    key={index}
                    variant='outline'
                    className='px-3 py-1 bg-white border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider'
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='h-[1px] bg-slate-100' />

      {/* Education & Certifications */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
        {teacher.education.length > 0 && (
          <div className='space-y-4'>
            <h2 className='text-xl md:text-2x font-black text-slate-900 tracking-tight flex items-center'>
              <GraduationCap className='w-5 h-5 mr-3 text-indigo-500' />
              Education
            </h2>
            <div className='space-y-3'>
              {teacher.education.map((edu, index) => (
                <div key={index} className='flex items-start gap-4 p-4 rounded-3xl bg-white border border-slate-100 shadow-sm'>
                  <div className='h-2 w-2 rounded-full bg-indigo-500 mt-2 shrink-0' />
                  <span className='text-slate-700 font-medium'>{edu}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {teacher.certifications.length > 0 && (
          <div className='space-y-4'>
            <h2 className='text-xl md:text-2x font-black text-slate-900 tracking-tight flex items-center'>
              <Award className='w-5 h-5 mr-3 text-emerald-500' />
              Certifications
            </h2>
            <div className='space-y-3'>
              {teacher.certifications.map((cert, index) => (
                <div key={index} className='flex items-start gap-4 p-4 rounded-3xl bg-white border border-slate-100 shadow-sm'>
                  <div className='h-2 w-2 rounded-full bg-emerald-500 mt-2 shrink-0' />
                  <span className='text-slate-700 font-medium'>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Achievements */}
      {teacher.achievements.length > 0 && (
        <div className='space-y-6'>
          <h2 className='text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center'>
            <TrendingUp className='h-6 w-6 mr-3 text-indigo-600' />
            Key Achievements
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {teacher.achievements.map((achievement, index) => (
              <div
                key={index}
                className='flex items-start gap-4 p-5 bg-indigo-50/30 rounded-xl border border-indigo-100/50'
              >
                <div className='p-2 bg-indigo-100 rounded-xl'>
                  <CheckCircle className='h-4 w-4 text-indigo-600 shrink-0' />
                </div>
                <span className='text-slate-700 font-bold text-sm'>{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why Choose Me */}
      {teacher.whyChooseMe && teacher.whyChooseMe.length > 0 && (
        <div className='bg-slate-900 rounded-3xl p-10 text-white overflow-hidden relative'>
          <div className='absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] -translate-y-32 translate-x-32' />
          <h2 className='text-2xl font-black mb-8 flex items-center relative z-10'>
            <Target className='h-6 w-6 mr-3 text-indigo-400' />
            Competitive Edge
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10'>
            {teacher.whyChooseMe.map((reason, index) => (
              <div
                key={index}
                className='flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md'
              >
                <Sparkles className='h-5 w-5 text-indigo-400 shrink-0 mt-0.5' />
                <span className='text-slate-200 font-medium text-sm'>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

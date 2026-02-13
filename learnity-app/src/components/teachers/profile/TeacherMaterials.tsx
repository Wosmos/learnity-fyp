'use client';

import { GraduationCap, Clock, BookOpen, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeacherData } from './types';

interface TeacherMaterialsProps {
  teacher: TeacherData;
}

export function TeacherMaterials({ teacher }: TeacherMaterialsProps) {
  return (
    <div className='space-y-12'>
      {/* Sample Lessons */}
      {teacher.sampleLessons && teacher.sampleLessons.length > 0 && (
        <div className='space-y-6'>
          <h2 className='text-xl md:text-2xl font-black text-slate-900 flex items-center tracking-tight'>
            <div className='p-2 bg-purple-50 rounded-lg mr-3 shadow-sm'>
              <BookOpen className='h-5 w-5 text-purple-600' />
            </div>
            Sample Lessons
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {teacher.sampleLessons.map((lesson, index) => (
              <div
                key={index}
                className='group bg-white border border-slate-100 rounded-[2rem] p-6 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex-1'>
                    <h3 className='font-bold text-lg text-slate-900 mb-1 group-hover:text-purple-600 transition-colors'>
                      {lesson.title}
                    </h3>
                    <p className='text-slate-500 text-sm line-clamp-2'>
                      {lesson.description}
                    </p>
                  </div>
                  <Badge variant='outline' className='ml-3 whitespace-nowrap bg-purple-50 border-purple-100 text-purple-700 rounded-full text-[10px] font-bold uppercase tracking-wider'>
                    {lesson.level}
                  </Badge>
                </div>
                <div className='flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                  <div className='flex items-center gap-1.5'>
                    <Clock className='h-3.5 w-3.5 text-slate-300' />
                    <span>{lesson.duration}</span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <GraduationCap className='h-3.5 w-3.5 text-slate-300' />
                    <span>{lesson.topics.length} topics</span>
                  </div>
                </div>
                <div className='flex flex-wrap gap-1.5 mt-4'>
                  {lesson.topics.map((topic, idx) => (
                    <span key={idx} className='px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-100 rounded-md text-[9px] font-bold uppercase tracking-tight'>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Stories */}
      {teacher.successStories && teacher.successStories.length > 0 && (
        <div className='space-y-6'>
          <h2 className='text-xl md:text-2xl font-black text-slate-900 flex items-center tracking-tight'>
            <div className='p-2 bg-emerald-50 rounded-lg mr-3 shadow-sm'>
              <Award className='h-5 w-5 text-emerald-600' />
            </div>
            Student Success Stories
          </h2>
          <div className='space-y-4'>
            {teacher.successStories.map((story, index) => (
              <div key={index} className='bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden'>
                <div className='absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -translate-y-16 translate-x-16' />
                <div className='flex flex-col md:flex-row items-start gap-6 relative z-10'>
                  <div className='w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-lg shadow-emerald-200'>
                    {story.studentName.charAt(0)}
                  </div>
                  <div className='flex-1'>
                    <div className='flex flex-col mb-4'>
                      <h3 className='text-lg font-black text-slate-900 tracking-tight'>
                        {story.studentName}
                      </h3>
                      <p className='text-xs font-bold text-emerald-600 uppercase tracking-[0.2em]'>
                        {story.subject}
                      </p>
                    </div>

                    <div className='bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4'>
                      <p className='font-bold text-slate-900 text-sm'>
                        Result: <span className='text-emerald-600'>{story.achievement}</span>
                      </p>
                    </div>

                    <p className='text-slate-600 font-medium leading-relaxed italic border-l-4 border-slate-100 pl-4'>
                      &ldquo;{story.testimonial}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

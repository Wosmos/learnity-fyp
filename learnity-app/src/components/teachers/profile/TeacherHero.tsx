'use client';

import { Award, Star, MapPin, Globe, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClientAuth } from '@/hooks/useClientAuth';
import { TeacherData } from './types';

interface TeacherHeroProps {
  teacher: TeacherData;
  gradient: string;
  initials: string;
}

export function TeacherHero({ teacher, gradient, initials }: TeacherHeroProps) {
  const { isAuthenticated } = useClientAuth();

  return (
    <div className='relative group'>
      {/* Banner */}
      <div className='relative min-h-[calc(60vh-100px)] w-full overflow-hidden'>
        {teacher.bannerImage ? (
          <img
            src={teacher.bannerImage}
            alt='Banner'
            className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradient} opacity-90`}
          />
        )}
        <div className='absolute inset-0 bg-linear-to-t from-white via-white/10 to-transparent' />

        <div className='absolute top-1/4 left-1/4 w-64 h-64 bg-white/20 blur-3xl rounded-full mix-blend-overlay animate-pulse' />
        <div className='absolute bottom-1/4 right-1/3 w-96 h-96 bg-black/5 blur-3xl rounded-full mix-blend-multiply' />
      </div>

      <div className='container mx-auto px-6 -mt-32 relative z-10 pb-12'>
        <div className='flex flex-col lg:flex-row items-end gap-8'>
          {/* Profile Avatar */}
          <div className='relative'>
            <div className='w-40 h-40 lg:w-56 lg:h-56 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] bg-slate-100'>
              {teacher.profilePicture ? (
                <img
                  src={teacher.profilePicture}
                  alt={teacher.name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-5xl font-black text-white italic`}
                >
                  {initials}
                </div>
              )}
            </div>
            {teacher.isTopRated && (
              <div className='absolute -top-4 -right-4 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg transform rotate-12'>
                <Award className='w-6 h-6 text-white' />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className='flex-1 mb-4'>
            <div className='flex items-center gap-3 mb-3'>
              <h1 className='text-4xl lg:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none'>
                {teacher.name}
              </h1>
              {teacher.isTopRated && (
                <div className='flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full'>
                  <Star className='w-3 h-3 text-amber-500 fill-amber-500' />
                  <span className='text-[10px] font-black text-amber-700 uppercase tracking-widest italic text-nowrap'>
                    Elite Mentor
                  </span>
                </div>
              )}
            </div>

            <div className='flex flex-wrap items-center gap-6 text-slate-500 font-medium italic'>
              {teacher.headline && (
                <p className='text-xl text-slate-600 font-bold lg:border-r lg:border-slate-200 lg:pr-6 lg:mr-0 leading-none'>
                  {teacher.headline}
                </p>
              )}
              <div className='flex items-center gap-2'>
                <MapPin className='w-4 h-4 text-slate-400' />
                <span>
                  {teacher.city || 'Remote'}, {teacher.country || 'Global'}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Globe className='w-4 h-4 text-slate-400' />
                <span>
                  {teacher.languages[0]} + {teacher.languages.length - 1} more
                </span>
              </div>
            </div>
          </div>

          {/* Price Card */}
          <div className='lg:w-80 w-full'>
            <div className='bg-slate-900/95 backdrop-blur-xl text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group/price'>
              <div className='absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl -translate-y-16 translate-x-16 rounded-full' />

              <div className='relative z-10'>
                <p className='text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2 italic'>
                  Monthly Commitment
                </p>
                <div className='flex items-baseline gap-2 mb-6'>
                  <span className='text-5xl font-black italic tracking-tighter'>
                    ${teacher.hourlyRate}
                  </span>
                  <span className='text-sm font-bold text-slate-400 uppercase italic'>
                    /mo
                  </span>
                </div>

                <div className='space-y-3'>
                  <Link href='/auth/register/student'>
                    <Button className='w-full h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]'>
                      Inaugurate Training
                    </Button>
                  </Link>
                  <Link
                    href={
                      isAuthenticated
                        ? `/messages/${teacher.id}`
                        : `/auth/login?redirect=/teachers/${teacher.id}`
                    }
                  >
                    <Button
                      variant='outline'
                      className='w-full h-14 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all'
                    >
                      <MessageCircle className='w-4 h-4 mr-2' />
                      Communicate
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

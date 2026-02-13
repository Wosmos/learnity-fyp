'use client';

import { Award, Star, MapPin, Globe, MessageCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useClientAuth } from '@/hooks/useClientAuth';
import { TeacherData } from './types';
import { BookSessionModal } from '../BookSessionModal';

interface TeacherHeroProps {
  teacher: TeacherData;
  gradient: string;
  initials: string;
}

export function TeacherHero({ teacher, gradient, initials }: TeacherHeroProps) {
  const { isAuthenticated, user, loading } = useClientAuth();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleBookSession = () => {
    // Always open modal - the modal itself will handle auth checks
    setIsBookingModalOpen(true);
  };

  return (
    <div className='relative w-full bg-white'>
      {/* Banner Area */}
      <div className='relative h-[250px] md:h-[320px] w-full overflow-hidden'>
        {teacher.bannerImage ? (
          <img
            src={teacher.bannerImage}
            alt='Banner'
            className='w-full h-full object-cover'
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradient} opacity-80`}
          />
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/10' />
      </div>

      {/* Main Content Container */}
      <div className='container mx-auto px-4 sm:px-6'>
        <div className='relative -mt-20 flex flex-col lg:flex-row gap-8 pb-8'>
          {/* 1. Profile Avatar Column */}
          <div className='flex flex-col items-center lg:items-start shrink-0'>
            <div className='relative group'>
              <div className='w-40 h-40 lg:w-48 lg:h-48 rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-white'>
                {teacher.profilePicture ? (
                  <img
                    src={teacher.profilePicture}
                    alt={teacher.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-4xl font-bold text-white italic`}
                  >
                    {initials}
                  </div>
                )}
              </div>
              {teacher.isTopRated && (
                <div className='absolute -top-3 -right-3 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg'>
                  <Award className='w-6 h-6 text-white' />
                </div>
              )}
            </div>

            {/* Quick Stats below Avatar (Desktop only) */}
            <div className='hidden lg:grid grid-cols-2 gap-2 mt-6 w-full'>
              <div className='text-center p-3 bg-slate-50 rounded-xl border border-slate-100'>
                <p className='text-lg font-bold text-slate-900'>
                  {teacher.lessonsCompleted}+
                </p>
                <p className='text-[10px] uppercase text-slate-500 font-bold'>
                  Lessons
                </p>
              </div>
              <div className='text-center p-3 bg-slate-50 rounded-xl border border-slate-100'>
                <p className='text-lg font-bold text-slate-900'>
                  {teacher.activeStudents}
                </p>
                <p className='text-[10px] uppercase text-slate-500 font-bold'>
                  Students
                </p>
              </div>
            </div>
          </div>

          {/* 2. Info Center Column */}
          <div className='flex-1 mt-4 lg:mt-24 text-center lg:text-left'>
            <div className='flex flex-col lg:flex-row lg:items-center gap-3 mb-4'>
              <h1 className='text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight'>
                {teacher.name}
              </h1>
              {teacher.isTopRated && (
                <div className='inline-flex items-center self-center lg:self-auto gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold uppercase'>
                  <Star className='w-3 h-3 fill-indigo-600' />
                  Elite Mentor
                </div>
              )}
            </div>

            <p className='text-lg md:text-xl text-slate-600 font-medium mb-6 max-w-2xl'>
              {teacher.headline}
            </p>

            <div className='flex flex-wrap justify-center lg:justify-start items-center gap-y-4 gap-x-8 text-slate-500'>
              <div className='flex items-center gap-2'>
                <MapPin className='w-4 h-4 text-indigo-500' />
                <span className='text-sm font-semibold'>
                  {teacher.city || 'Remote'}, {teacher.country || 'Global'}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Clock className='w-4 h-4 text-indigo-500' />
                <span className='text-sm font-semibold'>
                  Replies in {teacher.responseTime}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Globe className='w-4 h-4 text-indigo-500' />
                <div className='flex gap-1.5'>
                  {teacher.languages.map((lang, index) => (
                    <span key={lang} className='flex items-center gap-1.5'>
                      <span className='text-sm font-semibold text-slate-700'>
                        {lang}
                      </span>
                      {index < teacher.languages.length - 1 && (
                        <span className='text-slate-300'>·</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Pricing & Action Card */}
          <div className=' w-full lg:w-72 shrink-0'>
            <div className='bg-white lg:bg-slate-900 rounded-xl p-6 lg:text-white shadow-2xl lg:shadow-indigo-500/20 border border-slate-100 lg:border-transparent'>
              <div className='flex justify-between items-end mb-6'>
                <div>
                  <p className='text-[10px] uppercase font-bold tracking-widest text-slate-400 lg:text-indigo-400'>
                    Monthly Rate
                  </p>
                  <div className='flex items-baseline gap-1'>
                    <span className='text-4xl font-black'>
                      ${teacher.hourlyRate}
                    </span>
                    <span className='text-sm font-medium opacity-60'>/hr</span>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='flex items-center gap-1 text-amber-500 justify-end'>
                    <Star className='w-4 h-4 fill-amber-500' />
                    <span className='font-bold text-lg'>{teacher.rating}</span>
                  </div>
                  <p className='text-[10px] uppercase font-bold text-slate-400'>
                    {teacher.reviewCount} Reviews
                  </p>
                </div>
              </div>

              <div className='space-y-3'>
                <Button
                  onClick={handleBookSession}
                  className='w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-2xl text-sm font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-200 lg:shadow-none'
                >
                  Book a Lesson
                </Button>
                <Link
                  href={
                    isAuthenticated
                      ? `/messages/${teacher.id}`
                      : `/auth/login?redirect=/teachers/${teacher.id}`
                  }
                  className='block w-full'
                >
                  <Button
                    variant='outline'
                    className='w-full h-14 bg-transparent border-slate-200 lg:border-white/20 lg:text-white hover:bg-slate-50 lg:hover:bg-white/10 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all'
                  >
                    <MessageCircle className='w-4 h-4 mr-2' />
                    Message
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookSessionModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        teacher={{
          id: teacher.id,
          name: teacher.name,
          hourlyRate: teacher.hourlyRate,
          profilePicture: teacher.profilePicture,
        }}
      />
    </div>
  );
}

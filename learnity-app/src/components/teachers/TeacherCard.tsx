'use client';

import { Star, ShieldCheck, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TeacherCardProps {
  teacher: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
    subjects: string[];
    experience: number;
    bio: string;
    hourlyRate: string | null;
    isTopRated: boolean;
    rating: string;
    reviewCount: number;
  };
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  const initials =
    `${teacher.firstName[0]}${teacher.lastName[0]}`.toUpperCase();
  const rating = parseFloat(teacher.rating);

  // Premium Tiering Logic
  const isElite = rating >= 4.9;
  return (
    <Link href={`/teachers/${teacher.id}`} className='block group'>
      <div className='relative h-full bg-white rounded-[2.5rem] border border-slate-100 p-8 transition-all duration-500 hover:border-slate-900 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] flex flex-col'>
        {/* Header: Avatar & Rate */}
        <div className='flex justify-between items-start mb-8'>
          <div className='relative'>
            {teacher.profilePicture ? (
              <img
                src={teacher.profilePicture}
                alt={teacher.name}
                className='w-20 h-20 rounded-3xl object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500'
              />
            ) : (
              <div className='w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white text-xl font-black italic tracking-tighter'>
                {initials}
              </div>
            )}
            {/* Status Dot */}
            <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full'></div>
          </div>

          <div className='text-right'>
            <p className='text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1'>
              Rate
            </p>
            <p className='text-xl font-black text-slate-900 tracking-tighter italic'>
              ${teacher.hourlyRate}
              <span className='text-[10px] font-bold text-slate-400'>/hr</span>
            </p>
          </div>
        </div>

        {/* Identity */}
        <div className='mb-4'>
          <div className='flex items-center gap-2 mb-1'>
            <h3 className='text-xl font-black text-slate-900 uppercase italic tracking-tighter group-hover:text-indigo-600 transition-colors'>
              {teacher.name}
            </h3>
            {isElite && <ShieldCheck className='w-4 h-4 text-indigo-500' />}
          </div>

          <div className='flex flex-wrap gap-2'>
            {teacher.subjects.slice(0, 2).map((subject, index) => (
              <span
                key={index}
                className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'
              >
                {subject}
              </span>
            ))}
          </div>
        </div>

        {/* Performance Proof */}
        <div className='flex items-center gap-6 py-4 border-y border-slate-50 mb-6'>
          <div>
            <div className='flex items-center gap-1 text-amber-500 mb-0.5'>
              <span className='text-sm font-black italic'>
                {rating.toFixed(1)}
              </span>
              <Star className='w-3 h-3 fill-current' />
            </div>
            <p className='text-[9px] font-bold text-slate-300 uppercase tracking-[0.1em]'>
              {teacher.reviewCount} Reviews
            </p>
          </div>
          <div className='w-px h-8 bg-slate-100' />
          <div>
            <p className='text-sm font-black text-slate-900 italic mb-0.5'>
              {teacher.experience}Y
            </p>
            <p className='text-[9px] font-bold text-slate-300 uppercase tracking-[0.1em]'>
              Experience
            </p>
          </div>
        </div>

        {/* Bio - Compact & Sophisticated */}
        <p className='text-sm text-slate-500 leading-relaxed line-clamp-2 mb-8 font-medium italic'>
          "{teacher.bio}"
        </p>

        {/* Action Call */}
        <div className='mt-auto flex items-center justify-between group/btn'>
          <span className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-900'>
            View Dossier
          </span>
          <div className='w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center group-hover/btn:bg-slate-900 group-hover/btn:text-white transition-all duration-300'>
            <ArrowUpRight className='w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5' />
          </div>
        </div>
      </div>
    </Link>
  );
}

'use client';

import { 
  Star, 
  ShieldCheck, 
  ArrowUpRight, 
  Zap, 
  Medal, 
  Users, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
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
    rating: string;
    reviewCount: number;
    lessonsCompleted?: number;
  };
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  const initials = `${teacher.firstName[0]}${teacher.lastName[0]}`.toUpperCase();
  const numericRating = parseFloat(teacher.rating);
  
  // --- Smart Badge Logic ---
  const isElite = numericRating >= 4.9; 
  const isVeteran = teacher.experience >= 5;
  const isPopular = teacher.reviewCount >= 50;

  return (
    <Link href={`/teachers/${teacher.id}`} className='block group h-full'>
      <div className='relative h-full flex flex-col bg-white rounded-[20px] md:rounded-[24px] border border-slate-200 p-4 md:p-5 transition-all duration-500 cubic-bezier(0.25, 1, 0.5, 1) hover:border-slate-950 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 overflow-hidden'>
        
        {/* 1. The "Golden Thread" (Premium Top Gradient) */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-slate-900 via-amber-400 to-slate-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left ease-out" />

        {/* --- Header: Identity & Cost --- */}
        <div className='flex justify-between items-start mb-3 md:mb-5'>
          
          {/* Avatar Container (Responsive Size) */}
          <div className='relative'>
            <div className='w-14 h-14 md:w-[4.5rem] md:h-[4.5rem] rounded-xl md:rounded-2xl overflow-hidden bg-slate-50 ring-1 ring-slate-100 group-hover:ring-slate-950 transition-all duration-300'>
              {teacher.profilePicture ? (
                <img
                  src={teacher.profilePicture}
                  alt={teacher.name}
                  className='w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center bg-slate-950 text-white font-mono text-lg font-bold'>
                  {initials}
                </div>
              )}
            </div>
            
            {/* "Online" Status Pulse */}
            <div className='absolute -bottom-1 md:-bottom-1.5 -right-1 md:-right-1.5 bg-white p-[2px] md:p-[3px] rounded-full z-10'>
              <div className='relative flex h-2 w-2 md:h-2.5 md:w-2.5'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-full w-full bg-emerald-500'></span>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="text-right">
             <div className="inline-flex items-baseline gap-1">
                <span className="text-lg md:text-xl font-bold text-slate-900 font-mono tracking-tight">
                  ${teacher.hourlyRate || '0'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">/hr</span>
             </div>
             <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-0.5 group-hover:text-amber-500 transition-colors">
               Starting
             </p>
          </div>
        </div>

        {/* --- Body: Info & Story --- */}
        <div className="flex-1">
           {/* Name & Verification */}
           <div className="flex items-center gap-1.5 md:gap-2 mb-2">
             <h3 className='text-base md:text-lg font-bold text-slate-900 leading-none group-hover:text-black tracking-tight line-clamp-1'>
               {teacher.name}
             </h3>
             {isElite && (
               <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 fill-amber-500/10" strokeWidth={2.5} />
             )}
           </div>

           {/* Meaningful Badges (Mobile: Tight Gap / Desktop: Normal Gap) */}
           <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
             {isElite ? (
               <div className="inline-flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md bg-amber-50 border border-amber-100 text-amber-700">
                 <Zap className="w-3 h-3 fill-amber-500 text-amber-600" />
                 <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Top Rated</span>
               </div>
             ) : (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md bg-slate-50 border border-slate-100 text-slate-600">
                 <Star className="w-3 h-3 text-slate-400" />
                 <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">{numericRating} Rating</span>
               </div>
             )}

             {isVeteran && (
               <div className="inline-flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700">
                 <Medal className="w-3 h-3 text-blue-600" />
                 <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Expert</span>
               </div>
             )}

             {isPopular && (
               <div className="inline-flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md bg-purple-50 border border-purple-100 text-purple-700">
                 <Users className="w-3 h-3 text-purple-600" />
                 <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Popular</span>
               </div>
             )}
           </div>

           {/* The Bio (HIDDEN ON MOBILE, Visible on Desktop) */}
           <p className='hidden md:block text-xs font-medium text-slate-500 leading-relaxed line-clamp-2 mb-5 min-h-[2.5em]'>
              {teacher.bio || `Specialized instructor with ${teacher.experience} years of experience helping students achieve their goals.`}
           </p>

           {/* Subjects (Mobile: Limit visual clutter if needed, usually wrapping is fine) */}
           <div className="flex flex-wrap gap-1 md:gap-1.5 mb-4 md:mb-5">
             {teacher.subjects.slice(0, 3).map((subject, i) => (
               <span key={i} className="px-1.5 py-0.5 md:px-2 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-slate-500 bg-white border border-slate-200 group-hover:border-slate-300 transition-colors">
                 {subject}
               </span>
             ))}
           </div>
        </div>

        {/* --- Footer: The "Cockpit" Metrics & Action --- */}
        <div className="mt-auto">
          {/* Tactical Grid (Tighter padding on mobile) */}
          <div className="grid grid-cols-2 border-t border-b border-slate-100 divide-x divide-slate-100 mb-3 md:mb-4">
             {/* Box 1: Experience */}
             <div className="py-2 md:py-2.5 px-1 flex flex-col items-center justify-center group-hover:bg-slate-50/50 transition-colors">
                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Experience</span>
                <div className="flex items-center gap-1">
                   <Clock className="w-3 h-3 text-slate-400" />
                   <span className="font-mono text-xs font-bold text-slate-900">{teacher.experience} Years</span>
                </div>
             </div>
             
             {/* Box 2: Sessions */}
             <div className="py-2 md:py-2.5 px-1 flex flex-col items-center justify-center group-hover:bg-slate-50/50 transition-colors">
                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sessions</span>
                <div className="flex items-center gap-1">
                   <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                   <span className="font-mono text-xs font-bold text-slate-900">{teacher.lessonsCompleted || teacher.reviewCount || 0} Done</span>
                </div>
             </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between group/btn cursor-pointer">
             {/* Text hidden on mobile to keep it clean */}
             <span className="hidden md:block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover/btn:text-slate-900 transition-colors">
               View Profile
             </span>
             {/* Mobile: Show "Details" instead of blank space or keep just button? Let's keep just button aligned right on mobile, spread on desktop */}
             <span className="md:hidden text-[9px] font-bold uppercase tracking-widest text-slate-300">
               Tap to view
             </span>

             <div className='w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-300'>
                <ArrowUpRight className='w-4 h-4 transition-transform duration-300 group-hover:-rotate-45' />
             </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
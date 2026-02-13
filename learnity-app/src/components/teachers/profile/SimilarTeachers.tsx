'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Star,
  MapPin,
  Clock,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SimilarTeacher {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  teacherProfile: {
    subjects: string[];
    experience: number;
    bio: string;
    hourlyRate: string | null;
    rating: string;
    reviewCount: number;
    responseTime: string;
    city: string | null;
    country: string | null;
    isTopRated: boolean;
    lessonsCompleted: number;
    activeStudents: number;
    headline: string | null;
  };
}

interface SimilarTeachersProps {
  teacherId: string;
  subjects: string[];
  teacherName: string;
}

function TeacherCard({ teacher }: { teacher: SimilarTeacher }) {
  const { firstName, lastName, profilePicture, teacherProfile } = teacher;
  const fullName = `${firstName} ${lastName}`;
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
  const rating = parseFloat(teacherProfile.rating || '0');

  return (
    <Link href={`/teachers/${teacher.id}`} className='block group'>
      <div className='p-5 border border-slate-100 rounded-lg hover:border-slate-900 bg-white transition-all duration-300'>
        <div className='flex gap-5'>
          <div className='relative shrink-0'>
            <Avatar className='h-14 w-14 rounded-lg border border-slate-100'>
              <AvatarImage src={profilePicture || undefined} alt={fullName} className="object-cover" />
              <AvatarFallback className='bg-slate-950 text-white text-xs font-bold rounded-lg'>
                {initials}
              </AvatarFallback>
            </Avatar>
            {teacherProfile.isTopRated && (
              <div className="absolute -top-2 -left-2 bg-slate-950 p-1">
                <ShieldCheck className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className='text-sm font-bold uppercase tracking-tight text-slate-900 group-hover:text-slate-600 transition-colors'>
                  {fullName}
                </h3>
                <p className='text-xs text-slate-500 font-medium line-clamp-1 mt-0.5 uppercase tracking-wider'>
                  {teacherProfile.headline || 'Professional Educator'}
                </p>
              </div>
              <span className="text-xs font-bold text-slate-950 bg-slate-50 px-2 py-1">
                ${teacherProfile.hourlyRate}<span className="text-[10px] text-slate-400">/hr</span>
              </span>
            </div>

            <div className='flex items-center gap-4 mt-3'>
              <div className='flex items-center gap-1.5'>
                <Star className='h-3 w-3 text-slate-950 fill-slate-950' />
                <span className='text-xs font-bold text-slate-900'>{rating.toFixed(1)}</span>
                <span className='text-[10px] text-slate-400 font-bold'>({teacherProfile.reviewCount})</span>
              </div>
              
              <div className='flex items-center gap-1.5 text-slate-400'>
                <MapPin className='h-3 w-3' />
                <span className='text-[10px] font-bold uppercase tracking-tighter'>
                  {teacherProfile.country || 'Remote'}
                </span>
              </div>
            </div>

            <div className='flex flex-wrap gap-1.5 mt-4'>
              {teacherProfile.subjects.slice(0, 2).map(subject => (
                <span key={subject} className='text-[10px] font-bold py-1 px-2 bg-slate-100 text-slate-600 uppercase tracking-widest'>
                  {subject}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function SimilarTeachers({ teacherId, subjects, teacherName }: SimilarTeachersProps) {
  const [teachers, setTeachers] = useState<SimilarTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchSimilarTeachers() {
      try {
        const response = await fetch(`/api/teachers/${teacherId}/similar?subjects=${subjects.join(',')}`);
        const data = await response.json();
        if (data.success) setTeachers(data.teachers);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (subjects.length > 0) fetchSimilarTeachers();
    else setLoading(false);
  }, [teacherId, subjects]);

  if (loading) return <div className="h-40 w-full bg-slate-50 animate-pulse border border-slate-100" />;

  if (teachers.length === 0) return null;

  const displayedTeachers = showAll ? teachers : teachers.slice(0, 3);

  return (
    <section className='space-y-6'>
      <div className='flex items-end justify-between border-b border-slate-200 pb-4'>
        <div>
          <h3 className='text-xl font-light text-slate-900'>Similar <span className="italic ">Mentors</span></h3>
        </div>
        <div className='flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase'>
          <TrendingUp className="h-3 w-3" /> {teachers.length} profiles
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4'>
        {displayedTeachers.map(teacher => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        {teachers.length > 3 && (
          <Button
            variant='outline'
            onClick={() => setShowAll(!showAll)}
            className='flex-1 rounded-lg border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all'
          >
            {showAll ? 'Collapse List' : `View All ${teachers.length} Matches`}
          </Button>
        )}
        <Link href='/teachers' className="flex-1">
          <Button variant='ghost' className='w-full rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900'>
            All Teachers <ChevronRight className='h-3 w-3 ml-2' />
          </Button>
        </Link>
      </div>
    </section>
  );
}
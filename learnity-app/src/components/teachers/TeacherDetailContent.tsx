/**
 * Teacher Detail Content - Professional Preply-Style Design
 * Refactored into smaller components for better maintainability.
 */

'use client';

import { useEffect, useState } from 'react';
import { TeacherProfileHeader } from './profile/TeacherProfileHeader';
import { TeacherHero } from './profile/TeacherHero';
import { TeacherOverview } from './profile/TeacherOverview';
import { TeacherReviews } from './profile/TeacherReviews';
import { TeacherCourses } from './profile/TeacherCourses';
import { TeacherActualReviews } from './profile/TeacherActualReviews';
import { TeacherSidebar } from './profile/TeacherSidebar';
import { TeacherData, Testimonial } from './profile/types';

interface TeacherDetailProps {
  teacher: TeacherData;
}

const gradients = [
  'from-blue-600 via-purple-600 to-pink-600',
  'from-cyan-500 via-blue-600 to-purple-700',
  'from-orange-500 via-red-600 to-pink-600',
  'from-green-500 via-teal-600 to-blue-600',
  'from-purple-600 via-pink-600 to-red-600',
  'from-indigo-600 via-purple-600 to-pink-600',
];

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, BookOpen, Star as StarIcon, GraduationCap, Briefcase } from 'lucide-react';

export function TeacherDetailContent({
  teacher: initialTeacher,
}: TeacherDetailProps) {
  const [teacher, setTeacher] = useState(initialTeacher);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const initials =
    `${teacher.firstName[0]}${teacher.lastName[0]}`.toUpperCase();
  const gradient =
    gradients[
    Math.abs(
      teacher.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % gradients.length
    ];

  // Calculate rating distribution
  const getRatingDistribution = () => {
    const total = teacher.reviewCount;
    return [
      { stars: 5, percentage: 85, count: Math.floor(total * 0.85) },
      { stars: 4, percentage: 10, count: Math.floor(total * 0.1) },
      { stars: 3, percentage: 3, count: Math.floor(total * 0.03) },
      { stars: 2, percentage: 1, count: Math.floor(total * 0.01) },
      { stars: 1, percentage: 1, count: Math.floor(total * 0.01) },
    ];
  };

  useEffect(() => {
    // Fetch complete teacher data with testimonials
    async function fetchTeacherData() {
      try {
        const response = await fetch(`/api/teachers/${teacher.id}`);
        console.log(response, 'teachers data on client');
        const data = await response.json();
        if (data.success) {
          setTeacher(data.teacher);
          setTestimonials(data.teacher.testimonials || []);
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTeacherData();
  }, [teacher.id]);

  if (loading && !teacher) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white'>
      <TeacherProfileHeader teacher={teacher} />

      <TeacherHero teacher={teacher} gradient={gradient} initials={initials} />

      {/* Main Content */}
      <div className='container mx-auto px-4 py-8 lg:py-12'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
          {/* Left Column - Main Content with Tabs */}
          <div className='lg:col-span-2'>
            <Tabs defaultValue='overview' className='space-y-8'>
              <TabsList className='inline-flex h-14 items-center justify-start rounded-2xl bg-slate-50 p-1.5 text-slate-500 w-full md:w-auto border border-slate-100'>
                <TabsTrigger
                  value='overview'
                  className='inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-bold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm'
                >
                  <User className='w-4 h-4 mr-2' />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value='courses'
                  className='inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-bold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm'
                >
                  <BookOpen className='w-4 h-4 mr-2' />
                  Courses
                </TabsTrigger>
                <TabsTrigger
                  value='reviews'
                  className='inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2.5 text-sm font-bold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm'
                >
                  <StarIcon className='w-4 h-4 mr-2' />
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value='overview' className='space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300'>
                <TeacherOverview teacher={teacher} />
              </TabsContent>

              <TabsContent value='courses' className='space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300'>
                <TeacherCourses teacherId={teacher.id} teacherName={teacher.name} />
              </TabsContent>

              <TabsContent value='reviews' className='space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300'>
                <TeacherActualReviews
                  teacherId={teacher.id}
                  teacherName={teacher.name}
                />
                <TeacherReviews
                  teacher={teacher}
                  testimonials={testimonials}
                  getRatingDistribution={getRatingDistribution}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className='space-y-8'>
            <div className=' top-24 space-y-8'>
              <TeacherSidebar teacher={teacher} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

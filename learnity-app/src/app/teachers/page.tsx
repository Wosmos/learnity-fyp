/**
 * Teachers Page - Optimized with Prefetching
 * Showcases approved teachers with real data from database
 * Enhanced with prefetched data for better performance
 */

import { Suspense } from 'react';
import {
  GraduationCap,
  Users,
  Award,
  ArrowRight,
  Star,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/AppLayout';
import { TeachersGrid } from '@/components/teachers/TeachersGrid';
import { Button } from '@/components/ui/button';
import { PlatformStatsWithSuspense } from '@/components/shared/PlatformStats';
import { prefetchTeachersPage } from '@/lib/services/prefetch.service';
import { CTA, Hero, SectionHeader } from '@/components/externals';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Our Teachers | Learnity',
  description:
    'Meet our verified expert tutors ready to help you achieve your learning goals',
};

export default async function TeachersPage() {
  // Prefetch teachers data for optimal performance
  const teachersData = await prefetchTeachersPage();

  return (
    <PublicLayout>
      <div className='min-h-screen bg-white relative overflow-hidden'>
        {/* Background Elements */}
        <div className='absolute inset-0 bg-grid-black pointer-events-none z-0' />
        <div className='absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0'>
          <div className='blob bg-green-400/30 w-96 h-96 top-0 left-1/4 blur-3xl' />
          <div className='blob blob-delay-2 bg-slate-400/30 w-96 h-96 bottom-0 right-0 blur-3xl' />
        </div>

        <div className='relative z-10'>
          {/* Hero Section */}
          <Hero
            badge={{
              text: 'Verified Tutor Experts',
              showPulse: true,
            }}
            title={
              <>
                <span className='block text-gray-900 mb-2'>Meet Our</span>
                <span className='block bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent'>
                  Best Mentors
                </span>
              </>
            }
            description='All our tutors are carefully vetted, highly qualified, and passionate about helping students succeed'
            // primaryAction={{
            //   label: "Learn More About Us",
            //   href: "/about",
            //   variant: "cta",
            // }}
            stats={
              <PlatformStatsWithSuspense variant='hero' showTrends={true} />
            }
          />


          {/* All Teachers Grid */}
          <section className='py-20 bg-gray-50'>
            <div className='container mx-auto px-4'>
              <SectionHeader
                title='Our'
                highlightWord='Teachers'
                description='Browse our complete selection of qualified tutors across various subjects.'
              />

              <Suspense fallback={<TeachersGridSkeleton />}>
                <TeachersGrid initialData={teachersData} />
              </Suspense>
            </div>
          </section>

          {/* Popular Subjects */}
          {teachersData?.subjects && teachersData.subjects.length > 0 && (
            <section className='py-20'>
              <div className='container mx-auto px-4'>
                <SectionHeader
                  title='Popular'
                  highlightWord='Subjects'
                  description='Find expert tutors in these high-demand subjects'
                />

                <div className='flex flex-wrap justify-center gap-3 max-w-4xl mx-auto'>
                  {teachersData.subjects.slice(0, 20).map(subject => (
                    <span
                      key={subject}
                      className='px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors cursor-pointer'
                    >
                      {subject}
                    </span>
                  ))}
                </div>

                <div className='flex flex-wrap justify-center gap-3 max-w-4xl mx-auto'>
                  {teachersData.subjects.slice(0, 20).map(subject => (
                    <span
                      key={subject}
                      className='px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors cursor-pointer'
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Why Teach With Us */}
          <section className='bg-gray-50 py-20'>
            <div className='container mx-auto px-4'>
              <div className='max-w-4xl mx-auto'>
                <SectionHeader
                  title='Why'
                  highlightWord='Learnity'
                  description='Join our community of expert educators and make a difference'
                />

                <div className='grid grid-cols-1 md:grid-cols-3 gap-10'>
                  {[
                    {
                      title: 'Your Schedule, Your Rules',
                      desc: 'Work when you want. Set your own hours and balance teaching with your life perfectly.',
                      icon: GraduationCap,
                      color: 'from-blue-500 to-indigo-600',
                    },
                    {
                      title: 'Global Student Base',
                      desc: 'Connect with students from around the world. Grow your reputation in a massive learning community.',
                      icon: Users,
                      color: 'from-purple-500 to-pink-600',
                    },
                    {
                      title: 'Keep What You Earn',
                      desc: 'Set your own competitive rates. Our transparent system ensures you get paid exactly what you’re worth.',
                      icon: Award,
                      color: 'from-emerald-500 to-teal-600',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className='group relative flex flex-col items-start text-left'
                    >
                      {/* Icon with Onyx styling */}
                      <div className='relative mb-8 transition-transform duration-500 group-hover:-translate-y-2'>
                        <div className='absolute inset-0 bg-slate-950 blur-xl opacity-0 group-hover:opacity-20 transition-opacity' />
                        <div className='relative w-16 h-16 bg-slate-900 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-950 group-hover:bg-slate-950 group-hover:text-white transition-all duration-500 shadow-xl shadow-slate-200/50 group-hover:shadow-slate-950'>
                          <item.icon className='h-7 w-7 stroke-[1.5] text-white opacity-70 group-hover:opacity-100 transition-opacity' />
                        </div>
                      </div>

                      {/* Content */}
                      <div className='flex items-center gap-3 mb-4'>
                        <span className='text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 italic'>
                          0{i + 1}
                        </span>
                        <div className='h-px w-8 bg-slate-100 group-hover:w-12 group-hover:bg-indigo-600 transition-all duration-500' />
                      </div>

                      <h3 className='text-2xl font-black text-slate-950 uppercase italic tracking-tighter mb-4 leading-none'>
                        {item.title}
                      </h3>

                      <p className='text-sm text-slate-500 leading-relaxed font-medium italic opacity-80 group-hover:opacity-100 transition-opacity'>
                        {item.desc}
                      </p>

                      {/* Subtle corner accent */}
                      <div className='mt-8 h-1 w-0 bg-slate-950 group-hover:w-full transition-all duration-700' />
                    </div>
                  ))}
                </div>

                <div className='text-center mt-12'>
                  <Link href='/auth/register/teacher'>
                    <Button size='lg' className='px-8 py-4'>
                      Apply to Teach Today
                      <ArrowRight className='ml-2 h-5 w-5' />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
          {/* CTA Section */}
          <CTA
            title='Ready to start learning?'
            description='Join thousands of active learners and connect with expert tutors today. Your learning journey starts here.'
            primaryAction={{
              label: 'Find your tutor',
              href: '/teachers',
              variant: 'ctaSecondary',
            }}
            secondaryAction={{
              label: 'Become a Tutors',
              href: '/auth/register/teacher',
              variant: 'outline',
            }}
          />
        </div>
      </div>
    </PublicLayout>
  );
}

function TeachersGridSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className='bg-white rounded-xl p-6 shadow-sm animate-pulse'
        >
          <div className='w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4'></div>
          <div className='h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4'></div>
          <div className='flex justify-center gap-4 mb-4'>
            <div className='h-4 bg-gray-200 rounded w-16'></div>
            <div className='h-4 bg-gray-200 rounded w-20'></div>
          </div>
          <div className='space-y-2'>
            <div className='h-3 bg-gray-200 rounded'></div>
            <div className='h-3 bg-gray-200 rounded w-5/6 mx-auto'></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Enable static generation with revalidation for optimal performance
export const revalidate = 300; // Revalidate every 5 minutes

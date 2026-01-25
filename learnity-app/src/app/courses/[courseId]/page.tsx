import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Star, Users, Clock } from 'lucide-react';
import { courseService } from '@/lib/services/course.service';
import { reviewService } from '@/lib/services/review.service';
import { prisma } from '@/lib/prisma';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { PublicLayout } from '@/components/layout/AppLayout';
import { CTA } from '@/components/externals';
import { formatDuration } from '@/lib/utils';
import CourseDetailClient from './CourseDetailClient';

/**
 * Course Detail Page - Optimized SSR & SSG
 */

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true, description: true, thumbnailUrl: true },
  });

  if (!course) return { title: 'Course Not Found' };

  return {
    title: `${course.title} | Learnity`,
    description: course.description.slice(0, 160),
    openGraph: {
      title: `${course.title} | Learnity`,
      description: course.description.slice(0, 160),
      images: course.thumbnailUrl ? [course.thumbnailUrl] : [],
    },
  };
}

// Pre-render top 50 most enrolled courses for ultra-speed
export async function generateStaticParams() {
  const popularCourses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { enrollmentCount: 'desc' },
    take: 50,
    select: { id: true },
  });

  return popularCourses.map(c => ({
    courseId: c.id,
  }));
}

async function getCourseData(courseId: string) {
  const [course, reviews, rating] = await Promise.all([
    courseService.getCourseById(courseId),
    reviewService.getCourseReviews(courseId, { limit: 5, page: 1 }),
    reviewService.getCourseRating(courseId),
  ]);

  if (!course) return null;

  const estimatedDuration = formatDuration(course.totalDuration);

  return {
    course: {
      ...course,
      price: course.price ? Number(course.price) : null,
      averageRating: course.averageRating ? Number(course.averageRating) : 0,
      teacher: {
        id: course.teacher.id,
        name: `${course.teacher.firstName || ''} ${course.teacher.lastName || ''}`.trim(),
        avatarUrl: course.teacher.profilePicture,
      },
      estimatedDuration,
      reviewsSummary: {
        averageRating: Number(rating.averageRating),
        totalReviews: rating.reviewCount,
        ratingDistribution: rating.ratingDistribution,
      },
      updatedAt: course.updatedAt.toISOString(),
      createdAt: course.createdAt.toISOString(),
      publishedAt: course.publishedAt?.toISOString() || null,
    },
    reviews: {
      ...reviews,
      reviews: reviews.reviews.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        student: {
          id: r.student.id,
          name: `${r.student.firstName} ${r.student.lastName}`.trim(),
          avatarUrl: r.student.profilePicture,
        },
      })),
    },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;
  const dataPromise = getCourseData(courseId);

  return (
    <PublicLayout showNavigation={true}>
      <Suspense fallback={<CourseDetailSkeleton />}>
        <AsyncCourseDetail dataPromise={dataPromise} />
      </Suspense>

      <CTA
        title='Ready to master this subject?'
        description='Join thousands of students and start your structured learning path today.'
        primaryAction={{
          label: 'Enroll Now',
          href: '/auth/register',
          variant: 'ctaSecondary',
        }}
        secondaryAction={{
          label: 'View All Courses',
          href: '/courses',
          variant: 'outline',
        }}
      />
    </PublicLayout>
  );
}

async function AsyncCourseDetail({
  dataPromise,
}: {
  dataPromise: Promise<any>;
}) {
  const data = await dataPromise;
  if (!data) notFound();

  const { course, reviews } = data;

  return (
    <>
      {/* SSR HERO SECTION */}
      <section className='bg-white border-b border-slate-50 relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-50/20 to-transparent pointer-events-none' />
        <div className='max-w-7xl mx-auto px-6 py-12 lg:py-24 relative z-10'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-20 items-center'>
            <div className='space-y-10'>
              <div className='flex flex-wrap gap-3'>
                <Badge className='bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]'>
                  {course.category?.name}
                </Badge>
                <Badge
                  variant='outline'
                  className='border-slate-200 text-slate-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]'
                >
                  {course.difficulty}
                </Badge>
              </div>

              <div className='space-y-4'>
                <h1 className='text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter italic uppercase'>
                  {course.title.split(' ').map((word: string, i: number) => (
                    <span
                      key={i}
                      className={i % 2 === 1 ? 'text-indigo-600' : ''}
                    >
                      {word}{' '}
                    </span>
                  ))}
                </h1>
                <p className='text-slate-500 font-medium text-lg max-w-lg leading-relaxed'>
                  {course.description.slice(0, 200)}...
                </p>
              </div>

              <div className='flex flex-wrap items-center gap-x-12 gap-y-6'>
                <div className='flex items-center gap-3'>
                  <Star className='h-6 w-6 fill-amber-400 text-amber-400' />
                  <div>
                    <span className='text-2xl font-black italic tracking-tighter text-slate-900 leading-none block'>
                      {Number(course.averageRating).toFixed(1)}
                    </span>
                    <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                      {course.reviewCount} Reports
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Users className='h-6 w-6 text-slate-300' />
                  <div>
                    <span className='text-2xl font-black italic tracking-tighter text-slate-900 leading-none block'>
                      {course.enrollmentCount}
                    </span>
                    <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                      Students
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Clock className='h-6 w-6 text-slate-300' />
                  <div>
                    <span className='text-2xl font-black italic tracking-tighter text-slate-900 leading-none block'>
                      {course.estimatedDuration}
                    </span>
                    <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                      Course Length
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-5 p-3 pr-8 rounded-full bg-slate-50 border border-slate-100 w-max shadow-sm'>
                <div className='h-14 w-14 rounded-full overflow-hidden border-4 border-white shadow-md relative bg-slate-200'>
                  {course.teacher.avatarUrl ? (
                    <Image
                      src={course.teacher.avatarUrl}
                      alt={course.teacher.name}
                      fill
                      className='object-cover'
                    />
                  ) : (
                    <div className='h-full w-full flex items-center justify-center text-slate-400 font-black text-xl'>
                      {course.teacher.name[0]}
                    </div>
                  )}
                </div>
                <div className='flex flex-col'>
                  <span className='text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1'>
                    Your Teacher
                  </span>
                  <span className='text-lg font-black text-slate-900 tracking-tight'>
                    {course.teacher.name}
                  </span>
                </div>
              </div>
            </div>

            <div className='relative aspect-square lg:aspect-video rounded-[4rem] overflow-hidden shadow-2xl shadow-indigo-100 border-[12px] border-white ring-1 ring-slate-100 group'>
              {course.thumbnailUrl ? (
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className='object-cover group-hover:scale-105 transition-transform duration-1000 ease-out'
                />
              ) : (
                <div className='absolute inset-0 bg-slate-900 flex items-center justify-center'>
                  <Users className='h-20 w-20 text-indigo-500/20' />
                </div>
              )}
              <div className='absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-40' />
            </div>
          </div>
        </div>
      </section>

      <section className='max-w-7xl mx-auto px-6 py-20'>
        <CourseDetailClient course={course} initialReviews={reviews} />
      </section>
    </>
  );
}

function CourseDetailSkeleton() {
  return (
    <div className='max-w-7xl mx-auto px-6 py-20 w-full space-y-12'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-20 items-center'>
        <div className='space-y-10'>
          <Skeleton className='h-8 w-40 rounded-full' />
          <Skeleton className='h-40 w-full rounded-3xl' />
          <div className='flex gap-12'>
            <Skeleton className='h-12 w-24' />
            <Skeleton className='h-12 w-24' />
            <Skeleton className='h-12 w-24' />
          </div>
        </div>
        <Skeleton className='aspect-video w-full rounded-[4rem]' />
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-10'>
        <div className='lg:col-span-2 space-y-10'>
          <Skeleton className='h-12 w-full rounded-2xl' />
          <Skeleton className='h-[600px] w-full rounded-[3rem]' />
        </div>
        <Skeleton className='h-[500px] w-full rounded-[3rem]' />
      </div>
    </div>
  );
}

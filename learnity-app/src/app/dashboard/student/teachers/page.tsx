import { TeachersGridSkeleton } from '@/components/teachers/TeachersGridSkeleton';
import { TeachersGrid } from '@/components/teachers/TeachersGrid';
import { prefetchTeachersPage } from '@/lib/services/prefetch.service';
import React, { Suspense } from 'react';

const page = async () => {
  const teachersData = await prefetchTeachersPage();
  return (
    <>
      <Suspense fallback={<TeachersGridSkeleton />}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
           <div className=' px-8 my-6'>
          <h1 className='text-3xl font-black text-slate-900 uppercase italic tracking-tighter'>
            Browse <span className='text-indigo-600'>Teachers</span>
          </h1>
          <p className='text-slate-500 text-sm font-medium'>
            Find the perfect tutor for you
          </p>
        </div>
          <TeachersGrid initialData={teachersData} />
        </div>
      </Suspense>
    </>
  );
};

export default page;

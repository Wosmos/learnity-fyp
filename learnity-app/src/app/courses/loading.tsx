import { Skeleton } from '@/components/ui/skeleton';

export default function CoursesLoading() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6'>
        {/* Header + search */}
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-40' />
          <Skeleton className='h-10 w-64 rounded-lg' />
        </div>

        {/* Filter bar */}
        <div className='flex gap-3'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-9 w-24 rounded-full' />
          ))}
        </div>

        {/* Course grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className='h-72 rounded-3xl' />
          ))}
        </div>
      </div>
    </div>
  );
}

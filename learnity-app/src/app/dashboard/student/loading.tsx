import { Skeleton } from '@/components/ui/skeleton';

export default function StudentDashboardLoading() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <Skeleton className='h-7 w-48' />
            <Skeleton className='h-4 w-32' />
          </div>
          <Skeleton className='h-12 w-12 rounded-full' />
        </div>

        {/* Metric cards */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-[160px] rounded-3xl' />
          ))}
        </div>

        {/* Main content + sidebar */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          <div className='lg:col-span-8 space-y-4'>
            <Skeleton className='h-6 w-40' />
            <div className='space-y-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className='h-24 rounded-2xl' />
              ))}
            </div>
          </div>
          <div className='lg:col-span-4 space-y-4'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-48 rounded-2xl' />
            <Skeleton className='h-32 rounded-2xl' />
          </div>
        </div>
      </div>
    </div>
  );
}

import { Skeleton } from '@/components/ui/skeleton';

export default function TeacherDashboardLoading() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6'>
        {/* Page header */}
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <Skeleton className='h-8 w-56' />
            <Skeleton className='h-4 w-36' />
          </div>
          <Skeleton className='h-10 w-32 rounded-lg' />
        </div>

        {/* Stat cards */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-28 rounded-2xl' />
          ))}
        </div>

        {/* Quick actions */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-20 rounded-xl' />
          ))}
        </div>

        {/* Content area */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 space-y-3'>
            <Skeleton className='h-6 w-36' />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='h-16 rounded-xl' />
            ))}
          </div>
          <div className='space-y-3'>
            <Skeleton className='h-6 w-28' />
            <Skeleton className='h-40 rounded-xl' />
          </div>
        </div>
      </div>
    </div>
  );
}

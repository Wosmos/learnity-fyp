import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardLoading() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6'>
        {/* Header */}
        <Skeleton className='h-8 w-48' />

        {/* Metric row */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-24 rounded-xl' />
          ))}
        </div>

        {/* Tables */}
        <div className='space-y-3'>
          <Skeleton className='h-6 w-36' />
          <Skeleton className='h-10 w-full rounded-lg' />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className='h-14 rounded-lg' />
          ))}
        </div>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
  variant?: 'dashboard' | 'list' | 'detail' | 'form' | 'grid';
  className?: string;
}

export function LoadingSkeleton({
  variant = 'dashboard',
  className,
}: LoadingSkeletonProps) {
  return (
    <div className={cn('min-h-[60vh] p-6 space-y-6', className)}>
      {variant === 'dashboard' && <DashboardSkeleton />}
      {variant === 'list' && <ListSkeleton />}
      {variant === 'detail' && <DetailSkeleton />}
      {variant === 'form' && <FormSkeleton />}
      {variant === 'grid' && <GridSkeleton />}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      {/* Stats row */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-40 rounded-3xl' />
        ))}
      </div>
      {/* Content area */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-4'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-64 rounded-2xl' />
        </div>
        <div className='space-y-4'>
          <Skeleton className='h-8 w-32' />
          <Skeleton className='h-48 rounded-2xl' />
        </div>
      </div>
    </>
  );
}

function ListSkeleton() {
  return (
    <>
      <Skeleton className='h-10 w-64' />
      <div className='space-y-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-16 rounded-xl' />
        ))}
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <>
      <Skeleton className='h-48 rounded-2xl' />
      <div className='space-y-3'>
        <Skeleton className='h-8 w-3/4' />
        <Skeleton className='h-4 w-1/2' />
        <Skeleton className='h-32 rounded-xl' />
      </div>
    </>
  );
}

function FormSkeleton() {
  return (
    <div className='max-w-lg mx-auto space-y-6'>
      <Skeleton className='h-10 w-48 mx-auto' />
      <div className='space-y-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-10 rounded-lg' />
          </div>
        ))}
      </div>
      <Skeleton className='h-10 w-full rounded-lg' />
    </div>
  );
}

function GridSkeleton() {
  return (
    <>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-10 w-32 rounded-lg' />
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-64 rounded-2xl' />
        ))}
      </div>
    </>
  );
}

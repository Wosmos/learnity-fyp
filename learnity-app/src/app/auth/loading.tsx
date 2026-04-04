import { Skeleton } from '@/components/ui/skeleton';

export default function AuthLoading() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='w-full max-w-md space-y-6 p-6'>
        <div className='text-center space-y-2'>
          <Skeleton className='h-8 w-32 mx-auto' />
          <Skeleton className='h-4 w-48 mx-auto' />
        </div>
        <div className='space-y-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full rounded-lg' />
            </div>
          ))}
        </div>
        <Skeleton className='h-10 w-full rounded-lg' />
      </div>
    </div>
  );
}

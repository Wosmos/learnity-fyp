export function DashboardSkeleton() {
  return (
    <div className='flex-1 p-8 space-y-10 animate-pulse'>
      {/* 1. Stats Header HUD */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className='h-32 rounded-[2rem] bg-slate-100 border border-slate-200/50 relative overflow-hidden'
          >
            {/* Shimmer Effect Overlay */}
            <div className='absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]' />
          </div>
        ))}
      </div>

      {/* 2. System Status & Profile Section */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Profile Card Skeleton */}
        <div className='h-64 rounded-2xl bg-slate-50 border border-slate-100 p-8 flex flex-col items-center'>
          <div className='w-24 h-24 rounded-full bg-slate-200 mb-4' />
          <div className='w-32 h-4 bg-slate-200 rounded-full mb-2' />
          <div className='w-24 h-3 bg-slate-100 rounded-full' />
        </div>

        {/* System Status Skeleton */}
        <div className='lg:col-span-2 h-64 rounded-2xl bg-white border border-slate-100 p-8 space-y-6'>
          <div className='flex justify-between'>
            <div className='w-48 h-4 bg-slate-100 rounded-full' />
            <div className='w-12 h-12 rounded-xl bg-slate-50' />
          </div>
          <div className='w-full h-8 bg-slate-50 rounded-2xl' />
          <div className='w-3/4 h-3 bg-slate-50 rounded-full' />
        </div>
      </div>

      {/* 3. Main Content Split */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-10'>
        {/* Left: Active Tracks */}
        <div className='lg:col-span-8 space-y-6'>
          <div className='flex justify-between items-end'>
            <div className='w-40 h-6 bg-slate-200 rounded-lg' />
            <div className='w-20 h-3 bg-slate-100 rounded-full' />
          </div>

          {/* Large Terminal Card Skeleton */}
          <div className='h-60 rounded-3xl bg-white border border-slate-100 p-8 flex gap-8'>
            <div className='w-32 h-32 rounded-2xl bg-slate-100 shrink-0' />
            <div className='flex-1 space-y-6 py-2'>
              <div className='space-y-2'>
                <div className='w-1/4 h-3 bg-slate-100 rounded-full' />
                <div className='w-3/4 h-7 bg-slate-200 rounded-lg' />
              </div>
              <div className='w-full h-3 bg-slate-100 rounded-full' />
              <div className='flex justify-between'>
                <div className='w-32 h-3 bg-slate-50 rounded-full' />
                <div className='w-40 h-10 bg-slate-900/5 rounded-xl' />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Intelligence & Social */}
        <div className='lg:col-span-4 space-y-6'>
          <div className='w-32 h-4 bg-slate-200 rounded-full' />
          {/* Heatmap/Momentum Skeleton */}
          <div className='h-48 rounded-3xl bg-slate-900/[0.02] border border-slate-100' />
          {/* Action List Skeleton */}
          <div className='space-y-3'>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className='h-14 rounded-2xl bg-slate-50 border border-slate-100'
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

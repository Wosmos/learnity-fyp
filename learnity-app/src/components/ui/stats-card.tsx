import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type CardVariant = 'glassy' | 'modern' | 'primary' | 'secondary';

interface MetricCardProps {
  title: string;
  value: string | number;
  trendLabel?: string;
  trendValue?: string;
  isTrendUp?: boolean;
  variant?: CardVariant;
  icon: LucideIcon;
  className?: string;
}

export function MetricCard({
  title,
  value,
  trendLabel,
  trendValue,
  isTrendUp = true,
  variant = 'modern',
  icon: Icon,
  className,
}: MetricCardProps) {
  const variants = {
    glassy:
      'bg-white/40 backdrop-blur-xl border border-white/40 shadow-xl shadow-indigo-500/5 text-slate-900',
    modern:
      'bg-white border-none shadow-xl shadow-slate-200/60 text-slate-900 hover:shadow-indigo-100',
    primary: 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 border-none',
    secondary:
      'bg-slate-900 text-white shadow-xl shadow-slate-900/20 border-none',
  };

  const iconColors = {
    glassy: 'bg-indigo-500/10 text-indigo-600',
    modern: 'bg-slate-50 text-indigo-600',
    primary: 'bg-white/20 text-white',
    secondary: 'bg-white/10 text-indigo-400',
  };

  return (
    <div
      className={cn(
        // Layout: Vertical flex column to force "squarish" height
        // Mobile: min-h-[150px] ensures it looks like a widget even if empty
        'relative p-5 rounded-2xl md:rounded-3xl transition-all duration-500 group overflow-hidden flex flex-col justify-between h-full min-h-[150px] md:min-h-0',
        'active:scale-95 md:active:scale-100 transition-transform', // Mobile touch feedback
        variants[variant],
        className
      )}
    >
      {/* 1. DECORATIVE NOISE */}
      <div className='absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay'>
        <svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'>
          <filter id='noise'>
            <feTurbulence
              type='fractalNoise'
              baseFrequency='0.65'
              numOctaves='3'
              stitchTiles='stitch'
            />
          </filter>
          <rect width='100%' height='100%' filter='url(#noise)' />
        </svg>
      </div>

      <div className='relative z-10 flex flex-col h-full justify-between gap-4'>
        {/* HEADER: Icon Left, Title Right (Native Widget Style) */}
        <div className='flex items-start justify-between'>
          <div
            className={cn(
              'h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm',
              iconColors[variant]
            )}
          >
            <Icon className='h-5 w-5 md:h-6 md:w-6' />
          </div>
          <p
            className={cn(
              'text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-right mt-1 max-w-[60%] leading-tight',
              variant === 'primary' || variant === 'secondary'
                ? 'text-white/80'
                : 'text-slate-400'
            )}
          >
            {title}
          </p>
        </div>

        {/* MAIN CONTENT: Value & Graph */}
        <div>
          {/* Value */}
          <h3 className='text-3xl md:text-4xl font-black tracking-tighter leading-none mb-3'>
            {value}
          </h3>

          {/* Footer: Trend + Graph */}
          <div className='flex items-end justify-between'>
            {/* Trend Badge */}
            <div className='flex flex-col md:flex-row md:items-center gap-1 md:gap-2'>
              <div
                className={cn(
                  'flex items-center w-fit gap-0.5 px-1.5 py-0.5 md:px-2 rounded-md md:rounded-full text-[9px] md:text-[10px] font-black uppercase',
                  isTrendUp
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-rose-500/10 text-rose-500'
                )}
              >
                {isTrendUp ? (
                  <TrendingUp className='h-3 w-3' />
                ) : (
                  <TrendingDown className='h-3 w-3' />
                )}
                {trendValue}
              </div>
              <span
                className={cn(
                  'hidden md:block text-[10px] font-bold uppercase tracking-tight opacity-50',
                  variant === 'primary' || variant === 'secondary'
                    ? 'text-white'
                    : 'text-slate-500'
                )}
              >
                {trendLabel}
              </span>
            </div>

            {/* Sparkline (Visible on Mobile & Desktop) */}
            <div className='w-12 md:w-20 h-6 md:h-10 opacity-60 group-hover:opacity-100 transition-opacity'>
              <svg
                viewBox='0 0 100 40'
                className='w-full h-full overflow-visible'
              >
                <path
                  d={
                    isTrendUp
                      ? 'M0 35 Q 25 35, 40 20 T 70 25 T 100 5'
                      : 'M0 5 Q 25 5, 40 20 T 70 15 T 100 35'
                  }
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='5'
                  strokeLinecap='round'
                  className={isTrendUp ? 'text-emerald-500' : 'text-rose-500'}
                />
                {/* Dot only on Desktop to save mobile visual noise */}
                <circle
                  cx='100'
                  cy={isTrendUp ? '5' : '35'}
                  r='3'
                  fill='currentColor'
                  className={cn(
                    'hidden md:block animate-ping',
                    isTrendUp ? 'text-emerald-400' : 'text-rose-400'
                  )}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 3. HOVER GLOW EFFECT (Desktop Only) */}
      {(variant === 'modern' || variant === 'glassy') && (
        <div className='hidden md:block absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700' />
      )}
    </div>
  );
}

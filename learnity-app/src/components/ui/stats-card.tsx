import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'elevated' | 'subtle';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trendValue?: string;
  isTrendUp?: boolean;
  variant?: CardVariant;
  icon: LucideIcon;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trendValue,
  isTrendUp = true,
  variant = 'default',
  icon: Icon,
  className,
}: MetricCardProps) {
  const variants = {
    default:
      'bg-card text-card-foreground ring-1 ring-border shadow-sm hover:shadow-md',
    elevated:
      'bg-card text-card-foreground ring-1 ring-border shadow-md hover:shadow-lg',
    subtle:
      'bg-muted text-foreground ring-1 ring-border/50',
  };

  return (
    <div
      className={cn(
        'relative p-5 rounded-[24px] transition-all duration-300 group select-none overflow-hidden',
        'flex flex-col justify-between min-h-[160px]',
        'active:scale-[0.98] tap-highlight-transparent',
        variants[variant],
        className
      )}
    >
      {/* Top Row: Icon and Title */}
      <div className='flex items-start justify-between'>
        <div
          className={cn(
            'flex items-center justify-center h-10 w-10 rounded-2xl transition-all duration-500',
            'bg-muted text-foreground ring-1 ring-border/50'
          )}
        >
          <Icon
            size={20}
            strokeWidth={2.2}
            className='group-hover:scale-110 transition-transform'
          />
        </div>

        <p className='text-[10px] font-black uppercase tracking-[0.15em] leading-none pt-1 text-muted-foreground'>
          {title}
        </p>
      </div>

      {/* Bottom Content Stack */}
      <div className='space-y-3'>
        {/* Value */}
        <h3 className='text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none'>
          {value}
        </h3>

        {/* Subtitle (if no trend) or Trend & Sparkline */}
        <div className='flex items-center justify-between gap-4'>
          {trendValue ? (
            <div
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight',
                isTrendUp
                  ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20'
              )}
            >
              {isTrendUp ? (
                <TrendingUp size={12} strokeWidth={3} />
              ) : (
                <TrendingDown size={12} strokeWidth={3} />
              )}
              <span>{trendValue}</span>
            </div>
          ) : subtitle ? (
            <p className='text-[11px] font-medium text-muted-foreground truncate'>
              {subtitle}
            </p>
          ) : null}

          {trendValue && (
            <div className='w-16 h-6 opacity-40 group-hover:opacity-100 transition-opacity'>
              <svg viewBox='0 0 100 40' className='w-full h-full'>
                <path
                  d={
                    isTrendUp
                      ? 'M 0 35 L 20 25 L 40 30 L 60 10 L 80 15 L 100 0'
                      : 'M 0 5 L 20 15 L 40 10 L 60 25 L 80 20 L 100 40'
                  }
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='8'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className={isTrendUp ? 'text-emerald-500' : 'text-rose-500'}
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

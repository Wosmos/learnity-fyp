import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type CardVariant = 'onyx' | 'glass' | 'snow';

interface MetricCardProps {
  title: string;
  value: string | number;
  trendValue?: string;
  isTrendUp?: boolean;
  variant?: CardVariant;
  icon: LucideIcon;
  className?: string;
}

export function MetricCard({
  title,
  value,
  trendValue,
  isTrendUp = true,
  variant = 'snow',
  icon: Icon,
  className,
}: MetricCardProps) {
  const variants = {
    // Deep Onyx: High contrast, dark mode luxury
    onyx: 'bg-[#0A0A0B] text-white ring-1 ring-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
    // Apple Glass: Soft transparency, light mode depth
    glass: 'bg-white/70 backdrop-blur-xl ring-1 ring-black/[0.05] text-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.04)]',
    // Pure Snow: Clean, structured modernism
    snow: 'bg-white ring-1 ring-slate-200 text-slate-900 shadow-sm hover:shadow-md',
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
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex items-center justify-center h-10 w-10 rounded-2xl transition-all duration-500',
            variant === 'onyx' 
              ? 'bg-white/5 text-white ring-1 ring-white/10' 
              : 'bg-slate-100 text-slate-900 ring-1 ring-black/[0.03]'
          )}
        >
          <Icon size={20} strokeWidth={2.2} className="group-hover:scale-110 transition-transform" />
        </div>
        
        <p className={cn(
          'text-[10px] font-black uppercase tracking-[0.15em] leading-none pt-1',
          variant === 'onyx' ? 'text-slate-500' : 'text-slate-400'
        )}>
          {title}
        </p>
      </div>

      {/* Bottom Content Stack */}
      <div className="space-y-3">
        {/* Value with Fluid Typography */}
        <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
          {value}
        </h3>

        {/* Trend & Micro-graph Container */}
        <div className="flex items-center justify-between gap-4">
          {trendValue && (
            <div className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight',
              isTrendUp 
                ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20'
            )}>
              {isTrendUp ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
              <span>{trendValue}</span>
            </div>
          )}

          {/* Clean Vector Sparkline */}
          <div className="w-16 h-6 opacity-40 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <path
                d={isTrendUp 
                  ? "M 0 35 L 20 25 L 40 30 L 60 10 L 80 15 L 100 0" 
                  : "M 0 5 L 20 15 L 40 10 L 60 25 L 80 20 L 100 40"
                }
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isTrendUp ? 'text-emerald-500' : 'text-rose-500'}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Subtle Glow Overlay (Onyx Variant Only) */}
      {variant === 'onyx' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
      )}
    </div>
  );
}
import { LucideIcon, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ThemeColor = 'blue' | 'purple' | 'emerald' | 'orange' | 'rose' | 'gray';

export interface FeatureItem {
  icon?: LucideIcon;
  iconElement?: React.ReactNode;
  title: string;
  description?: string;
  benefits?: string[]; // Native support for the list
  content?: React.ReactNode;
  theme?: ThemeColor;
  className?: string;
}

export interface FeatureGridProps {
  items: FeatureItem[];
  columns?: 1 | 2 | 3 | 4;
  variant?: 'default' | 'minimal' | 'steps' | 'tactical';
  className?: string;
}

const themeStyles: Record<
  ThemeColor,
  {
    accent: string;
    bg: string;
    border: string;
    glow: string;
  }
> = {
  blue: {
    accent: 'text-blue-600',
    bg: 'bg-blue-50/50',
    border: 'border-blue-100',
    glow: 'shadow-blue-500/5',
  },
  purple: {
    accent: 'text-purple-600',
    bg: 'bg-purple-50/50',
    border: 'border-purple-100',
    glow: 'shadow-purple-500/5',
  },
  emerald: {
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-100',
    glow: 'shadow-emerald-500/5',
  },
  orange: {
    accent: 'text-orange-600',
    bg: 'bg-orange-50/50',
    border: 'border-orange-100',
    glow: 'shadow-orange-500/5',
  },
  rose: {
    accent: 'text-rose-600',
    bg: 'bg-rose-50/50',
    border: 'border-rose-100',
    glow: 'shadow-rose-500/5',
  },
  gray: {
    accent: 'text-slate-600',
    bg: 'bg-slate-50/50',
    border: 'border-slate-100',
    glow: 'shadow-slate-500/5',
  },
};

export function FeatureGrid({
  items,
  columns = 3,
  variant = 'steps',
  className,
}: FeatureGridProps) {
  return (
    <div
      className={cn(
        'grid gap-6 md:gap-8 relative',
        columns === 1
          ? 'grid-cols-1'
          : columns === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : columns === 3
              ? 'grid-cols-1 md:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {items.map((item, index) => {
        const Icon = item.icon;

        return (
          <div key={index} className='relative group'>
            {/* Logic for connecting lines in Steps variant */}
            {variant === 'steps' && index !== items.length - 1 && (
              <div className='hidden lg:block absolute top-12 left-[80%] w-[40%] h-[2px] bg-gradient-to-r from-slate-100 to-transparent z-0' />
            )}

            <Card
              className={cn(
                'h-full border transition-all duration-500 overflow-hidden relative',
                variant === 'steps'
                  ? 'bg-white rounded-[32px] border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl'
                  : 'bg-transparent border-none shadow-none'
              )}
            >
              {/* Massive Watermark Number */}
              {variant === 'steps' && (
                <span className='absolute -right-2 -bottom-4 text-[120px] font-black italic text-slate-50/50 select-none pointer-events-none group-hover:text-slate-100 transition-colors'>
                  0{index + 1}
                </span>
              )}

              <CardContent className='p-8 relative z-10 space-y-5'>
                {/* Icon Header */}
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-500 '
                  )}
                >
                  <div className='w-10 h-10 flex items-center justify-center rounded-xl bg-slate-950 text-white transition-transform group-hover:scale-110 '>
                    {Icon ? <Icon className={cn('w-7 h-7')} /> : item.iconElement}
                  </div>
                </div>

                {/* Text Content */}
                <div className='space-y-2'>
                  <h3 className='text-xl font-black uppercase italic tracking-tight text-slate-900'>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className='text-sm font-medium text-slate-500 leading-relaxed'>
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Benefit List (The "Better" part) */}
                {(item.benefits || item.content) && (
                  <div className='pt-4 space-y-3'>
                    {item.benefits?.map((benefit, bIdx) => (
                      <div key={bIdx} className='flex items-start gap-3'>
                        <div
                          className={cn(
                            'mt-1 p-0.5 rounded-full bg-slate-950 border'
                          )}
                        >
                          <CheckCircle2 className={cn('w-3.5 h-3.5')} />
                        </div>
                        <span className='text-xs font-bold text-slate-600 uppercase tracking-wide'>
                          {benefit}
                        </span>
                      </div>
                    ))}
                    {item.content}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

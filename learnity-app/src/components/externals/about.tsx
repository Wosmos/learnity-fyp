/**
 * About Section Component - Elite Onyx Edition
 * Refined for architectural depth and premium typography
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AboutContent {
  title: string;
  content: string | React.ReactNode;
  icon?: LucideIcon;
  iconElement?: React.ReactNode;
  gradient?: boolean;
  className?: string;
}

export interface AboutProps {
  left?: AboutContent;
  right?: AboutContent;
  content?: AboutContent;
  layout?: 'two-column' | 'single' | 'stacked';
  reverse?: boolean;
  className?: string;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl';
}

const maxWidthClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '7xl': 'max-w-7xl',
};

export function About({
  left,
  right,
  content,
  layout = 'two-column',
  reverse = false,
  className,
  maxWidth = '7xl',
}: AboutProps) {
  // Standard Text Content (Left side or Single)
  const renderContent = (item: AboutContent) => {
    return (
      <div className={cn('relative', item.className)}>
        {item.title && (
          <h2 className='text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none text-slate-900 mb-8'>
            {item.title}
          </h2>
        )}
        {typeof item.content === 'string' ? (
          <div className='space-y-6'>
            {item.content.split('\n\n').map((paragraph, index) => (
              <p
                key={index}
                className='text-lg text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-6'
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          item.content
        )}
      </div>
    );
  };

  // The "Onyx Card" (Right side or Stacked)
  const renderCard = (item: AboutContent) => {
    const Icon = item.icon;

    return (
      <div
        className={cn(
          'relative rounded-[2.5rem] p-10 md:p-14 overflow-hidden transition-all duration-500 group border border-slate-100',
          item.gradient
            ? 'bg-slate-950 text-white shadow-2xl shadow-indigo-500/10'
            : 'bg-white text-slate-900 shadow-xl shadow-slate-200/50'
        )}
      >
        {/* Subtle internal pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {Icon && (
          <div
            className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:-rotate-6',
              item.gradient
                ? 'bg-white/10 text-indigo-400'
                : 'bg-slate-950 text-white'
            )}
          >
            <Icon className='h-8 w-8' />
          </div>
        )}

        {item.title && (
          <h3
            className={cn(
              'text-2xl font-black uppercase italic tracking-tight mb-4',
              item.gradient ? 'text-white' : 'text-slate-950'
            )}
          >
            {item.title}
          </h3>
        )}

        <div
          className={cn(
            'text-base leading-relaxed font-medium opacity-80',
            item.gradient ? 'text-slate-300' : 'text-slate-500'
          )}
        >
          {item.content}
        </div>

        {/* Decorative Corner Glyph */}
        <div className='absolute -bottom-6 -right-6 text-8xl font-black italic opacity-[0.05] pointer-events-none select-none'>
          {item.title?.charAt(0)}
        </div>
      </div>
    );
  };

  return (
    <section className={cn('py-24', className)}>
      <div className='container mx-auto px-6'>
        <div className={cn(maxWidthClasses[maxWidth], 'mx-auto')}>
          {layout === 'two-column' && left && right && (
            <div
              className={cn(
                'grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center',
                reverse && 'md:flex-row-reverse'
              )}
            >
              <div className={cn(reverse ? 'lg:order-2' : 'lg:order-1')}>
                {renderContent(left)}
              </div>
              <div className={cn(reverse ? 'lg:order-1' : 'lg:order-2')}>
                {renderCard(right)}
              </div>
            </div>
          )}

          {layout === 'single' && content && (
            <div className='text-center max-w-3xl mx-auto'>
              {renderContent(content)}
            </div>
          )}

          {layout === 'stacked' && left && right && (
            <div className='grid grid-cols-1 gap-12'>
              {renderContent(left)}
              {renderCard(right)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

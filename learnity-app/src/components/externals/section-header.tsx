/**
 * Tactical Section Header - LMS Edition
 * Features: Multi-color gradient titles, Monospaced subtitles, and decorative data lines.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  title: string;
  highlightWord?: string; // For the multi-color effect
  description?: string;
  subtitle?: string;
  centered?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
};

export function SectionHeader({
  title,
  highlightWord,
  description,
  subtitle,
  centered = true,
  maxWidth = '2xl',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(
      'mb-16 md:mb-24 relative',
      centered && 'text-center flex flex-col items-center',
      className
    )}>
      {/* 1. Monospaced Subtitle (The "Protocol" look) */}
      {subtitle && (
        <div className="flex items-center gap-3 mb-4 group">
          <div className="h-[1px] w-8 bg-indigo-500/30 group-hover:w-12 transition-all" />
          <p className="text-[10px] md:text-xs font-mono font-black text-indigo-600 uppercase tracking-[0.3em]">
            {subtitle}
          </p>
          <div className="h-[1px] w-8 bg-indigo-500/30 group-hover:w-12 transition-all" />
        </div>
      )}

      {/* 2. Multi-color Sleek Title */}
      <h2 className={cn(
        'text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.85] text-slate-900',
        'drop-shadow-sm'
      )}>
        {title}{' '}
        {highlightWord && (
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 not-italic">
            {highlightWord}
          </span>
        )}
      </h2>

      {/* 3. Tactical Description with dynamic width */}
      {description && (
        <p className={cn(
          'mt-6 text-sm md:text-base font-bold text-slate-400 uppercase tracking-wide leading-relaxed',
          centered && maxWidthClasses[maxWidth],
          'relative'
        )}>
          {description}
          {/* Subtle underline for the description to act as a "Section Splitter" */}
          <span className="block h-[2px] w-12 bg-slate-100 mt-4 mx-auto" />
        </p>
      )}

      {/* 4. Background "Watermark" Decoration (Optional) */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-[0.03] pointer-events-none select-none">
        <span className="text-9xl font-black italic uppercase tracking-tighter">
          {title.split(' ')[0]}
        </span>
      </div>
    </div>
  );
}
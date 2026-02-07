'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  title: string;
  highlightWord?: string;
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
    <div
      className={cn(
        'relative mb-10 sm:mb-14 md:mb-18 lg:mb-20',
        centered && 'flex flex-col items-center text-center',
        className
      )}
    >
      {subtitle && (
        <div className="mb-3 flex items-center gap-2 sm:mb-4">
          <div className="h-px w-5 bg-indigo-500/25 sm:w-7" />
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-indigo-600 sm:text-[10px] md:text-xs">
            {subtitle}
          </p>
          <div className="h-px w-5 bg-indigo-500/25 sm:w-7" />
        </div>
      )}

      <h2 className="text-[clamp(1.75rem,5.5vw,4.5rem)] font-extrabold uppercase italic leading-[0.9] tracking-tighter text-slate-950">
        {title}
        {highlightWord && (
          <>
            <br className="hidden sm:block" />{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text not-italic text-transparent">
              {highlightWord}
            </span>
          </>
        )}
      </h2>

      {description && (
        <p
          className={cn(
            'mt-4 text-xs leading-relaxed text-slate-500 sm:mt-6 sm:text-sm md:mt-8 md:text-base',
            centered && maxWidthClasses[maxWidth]
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
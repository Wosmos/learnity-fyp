/**
 * Tactical Section Header - Onyx Morphic Edition
 * Features: Forced break highlighting, SVG rough underline, and monospaced protocols.
 */
'use client'
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
    <div className={cn(
      'mb-16 md:mb-24 relative',
      centered && 'text-center flex flex-col items-center',
      className
    )}>
      {/* 1. Protocol Subtitle */}
      {subtitle && (
        <div className="flex items-center gap-3 mb-6 group">
          <div className="h-[1px] w-8 bg-indigo-500/30 group-hover:w-12 transition-all duration-500" />
          <p className="text-[10px] md:text-xs font-mono font-black text-indigo-600 uppercase tracking-[0.4em]">
            {subtitle}
          </p>
          <div className="h-[1px] w-8 bg-indigo-500/30 group-hover:w-12 transition-all duration-500" />
        </div>
      )}

      {/* 2. Title with Forced Break & Rough Underline */}
      <h2 className={cn(
        'text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.8] text-slate-950',
        'relative inline-block'
      )}>
        <span className="block">{title}</span>
        
        {highlightWord && (
          <span className="relative inline-block mt-2 py-2 not-italic">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">
              {highlightWord}
            </span>
            
           
          </span>
        )}
      </h2>

      {/* 3. Description */}
      {description && (
        <p className={cn(
          'mt-10 text-sm md:text-base font-bold text-slate-500 uppercase tracking-[0.1em] leading-relaxed italic opacity-80',
          centered && maxWidthClasses[maxWidth]
        )}>
          {description}
        </p>
      )}

      {/* 4. Background Ghost Text */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-[0.02] pointer-events-none select-none -z-10">
        <span className="text-[12rem] font-black italic uppercase tracking-tighter">
          {title.split(' ')[0]}
        </span>
      </div>

      <style jsx>{`
        .path-draw {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: draw 1.5s ease-out forwards;
        }
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
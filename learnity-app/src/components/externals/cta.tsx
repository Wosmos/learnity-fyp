'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, LucideIcon, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CTAAction {
  label: string;
  href: string;
  variant?: any;
  icon?: LucideIcon;
}

export interface CTAProps {
  title: string;
  description?: string;
  primaryAction?: CTAAction;
  secondaryAction?: CTAAction;
  className?: string;
  isDark?: boolean; // Toggle for Onyx vs White theme
}

export function CTA({
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
  isDark = true,
}: CTAProps) {
  return (
    <section className={cn('py-24 px-6', className)}>
      <div className='max-w-7xl mx-auto'>
        <div
          className={cn(
            'relative rounded-3xl px-10 py-8 md:p-24 overflow-hidden transition-all duration-700 border',
            isDark
              ? 'bg-slate-950 border-white/5 text-white'
              : 'bg-white border-slate-100 text-slate-900 shadow-2xl shadow-slate-200/50'
          )}
        >
          {/* Subtle Depth Accents */}
          {isDark && (
            <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2' />
          )}

          <div className='relative z-10 max-w-3xl'>
            {/* Top Badge */}
            {/* <div className="flex items-center gap-3 mb-8">
              <Zap className={cn("w-4 h-4", isDark ? "text-amber-400 fill-amber-400" : "text-indigo-600")} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-[0.4em] italic",
                isDark ? "text-slate-500" : "text-slate-400"
              )}>
                Exclusive Membership
              </span>
            </div> */}

            {/* Title - Ultra Impact */}
            <h2 className='text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9] mb-8'>
              {title}
            </h2>

            {/* Description - Sophisticated Font Weight */}
            {description && (
              <p
                className={cn(
                  'text-md md:text-lg font-medium leading-relaxed max-w-xl mb-12 italic opacity-80',
                  isDark ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                {description}
              </p>
            )}

            {/* Actions */}
            <div className='flex flex-wrap gap-6'>
              {primaryAction && (
                <Link href={primaryAction.href} className='inline-block group '>
                  <button className='h-14 px-10 border border-slate-200 hover:border-slate-950 rounded-xl flex items-center gap-4 transition-all duration-300 active:scale-95 bg-white hover:bg-slate-950 group-hover:cursor-pointer'>
                    {/* Label - Swaps color on hover */}
                    <span className='text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-white transition-colors duration-300 group-hover:cursor-pointer'>
                      {primaryAction?.label}
                    </span>

                    {/* Icon - Circular frame that scales and colors */}
                    <div className='flex items-center justify-center w-7 h-7 rounded-xl bg-slate-50 group-hover:bg-white/10 transition-all duration-300'>
                      <ArrowRight className='h-3.5 w-3.5 text-slate-900 group-hover:text-slate-950 transition-transform group-hover:translate-x-0.5' />
                    </div>
                  </button>
                </Link>
              )}

              {secondaryAction && (
                <Link
                  href={secondaryAction.href}
                  className='group border-slate-200 hover:border-slate-950 rounded-xl flex items-center gap-4 transition-all duration-300 active:scale-95  hover:bg-slate-950 group-hover:cursor-pointer'
                >
                  <button
                    className={cn(
                      'h-14 px-8 rounded-2xl border transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-4',
                      isDark
                        ? 'border-white/10 text-white hover:bg-white/5 bg-transparent'
                        : 'border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900'
                    )}
                  >
                    <span className='text-[11px] font-black uppercase tracking-[0.2em]'>
                      {secondaryAction.label}
                    </span>
                    <ArrowRight className='h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all' />
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Large Background Glyph */}
          <div
            className={cn(
              'absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 text-[20rem] font-black italic select-none pointer-events-none opacity-[0.03]',
              isDark ? 'text-white' : 'text-slate-950'
            )}
          >
            Learnity
          </div>
        </div>
      </div>
    </section>
  );
}

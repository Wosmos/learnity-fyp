'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeroAction {
  label: string;
  href: string;
  variant?: 'cta' | 'ctaSecondary' | 'outline' | 'default' | 'ghost';
  icon?: LucideIcon;
}

export interface HeroBadge {
  text: string;
  showPulse?: boolean;
  className?: string;
}

export interface HeroProps {
  title: string | React.ReactNode;
  subtitle?: string;
  description?: string;
  badge?: HeroBadge;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  centered?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
  background?: 'gradient' | 'solid' | 'none';
  className?: string;
  children?: React.ReactNode;
  stats?: React.ReactNode;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
};

export function Hero({
  title,
  subtitle,
  description,
  badge,
  primaryAction,
  secondaryAction,
  centered = true,
  maxWidth = '4xl',
  background = 'gradient',
  className,
  children,
  stats,
}: HeroProps) {
  const TitleComponent = typeof title === 'string' ? 'h1' : 'div';

  return (
    <section className={cn(
      'relative min-h-[70vh] flex items-center justify-center pt-16 pb-10 overflow-hidden',
      className
    )}>
      {/* 1. Enhanced Background: Added Mesh Gradients for depth */}
      {background === 'gradient' && (
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-purple-400/10 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        </div>
      )}

      <div className="container relative z-10 mx-auto px-6">
        <div className={cn(
          'mx-auto transition-all duration-700 ease-out',
          centered ? 'text-center' : 'text-left',
          maxWidthClasses[maxWidth]
        )}>
          
          {/* 2. Badge: Refined glassmorphism and tighter typography */}
          {badge && (
            <div className={cn(
              'mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000', 
              centered && 'flex justify-center'
            )}>
              <Badge className={cn(
                'group flex items-center gap-2.5 px-4 py-1.5 border-blue-200/40 bg-slate-900 text-blue-50 backdrop-blur-md shadow-sm transition-all hover:bg-slate-950 hover:shadow-md cursor-default rounded-full border',
                badge.className
              )}>
                {badge.showPulse && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
                <span className="text-xs font-semibold tracking-wide uppercase">{badge.text}</span>
              </Badge>
            </div>
          )}

          {/* 3. Title & Subtitle: Improved tracking and line-height */}
          <div className="space-y-4 font-black uppercase italic tracking-tight text-slate-900 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            {subtitle && (
              <p className="text-blue-600 font-bold tracking-[0.2em] uppercase text-xs md:text-sm">
                {subtitle}
              </p>
            )}
            <TitleComponent className={cn(
              'text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[1.05] text-slate-900',
              centered ? 'mx-auto' : ''
            )}>
              {title}
            </TitleComponent>
          </div>

          {/* 4. Description: Better contrast and max-width for readability */}
          {description && (
            <p className={cn(
              'text-lg md:text-xl text-slate-500 mb-12 leading-relaxed font-medium',
              centered ? 'mx-auto max-w-2xl' : 'max-w-xl',
              'animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300'
            )}>
              {description}
            </p>
          )}

          {/* 5. Actions: Smooth hover states and standard Apple button sizing */}
          {(primaryAction || secondaryAction) && (
            <div className={cn(
              'flex flex-col sm:flex-row gap-4 items-center mb-16',
              centered ? 'justify-center' : 'justify-start',
              'animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500'
            )}>
              {primaryAction && (
                <Link href={primaryAction.href} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-14 px-8 text-base rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5 active:scale-95 font-bold"
                  >
                    {primaryAction.label}
                    {primaryAction.icon ? (
                      <primaryAction.icon className="ml-2 h-5 w-5 opacity-80" />
                    ) : (
                      <ArrowRight className="ml-2 h-5 w-5 opacity-80" />
                    )}
                  </Button>
                </Link>
              )}
              {secondaryAction && (
                <Link href={secondaryAction.href} className="w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    className="w-full sm:w-auto h-14 px-8 text-base rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-slate-950 hover:border-slate-300 transition-all font-bold"
                  >
                    {secondaryAction.label}
                    {secondaryAction.icon && (
                      <secondaryAction.icon className="ml-2 h-5 w-5 opacity-60" />
                    )}
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* 6. Stats & Children: Added soft containers */}
          {stats && (
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
              <div className="inline-block p-1 rounded-3xl bg-slate-50/50 border border-slate-100 backdrop-blur-sm">
                 {stats}
              </div>
            </div>
          )}

          {children && (
            <div className="mt-8 animate-in fade-in duration-1000 delay-1000">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
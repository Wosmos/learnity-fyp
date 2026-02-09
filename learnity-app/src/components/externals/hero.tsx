'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <section
      className={cn(
        'relative flex min-h-[60svh] items-center justify-center overflow-hidden px-4 py-16 sm:px-6 sm:py-20 md:min-h-[70svh] md:py-24 lg:py-32',
        className
      )}
    >
      {/* Background */}
      {background === 'gradient' && (
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-blue-400/8 blur-[100px] sm:blur-[120px]" />
          <div className="absolute -bottom-[5%] -right-[5%] h-[30%] w-[30%] rounded-full bg-purple-400/8 blur-[80px] sm:blur-[100px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        </div>
      )}

      <div className="container relative z-10 mx-auto w-full">
        <div
          className={cn(
            'mx-auto',
            centered ? 'text-center' : 'text-left',
            maxWidthClasses[maxWidth]
          )}
        >
          {/* Badge */}
          {badge && (
            <div
              className={cn(
                'mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700',
                centered && 'flex justify-center'
              )}
            >
              <Badge
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-slate-900 px-3.5 py-1.5 text-blue-50 shadow-sm backdrop-blur-md ',
                  badge.className
                )}
              >
                {badge.showPulse && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
                  </span>
                )}
                <span className="text-[8px] sm:text-[11px] font-semibold uppercase tracking-wider">
                  {badge.text}
                </span>
              </Badge>
            </div>
          )}

          {/* Title block */}
          <div className="mb-6 space-y-3 sm:mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-100">
            {subtitle && (
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 sm:text-xs md:text-sm">
                {subtitle}
              </p>
            )}
            <TitleComponent
              className={cn(
                'text-[clamp(2rem,6vw,5.5rem)] font-extrabold uppercase italic leading-[1.05] tracking-tighter text-slate-900',
                centered && 'mx-auto'
              )}
            >
              {title}
            </TitleComponent>
          </div>

          {/* Description */}
          {description && (
            <p
              className={cn(
                'mb-8 text-base leading-relaxed text-slate-500 sm:mb-10 sm:text-lg md:text-xl',
                centered ? 'mx-auto max-w-2xl' : 'max-w-xl',
                'animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-200'
              )}
            >
              {description}
            </p>
          )}

          {/* Actions */}
          {(primaryAction || secondaryAction) && (
            <div
              className={cn(
                'mb-10 flex flex-col gap-3 sm:flex-row sm:gap-4 md:mb-14',
                centered ? 'items-center justify-center' : 'items-start justify-start',
                'animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-300'
              )}
            >
              {primaryAction && (
                <Link href={primaryAction.href} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="h-12 w-full rounded-xl bg-slate-900 px-7 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98] sm:h-13 sm:w-auto sm:rounded-2xl sm:px-8 sm:text-base"
                  >
                    {primaryAction.label}
                    {primaryAction.icon ? (
                      <primaryAction.icon className="ml-2 h-4 w-4 opacity-80 sm:h-5 sm:w-5" />
                    ) : (
                      <ArrowRight className="ml-2 h-4 w-4 opacity-80 sm:h-5 sm:w-5" />
                    )}
                  </Button>
                </Link>
              )}
              {secondaryAction && (
                <Link href={secondaryAction.href} className="w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white/60 px-7 text-sm font-bold backdrop-blur-sm transition-all hover:bg-slate-50 sm:h-13 sm:w-auto sm:rounded-2xl sm:px-8 sm:text-base"
                  >
                    {secondaryAction.label}
                    {secondaryAction.icon && (
                      <secondaryAction.icon className="ml-2 h-4 w-4 opacity-60 sm:h-5 sm:w-5" />
                    )}
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-500">
              {stats}
            </div>
          )}

          {/* Children */}
          {children && (
            <div className="mt-4 sm:mt-6 animate-in fade-in duration-700 fill-mode-both delay-700">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
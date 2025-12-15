/**
 * Hero Section Component
 * Modern, sleek hero section with flexible content support
 * Apple-inspired clean design
 */

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
  variant?: 'cta' | 'ctaSecondary' | 'outline' | 'default';
  icon?: LucideIcon;
}

export interface HeroBadge {
  text: string;
  showPulse?: boolean;
  className?: string;
}

export interface HeroProps {
  // Content
  title: string | React.ReactNode;
  subtitle?: string;
  description?: string;

  // Badge
  badge?: HeroBadge;

  // Actions
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;

  // Layout
  centered?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';

  // Styling
  background?: 'gradient' | 'solid' | 'none';
  className?: string;

  // Children for custom content
  children?: React.ReactNode;

  // Stats component
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

const backgroundClasses = {
  gradient: 'bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 backdrop-blur-sm',
  solid: 'bg-white/80 backdrop-blur-md',
  none: '',
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
  const titleContent = typeof title === 'string' ? title : title;

  return (
    <section className={cn('relative overflow-hidden', className)}>
      {/* Background with animated gradient */}
      {background !== 'none' && (
        <div className={cn(
          'absolute inset-0 -z-10',
          backgroundClasses[background],
          background === 'gradient' && 'animate-gradient'
        )} />
      )}

      {/* Content */}
      <div className="container mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className={cn(
          'mx-auto',
          centered ? 'text-center' : '',
          maxWidthClasses[maxWidth]
        )}>
          {/* Badge */}
          {badge && (
            <div className={cn('mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700', centered && 'flex justify-center')}>
              <Badge className={cn(
                'inline-flex items-center gap-2 px-4 py-2 glass border-blue-200/50 text-blue-700 hover:bg-slate-50/50 text-sm font-medium rounded-full shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105',
                badge.className
              )}>
                {badge.showPulse && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                  </span>
                )}
                {badge.text}
              </Badge>
            </div>
          )}

          {/* Title */}
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            {subtitle && (
              <p className="text-lg md:text-xl text-gray-600 mb-4 font-medium">
                {subtitle}
              </p>
            )}
            <TitleComponent className={cn(
              'text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight drop-shadow-sm',
              centered ? 'text-center' : ''
            )}>
              {titleContent}
            </TitleComponent>
          </div>

          {/* Description */}
          {description && (
            <p className={cn(
              'text-lg md:text-xl text-gray-600 mb-10 leading-relaxed',
              centered ? 'mx-auto' : '',
              maxWidth === '4xl' ? 'max-w-2xl' : '',
              centered && 'text-center'
            )}>
              {description}
            </p>
          )}

          {/* Actions */}
          {(primaryAction || secondaryAction) && (
            <div className={cn(
              'flex flex-col sm:flex-row gap-4 mb-12',
              centered ? 'justify-center' : '',
              'animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300'
            )}>
              {primaryAction && (
                <Link href={primaryAction.href}>
                  <Button
                    size="lg"
                    variant={primaryAction.variant || 'cta'}
                    className="text-base px-8 py-6 rounded-xl hover:scale-105 font-semibold glow-blue transition-all duration-300"
                  >
                    {primaryAction.label}
                    {primaryAction.icon ? (
                      <primaryAction.icon className="ml-2 h-5 w-5" />
                    ) : (
                      <ArrowRight className="ml-2 h-5 w-5" />
                    )}
                  </Button>
                </Link>
              )}
              {secondaryAction && (
                <Link href={secondaryAction.href}>
                  <Button
                    size="lg"
                    variant={secondaryAction.variant || 'outline'}
                    className="text-base px-8 py-6 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:border-blue-200 transition-all duration-300 font-semibold shadow-sm"
                  >
                    {secondaryAction.label}
                    {secondaryAction.icon && (
                      <secondaryAction.icon className="ml-2 h-5 w-5" />
                    )}
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              {stats}
            </div>
          )}

          {/* Custom Children */}
          {children}
        </div>
      </div>
    </section>
  );
}


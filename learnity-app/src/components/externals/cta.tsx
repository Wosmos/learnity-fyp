/**
 * CTA (Call to Action) Section Component
 * Modern, flexible CTA section with customizable content
 * Apple-inspired design with smooth animations
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CTAAction {
  label: string;
  href: string;
  variant?: 'cta' | 'ctaSecondary' | 'outline' | 'default' | 'gradient';
  icon?: LucideIcon;
  className?: string;
}

export interface CTAProps {
  // Content
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  
  // Actions
  primaryAction?: CTAAction;
  secondaryAction?: CTAAction;
  actions?: CTAAction[]; // For multiple actions
  
  // Styling
  variant?: 'default' | 'gradient' | 'minimal' | 'card';
  size?: 'sm' | 'md' | 'lg';
  background?: 'blue' | 'purple' | 'gradient' | 'white' | 'gray';
  
  // Layout
  centered?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  
  // Custom
  className?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantClasses = {
  default: 'rounded-3xl px-8 py-16 md:px-16 md:py-20',
  gradient: 'rounded-3xl px-8 py-16 md:px-16 md:py-20',
  minimal: 'rounded-2xl px-6 py-12 md:px-12 md:py-16',
  card: 'rounded-2xl px-6 py-12 md:px-12 md:py-16 shadow-xl',
};

const backgroundClasses = {
  blue: 'bg-blue-600',
  purple: 'bg-purple-600',
  gradient: 'bg-gradient-to-br from-blue-600 to-purple-600',
  white: 'bg-white',
  gray: 'bg-gray-50',
};

const textColorClasses = {
  blue: 'text-white',
  purple: 'text-white',
  gradient: 'text-white',
  white: 'text-gray-900',
  gray: 'text-gray-900',
};

const descriptionColorClasses = {
  blue: 'text-blue-100',
  purple: 'text-purple-100',
  gradient: 'text-blue-100',
  white: 'text-gray-600',
  gray: 'text-gray-600',
};

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
};

export function CTA({
  title,
  description,
  primaryAction,
  secondaryAction,
  actions,
  variant = 'default',
  background = 'blue',
  centered = true,
  maxWidth = '4xl',
  className,
  icon,
  children,
}: CTAProps) {
  const displayActions = actions || [primaryAction, secondaryAction].filter(Boolean) as CTAAction[];

  return (
    <section className={cn('py-20', className)}>
      <div className="container mx-auto px-4">
        <div className={cn(
          'relative overflow-hidden',
          variantClasses[variant],
          backgroundClasses[background],
          'animate-in fade-in slide-in-from-bottom-4 duration-700'
        )}>
          {/* Decorative Background Elements */}
          {background !== 'white' && background !== 'gray' && (
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-32 -translate-y-32"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-48 translate-y-48"></div>
            </div>
          )}

          {/* Content */}
          <div className={cn(
            'relative z-10',
            centered && 'text-center',
            maxWidthClasses[maxWidth],
            centered && 'mx-auto'
          )}>
            {/* Icon */}
            {icon && (
              <div className={cn('mb-6', centered && 'flex justify-center')}>
                {icon}
              </div>
            )}

            {/* Title */}
            <h2 className={cn(
              'text-4xl md:text-5xl font-bold mb-6',
              textColorClasses[background]
            )}>
              {title}
            </h2>

            {/* Description */}
            {description && (
              <p className={cn(
                'text-xl mb-10 leading-relaxed',
                descriptionColorClasses[background]
              )}>
                {description}
              </p>
            )}

            {/* Actions */}
            {displayActions.length > 0 && (
              <div className={cn(
                'flex flex-col sm:flex-row gap-4',
                centered ? 'justify-center' : ''
              )}>
                {displayActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <Button
                      size="lg"
                      variant={action.variant || (index === 0 ? 'ctaSecondary' : 'outline')}
                      className={cn(
                        'text-base px-8 py-6 rounded-xl font-semibold'
                      )}
                    >
                      {action.label}
                      {action.icon ? (
                        <action.icon className="ml-2 h-5 w-5" />
                      ) : (
                        <ArrowRight className="ml-2 h-5 w-5" />
                      )}
                    </Button>
                  </Link>
                ))}
              </div>
            )}

            {/* Custom Children */}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}


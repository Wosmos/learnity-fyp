/**
 * Section Header Component
 * Reusable section header with title and description
 * Clean, modern design
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  subtitle?: string;
  centered?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
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
  description,
  subtitle,
  centered = true,
  maxWidth = '2xl',
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn(
      'mb-12 md:mb-16',
      centered && 'text-center',
      className
    )}>
      {subtitle && (
        <p className="text-sm md:text-base text-blue-600 font-medium mb-2 uppercase tracking-wide">
          {subtitle}
        </p>
      )}
      <h2 className={cn(
        'text-4xl md:text-5xl font-bold text-gray-900 mb-4',
        titleClassName
      )}>
        {title}
      </h2>
      {description && (
        <p className={cn(
          'text-lg text-gray-600',
          centered && maxWidthClasses[maxWidth] + ' mx-auto',
          descriptionClassName
        )}>
          {description}
        </p>
      )}
    </div>
  );
}


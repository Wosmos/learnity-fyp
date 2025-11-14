/**
 * Feature Grid Component
 * Flexible grid for displaying features, values, benefits, etc.
 * Modern card-based design with hover effects
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FeatureItem {
  icon?: LucideIcon;
  iconElement?: React.ReactNode;
  title: string;
  description?: string;
  content?: React.ReactNode;
  color?: string;
  bgColor?: string;
  className?: string;
}

export interface FeatureGridProps {
  items: FeatureItem[];
  columns?: 1 | 2 | 3 | 4;
  variant?: 'default' | 'minimal' | 'elevated' | 'outlined';
  centered?: boolean;
  showIcons?: boolean;
  className?: string;
  itemClassName?: string;
}

const gridColsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

const cardVariantClasses = {
  default: 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300',
  minimal: 'border-0 shadow-none hover:shadow-md hover:-translate-y-0.5 transition-all duration-300',
  elevated: 'shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
  outlined: 'border-2 shadow-none hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300',
};

export function FeatureGrid({
  items,
  columns = 3,
  variant = 'default',
  centered = true,
  showIcons = true,
  className,
  itemClassName,
}: FeatureGridProps) {
  return (
    <div className={cn(
      'grid gap-6 md:gap-8',
      gridColsClasses[columns],
      className
    )}>
      {items.map((item, index) => {
        const Icon = item.icon;
        const iconBgColor = item.bgColor || 'bg-blue-100';
        const iconColor = item.color || 'text-blue-600';

        return (
          <Card
            key={index}
            variant={variant === 'outlined' ? 'outlined' : 'default'}
            className={cn(
              cardVariantClasses[variant],
              centered && 'text-center',
              item.className,
              itemClassName
            )}
          >
            <CardContent className="p-6">
              {/* Icon */}
              {showIcons && (Icon || item.iconElement) && (
                <div className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
                  iconBgColor,
                  centered ? 'mx-auto' : ''
                )}>
                  {Icon ? (
                    <Icon className={cn('h-7 w-7', iconColor)} />
                  ) : (
                    item.iconElement
                  )}
                </div>
              )}

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {item.title}
              </h3>

              {/* Description */}
              {item.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              )}

              {/* Custom Content */}
              {item.content}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}


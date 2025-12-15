/**
 * About Section Component
 * Flexible about/mission/vision section component
 * Modern two-column or single-column layout
 */

'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AboutContent {
  title: string;
  content: string | React.ReactNode;
  icon?: LucideIcon;
  iconElement?: React.ReactNode;
  gradient?: boolean;
  className?: string;
}

export interface AboutProps {
  // Two-column layout
  left?: AboutContent;
  right?: AboutContent;

  // Single content
  content?: AboutContent;

  // Layout
  layout?: 'two-column' | 'single' | 'stacked';
  reverse?: boolean;

  // Styling
  className?: string;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

const maxWidthClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
};

export function About({
  left,
  right,
  content,
  layout = 'two-column',
  reverse = false,
  className,
  maxWidth = '4xl',
}: AboutProps) {
  const renderContent = (item: AboutContent) => {
    return (
      <div className={cn(item.className)}>
        {item.title && (
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {item.title}
          </h2>
        )}
        {typeof item.content === 'string' ? (
          <div className="space-y-4">
            {item.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-lg text-gray-600 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          item.content
        )}
      </div>
    );
  };

  const renderCard = (item: AboutContent) => {
    const Icon = item.icon;

    return (
      <div className={cn(
        'rounded-2xl p-8 text-white glass-card border-none',
        item.gradient
          ? 'bg-gradient-to-br from-blue-500/80 to-purple-600/80 backdrop-blur-md shadow-xl'
          : 'bg-slate-600/80 backdrop-blur-md shadow-xl'
      )}>
        {Icon && <Icon className="h-16 w-16 mb-6" />}
        {item.iconElement && <div className="mb-6">{item.iconElement}</div>}
        {item.title && (
          <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
        )}
        {typeof item.content === 'string' ? (
          <p className="text-blue-50 leading-relaxed">{item.content}</p>
        ) : (
          <div className="text-blue-50">{item.content}</div>
        )}
      </div>
    );
  };

  return (
    <section className={cn('py-20', className)}>
      <div className="container mx-auto px-4">
        <div className={cn(maxWidthClasses[maxWidth], 'mx-auto')}>
          {layout === 'two-column' && left && right && (
            <div className={cn(
              'grid grid-cols-1 md:grid-cols-2 gap-12 items-center',
              reverse && 'md:flex-row-reverse'
            )}>
              {renderContent(left)}
              {renderCard(right)}
            </div>
          )}

          {layout === 'single' && content && (
            <div className="text-center">
              {renderContent(content)}
            </div>
          )}

          {layout === 'stacked' && left && right && (
            <div className="space-y-12">
              {renderContent(left)}
              {renderCard(right)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


'use client';

/**
 * Reusable Page Header Component
 * Provides consistent header styling across dashboard pages
 */

import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface PageHeaderProps {
  /** Main title of the page */
  title: string;
  /** Subtitle or description text */
  subtitle?: string;
  /** Icon component to display (from lucide-react) */
  icon?: LucideIcon;
  /** Icon gradient colors (from-color to-color) */
  iconGradient?: {
    from: string;
    to: string;
  };
  /** Action buttons or elements to display on the right */
  actions?: ReactNode;
  /** Whether the header should be sticky */
  sticky?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconGradient = { from: 'blue-600', to: 'blue-700' },
  actions,
  sticky = false,
  className = '',
}: PageHeaderProps) {
  return (
    <header 
      className={`backdrop-blur-md -mb-2 ${
        sticky ? 'sticky top-0 z-10' : ''
      } ${className}`}
    >
      <div className="max-w-[1600px] px-10 mx-auto ">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            {Icon && (
              <div className={`p-2.5 bg-gradient-to-br from-${iconGradient.from} to-${iconGradient.to} rounded-xl shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-slate-500">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default PageHeader;
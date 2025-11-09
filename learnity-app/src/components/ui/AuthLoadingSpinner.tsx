/**
 * Authentication Loading Spinner Component
 * Branded loading state for authentication checks with accessibility features
 */

'use client';

import { GraduationCap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AuthLoadingSpinnerProps {
  message?: string;
  showLogo?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * AuthLoadingSpinner - Branded loading component for authentication checks
 * Features:
 * - Learnity branding with logo
 * - Accessible with proper ARIA labels
 * - Responsive design for all device sizes
 * - Customizable message and size
 */
export function AuthLoadingSpinner({
  message = 'Checking authentication...',
  showLogo = true,
  className,
  size = 'md'
}: AuthLoadingSpinnerProps) {
  const sizeClasses = {
    sm: {
      container: 'p-4',
      logo: 'h-6 w-6',
      logoContainer: 'p-2',
      spinner: 'h-4 w-4',
      text: 'text-sm'
    },
    md: {
      container: 'p-8',
      logo: 'h-8 w-8',
      logoContainer: 'p-3',
      spinner: 'h-6 w-6',
      text: 'text-base'
    },
    lg: {
      container: 'p-12',
      logo: 'h-10 w-10',
      logoContainer: 'p-4',
      spinner: 'h-8 w-8',
      text: 'text-lg'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center min-h-[200px] w-full',
        sizes.container,
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {/* Logo and Brand */}
      {showLogo && (
        <div className="flex items-center space-x-3 mb-6">
          <div className={cn(
            'bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg',
            sizes.logoContainer
          )}>
            <GraduationCap className={cn('text-white', sizes.logo)} />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Learnity
          </span>
        </div>
      )}

      {/* Loading Spinner */}
      <div className="flex items-center space-x-3 mb-4">
        <Loader2 
          className={cn(
            'animate-spin text-blue-600',
            sizes.spinner
          )}
          aria-hidden="true"
        />
        <span 
          className={cn(
            'text-gray-700 font-medium',
            sizes.text
          )}
        >
          {message}
        </span>
      </div>

      {/* Progress indicator */}
      <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse" />
      </div>

      {/* Screen reader only text */}
      <span className="sr-only">
        Please wait while we verify your authentication status. This should only take a moment.
      </span>
    </div>
  );
}

/**
 * Compact version for inline loading states
 */
export function AuthLoadingInline({
  message = 'Loading...',
  className
}: Pick<AuthLoadingSpinnerProps, 'message' | 'className'>) {
  return (
    <div 
      className={cn('flex items-center space-x-2', className)}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <Loader2 className="h-4 w-4 animate-spin text-blue-600" aria-hidden="true" />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
}

/**
 * Full-screen loading overlay for critical authentication checks
 */
export function AuthLoadingOverlay({
  message = 'Authenticating...',
  className
}: Pick<AuthLoadingSpinnerProps, 'message' | 'className'>) {
  return (
    <div 
      className={cn(
        'fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <AuthLoadingSpinner 
        message={message}
        showLogo={true}
        size="lg"
      />
    </div>
  );
}
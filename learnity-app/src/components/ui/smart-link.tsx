/**
 * Smart Link Component
 * Enhanced Next.js Link with intelligent prefetching strategies
 */

'use client';

import { forwardRef, ReactNode } from 'react';
import Link, { LinkProps } from 'next/link';
import { useSmartPrefetch } from '@/hooks/usePrefetch';
import { cn } from '@/lib/utils';

interface SmartLinkProps extends Omit<LinkProps, 'href'> {
  href: string;
  children: ReactNode;
  className?: string;
  prefetchStrategy?: 'hover' | 'intersection' | 'immediate' | 'none';
  prefetchDelay?: number;
  disabled?: boolean;
  onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
}

/**
 * Smart Link component with intelligent prefetching
 * Automatically prefetches routes based on user interaction patterns
 */
export const SmartLink = forwardRef<HTMLAnchorElement, SmartLinkProps>(
  ({
    href,
    children,
    className,
    prefetchStrategy = 'hover',
    prefetchDelay = 100,
    disabled = false,
    ...props
  }, ref) => {
    const { createSmartLink } = useSmartPrefetch();

    // Don't prefetch if disabled or external link
    const shouldPrefetch = !disabled &&
      !href.startsWith('http') &&
      !href.startsWith('mailto:') &&
      !href.startsWith('tel:') &&
      prefetchStrategy !== 'none';

    // Get prefetch handlers based on strategy
    const prefetchHandlers = (shouldPrefetch
      ? createSmartLink(href, prefetchStrategy === 'intersection' ? 'intersection' : 'hover')
      : {}) as { onMouseEnter?: () => void; ref?: (node: HTMLElement | null) => void };

    // Handle immediate prefetching
    if (shouldPrefetch && prefetchStrategy === 'immediate') {
      // This will be handled by the useCriticalPrefetch hook at the page level
    }

    if (disabled) {
      return (
        <span
          className={cn(
            'cursor-not-allowed opacity-50',
            className
          )}
          ref={ref as React.Ref<HTMLSpanElement>}
        >
          {children}
        </span>
      );
    }

    return (
      <Link
        href={href}
        ref={ref}
        className={className}
        {...props}
        {...(prefetchStrategy === 'hover' ? {
          onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => {
            setTimeout(() => {
              if (prefetchHandlers.onMouseEnter) {
                prefetchHandlers.onMouseEnter();
              }
            }, prefetchDelay);

            // Call original onMouseEnter if provided
            if (props.onMouseEnter) {
              props.onMouseEnter(e);
            }
          }
        } : {})}
      >
        {children}
      </Link>
    );
  }
);

SmartLink.displayName = 'SmartLink';

/**
 * Smart Button Link - Combines Button styling with Smart Link functionality
 */
interface SmartButtonLinkProps extends SmartLinkProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'cta' | 'ctaSecondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const SmartButtonLink = forwardRef<HTMLAnchorElement, SmartButtonLinkProps>(
  ({ variant = 'default', size = 'default', className, ...props }, ref) => {
    const buttonVariants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
      cta: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl',
      ctaSecondary: 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl',
    };

    const buttonSizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };

    return (
      <SmartLink
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

SmartButtonLink.displayName = 'SmartButtonLink';

/**
 * Navigation Link - Optimized for navigation menus
 */
interface NavLinkProps extends SmartLinkProps {
  isActive?: boolean;
  showActiveIndicator?: boolean;
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ isActive = false, showActiveIndicator = true, className, children, ...props }, ref) => {
    return (
      <SmartLink
        ref={ref}
        className={cn(
          'relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary',
          isActive ? 'text-primary' : 'text-muted-foreground',
          className
        )}
        prefetchStrategy="hover"
        prefetchDelay={50}
        {...props}
      >
        {children}
        {showActiveIndicator && isActive && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
        )}
      </SmartLink>
    );
  }
);

NavLink.displayName = 'NavLink';

/**
 * Card Link - For clickable cards with prefetching
 */
interface CardLinkProps extends SmartLinkProps {
  hover?: boolean;
}

export const CardLink = forwardRef<HTMLAnchorElement, CardLinkProps>(
  ({ hover = true, className, ...props }, ref) => {
    return (
      <SmartLink
        ref={ref}
        className={cn(
          'block rounded-lg transition-all duration-200',
          hover && 'hover:shadow-lg hover:-translate-y-1',
          className
        )}
        prefetchStrategy="intersection"
        {...props}
      />
    );
  }
);

CardLink.displayName = 'CardLink';
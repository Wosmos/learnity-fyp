/**
 * AsyncButton Component
 * Button with built-in loading state management for async operations
 * Automatically shows loading spinner and disables during async operations
 */

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AsyncButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  /** Async function to execute on click */
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement>
  ) => Promise<void> | void;
  /** Loading state - can be controlled externally */
  isLoading?: boolean;
  /** Text to show when loading */
  loadingText?: string;
  /** Icon to show when loading (defaults to Loader2) */
  loadingIcon?: React.ReactNode;
  /** Whether to show loading icon */
  showLoadingIcon?: boolean;
  /** Additional class for loading state */
  loadingClassName?: string;
  asChild?: boolean;
}

export const AsyncButton = React.forwardRef<
  HTMLButtonElement,
  AsyncButtonProps
>(
  (
    {
      className,
      variant,
      size,
      onClick,
      isLoading: externalLoading,
      loadingText,
      loadingIcon,
      showLoadingIcon = true,
      loadingClassName,
      disabled,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const [internalLoading, setInternalLoading] = React.useState(false);

    // Use external loading state if provided, otherwise use internal
    const isLoading =
      externalLoading !== undefined ? externalLoading : internalLoading;

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || disabled) {
        event.preventDefault();
        return;
      }

      if (!onClick) return;

      // If external loading is controlled, don't manage internal state
      if (externalLoading === undefined) {
        setInternalLoading(true);
      }

      try {
        await onClick(event);
      } finally {
        if (externalLoading === undefined) {
          setInternalLoading(false);
        }
      }
    };

    const LoadingIcon = loadingIcon || (
      <Loader2 className='h-4 w-4 animate-spin' />
    );

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(className, isLoading && loadingClassName)}
        onClick={handleClick}
        disabled={disabled || isLoading}
        asChild={asChild}
        {...props}
      >
        {isLoading ? (
          <>
            {showLoadingIcon && <span className='mr-2'>{LoadingIcon}</span>}
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

AsyncButton.displayName = 'AsyncButton';

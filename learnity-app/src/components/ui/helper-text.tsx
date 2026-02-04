/**
 * Helper Text Component
 * Displays helper text, error messages, or hints below form inputs
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface HelperTextProps extends React.ComponentProps<'p'> {
  error?: boolean;
  success?: boolean;
}

function HelperText({
  className,
  error = false,
  success = false,
  ...props
}: HelperTextProps) {
  return (
    <p
      className={cn(
        'text-sm mt-1.5',
        error && 'text-destructive',
        success && 'text-success-600',
        !error && !success && 'text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export { HelperText };

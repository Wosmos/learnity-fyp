'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryContentProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  backHref?: string;
  backLabel?: string;
}

export function ErrorBoundaryContent({
  error,
  reset,
  title = 'Something went wrong',
  backHref,
  backLabel = 'Go back',
}: ErrorBoundaryContentProps) {
  return (
    <div className='min-h-[60vh] flex items-center justify-center px-4'>
      <div className='text-center space-y-6 max-w-md'>
        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10'>
          <AlertTriangle className='h-8 w-8 text-destructive' />
        </div>

        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold text-foreground'>{title}</h2>
          <p className='text-muted-foreground'>
            {process.env.NODE_ENV === 'development'
              ? error.message
              : 'An unexpected error occurred. Please try again.'}
          </p>
        </div>

        <div className='flex items-center justify-center gap-3'>
          <Button onClick={reset} variant='default'>
            <RefreshCw className='h-4 w-4' />
            Try again
          </Button>
          {backHref && (
            <Button variant='outline' asChild>
              <a href={backHref}>{backLabel}</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * useAsyncAction Hook
 * Manages loading states for async button actions with proper error handling
 * 
 * @example
 * const { execute, isLoading } = useAsyncAction(async () => {
 *   await someAsyncOperation();
 * });
 * 
 * <Button onClick={execute} disabled={isLoading}>
 *   {isLoading ? 'Loading...' : 'Click Me'}
 * </Button>
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAsyncActionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
}

export function useAsyncAction<T extends unknown[]>(
  action: (...args: T) => Promise<void>,
  options: UseAsyncActionOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    showToast = true,
  } = options;

  const execute = useCallback(
    async (...args: T) => {
      setIsLoading(true);
      setError(null);

      try {
        await action(...args);

        if (showToast && successMessage) {
          toast({
            title: 'Success',
            description: successMessage,
          });
        }

        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);

        if (showToast) {
          toast({
            title: 'Error',
            description: errorMessage || error.message,
            variant: 'destructive',
          });
        }

        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [action, onSuccess, onError, successMessage, errorMessage, showToast, toast]
  );

  return {
    execute,
    isLoading,
    error,
  };
}

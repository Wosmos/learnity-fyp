'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';

/**
 * Authenticated API query hook — replaces useEffect + useState + fetch pattern.
 * Data is cached, deduplicated, and automatically refetched when stale.
 *
 * Usage:
 *   const { data, isLoading } = useApiQuery(['enrollments'], '/api/enrollments');
 *   const { data } = useApiQuery(['wallet'], '/api/wallet', { staleTime: 30_000 });
 */
export function useApiQuery<T = unknown>(
  key: string[],
  url: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  const authenticatedFetch = useAuthenticatedFetch();

  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const res = await authenticatedFetch(url);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      return json.data ?? json;
    },
    ...options,
  });
}

/**
 * Authenticated API mutation hook with automatic cache invalidation.
 *
 * Usage:
 *   const mutation = useApiMutation('/api/wallet/deposit', {
 *     invalidateKeys: [['wallet']],
 *   });
 *   mutation.mutate({ amount: 1000 });
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  url: string,
  options?: {
    method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    invalidateKeys?: string[][];
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
  }
) {
  const authenticatedFetch = useAuthenticatedFetch();
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const res = await authenticatedFetch(url, {
        method: options?.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variables),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || `API error: ${res.status}`);
      }
      const json = await res.json();
      return json.data ?? json;
    },
    onSuccess: (data) => {
      // Invalidate related queries so they refetch with fresh data
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

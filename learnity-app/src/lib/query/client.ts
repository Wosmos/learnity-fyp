import { QueryClient } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 60s — won't refetch during this window
        staleTime: 60 * 1000,
        // Keep unused data in cache for 5 min before GC
        gcTime: 5 * 60 * 1000,
        // Retry failed requests once
        retry: 1,
        // Don't refetch on window focus in dev (annoying), do in prod
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  // Server: always create a new client (no sharing between requests)
  if (typeof window === 'undefined') return makeQueryClient();
  // Browser: reuse the same client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

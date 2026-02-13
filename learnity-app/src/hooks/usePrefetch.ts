/**
 * Client-side Prefetching Hook
 * Provides intelligent prefetching strategies for better UX
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface PrefetchOptions {
  strategy?: 'hover' | 'intersection' | 'idle' | 'immediate';
  delay?: number;
  threshold?: number;
}

/**
 * Hook for intelligent prefetching of routes and data
 */
export function usePrefetch() {
  const router = useRouter();
  const prefetchedRoutes = useRef(new Set<string>());

  const prefetchRoute = useCallback(
    (href: string) => {
      if (!prefetchedRoutes.current.has(href)) {
        router.prefetch(href);
        prefetchedRoutes.current.add(href);
      }
    },
    [router]
  );

  const prefetchOnHover = useCallback(
    (href: string, delay: number = 100) => {
      return {
        onMouseEnter: () => {
          setTimeout(() => prefetchRoute(href), delay);
        },
      };
    },
    [prefetchRoute]
  );

  const prefetchOnIntersection = useCallback(
    (href: string, options: IntersectionObserverInit = { threshold: 0.1 }) => {
      return useCallback(
        (node: HTMLElement | null) => {
          if (!node) return;

          const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                prefetchRoute(href);
                observer.disconnect();
              }
            });
          }, options);

          observer.observe(node);

          return () => observer.disconnect();
        },
        [href]
      );
    },
    [prefetchRoute]
  );

  const prefetchOnIdle = useCallback(
    (href: string) => {
      useEffect(() => {
        const prefetch = () => prefetchRoute(href);

        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(prefetch);
        } else {
          setTimeout(prefetch, 1000);
        }
      }, [href]);
    },
    [prefetchRoute]
  );

  return {
    prefetchRoute,
    prefetchOnHover,
    prefetchOnIntersection,
    prefetchOnIdle,
  };
}

/**
 * Hook for prefetching critical routes on page load
 */
export function useCriticalPrefetch(routes: string[]) {
  const { prefetchRoute } = usePrefetch();

  useEffect(() => {
    // Prefetch critical routes after a short delay
    const timer = setTimeout(() => {
      routes.forEach(route => prefetchRoute(route));
    }, 100);

    return () => clearTimeout(timer);
  }, [routes, prefetchRoute]);
}

/**
 * Hook for smart link prefetching based on user behavior
 */
export function useSmartPrefetch() {
  const { prefetchOnHover, prefetchOnIntersection } = usePrefetch();

  const createSmartLink = useCallback(
    (href: string, strategy: 'hover' | 'intersection' = 'hover') => {
      if (strategy === 'hover') {
        return prefetchOnHover(href);
      } else {
        const ref = prefetchOnIntersection(href);
        return { ref };
      }
    },
    [prefetchOnHover, prefetchOnIntersection]
  );

  return { createSmartLink };
}

/**
 * Hook for data prefetching with cache management
 */
export function useDataPrefetch() {
  const prefetchedData = useRef(new Map<string, any>());

  const prefetchData = useCallback(
    async (key: string, fetcher: () => Promise<any>) => {
      if (prefetchedData.current.has(key)) {
        return prefetchedData.current.get(key);
      }

      try {
        const data = await fetcher();
        prefetchedData.current.set(key, data);
        return data;
      } catch (error) {
        console.error(`Error prefetching data for key: ${key}`, error);
        return null;
      }
    },
    []
  );

  const getCachedData = useCallback((key: string) => {
    return prefetchedData.current.get(key);
  }, []);

  const clearCache = useCallback((key?: string) => {
    if (key) {
      prefetchedData.current.delete(key);
    } else {
      prefetchedData.current.clear();
    }
  }, []);

  return {
    prefetchData,
    getCachedData,
    clearCache,
  };
}

/**
 * Hook for performance monitoring of prefetching
 */
export function usePrefetchMetrics() {
  const metrics = useRef({
    prefetchCount: 0,
    hitCount: 0,
    missCount: 0,
    totalTime: 0,
  });

  const recordPrefetch = useCallback(() => {
    metrics.current.prefetchCount++;
  }, []);

  const recordHit = useCallback((time: number) => {
    metrics.current.hitCount++;
    metrics.current.totalTime += time;
  }, []);

  const recordMiss = useCallback(() => {
    metrics.current.missCount++;
  }, []);

  const getMetrics = useCallback(() => {
    const { prefetchCount, hitCount, missCount, totalTime } = metrics.current;
    return {
      prefetchCount,
      hitCount,
      missCount,
      hitRate: prefetchCount > 0 ? (hitCount / prefetchCount) * 100 : 0,
      averageTime: hitCount > 0 ? totalTime / hitCount : 0,
    };
  }, []);

  const resetMetrics = useCallback(() => {
    metrics.current = {
      prefetchCount: 0,
      hitCount: 0,
      missCount: 0,
      totalTime: 0,
    };
  }, []);

  return {
    recordPrefetch,
    recordHit,
    recordMiss,
    getMetrics,
    resetMetrics,
  };
}

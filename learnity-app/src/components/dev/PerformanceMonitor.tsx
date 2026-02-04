/**
 * Performance Monitor Component
 * Tracks and displays performance metrics for development
 * Only renders in development mode
 */

'use client';

import { useEffect, useState } from 'react';
import { usePrefetchMetrics } from '@/hooks/usePrefetch';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte

  // Custom metrics
  prefetchHitRate?: number;
  cacheHitRate?: number;
  totalPrefetches?: number;

  // Navigation timing
  domContentLoaded?: number;
  loadComplete?: number;

  // Memory usage (if available)
  memoryUsage?: {
    used: number;
    total: number;
  };
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isVisible, setIsVisible] = useState(false);
  const { getMetrics } = usePrefetchMetrics();

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const collectMetrics = () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const prefetchMetrics = getMetrics();

      // Get memory info if available
      const memoryInfo = (performance as any).memory;

      setMetrics({
        domContentLoaded:
          navigation?.domContentLoadedEventEnd -
          navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        ttfb: navigation?.responseStart - navigation?.requestStart,
        prefetchHitRate: prefetchMetrics.hitRate,
        totalPrefetches: prefetchMetrics.prefetchCount,
        memoryUsage: memoryInfo
          ? {
              used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024),
              total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024),
            }
          : undefined,
      });
    };

    // Collect initial metrics
    collectMetrics();

    // Set up Web Vitals observer
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'largest-contentful-paint':
              setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
              break;
            case 'first-input':
              setMetrics(prev => ({
                ...prev,
                fid: (entry as any).processingStart - entry.startTime,
              }));
              break;
            case 'layout-shift':
              if (!(entry as any).hadRecentInput) {
                setMetrics(prev => ({
                  ...prev,
                  cls: (prev.cls || 0) + (entry as any).value,
                }));
              }
              break;
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
              }
              break;
          }
        }
      });

      observer.observe({
        entryTypes: [
          'largest-contentful-paint',
          'first-input',
          'layout-shift',
          'paint',
        ],
      });

      return () => observer.disconnect();
    }

    // Update metrics periodically
    const interval = setInterval(collectMetrics, 5000);
    return () => clearInterval(interval);
  }, [getMetrics]);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') return null;

  const formatTime = (time?: number) => {
    if (!time) return 'N/A';
    return `${Math.round(time)}ms`;
  };

  const getScoreColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'text-green-600';
    if (value <= thresholds[1]) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className='bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-mono hover:bg-gray-800 transition-colors'
      >
        {isVisible ? '📊 Hide' : '📊 Perf'}
      </button>

      {isVisible && (
        <div className='absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 text-xs font-mono'>
          <div className='flex justify-between items-center mb-3'>
            <h3 className='font-bold text-gray-900'>Performance Metrics</h3>
            <button
              onClick={() => setIsVisible(false)}
              className='text-gray-500 hover:text-gray-700'
            >
              ✕
            </button>
          </div>

          <div className='space-y-2'>
            {/* Core Web Vitals */}
            <div className='border-b border-gray-100 pb-2'>
              <h4 className='font-semibold text-gray-700 mb-1'>
                Core Web Vitals
              </h4>
              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <span className='text-gray-500'>LCP:</span>
                  <span
                    className={`ml-1 ${metrics.lcp ? getScoreColor(metrics.lcp, [2500, 4000]) : ''}`}
                  >
                    {formatTime(metrics.lcp)}
                  </span>
                </div>
                <div>
                  <span className='text-gray-500'>FID:</span>
                  <span
                    className={`ml-1 ${metrics.fid ? getScoreColor(metrics.fid, [100, 300]) : ''}`}
                  >
                    {formatTime(metrics.fid)}
                  </span>
                </div>
                <div>
                  <span className='text-gray-500'>CLS:</span>
                  <span
                    className={`ml-1 ${metrics.cls ? getScoreColor(metrics.cls * 1000, [100, 250]) : ''}`}
                  >
                    {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className='text-gray-500'>FCP:</span>
                  <span
                    className={`ml-1 ${metrics.fcp ? getScoreColor(metrics.fcp, [1800, 3000]) : ''}`}
                  >
                    {formatTime(metrics.fcp)}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Timing */}
            <div className='border-b border-gray-100 pb-2'>
              <h4 className='font-semibold text-gray-700 mb-1'>Navigation</h4>
              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <span className='text-gray-500'>TTFB:</span>
                  <span className='ml-1'>{formatTime(metrics.ttfb)}</span>
                </div>
                <div>
                  <span className='text-gray-500'>DCL:</span>
                  <span className='ml-1'>
                    {formatTime(metrics.domContentLoaded)}
                  </span>
                </div>
                <div>
                  <span className='text-gray-500'>Load:</span>
                  <span className='ml-1'>
                    {formatTime(metrics.loadComplete)}
                  </span>
                </div>
              </div>
            </div>

            {/* Prefetch Metrics */}
            <div className='border-b border-gray-100 pb-2'>
              <h4 className='font-semibold text-gray-700 mb-1'>Prefetching</h4>
              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <span className='text-gray-500'>Hit Rate:</span>
                  <span className='ml-1'>
                    {metrics.prefetchHitRate
                      ? `${Math.round(metrics.prefetchHitRate)}%`
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className='text-gray-500'>Total:</span>
                  <span className='ml-1'>{metrics.totalPrefetches || 0}</span>
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            {metrics.memoryUsage && (
              <div>
                <h4 className='font-semibold text-gray-700 mb-1'>Memory</h4>
                <div>
                  <span className='text-gray-500'>Used:</span>
                  <span className='ml-1'>{metrics.memoryUsage.used}MB</span>
                  <span className='text-gray-400 ml-1'>
                    / {metrics.memoryUsage.total}MB
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-1 mt-1'>
                  <div
                    className='bg-blue-600 h-1 rounded-full'
                    style={{
                      width: `${(metrics.memoryUsage.used / metrics.memoryUsage.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className='mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500'>
            Updates every 5s • Dev only
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Performance Provider - Wraps the app to provide performance context
 */
export function PerformanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <PerformanceMonitor />
    </>
  );
}

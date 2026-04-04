/**
 * In-memory rate limiter using a Map with automatic TTL cleanup.
 * No external dependencies — works on single-instance deployments (Vercel, etc.).
 *
 * Usage:
 *   const limiter = createRateLimiter({ limit: 60, windowMs: 60_000 });
 *   const result = limiter.check(ip);
 *   if (!result.allowed) return new Response('Too many requests', { status: 429 });
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimiterConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function createRateLimiter({ limit, windowMs }: RateLimiterConfig) {
  const store = new Map<string, RateLimitEntry>();

  // Cleanup expired entries every 60 seconds to prevent memory growth
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 60_000);

  // Allow garbage collection if the module is unloaded
  if (typeof cleanup === 'object' && 'unref' in cleanup) {
    cleanup.unref();
  }

  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      const entry = store.get(key);

      // New key or expired window — reset
      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
      }

      // Within window — increment
      entry.count++;

      if (entry.count > limit) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt };
      }

      return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
    },

    /** Get current stats (for debugging/monitoring) */
    get size() {
      return store.size;
    },
  };
}

// ─── Pre-configured limiters for different route types ──────

/** Auth endpoints: 10 requests per minute per IP */
export const authLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

/** Write endpoints (POST/PUT/DELETE): 30 requests per minute per IP */
export const writeLimiter = createRateLimiter({ limit: 30, windowMs: 60_000 });

/** Read endpoints (GET): 100 requests per minute per IP */
export const readLimiter = createRateLimiter({ limit: 100, windowMs: 60_000 });

/** Global fallback: 200 requests per minute per IP */
export const globalLimiter = createRateLimiter({ limit: 200, windowMs: 60_000 });

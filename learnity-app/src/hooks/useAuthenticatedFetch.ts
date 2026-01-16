import { useCallback, useMemo } from 'react';
import { useAuth } from './useAuth.unified';

interface AuthenticatedFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

// Simple in-memory cache for API responses
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 1 minute default cache

export function useAuthenticatedFetch() {
  const { user, loading } = useAuth();

  const authenticatedFetch = useCallback(async (
    url: string, 
    options: AuthenticatedFetchOptions = {}
  ): Promise<Response> => {
    const { skipAuth = false, headers = {}, ...restOptions } = options;

    // Check if user is authenticated when auth is required
    if (!skipAuth && !user) {
      console.error('[useAuthenticatedFetch] No authenticated user found for', url);
      throw new Error('Authentication required');
    }

    // Get Firebase ID token if user is authenticated and auth is not skipped
    let authHeaders = {};
    if (!skipAuth && user) {
      try {
        // Use cached token if possible (don't force refresh every time)
        const idToken = await user.getIdToken(false);
        authHeaders = {
          'Authorization': `Bearer ${idToken}`,
        };
      } catch (error) {
        console.error('[useAuthenticatedFetch] Failed to get ID token:', error);
        // Try one more time forcing refresh if the cached one failed
        try {
          const idToken = await user.getIdToken(true);
          authHeaders = {
            'Authorization': `Bearer ${idToken}`,
          };
        } catch (retryError) {
          console.error('[useAuthenticatedFetch] Failed to get ID token on retry:', retryError);
          throw new Error('Authentication failed - unable to get valid token');
        }
      }
    }

    // Merge headers
    const finalHeaders: HeadersInit = {
      ...(headers as Record<string, string>),
      ...authHeaders,
    };
    
    // Only add Content-Type if not FormData
    if (!(restOptions.body instanceof FormData) && typeof finalHeaders === 'object' && !Array.isArray(finalHeaders)) {
      (finalHeaders as Record<string, string>)['Content-Type'] = 'application/json';
    }

    // Make the request
    const response = await fetch(url, {
      ...restOptions,
      headers: finalHeaders,
    });

    // Handle authentication errors
    if (response.status === 401) {
      // Try to refresh token and retry once
      if (!skipAuth && user) {
        try {
          const idToken = await user.getIdToken(true);
          const retryHeaders = {
            ...finalHeaders,
            'Authorization': `Bearer ${idToken}`,
          };
          
          const retryResponse = await fetch(url, {
            ...restOptions,
            headers: retryHeaders,
          });
          
          if (retryResponse.ok || retryResponse.status !== 401) {
            return retryResponse;
          }
        } catch (error) {
          console.error('[useAuthenticatedFetch] Token refresh failed:', error);
        }
      }
      throw new Error('Authentication required');
    }

    return response;
  }, [user, loading]);

  return authenticatedFetch;
}

/**
 * Convenience hook for making authenticated API calls with JSON responses
 * OPTIMIZED: Added simple in-memory caching for GET requests
 */
export function useAuthenticatedApi() {
  const authenticatedFetch = useAuthenticatedFetch();
  const pendingRequests = useRef<Map<string, Promise<any>>>(new Map());

  const get = useCallback(async (url: string, options?: { skipCache?: boolean; cacheDuration?: number }) => {
    const { skipCache = false, cacheDuration = CACHE_DURATION } = options || {};
    
    // Check cache first for GET requests
    if (!skipCache) {
      const cached = apiCache.get(url);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        return cached.data;
      }
    }
    
    // Deduplicate concurrent requests to the same URL
    const pending = pendingRequests.current.get(url);
    if (pending) {
      return pending;
    }
    
    const requestPromise = (async () => {
      try {
        const response = await authenticatedFetch(url, { method: 'GET' });
        if (!response.ok) {
          throw new Error(`GET ${url} failed: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Cache the response
        if (!skipCache) {
          apiCache.set(url, { data, timestamp: Date.now() });
        }
        
        return data;
      } finally {
        pendingRequests.current.delete(url);
      }
    })();
    
    pendingRequests.current.set(url, requestPromise);
    return requestPromise;
  }, [authenticatedFetch]);

  const post = useCallback(async (url: string, data?: any) => {
    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`POST ${url} failed: ${response.statusText}`);
    }
    
    // Invalidate related cache entries on POST
    invalidateCache(url);
    
    return response.json();
  }, [authenticatedFetch]);

  const put = useCallback(async (url: string, data?: any) => {
    const response = await authenticatedFetch(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`PUT ${url} failed: ${response.statusText}`);
    }
    
    // Invalidate related cache entries on PUT
    invalidateCache(url);
    
    return response.json();
  }, [authenticatedFetch]);

  const del = useCallback(async (url: string) => {
    const response = await authenticatedFetch(url, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`DELETE ${url} failed: ${response.statusText}`);
    }
    
    // Invalidate related cache entries on DELETE
    invalidateCache(url);
    
    return response.json();
  }, [authenticatedFetch]);

  // Memoize the API object to prevent infinite re-render loops in components
  return useMemo(() => {
    console.debug('[useAuthenticatedApi] Creating new API object');
    return {
      get,
      post,
      put,
      delete: del,
      fetch: authenticatedFetch,
    };
  }, [get, post, put, del, authenticatedFetch]);
}
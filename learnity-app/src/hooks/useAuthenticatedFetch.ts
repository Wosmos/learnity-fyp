
import { useCallback } from 'react';
import { useAuth } from './useAuth.unified';

interface AuthenticatedFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export function useAuthenticatedFetch() {
  const { user, loading } = useAuth();

  const authenticatedFetch = useCallback(async (
    url: string, 
    options: AuthenticatedFetchOptions = {}
  ): Promise<Response> => {
    const { skipAuth = false, headers = {}, ...restOptions } = options;

    // Wait for auth to be ready if still loading
    if (!skipAuth && loading) {
      throw new Error('Authentication is still loading');
    }

    // Check if user is authenticated when auth is required
    if (!skipAuth && !user) {
      console.error('No authenticated user found');
      throw new Error('Authentication required');
    }

    // Get Firebase ID token if user is authenticated and auth is not skipped
    let authHeaders = {};
    if (!skipAuth && user) {
      try {
        // Force token refresh to ensure it's valid
        const idToken = await user.getIdToken(true);
        authHeaders = {
          'Authorization': `Bearer ${idToken}`,
        };
      } catch (error) {
        console.error('Failed to get ID token:', error);
        // Try one more time without forcing refresh
        try {
          const idToken = await user.getIdToken(false);
          authHeaders = {
            'Authorization': `Bearer ${idToken}`,
          };
        } catch (retryError) {
          console.error('Failed to get ID token on retry:', retryError);
          throw new Error('Authentication failed - unable to get valid token');
        }
      }
    }

    // Merge headers
    // Don't set Content-Type for FormData (browser will set it with boundary)
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
      console.error('Authentication failed - server returned 401');
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
          console.error('Token refresh failed:', error);
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
 */
export function useAuthenticatedApi() {
  const authenticatedFetch = useAuthenticatedFetch();

  const get = useCallback(async (url: string) => {
    const response = await authenticatedFetch(url, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`GET ${url} failed: ${response.statusText}`);
    }
    return response.json();
  }, [authenticatedFetch]);

  const post = useCallback(async (url: string, data?: any) => {
    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`POST ${url} failed: ${response.statusText}`);
    }
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
    return response.json();
  }, [authenticatedFetch]);

  const del = useCallback(async (url: string) => {
    const response = await authenticatedFetch(url, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`DELETE ${url} failed: ${response.statusText}`);
    }
    return response.json();
  }, [authenticatedFetch]);

  return {
    get,
    post,
    put,
    delete: del,
    fetch: authenticatedFetch,
  };
}
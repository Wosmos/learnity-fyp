/**
 * Authenticated Fetch Hook
 * Provides a fetch wrapper that automatically includes authentication headers
 */

import { useCallback } from 'react';
import { useClientAuth } from './useClientAuth';

interface AuthenticatedFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export function useAuthenticatedFetch() {
  const { user } = useClientAuth();

  const authenticatedFetch = useCallback(async (
    url: string, 
    options: AuthenticatedFetchOptions = {}
  ): Promise<Response> => {
    const { skipAuth = false, headers = {}, ...restOptions } = options;

    // Get Firebase ID token if user is authenticated and auth is not skipped
    let authHeaders = {};
    if (!skipAuth && user) {
      try {
        const idToken = await user.getIdToken();
        authHeaders = {
          'Authorization': `Bearer ${idToken}`,
        };
      } catch (error) {
        console.error('Failed to get ID token:', error);
        throw new Error('Authentication failed');
      }
    }

    // Merge headers
    const finalHeaders = {
      'Content-Type': 'application/json',
      ...headers,
      ...authHeaders,
    };

    // Make the request
    const response = await fetch(url, {
      ...restOptions,
      headers: finalHeaders,
    });

    // Handle authentication errors
    if (response.status === 401) {
      console.error('Authentication failed - redirecting to login');
      // In a real app, you might want to redirect to login or refresh the token
      throw new Error('Authentication required');
    }

    return response;
  }, [user]);

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
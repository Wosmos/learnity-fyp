/**
 * Auth Debug Info Component
 * Temporary component to help debug authentication issues in production
 * Remove this after fixing the auth issue
 */

'use client';

import { useClientAuth } from '@/hooks/useClientAuth';
import { useEffect, useState } from 'react';

export function AuthDebugInfo() {
  const { user, loading, isAuthenticated, claims } = useClientAuth();
  const [debugInfo, setDebugInfo] = useState<unknown>(null);

  useEffect(() => {
    const updateDebugInfo = async () => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          setDebugInfo({
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            customClaims: idTokenResult.claims,
            isAuthenticated,
            claims,
            loading,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          setDebugInfo({
            error: error instanceof Error ? error.message : 'Unknown error',
            isAuthenticated,
            claims,
            loading,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        setDebugInfo({
          user: null,
          isAuthenticated,
          claims,
          loading,
          timestamp: new Date().toISOString()
        });
      }
    };

    updateDebugInfo();
  }, [user, isAuthenticated, claims, loading]);

  // Only show in development or when there's an issue
  if (process.env.NODE_ENV === 'production' && isAuthenticated && claims) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <pre className="whitespace-pre-wrap overflow-auto max-h-60">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 bg-slate-600 text-white px-2 py-1 rounded text-xs"
      >
        Refresh Page
      </button>
    </div>
  );
}
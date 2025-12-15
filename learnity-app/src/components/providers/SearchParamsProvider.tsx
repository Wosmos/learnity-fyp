/**
 * SearchParams Provider
 * Reusable Suspense wrapper for components using useSearchParams()
 */

'use client';

import { Suspense, ReactNode } from 'react';

interface SearchParamsProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SearchParamsProvider({ 
  children, 
  fallback = <LoadingFallback /> 
}: SearchParamsProviderProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

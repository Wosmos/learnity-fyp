/**
 * Application Providers
 * Wraps the entire application with necessary providers for authentication, state management, etc.
 */

'use client';

import React from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';

export interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
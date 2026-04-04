/**
 * Application Providers
 * Wraps the entire application with necessary providers for authentication, theming, etc.
 */

'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { QueryProvider } from '@/lib/query/QueryProvider';

export interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute='class'
        defaultTheme='light'
        disableTransitionOnChange
      >
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

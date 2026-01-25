/**
 * Auth Redirect Handler - Client Component
 * Handles authentication redirects without blocking the main page render
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';

export function AuthRedirectHandler() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, claims } = useAuthContext();

  useEffect(() => {
    // Only redirect if user is authenticated and not loading
    if (!isLoading && isAuthenticated && user && claims) {
      // Determine redirect based on user role
      const role = claims.role;

      switch (role) {
        case 'ADMIN':
          router.push('/admin');
          break;
        case 'TEACHER':
          router.push('/dashboard/teacher');
          break;
        case 'STUDENT':
          router.push('/dashboard/student');
          break;
        case 'PENDING_TEACHER':
          router.push('/dashboard/teacher/pending');
          break;
        default:
          // Stay on landing page for unknown roles
          break;
      }
    }
  }, [isAuthenticated, isLoading, user, claims, router]);

  // This component doesn't render anything - it just handles redirects
  return null;
}

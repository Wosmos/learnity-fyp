'use client';

/**
 * Main Dashboard Page
 * Redirects authenticated users to their role-specific dashboard
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getDashboardRoute } from '@/lib/utils/auth-redirect.utils';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, loading, claims } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Not authenticated - redirect to login
      router.replace('/auth/login');
      return;
    }

    if (!user.emailVerified) {
      router.replace('/auth/verify-email');
      return;
    }

    if (claims?.role) {
      // Redirect to role-specific dashboard
      const dashboardRoute = getDashboardRoute(claims.role);
      router.replace(dashboardRoute);
    }
  }, [user, loading, claims, router]);

  // Show loading state while redirecting
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardContent className='pt-6'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Loading Dashboard
            </h3>
            <p className='text-gray-500'>Taking you to your dashboard...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

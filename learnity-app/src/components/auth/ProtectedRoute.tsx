'use client';

/**
 * Unified Protected Route Component
 * Simplified role-based access control with immediate redirects
 * Replaces the over-engineered individual protection components
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { Card, CardContent } from '@/components/ui/card';
import { getDashboardRoute } from '@/lib/utils/auth-redirect.utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Single unified protected route component
 * Handles all role-based access control in one place
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  fallback,
}: ProtectedRouteProps) {
  const { user, loading, claims } = useAuth();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // Not authenticated - redirect to login
    if (!user) {
      const currentPath = window.location.pathname;
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
      router.replace(loginUrl);
      return;
    }

    // No claims yet - wait for them
    if (!claims?.role) {
      console.warn('User authenticated but no role claims found');
      return;
    }

    // Check if user has required role
    const userRole = claims.role;
    const hasRequiredRole = allowedRoles.includes(userRole);

    if (hasRequiredRole) {
      setHasAccess(true);
    } else {
      // User doesn't have access - redirect to their correct dashboard
      console.log(
        `Access denied. User role: ${userRole}, Required: ${allowedRoles.join(', ')}`
      );
      const correctDashboard = getDashboardRoute(userRole);
      router.replace(correctDashboard);
    }
  }, [user, loading, claims, allowedRoles, router]);

  // Show loading state
  if (loading || !user || !claims) {
    return fallback || <LoadingFallback />;
  }

  // Show access denied briefly before redirect
  if (!hasAccess) {
    return <RedirectingFallback />;
  }

  // User has access - render children
  return <>{children}</>;
}

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardContent className='pt-6'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Verifying Access
            </h3>
            <p className='text-gray-500'>Checking your permissions...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Redirecting fallback component
 */
function RedirectingFallback() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardContent className='pt-6'>
          <div className='text-center'>
            <AlertTriangle className='h-12 w-12 text-orange-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Redirecting
            </h3>
            <p className='text-gray-500'>Taking you to your dashboard...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Convenience components for specific roles
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>{children}</ProtectedRoute>
  );
}

export function TeacherRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute
      allowedRoles={[
        UserRole.TEACHER,
        UserRole.PENDING_TEACHER,
        UserRole.ADMIN,
      ]}
    >
      {children}
    </ProtectedRoute>
  );
}

export function StudentRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
      {children}
    </ProtectedRoute>
  );
}

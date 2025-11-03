'use client';

/**
 * Admin Protected Route Component
 * Ensures only authenticated admin users can access admin pages
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminProtectedRoute({ children, fallback }: AdminProtectedRouteProps) {
  const { user, loading, claims } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/auth/login?redirect=/admin');
        return;
      }

      if (!claims || claims.role !== UserRole.ADMIN) {
        // Redirect to unauthorized page if not admin
        router.push('/unauthorized');
        return;
      }

      setIsChecking(false);
    }
  }, [user, loading, claims, router]);

  if (loading || isChecking) {
    return fallback || <AdminLoadingFallback />;
  }

  if (!user) {
    return <AdminAuthRequiredFallback />;
  }

  if (!claims || claims.role !== UserRole.ADMIN) {
    return <AdminUnauthorizedFallback />;
  }

  return <>{children}</>;
}

/**
 * Loading fallback component
 */
function AdminLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Verifying Access</h3>
            <p className="text-gray-500">
              Checking your admin permissions...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Authentication required fallback
 */
function AdminAuthRequiredFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-500 mb-4">
              You need to be logged in to access the admin panel.
            </p>
            <p className="text-sm text-gray-400">
              Redirecting to login...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Unauthorized access fallback
 */
function AdminUnauthorizedFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500 mb-4">
              You don't have permission to access the admin panel.
            </p>
            <p className="text-sm text-gray-400">
              Admin privileges required.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
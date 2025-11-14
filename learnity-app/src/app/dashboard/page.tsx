'use client';

/**
 * Dashboard Router
 * Redirects users to appropriate dashboard based on their role and profile completion
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClientAuth } from '@/hooks/useClientAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Loader2 } from 'lucide-react';
import { UserRole } from '@/types/auth';

export default function DashboardPage() {
  const { user, loading, isAuthenticated, claims } = useClientAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      // Not authenticated, redirect to login
      router.push('/auth/login?redirect=/dashboard');
      return;
    }

    // Check if user has completed profile setup
    const redirectToRoleDashboard = async () => {
      try {
        // Get user's custom claims to determine role and profile status
        let userRole = claims?.role;
        
        // If claims not available, try to get from Firebase token
        if (!userRole) {
          const idTokenResult = await user.getIdTokenResult();
          userRole = idTokenResult.claims.role as UserRole;
        }

        console.log('User role:', userRole);

        // Redirect based on role
        switch (userRole) {
          case UserRole.ADMIN:
            router.push('/dashboard/admin');
            break;
          case UserRole.TEACHER:
            router.push('/dashboard/teacher');
            break;
          case UserRole.STUDENT:
            router.push('/dashboard/student');
            break;
          case UserRole.PENDING_TEACHER:
            router.push('/dashboard/teacher/pending');
            break;
          case UserRole.REJECTED_TEACHER:
            router.push('/dashboard/teacher/rejected');
            break;
          default:
            // If no role is set, user needs to complete onboarding
            console.log('No role found, redirecting to welcome');
            router.push('/welcome');
        }

      } catch (error) {
        console.error('Error checking profile completion:', error);
        // If there's an error getting claims, assume user needs onboarding
        router.push('/welcome');
      }
    };

    redirectToRoleDashboard();
  }, [user, loading, isAuthenticated, claims, router]);

  // Show loading state while determining where to redirect
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-blue-600 rounded-lg mr-3">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Setting up your dashboard...
              </h3>
              <p className="text-gray-500">
                We're preparing your personalized experience
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
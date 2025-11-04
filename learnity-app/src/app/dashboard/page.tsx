'use client';

/**
 * Dashboard Router
 * Redirects users to appropriate dashboard based on their role and profile completion
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClientAuth } from '@/hooks/useClientAuth';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, isAdmin } = useClientAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Not authenticated, redirect to login
      router.push('/auth/login');
      return;
    }

    // Check if user has completed profile setup
    const checkProfileCompletion = async () => {
      try {
        // Get user's custom claims to determine role and profile status
        const idTokenResult = await user.getIdTokenResult();
        const claims = idTokenResult.claims;

        console.log('User claims:', claims);

        // If user has admin role, redirect to admin dashboard
        if (claims.role === 'ADMIN' || isAdmin) {
          router.push('/admin');
          return;
        }

        // If user has a role set, redirect to role-specific dashboard
        if (claims.role === 'STUDENT') {
          router.push('/dashboard/student');
          return;
        }

        if (claims.role === 'TEACHER') {
          router.push('/dashboard/teacher');
          return;
        }

        if (claims.role === 'PENDING_TEACHER') {
          router.push('/dashboard/pending-teacher');
          return;
        }

        // If no role is set, user needs to complete onboarding
        console.log('No role found, redirecting to welcome');
        router.push('/welcome');

      } catch (error) {
        console.error('Error checking profile completion:', error);
        // If there's an error getting claims, assume user needs onboarding
        router.push('/welcome');
      }
    };

    checkProfileCompletion();
  }, [user, loading, isAdmin, router]);

  // Show loading state while determining where to redirect
  return (
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
  );
}
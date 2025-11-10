/**
 * Login Page
 * Dedicated login page with proper redirect handling
 */

"use client";

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth";
import { useAuthService } from "@/hooks/useAuthService";
import { useClientAuth } from "@/hooks/useClientAuth";
import { PublicLayout } from "@/components/layout/AppLayout";
import { UserRole } from "@/types/auth";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const { login, socialLogin } = useAuthService();
  const { isAuthenticated, claims } = useClientAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const getDashboardRoute = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.TEACHER:
        return '/dashboard/teacher';
      case UserRole.STUDENT:
        return '/dashboard/student';
      case UserRole.PENDING_TEACHER:
        return '/application/status';
      default:
        return '/dashboard';
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && claims?.role) {
      // Redirect to role-specific dashboard or the requested redirect URL
      const defaultDashboard = getDashboardRoute(claims.role);
      router.push(redirectTo === '/dashboard' ? defaultDashboard : redirectTo);
    }
  }, [isAuthenticated, claims, router, redirectTo]);

  const handleSuccessfulLogin = () => {
    // The useEffect above will handle the redirect
    // This is just a placeholder for any additional login success logic
  };

  const handleForgotPassword = () => {
    router.push("/auth/forgot-password");
  };

  const handleSignUp = () => {
    router.push("/auth/register");
  };

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
          <div className="text-center ">
            <p className="text-gray-600">Redirecting to your dashboard...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout showNavigation={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <LoginForm
          onSubmit={login}
          onForgotPassword={handleForgotPassword}
          onSignUp={handleSignUp}
          onSocialLogin={socialLogin}
          requireCaptcha={false}
        />
      </div>
    </PublicLayout>
  );
}

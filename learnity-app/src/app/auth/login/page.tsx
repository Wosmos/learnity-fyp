/**
 * Login Page
 * Dedicated login page with modern split-screen design
 */

'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { LoginForm } from '@/components/auth';
import { useAuthService } from '@/hooks/useAuthService';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { AuthDebugInfo } from '@/components/debug/AuthDebugInfo';
import { getDashboardRoute } from '@/lib/utils/auth-redirect.utils';
import { UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import LeftSideSection from '@/components/auth/LeftSideSection';

export const dynamic = 'force-dynamic';

function LoginPageContent() {
  const { login, socialLogin } = useAuthService();
  const { isAuthenticated, claims, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const getRedirectPath = (role: UserRole) => {
    const defaultDashboard = getDashboardRoute(role);
    return redirectTo === '/dashboard' ? defaultDashboard : redirectTo;
  };

  // Redirect if already authenticated (e.g., user navigates to login page while logged in)
  useEffect(() => {
    if (isAuthenticated && claims?.role) {
      if (user && !user.emailVerified) {
        router.push('/auth/verify-email');
        return;
      }
      router.push(getRedirectPath(claims.role));
    }
  }, [isAuthenticated, user, claims, router, redirectTo]);

  // Login handler that redirects directly after success
  const handleLogin = async (data: any) => {
    await login(data);
    // After login resolves, claims should be in the store
    const { claims: currentClaims, user: currentUser } = useAuthStore.getState();
    if (currentUser && !currentUser.emailVerified) {
      router.push('/auth/verify-email');
      return;
    }
    if (currentClaims?.role) {
      router.push(getRedirectPath(currentClaims.role));
    }
  };

  // Social login handler that redirects directly after success
  const handleSocialLogin = async (provider: 'google' | 'microsoft') => {
    try {
      await socialLogin(provider);
      const { claims: currentClaims, user: currentUser } = useAuthStore.getState();
      if (currentUser && !currentUser.emailVerified) {
        router.push('/auth/verify-email');
        return;
      }
      if (currentClaims?.role) {
        router.push(getRedirectPath(currentClaims.role));
      }
      // If claims aren't ready yet, the useEffect above will handle
      // the redirect once AuthProvider populates them.
    } catch {
      // Error is already set in the auth store by useAuthService —
      // the LoginForm will display it. No redirect needed.
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/auth/register');
  };

  // Show loading while auth state is initializing (prevents flash of login form)
  if (loading || isAuthenticated) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center p-4'>
        <div className='text-center space-y-4'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto'></div>
          <p className='text-slate-600 font-medium'>
            {isAuthenticated ? 'Redirecting to your dashboard...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen w-full flex'>
      {/* Left Panel - Branding & Visuals (Hidden on mobile) */}
      <LeftSideSection />

      {/* Right Panel - Login Form */}
      <div className='w-full lg:w-1/2 bg-white flex flex-col justify-center items-center p-8 lg:p-12 relative'>
        <Link
          href='/'
          className='group flex items-center gap-2.5 transition-transform active:scale-95 absolute top-8 left-8 lg:hidden'
        >
          <div className='p-2 bg-slate-900 rounded-xl group-hover:rotate-6 transition-transform flex items-center justify-center'>
            <Image src='/logo.svg' alt='Learnity' width={24} height={24} />
          </div>
          <span className='text-xl font-bold tracking-tighter text-slate-900'>
            Learnity
          </span>
        </Link>

        <div className='absolute top-8 right-8'>
          <Link href='/'>
            <Button
              variant='ghost'
              size='sm'
              className='text-slate-600 hover:text-slate-900'
            >
              <ArrowLeft className='h-4 w-4 mr-2 ' />
              <div className='hidden lg:block'>Back to Home</div>
            </Button>
          </Link>
        </div>

        <div className='w-full max-w-md space-y-8 pt-4'>
          <LoginForm
            onSubmit={handleLogin}
            onForgotPassword={handleForgotPassword}
            onSignUp={handleSignUp}
            onSocialLogin={handleSocialLogin}
            requireCaptcha={false}
            variant='simple'
            className='w-full max-w-none px-0'
          />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-slate-50 flex items-center justify-center p-4'>
          <div className='text-center space-y-4'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto'></div>
            <p className='text-slate-600'>Loading...</p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
      {process.env.NODE_ENV === 'development' && <AuthDebugInfo />}
    </Suspense>
  );
}

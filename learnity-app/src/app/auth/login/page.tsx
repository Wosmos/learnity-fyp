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

  // Redirect if already authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    if (loading) return; // Still loading — wait for claims to arrive

    if (user && !user.emailVerified) {
      router.push('/auth/verify-email');
      return;
    }

    if (claims?.role) {
      // Refresh the session cookie before redirecting.
      // This prevents the expired-cookie redirect loop: when a user lands
      // here because middleware rejected an expired JWT cookie, Firebase SDK
      // still has a valid user. We get a fresh token and update the cookie
      // so the middleware accepts the next request.
      const dest = getRedirectPath(claims.role);
      user
        ?.getIdToken()
        .then(token =>
          fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token }),
          })
        )
        .catch(() => {})
        .finally(() => router.push(dest));
      return;
    }

    // Loading is done and authenticated but no role — user has
    // incomplete setup (new social login) or claims fetch failed.
    // Send to /welcome which handles the "no role" state.
    router.push('/welcome');
  }, [isAuthenticated, user, claims, loading, router, redirectTo]);

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
    } else {
      // Claims not ready — the useEffect above will handle redirect once they arrive
      // or send to /welcome if role is truly missing
      router.push('/dashboard');
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

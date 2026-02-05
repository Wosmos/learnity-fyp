/**
 * Login Page
 * Dedicated login page with modern split-screen design
 */

'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, Star, Users, BookOpen } from 'lucide-react';
import { LoginForm } from '@/components/auth';
import { useAuthService } from '@/hooks/useAuthService';
import { useClientAuth } from '@/hooks/useClientAuth';
import { AuthDebugInfo } from '@/components/debug/AuthDebugInfo';
import { getDashboardRoute } from '@/lib/utils/auth-redirect.utils';
import { Button } from '@/components/ui/button';
import LeftSideSection from '@/components/auth/LeftSideSection';

export const dynamic = 'force-dynamic';

function LoginPageContent() {
  const { login, socialLogin } = useAuthService();
  const { isAuthenticated, claims, user } = useClientAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user && !user.emailVerified) {
        router.push('/auth/verify-email');
        return;
      }

      if (claims?.role) {
        // Redirect to role-specific dashboard or the requested redirect URL
        const defaultDashboard = getDashboardRoute(claims.role);
        router.push(redirectTo === '/dashboard' ? defaultDashboard : redirectTo);
      }
    }
  }, [isAuthenticated, user, claims, router, redirectTo]);

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/auth/register');
  };

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center p-4'>
        <div className='text-center space-y-4'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto'></div>
          <p className='text-slate-600 font-medium'>
            Redirecting to your dashboard...
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
            <img src='/logo.svg' alt='Learnity' className='h-6 w-6' />
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
            onSubmit={login}
            onForgotPassword={handleForgotPassword}
            onSignUp={handleSignUp}
            onSocialLogin={socialLogin}
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

/**
 * Forgot Password Page
 * Password reset request page
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { PasswordResetRequestForm } from '@/components/auth';
import { useAuthService } from '@/hooks/useAuthService';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import LedtSideSection from '@/components/auth/LedtSideSection';

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuthService();
  const router = useRouter();

  const handleSubmit = async (data: {
    email: string;
    hcaptchaToken: string;
  }) => {
    await requestPasswordReset(data);
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <AuthProvider>
      <div className='min-h-screen w-full flex'>
        <LedtSideSection />

        {/* Right Panel */}
        <div className='w-full lg:w-1/2 bg-white flex flex-col justify-center items-center p-8 lg:p-12 relative'>
          <Link href='/' className='absolute top-8 left-8 lg:hidden'>
            <div className='flex items-center space-x-2 text-slate-600'>
              <div className='p-2 bg-slate-100 rounded-lg'>
                <GraduationCap className='h-6 w-6 text-slate-900' />
              </div>
              <span className='text-xl font-bold text-slate-900'>Learnity</span>
            </div>
          </Link>

          <div className='absolute top-8 right-8'>
            <Link href='/'>
              <Button
                variant='ghost'
                size='sm'
                className='text-slate-600 hover:text-slate-900'
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className='w-full max-w-md space-y-8'>
            <PasswordResetRequestForm
              onSubmit={handleSubmit}
              onBackToLogin={handleBackToLogin}
              variant='simple'
              className='w-full max-w-none px-0'
            />
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

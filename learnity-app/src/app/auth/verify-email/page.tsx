'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { EmailVerificationPending } from '@/components/auth/EmailVerificationPending';
import { useAuthService } from '@/hooks/useAuthService';
import { useAuthStore } from '@/lib/stores/auth.store';
import { UserRole } from '@/types/auth';

export default function VerifyEmailPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuthContext();
  const { resendVerificationEmail } = useAuthService();
  const { selectedRole } = useAuthStore();
  const router = useRouter();
  console.log(user, 'user')

  // If user is verified, redirect them to their dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.emailVerified) {
      router.push('/');
    } else if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [user, isAuthenticated, isLoading, router]);

  const handleResend = async () => {
    await resendVerificationEmail();
  };

  const handleBackToLogin = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/auth/login');
    }
  };

  if (isLoading) {
    return null; // Or a loader
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <EmailVerificationPending
        userRole={selectedRole || UserRole.STUDENT}
        onResendVerification={handleResend}
        onBackToLogin={handleBackToLogin}
      />
    </div>
  );
}

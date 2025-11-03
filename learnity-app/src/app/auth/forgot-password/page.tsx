/**
 * Forgot Password Page
 * Password reset request page
 */

'use client';

import React from 'react';
import { PasswordResetRequestForm } from '@/components/auth';
import { useAuthService } from '@/hooks/useAuthService';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuthService();
  const router = useRouter();

  const handleSubmit = async (data: { email: string; hcaptchaToken: string }) => {
    await requestPasswordReset(data);
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <PasswordResetRequestForm
          onSubmit={handleSubmit}
          onBackToLogin={handleBackToLogin}
        />
      </div>
    </AuthProvider>
  );
}
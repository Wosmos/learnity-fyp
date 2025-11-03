/**
 * Authentication Page
 * Main authentication entry point with responsive design
 */

'use client';

import React from 'react';
import { ResponsiveAuthRouter } from '@/components/auth';
import { useAuthService } from '@/hooks/useAuthService';
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function AuthPage() {
  const {
    registerStudent,
    registerTeacher,
    login,
    socialLogin,
    requestPasswordReset,
    resetPassword
  } = useAuthService();

  const handlePasswordResetRequest = async (email: string) => {
    await requestPasswordReset({ email, hcaptchaToken: '' });
  };

  const handlePasswordReset = async (data: { password: string; token: string }) => {
    await resetPassword({ 
      password: data.password, 
      confirmPassword: data.password, 
      token: data.token 
    });
  };

  return (
    <AuthProvider>
      <ResponsiveAuthRouter
        onLogin={login}
        onStudentRegister={registerStudent}
        onTeacherRegister={registerTeacher}
        onSocialLogin={socialLogin}
        onPasswordResetRequest={handlePasswordResetRequest}
        onPasswordReset={handlePasswordReset}
        requireCaptcha={false} // Set to true in production
      />
    </AuthProvider>
  );
}
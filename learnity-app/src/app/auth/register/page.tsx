/**
 * Registration Page
 * Dedicated registration page with role selection
 */

'use client';

import React from 'react';
import { RegistrationFlow } from '@/components/auth';
import { useAuthService } from '@/hooks/useAuthService';
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function RegisterPage() {
  const { registerStudent, registerTeacher } = useAuthService();

  return (
    <AuthProvider>
      <RegistrationFlow
        onStudentRegister={registerStudent}
        onTeacherRegister={registerTeacher}
      />
    </AuthProvider>
  );
}
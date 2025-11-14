/**
 * Teacher Registration Page
 * Direct teacher registration without role selection
 */

'use client';

import { QuickTeacherRegistrationForm } from '@/components/auth/QuickTeacherRegistrationForm';
import { useAuthService } from '@/hooks/useAuthService';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { useAuthStore } from '@/lib/stores/auth.store';
import { UserRole } from '@/types/auth';
import { QuickTeacherRegistrationData } from '@/lib/validators/quick-teacher-registration';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeacherRegisterPage() {
  const { registerQuickTeacher } = useAuthService();
  const { setSelectedRole, setRegistrationStep } = useAuthStore();
  const router = useRouter();

  // Set teacher role and form step on mount
  useEffect(() => {
    setSelectedRole(UserRole.TEACHER);
    setRegistrationStep('form');
  }, [setSelectedRole, setRegistrationStep]);

  const handleTeacherSubmit = async (data: QuickTeacherRegistrationData) => {
    try {
      await registerQuickTeacher(data);
      setRegistrationStep('verification');
    } catch (error) {
      // Error handling is done in the form component
      throw error;
    }
  };

  const handleBack = () => {
    // Redirect to role selection if user wants to go back
    router.push('/auth/register');
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          <QuickTeacherRegistrationForm
            onSubmit={handleTeacherSubmit}
            onBack={handleBack}
          />
        </div>
      </div>
    </AuthProvider>
  );
}


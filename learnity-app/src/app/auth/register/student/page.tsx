/**
 * Student Registration Page
 * Direct student registration without role selection
 */

'use client';

import { StudentRegistrationForm } from '@/components/auth/StudentRegistrationForm';
import { useAuthService } from '@/hooks/useAuthService';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { useAuthStore } from '@/lib/stores/auth.store';
import { UserRole } from '@/types/auth';
import { StudentRegistrationData } from '@/lib/validators/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentRegisterPage() {
  const { registerStudent } = useAuthService();
  const { setSelectedRole, setRegistrationStep } = useAuthStore();
  const router = useRouter();

  // Set student role and form step on mount
  useEffect(() => {
    setSelectedRole(UserRole.STUDENT);
    setRegistrationStep('form');
  }, [setSelectedRole, setRegistrationStep]);

  const handleStudentSubmit = async (data: StudentRegistrationData) => {
    try {
      await registerStudent(data);
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
          <StudentRegistrationForm
            onSubmit={handleStudentSubmit}
            onBack={handleBack}
          />
        </div>
      </div>
    </AuthProvider>
  );
}


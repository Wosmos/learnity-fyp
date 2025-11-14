/**
 * Registration Flow Container Component
 * Manages the complete registration flow for all user roles
 */

'use client';

import React from 'react';
import { UserRole } from '@/types/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { StudentRegistrationData } from '@/lib/validators/auth';
import { QuickTeacherRegistrationData } from '@/lib/validators/quick-teacher-registration';
import RoleSelection from './RoleSelection';
import StudentRegistrationForm from './StudentRegistrationForm';
import QuickTeacherRegistrationForm from './QuickTeacherRegistrationForm';
import EmailVerificationPending from './EmailVerificationPending';

export interface RegistrationFlowProps {
  onStudentRegister: (data: StudentRegistrationData) => Promise<void>;
  onTeacherRegister: (data: QuickTeacherRegistrationData) => Promise<void>;
  className?: string;
}

export const RegistrationFlow: React.FC<RegistrationFlowProps> = ({
  onStudentRegister,
  onTeacherRegister,
  className = ''
}) => {
  const { 
    registrationStep, 
    selectedRole, 
    setRegistrationStep, 
    setSelectedRole 
  } = useAuthStore();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setRegistrationStep('form');
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
    setRegistrationStep('role-selection');
  };

  const handleStudentSubmit = async (data: StudentRegistrationData) => {
    try {
      await onStudentRegister(data);
      setRegistrationStep('verification');
    } catch (error) {
      // Error handling is done in the form component
      throw error;
    }
  };

  const handleTeacherSubmit = async (data: QuickTeacherRegistrationData) => {
    try {
      await onTeacherRegister(data);
      setRegistrationStep('verification');
    } catch (error) {
      // Error handling is done in the form component
      throw error;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {registrationStep === 'role-selection' && (
          <RoleSelection onRoleSelect={handleRoleSelect} />
        )}

        {registrationStep === 'form' && selectedRole === UserRole.STUDENT && (
          <StudentRegistrationForm
            onSubmit={handleStudentSubmit}
            onBack={handleBackToRoleSelection}
          />
        )}

        {registrationStep === 'form' && selectedRole === UserRole.TEACHER && (
          <QuickTeacherRegistrationForm
            onSubmit={handleTeacherSubmit}
            onBack={handleBackToRoleSelection}
          />
        )}

        {registrationStep === 'verification' && (
          <EmailVerificationPending
            userRole={selectedRole}
            onResendVerification={async () => {
              // TODO: Implement resend verification
              console.log('Resend verification email');
            }}
            onBackToLogin={() => {
              setRegistrationStep('role-selection');
              setSelectedRole(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default RegistrationFlow;
/**
 * Mobile-Optimized Registration Flow Component
 * Touch-friendly registration with step-by-step navigation
 */

'use client';

import React, { useState } from 'react';
import { UserRole } from '@/types/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { StudentRegistrationData, TeacherRegistrationData } from '@/lib/validators/auth';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import MobileAuthLayout from './MobileAuthLayout';
import RoleSelection from './RoleSelection';
import StudentRegistrationForm from './StudentRegistrationForm';
import TeacherRegistrationForm from './TeacherRegistrationForm';
import EmailVerificationPending from './EmailVerificationPending';

export interface MobileRegistrationFlowProps {
  onStudentRegister: (data: StudentRegistrationData) => Promise<void>;
  onTeacherRegister: (data: TeacherRegistrationData) => Promise<void>;
  onBackToLogin: () => void;
  className?: string;
}

interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

export const MobileRegistrationFlow: React.FC<MobileRegistrationFlowProps> = ({
  onStudentRegister,
  onTeacherRegister,
  onBackToLogin,
  className = ''
}) => {
  const { 
    registrationStep, 
    selectedRole, 
    setRegistrationStep, 
    setSelectedRole 
  } = useAuthStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setRegistrationStep('form');
    setCurrentStepIndex(1);
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
    setRegistrationStep('role-selection');
    setCurrentStepIndex(0);
  };

  const handleStudentSubmit = async (data: StudentRegistrationData) => {
    try {
      await onStudentRegister(data);
      setRegistrationStep('verification');
      setCurrentStepIndex(2);
    } catch (error) {
      throw error;
    }
  };

  const handleTeacherSubmit = async (data: TeacherRegistrationData) => {
    try {
      await onTeacherRegister(data);
      setRegistrationStep('verification');
      setCurrentStepIndex(2);
    } catch (error) {
      throw error;
    }
  };

  const steps: RegistrationStep[] = [
    {
      id: 'role-selection',
      title: 'Choose Your Role',
      description: 'Select how you want to use Learnity',
      component: (
        <div className="px-4">
          <RoleSelection onRoleSelect={handleRoleSelect} />
        </div>
      )
    },
    {
      id: 'registration-form',
      title: selectedRole === UserRole.STUDENT ? 'Student Registration' : 'Teacher Application',
      description: selectedRole === UserRole.STUDENT 
        ? 'Create your student account' 
        : 'Apply to become a teacher',
      component: (
        <div className="px-4">
          {selectedRole === UserRole.STUDENT ? (
            <StudentRegistrationForm
              onSubmit={handleStudentSubmit}
              onBack={handleBackToRoleSelection}
            />
          ) : selectedRole === UserRole.TEACHER ? (
            <TeacherRegistrationForm
              onSubmit={handleTeacherSubmit}
              onBack={handleBackToRoleSelection}
            />
          ) : null}
        </div>
      )
    },
    {
      id: 'verification',
      title: 'Verify Your Email',
      description: 'Check your email to complete setup',
      component: (
        <div className="px-4">
          <EmailVerificationPending
            userRole={selectedRole}
            onResendVerification={async () => {
              console.log('Resend verification email');
            }}
            onBackToLogin={onBackToLogin}
          />
        </div>
      )
    }
  ];

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const canGoBack = currentStepIndex > 0;
  const canGoNext = currentStepIndex < steps.length - 1;

  const handleBack = () => {
    if (canGoBack) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      
      if (newIndex === 0) {
        setRegistrationStep('role-selection');
        setSelectedRole(null);
      } else if (newIndex === 1) {
        setRegistrationStep('form');
      }
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  return (
    <MobileAuthLayout
      title={currentStep.title}
      subtitle={currentStep.description}
      showBackButton={canGoBack}
      onBack={handleBack}
      headerActions={
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToLogin}
          className="text-gray-600"
        >
          Sign In
        </Button>
      }
      className={className}
    >
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Step {currentStepIndex + 1} of {steps.length}</span>
            <span className="text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 ${
                  index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                    ${index < currentStepIndex 
                      ? 'bg-blue-600 text-white' 
                      : index === currentStepIndex 
                        ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' 
                        : 'bg-gray-100 text-gray-400'
                    }
                  `}
                >
                  {index < currentStepIndex ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                
                <span className="hidden sm:block text-xs font-medium">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep.component}
        </div>

        {/* Mobile Navigation (only show for certain steps) */}
        {registrationStep === 'role-selection' && (
          <div className="flex items-center justify-between pt-6 border-t lg:hidden">
            <Button
              variant="outline"
              onClick={onBackToLogin}
              className="flex-1 mr-3"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
            
            <div className="text-sm text-gray-500">
              Choose a role to continue
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          <p>
            Need help? Contact our{' '}
            <button className="text-blue-600 hover:text-blue-700 underline">
              support team
            </button>
          </p>
        </div>

        {/* Mobile-specific features */}
        <div className="lg:hidden space-y-4">
          {/* Quick Actions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToLogin}
                className="w-full justify-start text-left"
              >
                Already have an account? Sign in
              </Button>
              
              {currentStepIndex > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentStepIndex(0);
                    setRegistrationStep('role-selection');
                    setSelectedRole(null);
                  }}
                  className="w-full justify-start text-left"
                >
                  Change role selection
                </Button>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tip</h4>
            <p className="text-sm text-blue-800">
              {currentStepIndex === 0 && "Choose the role that best describes how you want to use Learnity."}
              {currentStepIndex === 1 && selectedRole === UserRole.STUDENT && "Make sure to use a valid email address for account verification."}
              {currentStepIndex === 1 && selectedRole === UserRole.TEACHER && "Upload clear, high-quality documents for faster application review."}
              {currentStepIndex === 2 && "Check your spam folder if you don't see the verification email."}
            </p>
          </div>
        </div>
      </div>
    </MobileAuthLayout>
  );
};

export default MobileRegistrationFlow;
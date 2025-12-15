/**
 * Registration Flow Container Component
 * Responsive registration flow that works on both mobile and desktop
 * Consolidates RegistrationFlow and MobileRegistrationFlow
 */

'use client';

import React, { useState, useEffect } from 'react';
import { UserRole } from '@/types/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { StudentRegistrationData } from '@/lib/validators/auth';
import { QuickTeacherRegistrationData } from '@/lib/validators/quick-teacher-registration';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Check } from 'lucide-react';
import RoleSelection from './RoleSelection';
import StudentRegistrationForm from './StudentRegistrationForm';
import QuickTeacherRegistrationForm from './QuickTeacherRegistrationForm';
import EmailVerificationPending from './EmailVerificationPending';

export interface RegistrationFlowProps {
  onStudentRegister: (data: StudentRegistrationData) => Promise<void>;
  onTeacherRegister: (data: QuickTeacherRegistrationData) => Promise<void>;
  onBackToLogin?: () => void;
  className?: string;
  variant?: 'card' | 'simple';
}

const STEPS = [
  {
    id: 'role-selection',
    title: 'Choose Your Role',
    description: 'Select how you want to use Learnity',
  },
  {
    id: 'form',
    title: 'Registration',
    description: 'Create your account',
  },
  {
    id: 'verification',
    title: 'Verify Your Email',
    description: 'Check your email to complete setup',
  },
];

export const RegistrationFlow: React.FC<RegistrationFlowProps> = ({
  onStudentRegister,
  onTeacherRegister,
  onBackToLogin,
  className = '',
  variant = 'card'
}) => {
  const {
    registrationStep,
    selectedRole,
    setRegistrationStep,
    setSelectedRole
  } = useAuthStore();

  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Detect mobile device
  useEffect(() => {
    setIsClient(true);

    const checkMobile = () => {
      const isSmallScreen = window.innerWidth < 768; // md breakpoint
      setIsMobile(isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate current step index
  const getCurrentStepIndex = () => {
    if (registrationStep === 'role-selection') return 0;
    if (registrationStep === 'form') return 1;
    if (registrationStep === 'verification') return 2;
    return 0;
  };

  const currentStepIndex = getCurrentStepIndex();
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;
  const currentStep = STEPS[currentStepIndex];

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

  // Don't render until we know if it's mobile
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-slate-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  const isSimple = variant === 'simple';
  const containerClasses = isSimple
    ? `w-full ${className}`
    : `min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 ${className}`;

  return (
    <div className={containerClasses}>
      {/* Mobile Header - Show only if mobile AND not simple (or keep it? simple usually implies desktop split screen) */}
      {/* Actually, if isSimple is true (desktop split view), isMobile will likely be false. */}
      {isMobile && (
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
          {/* ... existing mobile header content ... */}
          {/* copying existing mobile header logic */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              {currentStepIndex > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToRoleSelection}
                  className="p-2 -ml-2"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}

              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentStep.title}
                </h1>
                {currentStep.description && (
                  <p className="text-sm text-gray-600">{currentStep.description}</p>
                )}
              </div>
            </div>

            {onBackToLogin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToLogin}
                className="text-gray-600"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}

      <div className={`container mx-auto px-4 ${isSimple ? 'py-0' : 'py-8 md:py-12'}`}>
        {/* Desktop Header - Hide if simple, as forms have their own headers now */}
        {!isMobile && !isSimple && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentStep.title}
            </h1>
            {currentStep.description && (
              <p className="text-lg text-gray-600">{currentStep.description}</p>
            )}
          </div>
        )}

        {/* Progress Indicator (Mobile) */}
        {isMobile && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Step {currentStepIndex + 1} of {STEPS.length}
              </span>
              <span className="text-gray-600">{Math.round(progress)}% Complete</span>
            </div>

            <Progress value={progress} className="h-2" />

            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 ${index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
                    }`}
                >
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                      ${index < currentStepIndex
                        ? 'bg-slate-600 text-white'
                        : index === currentStepIndex
                          ? 'bg-slate-100 text-blue-600 border-2 border-blue-600'
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
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {registrationStep === 'role-selection' && (
            <RoleSelection
              onRoleSelect={handleRoleSelect}
              className={isSimple ? "p-0" : ""}
            />
          )}

          {registrationStep === 'form' && selectedRole === UserRole.STUDENT && (
            <StudentRegistrationForm
              onSubmit={handleStudentSubmit}
              onBack={handleBackToRoleSelection}
              variant={variant}
            />
          )}

          {registrationStep === 'form' && selectedRole === UserRole.TEACHER && (
            <QuickTeacherRegistrationForm
              onSubmit={handleTeacherSubmit}
              onBack={handleBackToRoleSelection}
              variant={variant}
            />
          )}

          {registrationStep === 'verification' && (
            <EmailVerificationPending
              userRole={selectedRole}
              onResendVerification={async () => {
                // TODO: Implement resend verification
              }}
              onBackToLogin={() => {
                if (onBackToLogin) {
                  onBackToLogin();
                } else {
                  setRegistrationStep('role-selection');
                  setSelectedRole(null);
                }
              }}
            />
          )}
        </div>

        {/* Mobile Quick Actions - keeping them as is, they only show on mobile */}
        {isMobile && (
          <div className="mt-8 space-y-4">
            {/* Quick Actions Panel */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
              <div className="space-y-2">
                {onBackToLogin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBackToLogin}
                    className="w-full justify-start text-left"
                  >
                    Already have an account? Sign in
                  </Button>
                )}

                {currentStepIndex > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToRoleSelection}
                    className="w-full justify-start text-left"
                  >
                    Change role selection
                  </Button>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tip</h4>
              <p className="text-sm text-blue-800">
                {currentStepIndex === 0 && "Choose the role that best describes how you want to use Learnity."}
                {currentStepIndex === 1 && selectedRole === UserRole.STUDENT && "Make sure to use a valid email address for account verification."}
                {currentStepIndex === 1 && selectedRole === UserRole.TEACHER && "Upload clear, high-quality documents for faster application review."}
                {currentStepIndex === 2 && "Check your spam folder if you don't see the verification email."}
              </p>
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              <p>
                Need help? Contact our{' '}
                <button className="text-blue-600 hover:text-blue-700 underline">
                  support team
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationFlow;
/**
 * Authentication Demo Page
 * Showcases all authentication components for testing
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RoleSelection,
  LoginForm,
  StudentRegistrationForm,
  TeacherRegistrationForm,
  PasswordResetRequestForm,
  PasswordResetForm,
  EmailVerificationPending,
  EmailVerificationResult,
  MobileLoginForm,
  AuthProvider
} from '@/components/auth';
import { UserRole } from '@/types/auth';
import { ArrowLeft, Smartphone, Monitor } from 'lucide-react';

type DemoComponent = 
  | 'overview'
  | 'role-selection'
  | 'login-desktop'
  | 'login-mobile'
  | 'student-registration'
  | 'teacher-registration'
  | 'password-reset-request'
  | 'password-reset'
  | 'email-verification-pending'
  | 'email-verification-success'
  | 'email-verification-error';

export default function DemoPage() {
  const [currentComponent, setCurrentComponent] = useState<DemoComponent>('overview');

  const demoComponents = [
    { id: 'role-selection', name: 'Role Selection', icon: '👥' },
    { id: 'login-desktop', name: 'Login (Desktop)', icon: '🖥️' },
    { id: 'login-mobile', name: 'Login (Mobile)', icon: '📱' },
    { id: 'student-registration', name: 'Student Registration', icon: '🎓' },
    { id: 'teacher-registration', name: 'Teacher Registration', icon: '👨‍🏫' },
    { id: 'password-reset-request', name: 'Password Reset Request', icon: '🔑' },
    { id: 'password-reset', name: 'Password Reset', icon: '🔒' },
    { id: 'email-verification-pending', name: 'Email Verification Pending', icon: '📧' },
    { id: 'email-verification-success', name: 'Email Verification Success', icon: '✅' },
    { id: 'email-verification-error', name: 'Email Verification Error', icon: '❌' },
  ];

  const mockHandlers = {
    onSubmit: async (data: unknown) => {
      console.log('Demo submission:', data);
      alert('Demo mode: Form submitted successfully! Check console for data.');
    },
    onBack: () => setCurrentComponent('overview'),
    onForgotPassword: () => setCurrentComponent('password-reset-request'),
    onSignUp: () => setCurrentComponent('role-selection'),
    onSocialLogin: async (provider: string) => {
      console.log('Demo social login:', provider);
      alert(`Demo mode: ${provider} login attempted!`);
    },
    onRoleSelect: (role: UserRole) => {
      if (role === UserRole.STUDENT) {
        setCurrentComponent('student-registration');
      } else if (role === UserRole.TEACHER) {
        setCurrentComponent('teacher-registration');
      }
    },
    onResendVerification: async () => {
      alert('Demo mode: Verification email resent!');
    },
    onBackToLogin: () => setCurrentComponent('login-desktop'),
    onContinue: () => setCurrentComponent('overview'),
    onRetry: () => setCurrentComponent('email-verification-pending')
  };

  const renderComponent = () => {
    switch (currentComponent) {
      case 'role-selection':
        return <RoleSelection onRoleSelect={mockHandlers.onRoleSelect} />;
      
      case 'login-desktop':
        return (
          <div className="max-w-md mx-auto">
            <LoginForm
              onSubmit={mockHandlers.onSubmit}
              onForgotPassword={mockHandlers.onForgotPassword}
              onSignUp={mockHandlers.onSignUp}
              onSocialLogin={mockHandlers.onSocialLogin}
            />
          </div>
        );
      
      case 'login-mobile':
        return (
          <MobileLoginForm
            onSubmit={mockHandlers.onSubmit}
            onForgotPassword={mockHandlers.onForgotPassword}
            onSignUp={mockHandlers.onSignUp}
            onSocialLogin={mockHandlers.onSocialLogin}
          />
        );
      
      case 'student-registration':
        return (
          <StudentRegistrationForm
            onSubmit={mockHandlers.onSubmit}
            onBack={mockHandlers.onBack}
          />
        );
      
      case 'teacher-registration':
        return (
          <TeacherRegistrationForm
            onSubmit={mockHandlers.onSubmit}
            onBack={mockHandlers.onBack}
          />
        );
      
      case 'password-reset-request':
        return (
          <div className="max-w-md mx-auto">
            <PasswordResetRequestForm
              onSubmit={mockHandlers.onSubmit}
              onBackToLogin={mockHandlers.onBackToLogin}
            />
          </div>
        );
      
      case 'password-reset':
        return (
          <div className="max-w-md mx-auto">
            <PasswordResetForm
              token="demo-token"
              onSubmit={mockHandlers.onSubmit}
              onBackToLogin={mockHandlers.onBackToLogin}
            />
          </div>
        );
      
      case 'email-verification-pending':
        return (
          <EmailVerificationPending
            userRole={UserRole.STUDENT}
            onResendVerification={mockHandlers.onResendVerification}
            onBackToLogin={mockHandlers.onBackToLogin}
          />
        );
      
      case 'email-verification-success':
        return (
          <EmailVerificationResult
            success={true}
            userRole={UserRole.STUDENT}
            onContinue={mockHandlers.onContinue}
          />
        );
      
      case 'email-verification-error':
        return (
          <EmailVerificationResult
            success={false}
            error="The verification link has expired or is invalid."
            onContinue={mockHandlers.onContinue}
            onRetry={mockHandlers.onRetry}
          />
        );
      
      default:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                🎨 Authentication Components Demo
              </h1>
              <p className="text-lg text-gray-600">
                Explore all the authentication components built for Learnity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoComponents.map((component) => (
                <Card 
                  key={component.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setCurrentComponent(component.id as DemoComponent)}
                >
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">{component.icon}</div>
                    <CardTitle className="text-lg">{component.name}</CardTitle>
                    <CardDescription>
                      Click to view this component
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="mt-12 bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                🚀 Features Implemented
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h3 className="font-medium mb-2">✅ Core Features:</h3>
                  <ul className="space-y-1">
                    <li>• Role-based registration (Student/Teacher)</li>
                    <li>• Form validation with real-time feedback</li>
                    <li>• Social authentication (Google/Microsoft)</li>
                    <li>• Password strength validation</li>
                    <li>• Email verification flows</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">📱 Mobile Features:</h3>
                  <ul className="space-y-1">
                    <li>• Touch-friendly interfaces</li>
                    <li>• Biometric authentication detection</li>
                    <li>• Responsive design</li>
                    <li>• Network status monitoring</li>
                    <li>• Deep linking support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {currentComponent !== 'overview' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentComponent('overview')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Overview
                  </Button>
                )}
                <h1 className="text-xl font-semibold text-gray-900">
                  Authentication Demo
                </h1>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {currentComponent.includes('mobile') ? (
                  <div className="flex items-center space-x-1">
                    <Smartphone className="h-4 w-4" />
                    <span>Mobile View</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Monitor className="h-4 w-4" />
                    <span>Desktop View</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {renderComponent()}
        </div>

        {/* Footer */}
        <div className="bg-white border-t mt-12">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
            <p>
              This is a demo page showcasing the authentication components. 
              All forms are in demo mode and will not actually submit data.
            </p>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
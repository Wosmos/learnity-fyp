/**
 * Email Verification Pending Component
 * Shows verification status and allows resending verification email
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types/auth';
import { Mail, CheckCircle, Clock, RefreshCw, ArrowLeft } from 'lucide-react';

export interface EmailVerificationPendingProps {
  userRole: UserRole | null;
  onResendVerification: () => Promise<void>;
  onBackToLogin: () => void;
  className?: string;
}

export const EmailVerificationPending: React.FC<EmailVerificationPendingProps> = ({
  userRole,
  onResendVerification,
  onBackToLogin,
  className = ''
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    try {
      await onResendVerification();
      
      // Start cooldown timer
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to resend verification:', error);
    } finally {
      setIsResending(false);
    }
  };

  const getRoleSpecificContent = () => {
    switch (userRole) {
      case UserRole.STUDENT:
        return {
          title: 'Student Account Created!',
          description: 'Welcome to Learnity! Please verify your email to start learning.',
          nextSteps: [
            'Check your email inbox for a verification link',
            'Click the verification link to activate your account',
            'Complete your student profile setup',
            'Start exploring study groups and tutoring sessions'
          ],
          color: 'blue'
        };
      case UserRole.TEACHER:
        return {
          title: 'Teacher Application Submitted!',
          description: 'Thank you for applying to teach on Learnity. Please verify your email first.',
          nextSteps: [
            'Check your email inbox for a verification link',
            'Click the verification link to verify your email',
            'Our team will review your application within 2-3 business days',
            'You\'ll receive an email notification once approved'
          ],
          color: 'green'
        };
      default:
        return {
          title: 'Account Created!',
          description: 'Please verify your email to continue.',
          nextSteps: [
            'Check your email inbox for a verification link',
            'Click the verification link to activate your account'
          ],
          color: 'gray'
        };
    }
  };

  const content = getRoleSpecificContent();

  return (
    <div className={`w-full max-w-2xl mx-auto p-6 ${className}`}>
      <Card className="shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className={`
            mx-auto p-4 rounded-full w-16 h-16 flex items-center justify-center
            ${content.color === 'blue' ? 'bg-blue-100' : ''}
            ${content.color === 'green' ? 'bg-green-100' : ''}
            ${content.color === 'gray' ? 'bg-gray-100' : ''}
          `}>
            <Mail className={`
              h-8 w-8
              ${content.color === 'blue' ? 'text-blue-600' : ''}
              ${content.color === 'green' ? 'text-green-600' : ''}
              ${content.color === 'gray' ? 'text-gray-600' : ''}
            `} />
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {content.title}
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              {content.description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Next Steps:</h3>
            <div className="space-y-3">
              {content.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`
                    flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white
                    ${content.color === 'blue' ? 'bg-blue-600' : ''}
                    ${content.color === 'green' ? 'bg-green-600' : ''}
                    ${content.color === 'gray' ? 'bg-gray-600' : ''}
                  `}>
                    {index + 1}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Email Status */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <p className="text-sm font-medium text-yellow-800">
                Email Verification Pending
              </p>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              We've sent a verification email to your registered email address. 
              Please check your inbox and spam folder.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleResendVerification}
              disabled={isResending || resendCooldown > 0}
              className={`
                w-full font-medium
                ${content.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                ${content.color === 'green' ? 'bg-green-600 hover:bg-green-700' : ''}
                ${content.color === 'gray' ? 'bg-gray-600 hover:bg-gray-700' : ''}
              `}
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={onBackToLogin}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>
              Didn't receive the email? Check your spam folder or try resending.
            </p>
            <p>
              Need help?{' '}
              <button className="text-blue-600 hover:text-blue-700 underline">
                Contact Support
              </button>
            </p>
          </div>

          {/* Teacher-specific additional info */}
          {userRole === UserRole.TEACHER && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  Application Under Review
                </p>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Once you verify your email, our team will review your teaching credentials 
                and qualifications. You'll be notified via email once the review is complete.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationPending;
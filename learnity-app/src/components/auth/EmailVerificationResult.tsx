/**
 * Email Verification Result Component
 * Shows success or error states for email verification
 */

'use client';

import React from 'react';
import {
  CheckCircle,
  XCircle,
  Mail,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types/auth';

export interface EmailVerificationResultProps {
  success: boolean;
  userRole?: UserRole;
  error?: string;
  onContinue: () => void;
  onRetry?: () => void;
  className?: string;
}

export const EmailVerificationResult: React.FC<
  EmailVerificationResultProps
> = ({ success, userRole, error, onContinue, onRetry, className = '' }) => {
  const getSuccessContent = () => {
    switch (userRole) {
      case UserRole.STUDENT:
        return {
          title: 'Email Verified Successfully!',
          description:
            'Welcome to Learnity! Your student account is now active.',
          nextSteps: [
            'Complete your student profile',
            'Explore available study groups',
            'Find tutoring sessions',
            'Start your learning journey',
          ],
          buttonText: 'Continue to Dashboard',
          color: 'blue',
        };
      case UserRole.TEACHER:
        return {
          title: 'Email Verified Successfully!',
          description:
            "Your email is verified. We're now reviewing your teacher application.",
          nextSteps: [
            'Your application is under review',
            'Our team will verify your credentials',
            "You'll receive an email notification once approved",
            'Estimated review time: 2-3 business days',
          ],
          buttonText: 'Continue to Application Status',
          color: 'green',
        };
      default:
        return {
          title: 'Email Verified Successfully!',
          description: 'Your email address has been verified.',
          nextSteps: [
            'Your account is now active',
            'You can now access all features',
          ],
          buttonText: 'Continue',
          color: 'blue',
        };
    }
  };

  const successContent = getSuccessContent();

  if (success) {
    return (
      <div className={`w-full max-w-2xl mx-auto p-6 ${className}`}>
        <Card className='shadow-lg'>
          <CardHeader className='text-center space-y-4'>
            <div
              className={`
              mx-auto p-4 rounded-full w-16 h-16 flex items-center justify-center
              ${successContent.color === 'blue' ? 'bg-slate-100' : 'bg-green-100'}
            `}
            >
              <CheckCircle
                className={`
                h-8 w-8
                ${successContent.color === 'blue' ? 'text-blue-600' : 'text-green-600'}
              `}
              />
            </div>

            <div>
              <CardTitle className='text-2xl font-bold text-gray-900'>
                {successContent.title}
              </CardTitle>
              <CardDescription className='text-lg mt-2'>
                {successContent.description}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* Success Message */}
            <div
              className={`
              border rounded-lg p-4
              ${successContent.color === 'blue' ? 'bg-slate-50 border-blue-200' : 'bg-green-50 border-green-200'}
            `}
            >
              <div className='flex items-center space-x-2'>
                <Mail
                  className={`
                  h-5 w-5
                  ${successContent.color === 'blue' ? 'text-blue-600' : 'text-green-600'}
                `}
                />
                <p
                  className={`
                  text-sm font-medium
                  ${successContent.color === 'blue' ? 'text-blue-800' : 'text-green-800'}
                `}
                >
                  Email Verification Complete
                </p>
              </div>
              <p
                className={`
                text-sm mt-1
                ${successContent.color === 'blue' ? 'text-blue-700' : 'text-green-700'}
              `}
              >
                Your email address has been successfully verified and your
                account is now active.
              </p>
            </div>

            {/* Next Steps */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                What's Next:
              </h3>
              <div className='space-y-3'>
                {successContent.nextSteps.map((step, index) => (
                  <div key={index} className='flex items-start space-x-3'>
                    <div
                      className={`
                      flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white
                      ${successContent.color === 'blue' ? 'bg-slate-600' : 'bg-green-600'}
                    `}
                    >
                      {index + 1}
                    </div>
                    <p className='text-gray-700 text-sm leading-relaxed'>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <Button
              onClick={onContinue}
              className={`
                w-full font-medium
                ${successContent.color === 'blue' ? 'bg-slate-600 hover:bg-slate-700' : 'bg-green-600 hover:bg-green-700'}
              `}
            >
              {successContent.buttonText}
              <ArrowRight className='h-4 w-4 ml-2' />
            </Button>

            {/* Teacher-specific additional info */}
            {userRole === UserRole.TEACHER && (
              <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                <div className='flex items-center space-x-2'>
                  <RefreshCw className='h-5 w-5 text-yellow-600' />
                  <p className='text-sm font-medium text-yellow-800'>
                    Application Under Review
                  </p>
                </div>
                <p className='text-sm text-yellow-700 mt-1'>
                  While we review your application, you can update your profile
                  and prepare your teaching materials. We'll notify you as soon
                  as the review is complete.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className={`w-full max-w-2xl mx-auto p-6 ${className}`}>
      <Card className='shadow-lg'>
        <CardHeader className='text-center space-y-4'>
          <div className='mx-auto p-4 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center'>
            <XCircle className='h-8 w-8 text-red-600' />
          </div>

          <div>
            <CardTitle className='text-2xl font-bold text-gray-900'>
              Verification Failed
            </CardTitle>
            <CardDescription className='text-lg mt-2'>
              We couldn't verify your email address
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Error Message */}
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <div className='flex items-center space-x-2'>
              <XCircle className='h-5 w-5 text-red-600' />
              <p className='text-sm font-medium text-red-800'>
                Verification Error
              </p>
            </div>
            <p className='text-sm text-red-700 mt-1'>
              {error || 'The verification link may be expired or invalid.'}
            </p>
          </div>

          {/* Troubleshooting */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Possible Solutions:
            </h3>
            <div className='space-y-3'>
              <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0 w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-medium text-white'>
                  1
                </div>
                <p className='text-gray-700 text-sm leading-relaxed'>
                  Check if the verification link has expired (links are valid
                  for 24 hours)
                </p>
              </div>
              <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0 w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-medium text-white'>
                  2
                </div>
                <p className='text-gray-700 text-sm leading-relaxed'>
                  Make sure you're using the latest verification email
                </p>
              </div>
              <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0 w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-medium text-white'>
                  3
                </div>
                <p className='text-gray-700 text-sm leading-relaxed'>
                  Try requesting a new verification email
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='space-y-3'>
            {onRetry && (
              <Button
                onClick={onRetry}
                className='w-full bg-slate-600 hover:bg-slate-700'
              >
                <RefreshCw className='h-4 w-4 mr-2' />
                Request New Verification Email
              </Button>
            )}

            <Button variant='outline' onClick={onContinue} className='w-full'>
              Back to Login
            </Button>
          </div>

          {/* Help Text */}
          <div className='text-center text-sm text-gray-500'>
            Still having trouble?{' '}
            <button className='text-blue-600 hover:text-blue-700 underline'>
              Contact Support
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationResult;

/**
 * Password Reset Request Form Component
 * Handles password reset email requests with validation
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  KeyRound,
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  passwordResetRequestSchema,
  type PasswordResetRequestData,
} from '@/lib/validators/auth';

export interface PasswordResetRequestFormProps {
  onSubmit: (data: PasswordResetRequestData) => Promise<void>;
  onBackToLogin: () => void;
  className?: string;
  variant?: 'card' | 'simple';
}

export const PasswordResetRequestForm: React.FC<
  PasswordResetRequestFormProps
> = ({ onSubmit, onBackToLogin, className = '', variant = 'card' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState<string>('');

  const form = useForm<PasswordResetRequestData>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: '',
      hcaptchaToken: '',
    },
    mode: 'onChange',
  });

  const handleSubmit = async (data: PasswordResetRequestData) => {
    if (!hcaptchaToken) {
      form.setError('hcaptchaToken', {
        type: 'manual',
        message: 'Please complete the captcha verification',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, hcaptchaToken });
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Password reset request failed:', error);
      form.setError('root', {
        type: 'manual',
        message:
          error.message || 'Failed to send reset email. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    setIsSuccess(false);
    form.reset();
    setHcaptchaToken('');
  };

  if (isSuccess) {
    if (variant === 'simple') {
      return (
        <div className={`w-full max-w-md mx-auto ${className}`}>
          <div className='space-y-6 text-center'>
            <div className='mx-auto p-3 bg-green-100 rounded-lg w-fit'>
              <CheckCircle className='h-6 w-6 text-green-600' />
            </div>
            <div>
              <h1 className='text-2xl font-bold'>Check Your Email</h1>
              <p className='text-muted-foreground mt-2'>
                We've sent password reset instructions to your email
              </p>
            </div>

            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
              <p className='text-sm text-green-800'>
                If an account with that email exists, you'll receive a password
                reset link shortly.
              </p>
            </div>

            <div className='space-y-3 pt-4'>
              <Button
                onClick={handleTryAgain}
                variant='outline'
                className='w-full'
              >
                Try Different Email
              </Button>
              <Button
                onClick={onBackToLogin}
                className='w-full bg-slate-600 hover:bg-slate-700'
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`w-full max-w-md mx-auto p-6 ${className}`}>
        <Card className='shadow-lg'>
          <CardHeader className='text-center space-y-4'>
            <div className='mx-auto p-3 bg-green-100 rounded-lg w-fit'>
              <CheckCircle className='h-6 w-6 text-green-600' />
            </div>

            <div>
              <CardTitle className='text-2xl font-bold'>
                Check Your Email
              </CardTitle>
              <CardDescription>
                We've sent password reset instructions to your email
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className='space-y-6'>
            <div className='text-center space-y-4'>
              <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                <p className='text-sm text-green-800'>
                  If an account with that email exists, you'll receive a
                  password reset link shortly.
                </p>
              </div>

              <div className='text-sm text-gray-600 space-y-2'>
                <p>Didn't receive the email?</p>
                <ul className='text-left space-y-1'>
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure you entered the correct email address</li>
                  <li>• Wait a few minutes for the email to arrive</li>
                </ul>
              </div>
            </div>

            <div className='space-y-3'>
              <Button
                onClick={handleTryAgain}
                variant='outline'
                className='w-full'
              >
                Try Different Email
              </Button>

              <Button
                onClick={onBackToLogin}
                className='w-full bg-slate-600 hover:bg-slate-700'
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Login
              </Button>
            </div>

            <div className='text-center text-sm text-gray-500'>
              Need help?{' '}
              <button className='text-blue-600 hover:text-blue-700 underline'>
                Contact Support
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (variant === 'simple') {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <div className='space-y-6'>
          <div className='space-y-2 text-center lg:text-left'>
            <h1 className='text-3xl font-bold tracking-tight'>
              Reset Password
            </h1>
            <p className='text-muted-foreground'>
              Enter your email address and we'll send you a reset link
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-6'
            >
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                        <Input
                          type='email'
                          placeholder='Enter your email address'
                          className='pl-10 h-10 transition-colors focus:border-blue-500' // matched styles generally
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex justify-center'>
                <HCaptcha
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ''}
                  onVerify={token => {
                    setHcaptchaToken(token);
                    form.setValue('hcaptchaToken', token);
                    form.clearErrors('hcaptchaToken');
                  }}
                  onExpire={() => {
                    setHcaptchaToken('');
                    form.setValue('hcaptchaToken', '');
                  }}
                />
              </div>

              {form.formState.errors.hcaptchaToken && (
                <p className='text-sm text-red-600 text-center'>
                  {form.formState.errors.hcaptchaToken.message}
                </p>
              )}

              <Button
                type='submit'
                className='w-full bg-slate-600 hover:bg-slate-700 text-white font-medium h-10'
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              {form.formState.errors.root && (
                <div className='flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md'>
                  <AlertCircle className='h-4 w-4 flex-shrink-0' />
                  <span>{form.formState.errors.root.message}</span>
                </div>
              )}
            </form>
          </Form>

          <div className='text-center text-sm text-gray-600'>
            Remember your password?{' '}
            <Button
              type='button'
              variant='link'
              className='px-0 text-blue-600 hover:text-blue-700 font-medium cursor-pointer'
              onClick={onBackToLogin}
            >
              Sign in here
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto p-6 ${className}`}>
      <Card className='shadow-lg'>
        <CardHeader className='space-y-4'>
          <div className='flex items-center justify-between'>
            <Button
              variant='ghost'
              size='sm'
              onClick={onBackToLogin}
              className='text-gray-600 hover:text-gray-800'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Login
            </Button>
          </div>

          <div className='text-center'>
            <div className='mx-auto p-3 bg-slate-100 rounded-lg w-fit'>
              <KeyRound className='h-6 w-6 text-blue-600' />
            </div>

            <div className='mt-4'>
              <CardTitle className='text-2xl font-bold'>
                Reset Password
              </CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a reset link
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-6'
            >
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                        <Input
                          type='email'
                          placeholder='Enter your email address'
                          className='pl-10 transition-colors focus:border-blue-500'
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex justify-center'>
                <HCaptcha
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ''}
                  onVerify={token => {
                    setHcaptchaToken(token);
                    form.setValue('hcaptchaToken', token);
                    form.clearErrors('hcaptchaToken');
                  }}
                  onExpire={() => {
                    setHcaptchaToken('');
                    form.setValue('hcaptchaToken', '');
                  }}
                />
              </div>

              {form.formState.errors.hcaptchaToken && (
                <p className='text-sm text-red-600 text-center'>
                  {form.formState.errors.hcaptchaToken.message}
                </p>
              )}

              <Button
                type='submit'
                className='w-full bg-slate-600 hover:bg-slate-700 text-white font-medium'
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              {form.formState.errors.root && (
                <div className='flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md'>
                  <AlertCircle className='h-4 w-4 flex-shrink-0' />
                  <span>{form.formState.errors.root.message}</span>
                </div>
              )}
            </form>
          </Form>

          <div className='mt-6 text-center text-sm text-gray-600'>
            Remember your password?{' '}
            <Button
              type='button'
              variant='link'
              className='px-0 text-blue-600 hover:text-blue-700 font-medium cursor-pointer'
              onClick={onBackToLogin}
            >
              Sign in here
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordResetRequestForm;

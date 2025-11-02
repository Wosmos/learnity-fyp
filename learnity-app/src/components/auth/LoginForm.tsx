/**
 * Login Form Component
 * Handles user authentication with email/password and social login options
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { loginSchema, type LoginData } from '@/lib/validators/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { LogIn, Eye, EyeOff, Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

export interface LoginFormProps {
  onSubmit: (data: LoginData) => Promise<void>;
  onForgotPassword: () => void;
  onSignUp: () => void;
  onSocialLogin: (provider: 'google' | 'microsoft') => Promise<void>;
  requireCaptcha?: boolean;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onForgotPassword,
  onSignUp,
  onSocialLogin,
  requireCaptcha = false,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState<string>('');
  const [socialLoading, setSocialLoading] = useState<'google' | 'microsoft' | null>(null);
  
  const { error, setError } = useAuthStore();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      hcaptchaToken: ''
    },
    mode: 'onChange'
  });

  const handleSubmit = async (data: LoginData) => {
    if (requireCaptcha && !hcaptchaToken) {
      form.setError('hcaptchaToken', {
        type: 'manual',
        message: 'Please complete the captcha verification'
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit({ 
        ...data, 
        hcaptchaToken: requireCaptcha ? hcaptchaToken : undefined 
      });
    } catch (error: any) {
      console.error('Login failed:', error);
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Login failed. Please check your credentials and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'microsoft') => {
    setSocialLoading(provider);
    setError(null);
    
    try {
      await onSocialLogin(provider);
    } catch (error: any) {
      console.error(`${provider} login failed:`, error);
      form.setError('root', {
        type: 'manual',
        message: error.message || `${provider} login failed. Please try again.`
      });
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto p-6 ${className}`}>
      <Card className="shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto p-3 bg-blue-100 rounded-lg w-fit">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your Learnity account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('google')}
              disabled={!!socialLoading || isSubmitting}
            >
              {socialLoading === 'google' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('microsoft')}
              disabled={!!socialLoading || isSubmitting}
            >
              {socialLoading === 'microsoft' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M1 1h10v10H1z"/>
                  <path fill="#00A4EF" d="M13 1h10v10H13z"/>
                  <path fill="#7FBA00" d="M1 13h10v10H1z"/>
                  <path fill="#FFB900" d="M13 13h10v10H13z"/>
                </svg>
              )}
              Continue with Microsoft
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 transition-colors focus:border-blue-500"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 transition-colors focus:border-blue-500"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                  onClick={onForgotPassword}
                >
                  Forgot password?
                </Button>
              </div>

              {/* Captcha (shown when required) */}
              {requireCaptcha && (
                <div className="flex justify-center">
                  <HCaptcha
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ''}
                    onVerify={(token) => {
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
              )}

              {form.formState.errors.hcaptchaToken && (
                <p className="text-sm text-red-600 text-center">
                  {form.formState.errors.hcaptchaToken.message}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={isSubmitting || !!socialLoading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Error Display */}
              {(form.formState.errors.root || error) && (
                <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{form.formState.errors.root?.message || error?.message}</span>
                </div>
              )}
            </form>
          </Form>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Button
              type="button"
              variant="link"
              className="px-0 text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              onClick={onSignUp}
            >
              Sign up here
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
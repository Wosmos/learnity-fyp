/**
 * Mobile-Optimized Login Form Component
 * Touch-friendly login form with biometric support and mobile-specific features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { loginSchema, type LoginData } from '@/lib/validators/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { 
  LogIn, 
  Eye, 
  EyeOff, 
  Loader2, 
  Mail, 
  Lock, 
  AlertCircle, 
  Fingerprint,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import MobileAuthLayout from './MobileAuthLayout';

export interface MobileLoginFormProps {
  onSubmit: (data: LoginData) => Promise<void>;
  onForgotPassword: () => void;
  onSignUp: () => void;
  onSocialLogin: (provider: 'google' | 'microsoft') => Promise<void>;
  requireCaptcha?: boolean;
  className?: string;
}

export const MobileLoginForm: React.FC<MobileLoginFormProps> = ({
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
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
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

  // Check for biometric authentication availability
  useEffect(() => {
    const checkBiometric = async () => {
      if (typeof window !== 'undefined' && 'PublicKeyCredential' in window) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricAvailable(available);
        } catch (error) {
          console.log('Biometric check failed:', error);
        }
      }
    };

    checkBiometric();
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (data: LoginData) => {
    if (!isOnline) {
      form.setError('root', {
        type: 'manual',
        message: 'No internet connection. Please check your network and try again.'
      });
      return;
    }

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
    if (!isOnline) {
      form.setError('root', {
        type: 'manual',
        message: 'No internet connection. Please check your network and try again.'
      });
      return;
    }

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

  const handleBiometricLogin = async () => {
    if (!biometricAvailable) return;

    try {
      // This is a placeholder for biometric authentication
      // In a real implementation, you would integrate with WebAuthn API
      console.log('Biometric login attempted');
      
      // For now, just show a message
      form.setError('root', {
        type: 'manual',
        message: 'Biometric login is not yet implemented. Please use email/password.'
      });
    } catch (error) {
      console.error('Biometric login failed:', error);
    }
  };

  return (
    <MobileAuthLayout
      title="Welcome Back"
      subtitle="Sign in to your Learnity account"
      className={className}
    >
      <div className="space-y-6">
        {/* Network Status Indicator */}
        {!isOnline && (
          <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <WifiOff className="h-4 w-4 flex-shrink-0" />
            <span>No internet connection</span>
          </div>
        )}

        {/* Biometric Login (if available) */}
        {biometricAvailable && (
          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full h-14 text-base"
              onClick={handleBiometricLogin}
              disabled={!isOnline || isSubmitting || !!socialLoading}
            >
              <Fingerprint className="h-5 w-5 mr-3" />
              Use Biometric Login
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full h-14 text-base"
            onClick={() => handleSocialLogin('google')}
            disabled={!isOnline || !!socialLoading || isSubmitting}
          >
            {socialLoading === 'google' ? (
              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
            ) : (
              <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
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
            size="lg"
            className="w-full h-14 text-base"
            onClick={() => handleSocialLogin('microsoft')}
            disabled={!isOnline || !!socialLoading || isSubmitting}
          >
            {socialLoading === 'microsoft' ? (
              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
            ) : (
              <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        className="pl-12 h-14 text-base transition-colors focus:border-blue-500"
                        autoComplete="email"
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
                  <FormLabel className="text-base">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="pl-12 pr-12 h-14 text-base transition-colors focus:border-blue-500"
                        autoComplete="current-password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-14 px-4 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
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
                        className="mt-1"
                      />
                    </FormControl>
                    <FormLabel className="text-base font-normal">
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="link"
                className="px-0 text-base text-blue-600 hover:text-blue-700"
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
              size="lg"
              className="w-full h-14 text-base bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={!isOnline || isSubmitting || !!socialLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-3" />
                  Sign In
                </>
              )}
            </Button>

            {/* Error Display */}
            {(form.formState.errors.root || error) && (
              <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-4 rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{form.formState.errors.root?.message || error?.message}</span>
              </div>
            )}
          </form>
        </Form>

        {/* Sign Up Link */}
        <div className="text-center text-base text-gray-600 pt-4">
          Don't have an account?{' '}
          <Button
            type="button"
            variant="link"
            className="px-0 text-base text-blue-600 hover:text-blue-700 font-medium"
            onClick={onSignUp}
          >
            Sign up here
          </Button>
        </div>

        {/* Network Status */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          {isOnline ? (
            <>
              <Wifi className="h-3 w-3" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>
    </MobileAuthLayout>
  );
};

export default MobileLoginForm;
/**
 * Password Reset Form Component
 * Handles password reset with token validation and strength requirements
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { passwordResetSchema, type PasswordResetData } from '@/lib/validators/auth';
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react';

export interface PasswordResetFormProps {
  token: string;
  onSubmit: (data: PasswordResetData) => Promise<void>;
  onBackToLogin: () => void;
  className?: string;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  token,
  onSubmit,
  onBackToLogin,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<PasswordResetData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      token
    },
    mode: 'onChange'
  });

  const handleSubmit = async (data: PasswordResetData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Password reset failed:', error);
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Failed to reset password. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };

    strength = Object.values(checks).filter(Boolean).length;
    
    return {
      score: strength,
      checks,
      label: strength < 3 ? 'Weak' : strength < 5 ? 'Medium' : 'Strong',
      color: strength < 3 ? 'text-red-600' : strength < 5 ? 'text-yellow-600' : 'text-green-600'
    };
  };

  const passwordValue = form.watch('password');
  const passwordStrength = getPasswordStrength(passwordValue || '');

  if (isSuccess) {
    return (
      <div className={`w-full max-w-md mx-auto p-6 ${className}`}>
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto p-3 bg-green-100 rounded-lg w-fit">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            
            <div>
              <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
              <CardDescription>
                Your password has been updated successfully
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  You can now sign in with your new password.
                </p>
              </div>
            </div>

            <Button
              onClick={onBackToLogin}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto p-6 ${className}`}>
      <Card className="shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-3 bg-blue-100 rounded-lg w-fit">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
            <CardDescription>
              Choose a strong password for your account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your new password"
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
                    
                    {/* Password Strength Indicator */}
                    {passwordValue && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Password strength:</span>
                          <span className={`text-xs font-medium ${passwordStrength.color}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              passwordStrength.score < 3 ? 'bg-red-500' : 
                              passwordStrength.score < 5 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className={passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}>
                            ✓ 8+ characters
                          </div>
                          <div className={passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}>
                            ✓ Uppercase letter
                          </div>
                          <div className={passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}>
                            ✓ Lowercase letter
                          </div>
                          <div className={passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}>
                            ✓ Number
                          </div>
                          <div className={passwordStrength.checks.special ? 'text-green-600' : 'text-gray-400'}>
                            ✓ Special character
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your new password"
                          className="pl-10 pr-10 transition-colors focus:border-blue-500"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
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

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>

              {form.formState.errors.root && (
                <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{form.formState.errors.root.message}</span>
                </div>
              )}
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Button
              type="button"
              variant="link"
              className="px-0 text-blue-600 hover:text-blue-700 font-medium"
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

export default PasswordResetForm;
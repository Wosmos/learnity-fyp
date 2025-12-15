/**
 * Student Registration Form Component
 * Handles student registration with form validation and real-time feedback
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { studentRegistrationSchema, type StudentRegistrationData } from '@/lib/validators/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { GraduationCap, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

const GRADE_LEVELS = [
  { value: 'elementary', label: 'Elementary (K-5)' },
  { value: 'middle', label: 'Middle School (6-8)' },
  { value: 'high', label: 'High School (9-12)' },
  { value: 'college', label: 'College/University' },
  { value: 'graduate', label: 'Graduate School' },
  { value: 'adult', label: 'Adult Learner' }
];

const SUBJECTS = [
  'Mathematics', 'Science', 'English', 'History', 'Geography',
  'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art',
  'Music', 'Physical Education', 'Foreign Languages', 'Economics',
  'Psychology', 'Philosophy', 'Literature', 'Statistics'
];

export interface StudentRegistrationFormProps {
  onSubmit: (data: StudentRegistrationData) => Promise<void>;
  onBack: () => void;
  className?: string;
}

export const StudentRegistrationForm: React.FC<StudentRegistrationFormProps> = ({
  onSubmit,
  onBack,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState<string>('');

  const { setRegistrationStep } = useAuthStore();

  const form = useForm<StudentRegistrationData>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      gradeLevel: '',
      subjects: [],
      agreeToTerms: false,
      hcaptchaToken: ''
    },
    mode: 'onChange'
  });

  const handleSubmit = async (data: StudentRegistrationData) => {
    if (!hcaptchaToken) {
      form.setError('hcaptchaToken', {
        type: 'manual',
        message: 'Please complete the captcha verification'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, hcaptchaToken });
      setRegistrationStep('verification');
    } catch (error: any) {
      console.error('Registration failed:', error);
      form.setError('root', {
        type: 'manual',
        message: error.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setRegistrationStep('role-selection');
    onBack();
  };

  const handleSubjectToggle = (subject: string, checked: boolean) => {
    const currentSubjects = form.getValues('subjects');
    if (checked) {
      form.setValue('subjects', [...currentSubjects, subject]);
    } else {
      form.setValue('subjects', currentSubjects.filter(s => s !== subject));
    }
    form.trigger('subjects');
  };

  return (
    <div className={`w-full max-w-2xl mx-auto p-6 ${className}`}>
      <Card className="shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Role Selection
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Student Registration</CardTitle>
              <CardDescription>
                Create your student account to start learning
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your first name"
                            {...field}
                            className="transition-colors focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your last name"
                            {...field}
                            className="transition-colors focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          {...field}
                          className="transition-colors focus:border-blue-500"
                        />
                      </FormControl>
                      <FormDescription>
                        We'll send a verification email to this address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Security</h3>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a strong password"
                            {...field}
                            className="pr-10 transition-colors focus:border-blue-500"
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
                      <FormDescription>
                        Must contain uppercase, lowercase, number, and special character
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            {...field}
                            className="pr-10 transition-colors focus:border-blue-500"
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
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>

                <FormField
                  control={form.control}
                  name="gradeLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="transition-colors focus:border-blue-500">
                            <SelectValue placeholder="Select your grade level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GRADE_LEVELS.map((grade) => (
                            <SelectItem key={grade.value} value={grade.value}>
                              {grade.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subjects"
                  render={() => (
                    <FormItem>
                      <FormLabel>Subjects of Interest</FormLabel>
                      <FormDescription>
                        Select the subjects you're interested in learning (choose at least one)
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {SUBJECTS.map((subject) => (
                          <div key={subject} className="flex items-center space-x-2">
                            <Checkbox
                              id={subject}
                              checked={form.watch('subjects').includes(subject)}
                              onCheckedChange={(checked) =>
                                handleSubjectToggle(subject, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={subject}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {subject}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Terms and Captcha */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          I agree to the{' '}
                          <button type="button" className="text-blue-600 hover:text-blue-700 underline">
                            Terms of Service
                          </button>{' '}
                          and{' '}
                          <button type="button" className="text-blue-600 hover:text-blue-700 underline">
                            Privacy Policy
                          </button>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

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
                {form.formState.errors.hcaptchaToken && (
                  <p className="text-sm text-red-600 text-center">
                    {form.formState.errors.hcaptchaToken.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-3"
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Student Account'
                )}
              </Button>

              {form.formState.errors.root && (
                <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md">
                  {form.formState.errors.root.message}
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentRegistrationForm;
/**
 * Quick Teacher Registration Form - Simplified 3-Step Process
 * Clean, modern UI with better UX
 */

'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BookOpen,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  Loader2,
  User,
  GraduationCap,
  Clock,
  Shield,
  CheckCircle,
  Youtube,
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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  quickTeacherRegistrationSchema,
  type QuickTeacherRegistrationData,
} from '@/lib/validators/quick-teacher-registration';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useToast } from '@/hooks/use-toast';

// Simplified constants
const SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Art',
  'Music',
  'Foreign Languages',
  'Economics',
  'Psychology',
  'Business',
  'Programming',
  'Web Development',
  'Data Science',
];

const AGE_GROUPS = [
  'Elementary (6-10)',
  'Middle School (11-13)',
  'High School (14-18)',
  'College/University (18-22)',
  'Adult Learners (23+)',
];

const COUNTRIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Faisalabad',
  'Rawalpindi',
  'Multan',
  'Hyderabad',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Larkana',
  'Sheikhupura',
  'Jhang',
  'Dera Ghazi Khan',
  'Sahiwal',
  'Mirpur Khas',
  'Rahim Yar Khan',
];

const TIMEZONES = [
  'UTC-08:00 (Pacific)',
  'UTC-07:00 (Mountain)',
  'UTC-06:00 (Central)',
  'UTC-05:00 (Eastern)',
  'UTC+00:00 (London)',
  'UTC+01:00 (Central Europe)',
  'UTC+05:30 (India)',
  'UTC+08:00 (China)',
  'UTC+09:00 (Japan)',
];

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const TIME_SLOTS = [
  'Morning (6-12 PM)',
  'Afternoon (12-6 PM)',
  'Evening (6-10 PM)',
  'Night (10 PM-2 AM)',
];

export interface QuickTeacherRegistrationFormProps {
  onSubmit: (data: QuickTeacherRegistrationData) => Promise<void>;
  onBack: () => void;
  className?: string;
  variant?: 'card' | 'simple';
}

export const QuickTeacherRegistrationForm: React.FC<
  QuickTeacherRegistrationFormProps
> = ({ onSubmit, onBack, className = '', variant = 'card' }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState<string>('');

  const { setRegistrationStep } = useAuthStore();
  const { toast } = useToast();

  const form = useForm<QuickTeacherRegistrationData>({
    resolver: zodResolver(quickTeacherRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: '',
      phone: '',
      experience: 0,
      subjects: [],
      ageGroups: [],
      bio: '',
      hourlyRate: undefined,
      availableDays: [],
      timezone: '',
      preferredTimes: [],
      youtubeIntroUrl: '',
      agreeToTerms: false,
      agreeToBackgroundCheck: false,
      hcaptchaToken: '',
    },
    mode: 'onChange',
  });

  const steps = [
    { id: 1, title: 'Basic Info', icon: User, description: 'Personal details' },
    {
      id: 2,
      title: 'Teaching Profile',
      icon: GraduationCap,
      description: 'Your expertise',
    },
    {
      id: 3,
      title: 'Availability',
      icon: Clock,
      description: 'Schedule & verification',
    },
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const progress = (currentStep / steps.length) * 100;

  // Generic array field toggle handler
  const handleArrayFieldToggle = (
    fieldName: keyof QuickTeacherRegistrationData,
    value: string,
    checked: boolean
  ) => {
    const currentValues = (form.getValues(fieldName) as string[]) || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);

    form.setValue(
      fieldName,
      newValues as QuickTeacherRegistrationData[typeof fieldName]
    );
    form.trigger(fieldName);
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const values = form.getValues();

    switch (currentStep) {
      case 1:
        return await form.trigger([
          'firstName',
          'lastName',
          'email',
          'password',
          'confirmPassword',
          'country',
        ]);
      case 2:
        return await form.trigger([
          'experience',
          'subjects',
          'ageGroups',
          'bio',
        ]);
      case 3:
        return await form.trigger([
          'availableDays',
          'timezone',
          'preferredTimes',
          'agreeToTerms',
          'agreeToBackgroundCheck',
        ]);
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: QuickTeacherRegistrationData) => {
    if (!hcaptchaToken) {
      form.setError('hcaptchaToken', {
        type: 'manual',
        message: 'Please complete the captcha verification',
      });
      toast({
        title: 'Verification Required',
        description: 'Please complete the captcha verification to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      toast({
        title: 'Submitting Application',
        description: 'Creating your teacher profile...',
      });

      const enhancedData = {
        ...data,
        hcaptchaToken,
      };

      await onSubmit(enhancedData);

      toast({
        title: 'Application Submitted! 🎉',
        description:
          'Welcome to Learnity! Please verify your email to complete your setup.',
      });

      setRegistrationStep('verification');
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.';

      form.setError('root', {
        type: 'manual',
        message: errorMessage,
      });

      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setRegistrationStep('role-selection');
    onBack();
  };

  const isSimple = variant === 'simple';
  const cardClasses = isSimple
    ? 'shadow-none border-0'
    : 'shadow-xl border-0 bg-white/95 backdrop-blur';

  return (
    <div>
      <div>
        <CardHeader className={isSimple ? 'space-y-6 px-0' : 'space-y-6 pb-8'}>
          {isSimple ? (
            /* Simple Header */
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='text-sm font-medium text-slate-500'>
                  Step {currentStep} of {steps.length}
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleBack}
                  className='text-slate-500 hover:text-slate-900'
                >
                  <ChevronLeft className='h-4 w-4 mr-2' />
                  Back
                </Button>
              </div>

              <div className='space-y-1'>
                <h1 className='text-2xl font-black italic uppercase tracking-tighter'>
                  Become a Teacher
                </h1>
              </div>

              <div className='space-y-2'>
                <div className='flex justify-between text-xs text-muted-foreground'>
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className='h-2' />
              </div>
            </div>
          ) : (
            /* Original Header */
            <>
              <div className='flex items-center justify-between'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleBack}
                  className='text-gray-600 hover:text-gray-800'
                >
                  <ChevronLeft className='h-4 w-4 mr-2' />
                  Back
                </Button>
                <div className='text-sm text-gray-500'>
                  Step {currentStep} of {steps.length}
                </div>
              </div>

              <div className='text-center space-y-2'>
                <div className='flex items-center justify-center mb-4'>
                  <div className='p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full'>
                    <BookOpen className='h-8 w-8 text-white' />
                  </div>
                </div>
                <CardTitle className='text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent'>
                  Become a Teacher
                </CardTitle>
                <CardDescription className='text-lg text-gray-600'>
                  {currentStepData?.description} • Quick & Easy Setup
                </CardDescription>
              </div>

              <div className='space-y-4'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>Progress</span>
                  <span className='font-medium text-green-600'>
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className='h-3' />

                <div className='flex justify-between'>
                  {steps.map(step => {
                    const Icon = step.icon;
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;

                    return (
                      <div
                        key={step.id}
                        className='flex flex-col items-center space-y-2'
                      >
                        <div
                          className={`
                          w-10 h-10 rounded-full flex items-center justify-center transition-all
                          ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isCurrent
                                ? 'bg-slate-500 text-white'
                                : 'bg-gray-200 text-gray-500'
                          }
                        `}
                        >
                          {isCompleted ? (
                            <CheckCircle className='h-5 w-5' />
                          ) : (
                            <Icon className='h-5 w-5' />
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            isCurrent
                              ? 'text-blue-600'
                              : isCompleted
                                ? 'text-green-600'
                                : 'text-gray-500'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </CardHeader>

        <CardContent className='space-y-6'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-6'
            >
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className='space-y-6 animate-in slide-in-from-right-5 duration-300'>
                  <div className='text-center mb-6'>
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                      Let's get to know you
                    </h3>
                    <p className='text-gray-600'>
                      Basic information to create your account
                    </p>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='firstName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='John'
                              {...field}
                              className='h-12 transition-colors focus:border-green-500'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='lastName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Doe'
                              {...field}
                              className='h-12 transition-colors focus:border-green-500'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='john.doe@example.com'
                            {...field}
                            className='h-12 transition-colors focus:border-green-500'
                          />
                        </FormControl>
                        <FormDescription>
                          We'll send important updates to this email
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='password'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password *</FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder='Create a strong password'
                                {...field}
                                className='h-12 pr-10 transition-colors focus:border-green-500'
                              />
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className='h-4 w-4 text-gray-400' />
                                ) : (
                                  <Eye className='h-4 w-4 text-gray-400' />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='confirmPassword'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password *</FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder='Confirm your password'
                                {...field}
                                className='h-12 pr-10 transition-colors focus:border-green-500'
                              />
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className='h-4 w-4 text-gray-400' />
                                ) : (
                                  <Eye className='h-4 w-4 text-gray-400' />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='country'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className='h-12'>
                                <SelectValue placeholder='Select your City' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COUNTRIES.map(country => (
                                <SelectItem key={country} value={country}>
                                  {country}
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
                      name='phone'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              type='tel'
                              placeholder='+1234567890'
                              {...field}
                              className='h-12 transition-colors focus:border-green-500'
                            />
                          </FormControl>
                          <FormDescription>
                            Include country code (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Teaching Profile */}
              {currentStep === 2 && (
                <div className='space-y-6 animate-in slide-in-from-right-5 duration-300'>
                  <div className='text-center mb-6'>
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                      Tell us about your teaching
                    </h3>
                    <p className='text-gray-600'>
                      Help students understand your expertise
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name='experience'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Teaching Experience *</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min='0'
                            max='50'
                            placeholder='5'
                            {...field}
                            onChange={e =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                            className='h-12 transition-colors focus:border-green-500'
                          />
                        </FormControl>
                        <FormDescription>
                          Include all teaching, tutoring, and training
                          experience
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='subjects'
                    render={() => (
                      <FormItem>
                        <FormLabel>Subjects You Teach * (Max 5)</FormLabel>
                        <FormDescription>
                          Select your main teaching subjects
                        </FormDescription>
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 max-h-48 overflow-y-auto'>
                          {SUBJECTS.map(subject => (
                            <div
                              key={subject}
                              className='flex items-center space-x-2'
                            >
                              <Checkbox
                                id={subject}
                                checked={
                                  form.watch('subjects')?.includes(subject) ||
                                  false
                                }
                                onCheckedChange={checked =>
                                  handleArrayFieldToggle(
                                    'subjects',
                                    subject,
                                    checked as boolean
                                  )
                                }
                                disabled={
                                  form.watch('subjects')?.length >= 5 &&
                                  !form.watch('subjects')?.includes(subject)
                                }
                              />
                              <Label
                                htmlFor={subject}
                                className='text-sm font-normal cursor-pointer'
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

                  <FormField
                    control={form.control}
                    name='ageGroups'
                    render={() => (
                      <FormItem>
                        <FormLabel>Age Groups You Teach * (Max 3)</FormLabel>
                        <FormDescription>
                          Select the age groups you're comfortable teaching
                        </FormDescription>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-2'>
                          {AGE_GROUPS.map(ageGroup => (
                            <div
                              key={ageGroup}
                              className='flex items-center space-x-2'
                            >
                              <Checkbox
                                id={ageGroup}
                                checked={
                                  form.watch('ageGroups')?.includes(ageGroup) ||
                                  false
                                }
                                onCheckedChange={checked =>
                                  handleArrayFieldToggle(
                                    'ageGroups',
                                    ageGroup,
                                    checked as boolean
                                  )
                                }
                                disabled={
                                  form.watch('ageGroups')?.length >= 3 &&
                                  !form.watch('ageGroups')?.includes(ageGroup)
                                }
                              />
                              <Label
                                htmlFor={ageGroup}
                                className='text-sm font-normal cursor-pointer'
                              >
                                {ageGroup}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='bio'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Teaching Bio * (50-500 characters)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Tell students about your teaching style, experience, and what makes you a great teacher...'
                            className='min-h-[120px] transition-colors focus:border-green-500'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0}/500 characters • This will
                          be visible to students
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='hourlyRate'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Rate (PKR)</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min='5'
                              max='500'
                              placeholder='25'
                              {...field}
                              onChange={e =>
                                field.onChange(
                                  parseFloat(e.target.value) || undefined
                                )
                              }
                              className='h-12 transition-colors focus:border-green-500'
                            />
                          </FormControl>
                          <FormDescription>
                            You can adjust this later
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='youtubeIntroUrl'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube Introduction Video</FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <Input
                                placeholder='https://youtube.com/watch?v=...'
                                {...field}
                                className='h-12 pl-10 transition-colors focus:border-green-500'
                              />
                              <Youtube className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500' />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Optional: Add a YouTube video introduction
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Availability & Verification */}
              {currentStep === 3 && (
                <div className='space-y-6 animate-in slide-in-from-right-5 duration-300'>
                  <div className='text-center mb-6'>
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                      When are you available?
                    </h3>
                    <p className='text-gray-600'>
                      Set your schedule and complete verification
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name='availableDays'
                    render={() => (
                      <FormItem>
                        <FormLabel>Available Days *</FormLabel>
                        <FormDescription>
                          Select the days you're available to teach
                        </FormDescription>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mt-2'>
                          {DAYS_OF_WEEK.map(day => (
                            <div
                              key={day}
                              className='flex items-center space-x-2'
                            >
                              <Checkbox
                                id={day}
                                checked={
                                  form.watch('availableDays')?.includes(day) ||
                                  false
                                }
                                onCheckedChange={checked =>
                                  handleArrayFieldToggle(
                                    'availableDays',
                                    day,
                                    checked as boolean
                                  )
                                }
                              />
                              <Label
                                htmlFor={day}
                                className='text-sm font-normal cursor-pointer'
                              >
                                {day}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='timezone'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className='h-12'>
                                <SelectValue placeholder='Select your timezone' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TIMEZONES.map(timezone => (
                                <SelectItem key={timezone} value={timezone}>
                                  {timezone}
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
                      name='preferredTimes'
                      render={() => (
                        <FormItem>
                          <FormLabel>Preferred Time Slots * (Max 4)</FormLabel>
                          <FormDescription>
                            Select your preferred teaching times
                          </FormDescription>
                          <div className='space-y-2 mt-2'>
                            {TIME_SLOTS.map(timeSlot => (
                              <div
                                key={timeSlot}
                                className='flex items-center space-x-2'
                              >
                                <Checkbox
                                  id={timeSlot}
                                  checked={
                                    form
                                      .watch('preferredTimes')
                                      ?.includes(timeSlot) || false
                                  }
                                  onCheckedChange={checked =>
                                    handleArrayFieldToggle(
                                      'preferredTimes',
                                      timeSlot,
                                      checked as boolean
                                    )
                                  }
                                  disabled={
                                    form.watch('preferredTimes')?.length >= 4 &&
                                    !form
                                      .watch('preferredTimes')
                                      ?.includes(timeSlot)
                                  }
                                />
                                <Label
                                  htmlFor={timeSlot}
                                  className='text-sm font-normal cursor-pointer'
                                >
                                  {timeSlot}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* hCaptcha */}
                  <div className='space-y-4'>
                    <div className='flex justify-center'>
                      <HCaptcha
                        sitekey={
                          process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ''
                        }
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

                    {/* Terms Agreement - Now below captcha */}
                    <FormField
                      control={form.control}
                      name='agreeToTerms'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 p-4 bg-white rounded-xl border border-slate-100 shadow-sm'>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className='space-y-1 leading-none'>
                            <FormLabel className='text-sm font-medium text-slate-700 cursor-pointer'>
                              I agree to the{' '}
                              <Link
                                href='/terms'
                                className='text-blue-600 hover:text-blue-700 underline font-bold transition-colors'
                              >
                                Terms of Service
                              </Link>{' '}
                              and{' '}
                              <Link
                                href='/privacy'
                                className='text-blue-600 hover:text-blue-700 underline font-bold transition-colors'
                              >
                                Privacy Policy
                              </Link>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Legal Agreements */}
                  <div className='space-y-4 p-4 bg-gray-50 rounded-lg'>
                    <h4 className='font-medium text-gray-900 flex items-center gap-2'>
                      <Shield className='h-5 w-5' />
                      Verification & Agreement
                    </h4>

                    <FormField
                      control={form.control}
                      name='agreeToBackgroundCheck'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className='space-y-1 leading-none'>
                            <FormLabel className='text-sm font-normal'>
                              I consent to background verification checks
                            </FormLabel>
                            <FormDescription className='text-xs'>
                              This helps maintain platform safety and trust
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className='flex justify-between pt-6 border-t'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={currentStep === 1 ? handleBack : handlePrevious}
                  className='flex items-center gap-2'
                >
                  <ChevronLeft className='h-4 w-4' />
                  {currentStep === 1 ? 'Back to Roles' : 'Previous'}
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    type='button'
                    onClick={handleNext}
                    className='flex items-center gap-2 bg-zinc-600 hover:bg-zinc-700'
                  >
                    Next
                    <ArrowRight className='h-4 w-4' />
                  </Button>
                ) : (
                  <Button
                    type='submit'
                    disabled={isSubmitting || !form.formState.isValid}
                    className='flex items-center gap-2 bg-zinc-600 hover:bg-zinc-700'
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <CheckCircle className='h-4 w-4' />
                        Create Teacher Account
                      </>
                    )}
                  </Button>
                )}
              </div>

              {form.formState.errors.root && (
                <div className='text-sm text-red-600 text-center bg-red-50 p-3 rounded-md'>
                  {form.formState.errors.root.message}
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </div>
    </div>
  );
};

export default QuickTeacherRegistrationForm;

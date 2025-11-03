/**
 * Teacher Registration Form Component
 * Handles teacher registration with comprehensive application data collection
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
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { teacherRegistrationSchema, type TeacherRegistrationData } from '@/lib/validators/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { BookOpen, Eye, EyeOff, ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

const QUALIFICATIONS = [
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'PhD/Doctorate',
  'Teaching Certificate',
  'Professional Certification',
  'Industry Experience',
  'Online Teaching Experience',
  'Tutoring Experience'
];

const SUBJECTS = [
  'Mathematics', 'Science', 'English', 'History', 'Geography',
  'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art',
  'Music', 'Physical Education', 'Foreign Languages', 'Economics',
  'Psychology', 'Philosophy', 'Literature', 'Statistics',
  'Engineering', 'Business', 'Accounting', 'Marketing'
];

export interface TeacherRegistrationFormProps {
  onSubmit: (data: TeacherRegistrationData) => Promise<void>;
  onBack: () => void;
  className?: string;
}

export const TeacherRegistrationForm: React.FC<TeacherRegistrationFormProps> = ({
  onSubmit,
  onBack,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const { setRegistrationStep } = useAuthStore();

  const form = useForm<TeacherRegistrationData>({
    resolver: zodResolver(teacherRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      qualifications: [],
      subjects: [],
      experience: 0,
      bio: '',
      hourlyRate: undefined,
      agreeToTerms: false,
      hcaptchaToken: ''
    },
    mode: 'onChange'
  });

  const handleSubmit = async (data: TeacherRegistrationData) => {
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

  const handleQualificationToggle = (qualification: string, checked: boolean) => {
    const currentQualifications = form.getValues('qualifications');
    if (checked) {
      form.setValue('qualifications', [...currentQualifications, qualification]);
    } else {
      form.setValue('qualifications', currentQualifications.filter(q => q !== qualification));
    }
    form.trigger('qualifications');
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`w-full max-w-4xl mx-auto p-6 ${className}`}>
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
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Teacher Application</CardTitle>
              <CardDescription>
                Apply to become a verified teacher on our platform
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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
                            className="transition-colors focus:border-green-500"
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
                            className="transition-colors focus:border-green-500"
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
                          placeholder="Enter your professional email address"
                          {...field}
                          className="transition-colors focus:border-green-500"
                        />
                      </FormControl>
                      <FormDescription>
                        We'll send application updates to this address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              className="pr-10 transition-colors focus:border-green-500"
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
                              className="pr-10 transition-colors focus:border-green-500"
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
              </div>

              {/* Professional Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                
                <FormField
                  control={form.control}
                  name="qualifications"
                  render={() => (
                    <FormItem>
                      <FormLabel>Qualifications</FormLabel>
                      <FormDescription>
                        Select all qualifications that apply to you
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {QUALIFICATIONS.map((qualification) => (
                          <div key={qualification} className="flex items-center space-x-2">
                            <Checkbox
                              id={qualification}
                              checked={form.watch('qualifications').includes(qualification)}
                              onCheckedChange={(checked) => 
                                handleQualificationToggle(qualification, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={qualification}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {qualification}
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
                  name="subjects"
                  render={() => (
                    <FormItem>
                      <FormLabel>Subjects You Can Teach</FormLabel>
                      <FormDescription>
                        Select all subjects you're qualified to teach
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Teaching Experience</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="transition-colors focus:border-green-500"
                          />
                        </FormControl>
                        <FormDescription>
                          Include all teaching and tutoring experience
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate (USD) - Optional</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="5"
                            max="500"
                            placeholder="25"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            className="transition-colors focus:border-green-500"
                          />
                        </FormControl>
                        <FormDescription>
                          You can set this later in your profile
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your teaching experience, methodology, and what makes you a great teacher..."
                          className="min-h-[120px] transition-colors focus:border-green-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 50 characters. This will be visible to students.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Document Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Supporting Documents</h3>
                <p className="text-sm text-gray-600">
                  Upload certificates, diplomas, or other relevant documents (PDF, JPG, PNG - Max 5MB each)
                </p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <Label htmlFor="documents" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Click to upload documents
                    </span>
                    <span className="text-gray-600"> or drag and drop</span>
                  </Label>
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
                          <button type="button" className="text-green-600 hover:text-green-700 underline">
                            Terms of Service
                          </button>,{' '}
                          <button type="button" className="text-green-600 hover:text-green-700 underline">
                            Privacy Policy
                          </button>, and{' '}
                          <button type="button" className="text-green-600 hover:text-green-700 underline">
                            Teacher Guidelines
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
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  'Submit Teacher Application'
                )}
              </Button>

              {form.formState.errors.root && (
                <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md">
                  {form.formState.errors.root.message}
                </div>
              )}

              <div className="text-center text-sm text-gray-600 bg-blue-50 p-4 rounded-md">
                <p className="font-medium">Application Review Process</p>
                <p>Your application will be reviewed by our team within 2-3 business days. You'll receive an email notification once the review is complete.</p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherRegistrationForm;
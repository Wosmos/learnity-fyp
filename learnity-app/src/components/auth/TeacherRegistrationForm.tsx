/**
 * Enhanced Teacher Registration Form Component
 * Comprehensive teacher application with rich profile data collection
 */

'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { enhancedTeacherRegistrationSchema, type EnhancedTeacherRegistrationData } from '@/lib/validators/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { 
  BookOpen, Eye, EyeOff, ArrowLeft, Loader2, Upload, X, User, 
  GraduationCap, Clock, Camera, FileText, Shield,
  MapPin, Video, Award, Heart
} from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { uploadToVercelBlob } from '@/lib/services/blob.service';
import { useToast } from '@/hooks/use-toast';

// Enhanced form data constants
const QUALIFICATIONS = [
  'Bachelor&apos;s Degree', 'Master&apos;s Degree', 'PhD/Doctorate', 'Teaching Certificate',
  'Professional Certification', 'Industry Experience', 'Online Teaching Experience',
  'Tutoring Experience', 'TESOL/TEFL Certificate', 'Subject-Specific Certification'
];

const SUBJECTS = [
  'Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics',
  'Chemistry', 'Biology', 'Computer Science', 'Art', 'Music', 'Physical Education',
  'Foreign Languages', 'Economics', 'Psychology', 'Philosophy', 'Literature',
  'Statistics', 'Engineering', 'Business', 'Accounting', 'Marketing', 'Finance',
  'Data Science', 'Programming', 'Web Development', 'Graphic Design'
];

const TEACHING_METHODS = [
  'Visual Learning', 'Auditory Learning', 'Kinesthetic Learning', 'Interactive Discussions',
  'Problem-Based Learning', 'Project-Based Learning', 'Gamification', 'Storytelling',
  'Hands-On Activities', 'Technology Integration'
];

const AGE_GROUPS = [
  'Early Childhood (3-5)', 'Elementary (6-10)', 'Middle School (11-13)',
  'High School (14-18)', 'College/University (18-22)', 'Adult Learners (23+)',
  'Senior Learners (65+)', 'Special Needs'
];

const LESSON_TYPES = [
  'One-on-One Tutoring', 'Small Group (2-5)', 'Large Group (6+)',
  'Workshop Style', 'Intensive Bootcamp'
];

const TECHNOLOGY_SKILLS = [
  'Zoom', 'Google Meet', 'Microsoft Teams', 'Skype', 'Interactive Whiteboards',
  'Screen Sharing', 'Document Collaboration', 'Online Assessment Tools',
  'Learning Management Systems', 'Video Recording', 'Live Streaming',
  'Virtual Reality', 'Augmented Reality', 'Mobile Apps', 'Educational Software'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
  'Chinese (Mandarin)', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Dutch',
  'Swedish', 'Norwegian', 'Danish', 'Polish', 'Turkish', 'Greek', 'Hebrew'
];

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France',
  'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Switzerland', 'Austria', 'Belgium', 'Ireland', 'New Zealand', 'Japan',
  'South Korea', 'Singapore', 'India', 'Brazil', 'Mexico', 'Argentina'
];

const TIMEZONES = [
  'UTC-12:00 (Baker Island)', 'UTC-11:00 (American Samoa)', 'UTC-10:00 (Hawaii)',
  'UTC-09:00 (Alaska)', 'UTC-08:00 (Pacific)', 'UTC-07:00 (Mountain)',
  'UTC-06:00 (Central)', 'UTC-05:00 (Eastern)', 'UTC-04:00 (Atlantic)',
  'UTC-03:00 (Argentina)', 'UTC-02:00 (South Georgia)', 'UTC-01:00 (Azores)',
  'UTC+00:00 (London)', 'UTC+01:00 (Central Europe)', 'UTC+02:00 (Eastern Europe)',
  'UTC+03:00 (Moscow)', 'UTC+04:00 (Dubai)', 'UTC+05:00 (Pakistan)',
  'UTC+05:30 (India)', 'UTC+06:00 (Bangladesh)', 'UTC+07:00 (Thailand)',
  'UTC+08:00 (China)', 'UTC+09:00 (Japan)', 'UTC+10:00 (Australia East)',
  'UTC+11:00 (Solomon Islands)', 'UTC+12:00 (New Zealand)'
];

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const TIME_SLOTS = [
  'Early Morning (6-9 AM)', 'Morning (9-12 PM)', 'Afternoon (12-3 PM)',
  'Late Afternoon (3-6 PM)', 'Evening (6-9 PM)', 'Night (9-12 AM)',
  'Late Night (12-3 AM)', 'Very Late (3-6 AM)'
];

const PERSONAL_INTERESTS = [
  'Reading', 'Writing', 'Travel', 'Photography', 'Cooking', 'Gardening',
  'Sports', 'Fitness', 'Yoga', 'Meditation', 'Music', 'Dancing', 'Painting',
  'Drawing', 'Crafts', 'Technology', 'Gaming', 'Movies', 'Theater', 'Volunteering'
];

const COMMUNICATION_PREFERENCES = [
  'Email', 'Phone', 'Text', 'Video Call'
];

export interface TeacherRegistrationFormProps {
  onSubmit: (data: EnhancedTeacherRegistrationData) => Promise<void>;
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
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [videoIntro, setVideoIntro] = useState<File | null>(null);
  const [currentTab, setCurrentTab] = useState('basic');
  const [completionProgress, setCompletionProgress] = useState(0);
  
  const { setRegistrationStep } = useAuthStore();
  const { toast } = useToast();

  const form = useForm<EnhancedTeacherRegistrationData>({
    resolver: zodResolver(enhancedTeacherRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      dateOfBirth: '',
      gender: undefined,
      qualifications: [],
      subjects: [],
      experience: 0,
      onlineExperience: 0,
      bio: '',
      headline: '',
      teachingApproach: '',
      hourlyRate: undefined,
      teachingMethods: [],
      ageGroups: [],
      lessonTypes: [],
      technologySkills: [],
      availableDays: [],
      preferredTimes: [],
      timezone: '',
      minSessionLength: 60,
      maxSessionLength: 120,
      languages: [],
      education: [],
      certifications: [],
      specialties: [],
      achievements: [],
      personalInterests: [],
      hobbies: [],
      linkedinUrl: '',
      websiteUrl: '',
      youtubeUrl: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      communicationPreference: undefined,
      whyChooseMe: [],
      agreeToTerms: false,
      agreeToBackgroundCheck: false,
      hcaptchaToken: ''
    },
    mode: 'onChange'
  });

  // Calculate completion progress
  const calculateProgress = useCallback(() => {
    const formValues = form.getValues();
    const requiredFields = [
      'firstName', 'lastName', 'email', 'password', 'confirmPassword',
      'country', 'qualifications', 'subjects', 'bio', 'ageGroups',
      'lessonTypes', 'availableDays', 'preferredTimes', 'timezone',
      'languages', 'education', 'agreeToTerms', 'agreeToBackgroundCheck'
    ];
    
    let completedFields = 0;
    requiredFields.forEach(field => {
      const value = formValues[field as keyof EnhancedTeacherRegistrationData];
      if (Array.isArray(value) ? value.length > 0 : value) {
        completedFields++;
      }
    });
    
    const progress = Math.round((completedFields / requiredFields.length) * 100);
    setCompletionProgress(progress);
  }, [form]);

  // Watch form changes to update progress
  React.useEffect(() => {
    const subscription = form.watch(() => calculateProgress());
    return () => subscription.unsubscribe();
  }, [form, calculateProgress]);

  const handleSubmit = async (data: EnhancedTeacherRegistrationData) => {
    if (!hcaptchaToken) {
      form.setError('hcaptchaToken', {
        type: 'manual',
        message: 'Please complete the captcha verification'
      });
      toast({
        title: "Verification Required",
        description: "Please complete the captcha verification to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Show progress toast
      toast({
        title: "Submitting Application",
        description: "Please wait while we process your teacher application...",
      });

      // Upload files if present
      let profilePictureUrl = '';
      let bannerImageUrl = '';
      let videoIntroUrl = '';
      const documentUrls: string[] = [];

      // Upload profile picture
      if (profilePicture) {
        try {
          const result = await uploadToVercelBlob.uploadProfilePicture(profilePicture, 'temp-' + Date.now());
          profilePictureUrl = result.url;
          if (!result.url) {
            console.warn('Profile picture upload skipped - Vercel Blob not configured');
          }
        } catch (error) {
          console.error('Profile picture upload failed:', error);
          toast({
            title: "Upload Warning",
            description: "Profile picture upload failed, but application will continue.",
            variant: "destructive",
          });
        }
      }

      // Upload banner image
      if (bannerImage) {
        try {
          const result = await uploadToVercelBlob.uploadBannerImage(bannerImage, 'temp-' + Date.now());
          bannerImageUrl = result.url;
          if (!result.url) {
            console.warn('Banner image upload skipped - Vercel Blob not configured');
          }
        } catch (error) {
          console.error('Banner image upload failed:', error);
          toast({
            title: "Upload Warning",
            description: "Banner image upload failed, but application will continue.",
            variant: "destructive",
          });
        }
      }

      // Upload video introduction
      if (videoIntro) {
        try {
          const result = await uploadToVercelBlob.uploadVideoIntro(videoIntro, 'temp-' + Date.now());
          videoIntroUrl = result.url;
          if (!result.url) {
            console.warn('Video introduction upload skipped - Vercel Blob not configured');
          }
        } catch (error) {
          console.error('Video introduction upload failed:', error);
          toast({
            title: "Upload Warning",
            description: "Video introduction upload failed, but application will continue.",
            variant: "destructive",
          });
        }
      }

      // Upload documents
      for (const file of uploadedFiles) {
        try {
          const result = await uploadToVercelBlob.uploadDocument(file, 'temp-' + Date.now());
          if (result.url) {
            documentUrls.push(result.url);
          } else {
            console.warn(`Document upload skipped for ${file.name} - Vercel Blob not configured`);
          }
        } catch (error) {
          console.error(`Document upload failed for ${file.name}:`, error);
          toast({
            title: "Upload Warning",
            description: `Document "${file.name}" upload failed, but application will continue.`,
            variant: "destructive",
          });
        }
      }

      const enhancedData = {
        ...data,
        hcaptchaToken,
        profilePictureUrl,
        bannerImageUrl,
        videoIntroUrl,
        documentUrls
      };

      console.log('Submitting enhanced teacher data:', {
        email: data.email,
        hasFiles: {
          profilePicture: !!profilePictureUrl,
          bannerImage: !!bannerImageUrl,
          videoIntro: !!videoIntroUrl,
          documents: documentUrls.length
        }
      });

      await onSubmit(enhancedData);
      
      toast({
        title: "Application Submitted!",
        description: "Your teacher application has been submitted successfully. You'll receive an email confirmation shortly.",
      });
      
      setRegistrationStep('verification');
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      
      form.setError('root', {
        type: 'manual',
        message: errorMessage
      });

      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setRegistrationStep('role-selection');
    onBack();
  };

  // Generic array field toggle handler
  const handleArrayFieldToggle = (fieldName: keyof EnhancedTeacherRegistrationData, value: string, checked: boolean) => {
    const currentValues = (form.getValues(fieldName) as string[]) || [];
    const newValues = checked 
      ? [...currentValues, value] 
      : currentValues.filter(v => v !== value);
    
    form.setValue(fieldName, newValues as EnhancedTeacherRegistrationData[typeof fieldName]);
    form.trigger(fieldName);
  };

  // File upload handlers
  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && uploadToVercelBlob.getFileCategory(file) === 'image') {
      setProfilePicture(file);
    }
  };

  const handleBannerImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && uploadToVercelBlob.getFileCategory(file) === 'image') {
      setBannerImage(file);
    }
  };

  const handleVideoIntroUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && uploadToVercelBlob.getFileCategory(file) === 'video') {
      setVideoIntro(file);
    }
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const category = uploadToVercelBlob.getFileCategory(file);
      return category === 'document' || category === 'image';
    });
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeProfilePicture = () => setProfilePicture(null);
  const removeBannerImage = () => setBannerImage(null);
  const removeVideoIntro = () => setVideoIntro(null);

  // Tab navigation
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'contact', label: 'Contact', icon: MapPin },
    { id: 'professional', label: 'Professional', icon: GraduationCap },
    { id: 'teaching', label: 'Teaching', icon: BookOpen },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'media', label: 'Media', icon: Camera },
    { id: 'additional', label: 'Additional', icon: Heart },
    { id: 'verification', label: 'Verification', icon: Shield }
  ];

  const canProceedToNext = (tabId: string): boolean => {
    const values = form.getValues();
    switch (tabId) {
      case 'basic':
        return !!(values.firstName && values.lastName && values.email && values.password && values.confirmPassword);
      case 'contact':
        return !!values.country;
      case 'professional':
        return !!(values.qualifications.length && values.subjects.length && values.bio && values.experience >= 0);
      case 'teaching':
        return !!(values.ageGroups.length && values.lessonTypes.length);
      case 'availability':
        return !!(values.availableDays.length && values.preferredTimes.length && values.timezone);
      case 'additional':
        return !!values.languages.length;
      default:
        return true;
    }
  };

  return (
    <div className={`w-full max-w-6xl mx-auto p-6 ${className}`}>
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
            <div className="text-sm text-gray-600">
              Step {tabs.findIndex(tab => tab.id === currentTab) + 1} of {tabs.length}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold">Enhanced Teacher Application</CardTitle>
              <CardDescription>
                Complete your comprehensive teacher profile to join our platform
              </CardDescription>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Application Progress</span>
              <span className="font-medium text-green-600">{completionProgress}%</span>
            </div>
            <Progress value={completionProgress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isCompleted = canProceedToNext(tab.id);
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={`flex flex-col items-center gap-1 p-2 ${
                          isCompleted ? 'text-green-600' : ''
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs hidden sm:block">{tab.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Basic Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
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
                            <FormLabel>Last Name *</FormLabel>
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
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your professional email address"
                              {...field}
                              className="transition-colors focus:border-green-500"
                            />
                          </FormControl>
                          <FormDescription>
                            We&apos;ll send application updates to this address
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password *</FormLabel>
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
                            <FormLabel>Confirm Password *</FormLabel>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                className="transition-colors focus:border-green-500"
                              />
                            </FormControl>
                            <FormDescription>Must be 18+ years old</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Contact Information Tab */}
                <TabsContent value="contact" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Contact Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                {...field}
                                className="transition-colors focus:border-green-500"
                              />
                            </FormControl>
                            <FormDescription>Include country code</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {COUNTRIES.map((country) => (
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
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full address"
                              {...field}
                              className="transition-colors focus:border-green-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your city"
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
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your state"
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
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP/Postal Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter ZIP code"
                                {...field}
                                className="transition-colors focus:border-green-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Emergency Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="emergencyContactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Full name"
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
                          name="emergencyContactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Phone</FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  placeholder="+1 (555) 123-4567"
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
                          name="emergencyContactRelation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Relationship</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Spouse, Parent"
                                  {...field}
                                  className="transition-colors focus:border-green-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="communicationPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Communication Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select preference" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COMMUNICATION_PREFERENCES.map((pref) => (
                                <SelectItem key={pref} value={pref}>
                                  {pref}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Professional Information Tab */}
                <TabsContent value="professional" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Professional Information
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="qualifications"
                      render={() => (
                        <FormItem>
                          <FormLabel>Qualifications *</FormLabel>
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
                                    handleArrayFieldToggle('qualifications', qualification, checked as boolean)
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
                          <FormLabel>Subjects You Can Teach *</FormLabel>
                          <FormDescription>
                            Select all subjects you&apos;re qualified to teach
                          </FormDescription>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 max-h-48 overflow-y-auto">
                            {SUBJECTS.map((subject) => (
                              <div key={subject} className="flex items-center space-x-2">
                                <Checkbox
                                  id={subject}
                                  checked={form.watch('subjects').includes(subject)}
                                  onCheckedChange={(checked) => 
                                    handleArrayFieldToggle('subjects', subject, checked as boolean)
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
                            <FormLabel>Years of Teaching Experience *</FormLabel>
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
                        name="onlineExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Online Teaching Experience</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="30"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                className="transition-colors focus:border-green-500"
                              />
                            </FormControl>
                            <FormDescription>
                              Specific online/remote teaching experience
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="headline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Headline</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Experienced Math Tutor Specializing in Calculus"
                              {...field}
                              className="transition-colors focus:border-green-500"
                            />
                          </FormControl>
                          <FormDescription>
                            A catchy one-line description of your expertise
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Bio *</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="teachingApproach"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teaching Approach & Methodology</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your teaching philosophy, methods, and how you adapt to different learning styles..."
                              className="min-h-[100px] transition-colors focus:border-green-500"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Explain your unique teaching methodology
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
                          <FormLabel>Hourly Rate (USD)</FormLabel>
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
                            You can adjust this later in your profile
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent> 
               {/* Teaching Details Tab */}
                <TabsContent value="teaching" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Teaching Details
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="teachingMethods"
                      render={() => (
                        <FormItem>
                          <FormLabel>Teaching Methods</FormLabel>
                          <FormDescription>
                            Select your preferred teaching approaches
                          </FormDescription>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            {TEACHING_METHODS.map((method) => (
                              <div key={method} className="flex items-center space-x-2">
                                <Checkbox
                                  id={method}
                                  checked={form.watch('teachingMethods')?.includes(method) || false}
                                  onCheckedChange={(checked) => 
                                    handleArrayFieldToggle('teachingMethods', method, checked as boolean)
                                  }
                                />
                                <Label
                                  htmlFor={method}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {method}
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
                      name="ageGroups"
                      render={() => (
                        <FormItem>
                          <FormLabel>Age Groups You Teach *</FormLabel>
                          <FormDescription>
                            Select all age groups you&apos;re comfortable teaching
                          </FormDescription>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            {AGE_GROUPS.map((ageGroup) => (
                              <div key={ageGroup} className="flex items-center space-x-2">
                                <Checkbox
                                  id={ageGroup}
                                  checked={form.watch('ageGroups')?.includes(ageGroup) || false}
                                  onCheckedChange={(checked) => 
                                    handleArrayFieldToggle('ageGroups', ageGroup, checked as boolean)
                                  }
                                />
                                <Label
                                  htmlFor={ageGroup}
                                  className="text-sm font-normal cursor-pointer"
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
                      name="lessonTypes"
                      render={() => (
                        <FormItem>
                          <FormLabel>Lesson Types *</FormLabel>
                          <FormDescription>
                            Select the types of lessons you offer
                          </FormDescription>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            {LESSON_TYPES.map((lessonType) => (
                              <div key={lessonType} className="flex items-center space-x-2">
                                <Checkbox
                                  id={lessonType}
                                  checked={form.watch('lessonTypes').includes(lessonType)}
                                  onCheckedChange={(checked) => 
                                    handleArrayFieldToggle('lessonTypes', lessonType, checked as boolean)
                                  }
                                />
                                <Label
                                  htmlFor={lessonType}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {lessonType}
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
                      name="technologySkills"
                      render={() => (
                        <FormItem>
                          <FormLabel>Technology Skills</FormLabel>
                          <FormDescription>
                            Select the technologies you&apos;re proficient with
                          </FormDescription>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 max-h-48 overflow-y-auto">
                            {TECHNOLOGY_SKILLS.map((skill) => (
                              <div key={skill} className="flex items-center space-x-2">
                                <Checkbox
                                  id={skill}
                                  checked={form.watch('technologySkills')?.includes(skill) || false}
                                  onCheckedChange={(checked) => 
                                    handleArrayFieldToggle('technologySkills', skill, checked as boolean)
                                  }
                                />
                                <Label
                                  htmlFor={skill}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {skill}
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
                        name="minSessionLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Session Length (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="15"
                                max="180"
                                placeholder="60"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                                className="transition-colors focus:border-green-500"
                              />
                            </FormControl>
                            <FormDescription>
                              Shortest lesson duration you offer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxSessionLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Session Length (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="30"
                                max="300"
                                placeholder="120"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 120)}
                                className="transition-colors focus:border-green-500"
                              />
                            </FormControl>
                            <FormDescription>
                              Longest lesson duration you offer
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Availability Tab */}
                <TabsContent value="availability" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Availability & Schedule
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="availableDays"
                      render={() => (
                        <FormItem>
                          <FormLabel>Available Days *</FormLabel>
                          <FormDescription>
                            Select the days you&apos;re available to teach
                          </FormDescription>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                            {DAYS_OF_WEEK.map((day) => (
                              <div key={day} className="flex items-center space-x-2">
                                <Checkbox
                                  id={day}
                                  checked={form.watch('availableDays').includes(day)}
                                  onCheckedChange={(checked) => 
                                    handleArrayFieldToggle('availableDays', day, checked as boolean)
                                  }
                                />
                                <Label
                                  htmlFor={day}
                                  className="text-sm font-normal cursor-pointer"
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

                    <FormField
                      control={form.control}
                      name="preferredTimes"
                      render={() => (
                        <FormItem>
                          <FormLabel>Preferred Time Slots *</FormLabel>
                          <FormDescription>
                            Select your preferred teaching times
                          </FormDescription>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            {TIME_SLOTS.map((timeSlot) => (
                              <div key={timeSlot} className="flex items-center space-x-2">
                                <Checkbox
                                  id={timeSlot}
                                  checked={form.watch('preferredTimes').includes(timeSlot)}
                                  onCheckedChange={(checked) => 
                                    handleArrayFieldToggle('preferredTimes', timeSlot, checked as boolean)
                                  }
                                />
                                <Label
                                  htmlFor={timeSlot}
                                  className="text-sm font-normal cursor-pointer"
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

                    <FormField
                      control={form.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your timezone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TIMEZONES.map((timezone) => (
                                <SelectItem key={timezone} value={timezone}>
                                  {timezone}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            This helps students book at convenient times
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="languages"
                      render={() => (
                        <FormItem>
                          <FormLabel>Languages You Speak *</FormLabel>
                          <FormDescription>
                            Select all languages you can teach in
                          </FormDescription>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 max-h-48 overflow-y-auto">
                            {LANGUAGES.map((language) => (
                              <div key={language} className="flex items-center space-x-2">
                                <Checkbox
                                  id={language}
                                  checked={form.watch('languages').includes(language)}
                                  onCheckedChange={(checked) => 
                                    handleArrayFieldToggle('languages', language, checked as boolean)
                                  }
                                />
                                <Label
                                  htmlFor={language}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {language}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Media Upload Tab */}
                <TabsContent value="media" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Media & Documents
                    </h3>
                    
                    {!process.env.NEXT_PUBLIC_BLOB_TOKEN && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-yellow-600">⚠️</div>
                          <div>
                            <h4 className="text-sm font-medium text-yellow-800">File Upload Notice</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              File uploads are currently not configured. You can still submit your application, 
                              and files can be uploaded later through your profile settings.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Profile Picture Upload */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Profile Picture</Label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                          {profilePicture ? (
                            <Image
                              src={URL.createObjectURL(profilePicture)}
                              alt="Profile preview"
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="profilePicture" className="cursor-pointer">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                              <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                              <span className="text-sm text-gray-600">
                                Click to upload profile picture
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                JPG, PNG up to 10MB
                              </p>
                            </div>
                          </Label>
                          <Input
                            id="profilePicture"
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureUpload}
                            className="hidden"
                          />
                          {profilePicture && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={removeProfilePicture}
                              className="mt-2"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Banner Image Upload */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Banner Image (Optional)</Label>
                      <div className="space-y-3">
                        {bannerImage && (
                          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={URL.createObjectURL(bannerImage)}
                              alt="Banner preview"
                              width={1200}
                              height={128}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <Label htmlFor="bannerImage" className="cursor-pointer">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <span className="text-sm text-gray-600">
                              Click to upload banner image
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG up to 10MB • Recommended: 1200x400px
                            </p>
                          </div>
                        </Label>
                        <Input
                          id="bannerImage"
                          type="file"
                          accept="image/*"
                          onChange={handleBannerImageUpload}
                          className="hidden"
                        />
                        {bannerImage && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={removeBannerImage}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove Banner
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Video Introduction Upload */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Video Introduction (Optional)</Label>
                      <div className="space-y-3">
                        {videoIntro && (
                          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">{videoIntro.name}</p>
                              <p className="text-xs text-gray-500">
                                {(videoIntro.size / (1024 * 1024)).toFixed(1)} MB
                              </p>
                            </div>
                          </div>
                        )}
                        <Label htmlFor="videoIntro" className="cursor-pointer">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                            <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <span className="text-sm text-gray-600">
                              Click to upload video introduction
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              MP4, WebM up to 50MB • Max 3 minutes
                            </p>
                          </div>
                        </Label>
                        <Input
                          id="videoIntro"
                          type="file"
                          accept="video/*"
                          onChange={handleVideoIntroUpload}
                          className="hidden"
                        />
                        {videoIntro && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={removeVideoIntro}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove Video
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Document Upload */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Supporting Documents</Label>
                      <p className="text-sm text-gray-600">
                        Upload certificates, diplomas, or other relevant documents
                      </p>
                      
                      <Label htmlFor="documents" className="cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-blue-600 hover:text-blue-700 font-medium">
                            Click to upload documents
                          </span>
                          <span className="text-gray-600"> or drag and drop</span>
                          <p className="text-xs text-gray-500 mt-1">
                            PDF, JPG, PNG up to 10MB each
                          </p>
                        </div>
                      </Label>
                      <Input
                        id="documents"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleDocumentUpload}
                        className="hidden"
                      />

                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                          <div className="space-y-2">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="text-sm text-gray-700">{file.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                                    </p>
                                  </div>
                                </div>
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
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Additional Information Tab */}
                <TabsContent value="additional" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Additional Information
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education Background *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="List your educational qualifications, degrees, institutions..."
                              className="min-h-[100px] transition-colors focus:border-green-500"
                              {...field}
                              onChange={(e) => {
                                const lines = e.target.value.split('\n').filter(line => line.trim());
                                field.onChange(lines);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter each qualification on a new line
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="certifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certifications</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="List any relevant certifications..."
                              className="min-h-[80px] transition-colors focus:border-green-500"
                              {...field}
                              onChange={(e) => {
                                const lines = e.target.value.split('\n').filter(line => line.trim());
                                field.onChange(lines);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter each certification on a new line
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialties"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teaching Specialties</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="List your teaching specialties and areas of expertise..."
                              className="min-h-[80px] transition-colors focus:border-green-500"
                              {...field}
                              onChange={(e) => {
                                const lines = e.target.value.split('\n').filter(line => line.trim());
                                field.onChange(lines);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter each specialty on a new line
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="achievements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Achievements & Awards</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="List any teaching awards, recognitions, or notable achievements..."
                              className="min-h-[80px] transition-colors focus:border-green-500"
                              {...field}
                              onChange={(e) => {
                                const lines = e.target.value.split('\n').filter(line => line.trim());
                                field.onChange(lines);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter each achievement on a new line
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="whyChooseMe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Why Choose Me?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What makes you unique as a teacher? List your key differentiators..."
                              className="min-h-[100px] transition-colors focus:border-green-500"
                              {...field}
                              onChange={(e) => {
                                const lines = e.target.value.split('\n').filter(line => line.trim());
                                field.onChange(lines);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter each key point on a new line (max 5 points)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="personalInterests"
                      render={() => (
                        <FormItem>
                          <FormLabel>Personal Interests</FormLabel>
                          <FormDescription>
                            Share your interests to help students connect with you
                          </FormDescription>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 max-h-48 overflow-y-auto">
                            {PERSONAL_INTERESTS.map((interest) => (
                              <div key={interest} className="flex items-center space-x-2">
                                <Checkbox
                                  id={interest}
                                  checked={form.watch('personalInterests')?.includes(interest) || false}
                                  onCheckedChange={(checked) => 
                                    handleArrayFieldToggle('personalInterests', interest, checked as boolean)
                                  }
                                />
                                <Label
                                  htmlFor={interest}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {interest}
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
                      name="hobbies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hobbies</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="List your hobbies and interests outside of teaching..."
                              className="min-h-[80px] transition-colors focus:border-green-500"
                              {...field}
                              onChange={(e) => {
                                const lines = e.target.value.split('\n').filter(line => line.trim());
                                field.onChange(lines);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter each hobby on a new line
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Professional Links</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="linkedinUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>LinkedIn Profile</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://linkedin.com/in/yourprofile"
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
                          name="websiteUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Personal Website</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://yourwebsite.com"
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
                          name="youtubeUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>YouTube Channel</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://youtube.com/c/yourchannel"
                                  {...field}
                                  className="transition-colors focus:border-green-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Verification Tab */}
                <TabsContent value="verification" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Verification & Agreement
                    </h3>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Application Review Process</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Your application will be reviewed within 2-3 business days</li>
                        <li>• We may contact you for additional information or clarification</li>
                        <li>• You&apos;ll receive an email notification once the review is complete</li>
                        <li>• Approved teachers get access to the full dashboard and can start teaching</li>
                      </ul>
                    </div>

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

                      <FormField
                        control={form.control}
                        name="agreeToBackgroundCheck"
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
                                I consent to background verification checks as required by the platform
                              </FormLabel>
                              <FormDescription className="text-xs">
                                This may include identity verification, qualification checks, and reference verification
                              </FormDescription>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

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

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Ready to Submit?</h4>
                      <p className="text-sm text-green-800 mb-4">
                        Please review all your information before submitting. You can edit most details later in your profile.
                      </p>
                      
                      <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
                        disabled={isSubmitting || !form.formState.isValid || completionProgress < 80}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting Application...
                          </>
                        ) : (
                          <>
                            <Award className="h-4 w-4 mr-2" />
                            Submit Teacher Application
                          </>
                        )}
                      </Button>

                      {completionProgress < 80 && (
                        <p className="text-sm text-orange-600 text-center mt-2">
                          Please complete at least 80% of the form to submit ({completionProgress}% completed)
                        </p>
                      )}
                    </div>

                    {form.formState.errors.root && (
                      <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md">
                        {form.formState.errors.root.message}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab Navigation */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const currentIndex = tabs.findIndex(tab => tab.id === currentTab);
                      if (currentIndex > 0) {
                        setCurrentTab(tabs[currentIndex - 1].id);
                      }
                    }}
                    disabled={tabs.findIndex(tab => tab.id === currentTab) === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="text-sm text-gray-500">
                    {completionProgress}% Complete
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      const currentIndex = tabs.findIndex(tab => tab.id === currentTab);
                      if (currentIndex < tabs.length - 1) {
                        setCurrentTab(tabs[currentIndex + 1].id);
                      }
                    }}
                    disabled={tabs.findIndex(tab => tab.id === currentTab) === tabs.length - 1}
                  >
                    Next
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                </div>
              </Tabs>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherRegistrationForm;
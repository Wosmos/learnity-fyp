'use client';

/**
 * Onboarding Flow for New Users
 * Multi-step profile completion after initial authentication
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useClientAuth } from '@/hooks/useClientAuth';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  User,
  Mail,
  Target,
  Star,
  Clock,
  Award,
  Globe,
  Smartphone
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

export default function OnboardingPage() {
  const { user, loading } = useClientAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    role: searchParams?.get('role') || '',
    firstName: '',
    lastName: '',
    gradeLevel: '',
    subjects: [] as string[],
    interests: [] as string[],
    goals: [] as string[],
    experience: '',
    qualifications: [] as string[],
    bio: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const steps: OnboardingStep[] = [
    {
      id: 'role',
      title: 'Choose Your Role',
      description: 'How do you plan to use Learnity?',
      component: RoleSelectionStep
    },
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Tell us a bit about yourself',
      component: BasicInfoStep
    },
    {
      id: 'preferences',
      title: 'Your Preferences',
      description: 'Customize your learning experience',
      component: PreferencesStep
    },
    {
      id: 'complete',
      title: 'All Set!',
      description: 'Your profile is ready',
      component: CompletionStep
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Complete Your Profile
                </h1>
                <p className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <Badge variant="secondary">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-lg text-gray-600">
            {steps[currentStep].description}
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
              nextStep={nextStep}
              prevStep={prevStep}
              currentStep={currentStep}
              totalSteps={steps.length}
              user={user}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Step Components
function RoleSelectionStep({ formData, updateFormData, nextStep }: any) {
  const handleRoleSelect = (role: string) => {
    updateFormData({ role });
    setTimeout(nextStep, 300); // Small delay for better UX
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
            formData.role === 'student' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}
          onClick={() => handleRoleSelect('student')}
        >
          <CardHeader className="text-center">
            <div className="mx-auto p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <CardTitle>Student</CardTitle>
            <CardDescription>
              I want to learn and improve my skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Access to tutoring sessions</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Join study groups</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Track learning progress</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
            formData.role === 'teacher' ? 'ring-2 ring-green-500 bg-green-50' : ''
          }`}
          onClick={() => handleRoleSelect('teacher')}
        >
          <CardHeader className="text-center">
            <div className="mx-auto p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl w-fit mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <CardTitle>Teacher</CardTitle>
            <CardDescription>
              I want to teach and share my knowledge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Create and manage courses</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Monitor student progress</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Earn income from teaching</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BasicInfoStep({ formData, updateFormData, nextStep, prevStep, user }: any) {
  const [firstName, setFirstName] = useState(formData.firstName || user?.displayName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(formData.lastName || user?.displayName?.split(' ').slice(1).join(' ') || '');

  const handleNext = () => {
    updateFormData({ firstName, lastName });
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Email Address</Label>
        <Input
          value={user?.email || ''}
          disabled
          className="bg-gray-50"
        />
        <p className="text-xs text-gray-500">
          This is your login email and cannot be changed
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={!firstName.trim()}>
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function PreferencesStep({ formData, updateFormData, nextStep, prevStep }: any) {
  const [subjects, setSubjects] = useState<string[]>(formData.subjects || []);
  const [interests, setInterests] = useState<string[]>(formData.interests || []);

  const subjectOptions = [
    'Mathematics', 'Science', 'English', 'History', 'Art', 'Music',
    'Computer Science', 'Languages', 'Business', 'Psychology'
  ];

  const interestOptions = [
    'Technology', 'Arts & Crafts', 'Sports', 'Reading', 'Music',
    'Travel', 'Cooking', 'Photography', 'Gaming', 'Nature'
  ];

  const toggleSelection = (item: string, list: string[], setter: (list: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleNext = () => {
    updateFormData({ subjects, interests });
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">
            {formData.role === 'student' ? 'What subjects interest you?' : 'What subjects do you teach?'}
          </Label>
          <p className="text-sm text-gray-600 mb-3">Select all that apply</p>
          <div className="flex flex-wrap gap-2">
            {subjectOptions.map((subject) => (
              <Badge
                key={subject}
                variant={subjects.includes(subject) ? "default" : "outline"}
                className="cursor-pointer hover:bg-blue-100"
                onClick={() => toggleSelection(subject, subjects, setSubjects)}
              >
                {subject}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">What are your interests?</Label>
          <p className="text-sm text-gray-600 mb-3">Help us personalize your experience</p>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <Badge
                key={interest}
                variant={interests.includes(interest) ? "default" : "outline"}
                className="cursor-pointer hover:bg-green-100"
                onClick={() => toggleSelection(interest, interests, setInterests)}
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext}>
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function CompletionStep({ formData, user }: any) {
  const router = useRouter();

  const handleComplete = async () => {
    // Here you would typically save the profile data to your backend
    console.log('Profile data:', formData);
    
    // For now, redirect to appropriate dashboard
    if (formData.role === 'student') {
      router.push('/dashboard/student');
    } else if (formData.role === 'teacher') {
      router.push('/dashboard/teacher');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="mx-auto p-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full w-fit">
        <CheckCircle className="h-12 w-12 text-white" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Learnity, {formData.firstName}! 🎉
        </h3>
        <p className="text-lg text-gray-600">
          Your profile is complete and you're ready to start your learning journey.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
        <h4 className="font-semibold text-gray-900 mb-3">Profile Summary:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Role:</span>
            <Badge variant="secondary">{formData.role}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span>{formData.firstName} {formData.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="text-xs">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Subjects:</span>
            <span className="text-xs">{formData.subjects.length} selected</span>
          </div>
        </div>
      </div>

      <Button onClick={handleComplete} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
        Enter Learnity
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
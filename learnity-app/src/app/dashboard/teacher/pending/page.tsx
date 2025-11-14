/**
 * Pending Teacher Dashboard
 * Beautiful, engaging experience for teachers awaiting approval
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, CheckCircle, AlertCircle, Camera, FileText, 
  Video, Award, BookOpen, TrendingUp, Eye, Mail, 
  Calendar, Star, MessageCircle, ArrowRight,
  Edit, Play, ExternalLink
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useToast } from '@/hooks/use-toast';

interface ApplicationStatus {
  step: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  description: string;
}

interface ProfileSection {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ElementType;
  action: string;
  impact: string;
}

interface TeacherProfile {
  submittedAt?: string;
  profilePicture?: string;
  videoIntroUrl?: string;
  documents?: string[];
  qualifications?: string[];
  certifications?: string[];
  linkedinUrl?: string;
  teachingApproach?: string;
  specialties?: string[];
  subjects?: string[];
  bio?: string;
  availableDays?: string[];
}

export default function PendingTeacherDashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [profileCompletion, setProfileCompletion] = useState(65);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [applicationDate, setApplicationDate] = useState('');
  const [expectedResponse, setExpectedResponse] = useState('');

  const applicationSteps: ApplicationStatus[] = [
    {
      step: 'Application Submitted',
      status: 'completed',
      date: applicationDate,
      description: 'Your teacher application has been received'
    },
    {
      step: 'Email Verified',
      status: 'completed',
      date: applicationDate,
      description: 'Email address confirmed successfully'
    },
    {
      step: 'Admin Review',
      status: 'current',
      description: 'Our team is reviewing your application (2-3 business days)'
    },
    {
      step: 'Profile Approval',
      status: 'pending',
      description: 'Final approval and account activation'
    },
    {
      step: 'Start Teaching',
      status: 'pending',
      description: 'Access full teaching features and find students'
    }
  ];

  const profileSections: ProfileSection[] = [
    {
      id: 'photo',
      title: 'Add Profile Photo',
      description: 'Upload a professional photo to build trust with students',
      completed: false,
      icon: Camera,
      action: 'Upload Photo',
      impact: 'Increases student trust by 40%'
    },
    {
      id: 'certificates',
      title: 'Upload Certificates',
      description: 'Add your teaching certificates and qualifications',
      completed: false,
      icon: FileText,
      action: 'Upload Documents',
      impact: 'Speeds up approval process'
    },
    {
      id: 'video',
      title: 'YouTube Introduction',
      description: 'Add a YouTube video to introduce yourself to students',
      completed: false,
      icon: Video,
      action: 'Add Video URL',
      impact: 'Students love video previews'
    },
    {
      id: 'bio',
      title: 'Enhanced Bio',
      description: 'Expand your teaching bio with more details',
      completed: true,
      icon: Edit,
      action: 'Enhance Bio',
      impact: 'Better student matching'
    },
    {
      id: 'availability',
      title: 'Detailed Schedule',
      description: 'Set specific time slots and session preferences',
      completed: false,
      icon: Calendar,
      action: 'Set Schedule',
      impact: 'More booking opportunities'
    }
  ];

  const learningResources = [
    {
      title: 'How to Create Great Lesson Plans',
      description: 'Learn effective lesson planning strategies',
      icon: BookOpen,
      duration: '5 min read',
      category: 'Teaching Tips'
    },
    {
      title: 'Setting Your Hourly Rate Guide',
      description: 'Price your services competitively',
      icon: TrendingUp,
      duration: '3 min read',
      category: 'Pricing'
    },
    {
      title: 'Recording Your First YouTube Intro',
      description: 'Tips for creating engaging video introductions',
      icon: Play,
      duration: '7 min read',
      category: 'Marketing'
    },
    {
      title: 'Getting Your First 5-Star Review',
      description: 'Best practices for student satisfaction',
      icon: Star,
      duration: '4 min read',
      category: 'Success Tips'
    }
  ];

  // Fetch teacher profile data
  useEffect(() => {
    const fetchTeacherProfile = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/teacher/profile', {
          headers: {
            'Authorization': `Bearer ${await user.getIdToken()}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTeacherProfile(data.profile);
          
          // Set real application date
          if (data.profile?.submittedAt) {
            const submitDate = new Date(data.profile.submittedAt);
            setApplicationDate(submitDate.toLocaleDateString());
            
            // Calculate expected response (3 business days)
            const expectedDate = new Date(submitDate);
            expectedDate.setDate(expectedDate.getDate() + 3);
            setExpectedResponse(expectedDate.toLocaleDateString());
          }
        }
      } catch (error) {
        console.error('Failed to fetch teacher profile:', error);
        // Use fallback dates
        const today = new Date();
        setApplicationDate(today.toLocaleDateString());
        const expected = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
        setExpectedResponse(expected.toLocaleDateString());
      }
    };

    fetchTeacherProfile();
  }, [user]);

  // Calculate profile completion based on real data
  useEffect(() => {
    if (!teacherProfile) return;
    
    const completionFactors = [
      !!teacherProfile.profilePicture,
      !!teacherProfile.videoIntroUrl,
      (teacherProfile.documents?.length || 0) > 0,
      (teacherProfile.qualifications?.length || 0) > 0,
      (teacherProfile.certifications?.length || 0) > 0,
      !!teacherProfile.linkedinUrl,
      !!teacherProfile.teachingApproach,
      (teacherProfile.specialties?.length || 0) > 0
    ];
    
    const completed = completionFactors.filter(Boolean).length;
    const total = completionFactors.length;
    const completion = Math.round((completed / total) * 100);
    setProfileCompletion(completion);
    
    // Update profile sections based on real data
    profileSections.forEach(section => {
      switch (section.id) {
        case 'photo':
          section.completed = !!teacherProfile.profilePicture;
          break;
        case 'certificates':
          section.completed = (teacherProfile.documents?.length || 0) > 0;
          break;
        case 'video':
          section.completed = !!teacherProfile.videoIntroUrl;
          break;
        case 'bio':
          section.completed = !!teacherProfile.teachingApproach;
          break;
        case 'availability':
          section.completed = (teacherProfile.availableDays?.length || 0) > 0;
          break;
      }
    });
  }, [profileSections, teacherProfile]);

  const handleSectionAction = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Profile enhancement features will be available soon!",
    });
  };

  const handlePreviewProfile = () => {
    toast({
      title: "Profile Preview",
      description: "Profile preview feature coming soon!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
              <Clock className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Welcome to Learnity, {user?.displayName || 'Teacher'}! 👋
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            {teacherProfile ? 
              `${teacherProfile.subjects?.join(', ') || 'Subject'} Teacher Application Under Review` :
              'Your teacher application is under review'
            }
          </p>
          {teacherProfile?.bio && (
            <p className="text-gray-600 max-w-2xl mx-auto">
              &ldquo;{teacherProfile.bio}&rdquo;
            </p>
          )}
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 px-4 py-2">
            <Clock className="h-4 w-4 mr-2" />
            Application Status: Under Review
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Application Status */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Application Progress */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Application Progress
                </CardTitle>
                <CardDescription>
                  Track your application status and next steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Submitted: {applicationDate}</span>
                  <span>Expected Response: {expectedResponse}</span>
                </div>
                
                <div className="space-y-4">
                  {applicationSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${step.status === 'completed' ? 'bg-green-500 text-white' :
                          step.status === 'current' ? 'bg-blue-500 text-white animate-pulse' :
                          'bg-gray-200 text-gray-500'}
                      `}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : step.status === 'current' ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <div className="w-2 h-2 bg-current rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${
                            step.status === 'current' ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {step.step}
                          </h4>
                          {step.date && (
                            <span className="text-sm text-gray-500">{step.date}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">What happens next?</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        Our team will review your application within 2-3 business days. 
                        You'll receive an email notification once the review is complete.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Enhancement */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Complete Your Profile ({profileCompletion}%)
                    </CardTitle>
                    <CardDescription>
                      Boost your profile while waiting for approval
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handlePreviewProfile}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={profileCompletion} className="h-3" />
                
                <div className="space-y-3">
                  {profileSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <div key={section.id} className={`
                        p-4 rounded-lg border transition-all
                        ${section.completed ? 
                          'bg-green-50 border-green-200' : 
                          'bg-gray-50 border-gray-200 hover:border-blue-300'}
                      `}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`
                              p-2 rounded-lg
                              ${section.completed ? 'bg-green-100' : 'bg-blue-100'}
                            `}>
                              <Icon className={`h-4 w-4 ${
                                section.completed ? 'text-green-600' : 'text-blue-600'
                              }`} />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{section.title}</h4>
                              <p className="text-sm text-gray-600">{section.description}</p>
                              <p className="text-xs text-green-600 mt-1">{section.impact}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {section.completed ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Done
                              </Badge>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={handleSectionAction}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                {section.action}
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Learning Resources & Stats */}
          <div className="space-y-6">
            
            {/* Quick Stats */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-blue-500 text-white">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Award className="h-12 w-12 mx-auto opacity-80" />
                  <div>
                    <h3 className="text-2xl font-bold">You&apos;re Almost There!</h3>
                    <p className="opacity-90">
                      Teachers with complete profiles get 3x more students
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{profileCompletion}%</div>
                      <div className="text-sm opacity-80">Profile Complete</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">2-3</div>
                      <div className="text-sm opacity-80">Days to Approval</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Resources */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Prepare for Success
                </CardTitle>
                <CardDescription>
                  Learn while you wait for approval
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {learningResources.map((resource, index) => {
                  const Icon = resource.icon;
                  return (
                    <div key={index} className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{resource.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{resource.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline" className="text-xs">
                              {resource.category}
                            </Badge>
                            <span className="text-xs text-gray-500">{resource.duration}</span>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  );
                })}
                
                <Button variant="outline" className="w-full mt-4">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View All Resources
                </Button>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Have questions about your application or need assistance?
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
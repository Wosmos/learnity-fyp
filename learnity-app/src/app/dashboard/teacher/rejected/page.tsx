'use client';

/**
 * Rejected Teacher Dashboard
 * Support and guidance for teachers whose applications were not approved
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  AlertCircle, RefreshCw, MessageCircle, BookOpen,
  FileText, CheckCircle, Mail, Phone, ExternalLink,
  Heart, Star, Users, TrendingUp, Clock, Award
} from 'lucide-react';

interface RejectionInfo {
  reason: string;
  feedback: string;
  canReapply: boolean;
  reapplyDate?: string;
  improvementAreas: string[];
}

export default function RejectedTeacherDashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();
  const [rejectionInfo, setRejectionInfo] = useState<RejectionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const improvementResources = [
    {
      title: 'Teaching Certification Programs',
      description: 'Enhance your qualifications with recognized certifications',
      icon: Award,
      link: '#',
      category: 'Certification'
    },
    {
      title: 'Creating Professional Teaching Videos',
      description: 'Learn to create engaging introduction videos',
      icon: FileText,
      link: '#',
      category: 'Video Skills'
    },
    {
      title: 'Building Your Teaching Portfolio',
      description: 'Showcase your experience and achievements effectively',
      icon: BookOpen,
      link: '#',
      category: 'Portfolio'
    },
    {
      title: 'Online Teaching Best Practices',
      description: 'Master the art of virtual education',
      icon: Users,
      link: '#',
      category: 'Teaching Skills'
    }
  ];

  const supportOptions = [
    {
      title: 'Schedule a Feedback Call',
      description: 'Get personalized guidance from our team',
      icon: Phone,
      action: 'schedule_call'
    },
    {
      title: 'Email Support',
      description: 'Send us your questions and concerns',
      icon: Mail,
      action: 'email_support'
    },
    {
      title: 'Join Teacher Community',
      description: 'Connect with other aspiring educators',
      icon: Users,
      action: 'join_community'
    }
  ];

  useEffect(() => {
    const fetchRejectionInfo = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetch('/api/teacher/rejection-info', {
          headers: {
            'Authorization': `Bearer ${await user.getIdToken()}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRejectionInfo(data.rejectionInfo);
        } else {
          // Fallback data if API not available
          setRejectionInfo({
            reason: 'Incomplete Documentation',
            feedback: 'Your application was missing some required documents. Please ensure all certifications and qualifications are properly uploaded.',
            canReapply: true,
            reapplyDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            improvementAreas: ['Upload missing certificates', 'Add professional references', 'Create video introduction']
          });
        }
      } catch (error) {
        console.error('Failed to fetch rejection info:', error);
        // Use fallback data
        setRejectionInfo({
          reason: 'Application Under Review',
          feedback: 'We are still reviewing your application. Please check back later for updates.',
          canReapply: true,
          reapplyDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          improvementAreas: ['Complete profile', 'Add more experience details']
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRejectionInfo();
  }, [user]);

  const handleReapply = () => {
    router.push('/auth/register/teacher');
  };

  const handleSupportAction = (action: string) => {
    switch (action) {
      case 'schedule_call':
        toast({
          title: "Scheduling Feature Coming Soon",
          description: "We'll notify you when call scheduling is available.",
        });
        break;
      case 'email_support':
        window.location.href = 'mailto:support@learnity.com?subject=Teacher Application Support';
        break;
      case 'join_community':
        toast({
          title: "Community Access",
          description: "Redirecting to our teacher community forum...",
        });
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Application Update
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Thank you for your interest in teaching with Learnity
          </p>
          <Badge variant="secondary" className="bg-red-100 text-red-800 px-4 py-2">
            <AlertCircle className="h-4 w-4 mr-2" />
            Application Not Approved
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Rejection Details */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-500" />
                  Application Feedback
                </CardTitle>
                <CardDescription>
                  Details about your application review
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rejectionInfo && (
                  <>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-900 mb-2">Reason: {rejectionInfo.reason}</h4>
                      <p className="text-red-800 text-sm">{rejectionInfo.feedback}</p>
                    </div>

                    {rejectionInfo.improvementAreas.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Areas for Improvement:</h4>
                        <div className="space-y-2">
                          {rejectionInfo.improvementAreas.map((area, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-orange-500" />
                              <span className="text-sm text-gray-700">{area}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {rejectionInfo.canReapply && (
                      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start gap-3">
                          <RefreshCw className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-900">You Can Reapply!</h4>
                            <p className="text-sm text-green-800 mt-1">
                              After addressing the feedback above, you&apos;re welcome to submit a new application.
                              {rejectionInfo.reapplyDate && (
                                <> You can reapply starting {rejectionInfo.reapplyDate}.</>
                              )}
                            </p>
                            <Button
                              onClick={handleReapply}
                              className="mt-3 bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Start New Application
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Improvement Resources */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Improvement Resources
                </CardTitle>
                <CardDescription>
                  Resources to help strengthen your next application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {improvementResources.map((resource, index) => {
                    const Icon = resource.icon;
                    return (
                      <div key={index} className="p-4 border rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <Icon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{resource.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{resource.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline" className="text-xs">
                                {resource.category}
                              </Badge>
                              <ExternalLink className="h-3 w-3 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Encouragement Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Heart className="h-12 w-12 mx-auto opacity-80" />
                  <div>
                    <h3 className="text-xl font-bold">Don&apos;t Give Up!</h3>
                    <p className="opacity-90 text-sm">
                      Many successful teachers didn&apos;t get approved on their first try.
                      Use this feedback to come back stronger!
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                    <div className="text-center">
                      <div className="text-lg font-bold">85%</div>
                      <div className="text-xs opacity-80">Reapply Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">4.8★</div>
                      <div className="text-xs opacity-80">Average Teacher Rating</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Options */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                  Get Support
                </CardTitle>
                <CardDescription>
                  We&apos;re here to help you succeed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {supportOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-auto p-4"
                      onClick={() => handleSupportAction(option.action)}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="font-medium text-sm">{option.title}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Success Stories */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Success Stories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-700 italic">
                    &ldquo;I was rejected initially but used the feedback to improve my profile.
                    Now I&apos;m a top-rated teacher with 50+ students!&rdquo;
                  </p>
                  <p className="text-xs text-gray-500 mt-2">- Sarah M., Math Teacher</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-gray-700 italic">
                    &ldquo;The rejection motivated me to get additional certifications.
                    Best decision I ever made!&rdquo;
                  </p>
                  <p className="text-xs text-gray-500 mt-2">- David L., Science Teacher</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
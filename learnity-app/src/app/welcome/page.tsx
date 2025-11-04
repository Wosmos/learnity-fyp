'use client';

/**
 * Welcome Dashboard for New Users
 * Onboarding flow for users who just logged in but haven't completed registration
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useClientAuth } from '@/hooks/useClientAuth';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  ArrowRight, 
  CheckCircle,
  User,
  Mail,
  Shield,
  Star,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function WelcomePage() {
  const { user, loading } = useClientAuth();
  const router = useRouter();
  const [profileCompletion, setProfileCompletion] = useState(20);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

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

  const userName = user.displayName || user.email?.split('@')[0] || 'New User';
  const isEmailVerified = user.emailVerified;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome to Learnity
                </h1>
                <p className="text-sm text-gray-600">Let's get you started!</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{userName}</span>
              </Badge>
              {!isEmailVerified && (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <Mail className="h-3 w-3" />
                  <span>Email Unverified</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Hero */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Learnity, {userName}! 🎉
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            You're just a few steps away from unlocking personalized learning experiences. 
            Let's complete your profile to get started.
          </p>
          
          {/* Profile Completion Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-sm text-gray-500">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-3" />
            <p className="text-xs text-gray-500 mt-1">Complete your profile to unlock all features</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Choose Your Role */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Choose Your Role</CardTitle>
              </div>
              <CardDescription>
                Tell us how you plan to use Learnity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/auth/register?role=student">
                  <Button variant="outline" className="w-full justify-start">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    I'm a Student
                  </Button>
                </Link>
                <Link href="/auth/register?role=teacher">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    I'm a Teacher
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Verify Email */}
          <Card className={`hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg ${
            !isEmailVerified ? 'ring-2 ring-orange-200' : ''
          }`}>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  isEmailVerified ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  <Mail className={`h-5 w-5 ${
                    isEmailVerified ? 'text-green-600' : 'text-orange-600'
                  }`} />
                </div>
                <CardTitle className="text-lg">Verify Email</CardTitle>
              </div>
              <CardDescription>
                {isEmailVerified ? 'Email verified successfully!' : 'Secure your account with email verification'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEmailVerified ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Email verified</span>
                </div>
              ) : (
                <Button className="w-full">
                  Send Verification Email
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Explore Features */}
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Explore Features</CardTitle>
              </div>
              <CardDescription>
                Discover what Learnity has to offer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/demo">
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    Platform Demo
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Auth Features
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Selection Cards */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What brings you to Learnity?
            </h2>
            <p className="text-lg text-gray-600">
              Choose your path to get personalized recommendations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Path */}
            <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-2xl">I'm here to Learn</CardTitle>
                <CardDescription className="text-base">
                  Access personalized tutoring, join study groups, and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">One-on-one tutoring sessions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Interactive study groups</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Progress tracking & analytics</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Mobile-optimized learning</span>
                  </div>
                </div>
                <Link href="/auth/register?role=student" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    Get Started as Student
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Teacher Path */}
            <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl w-fit mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-2xl">I'm here to Teach</CardTitle>
                <CardDescription className="text-base">
                  Share your expertise, manage students, and earn income through teaching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Flexible scheduling system</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Student progress monitoring</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Content creation tools</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Verified teacher profiles</span>
                  </div>
                </div>
                <Link href="/auth/register?role=teacher" className="block">
                  <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                    Get Started as Teacher
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What happens next?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit mb-4">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Complete Profile</h3>
              <p className="text-sm text-gray-600">
                Tell us about yourself and your learning goals
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto p-3 bg-green-100 rounded-full w-fit mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Set Preferences</h3>
              <p className="text-sm text-gray-600">
                Customize your learning experience and interests
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto p-3 bg-purple-100 rounded-full w-fit mb-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Start Learning</h3>
              <p className="text-sm text-gray-600">
                Access personalized content and connect with others
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Need help getting started?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/demo">
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-2" />
                Platform Demo
              </Button>
            </Link>
            <Link href="/auth">
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Auth Features
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <GraduationCap className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
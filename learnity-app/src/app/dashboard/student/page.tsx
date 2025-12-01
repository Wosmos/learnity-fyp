'use client';

/**
 * Student Dashboard
 * Enhanced dashboard with real profile data and modern UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Calendar,
  TrendingUp,
  Star,
  Clock,
  Target,
  Award,
  Play,
  MessageCircle,
  Heart,
  Edit,
  Mail,
  CheckCircle2,
  Zap,
  Brain,
  Rocket
} from 'lucide-react';
import Link from 'next/link';
import { ProfileCompletionBanner } from '@/components/profile/ProfileCompletionBanner';
import { ProfileCompletionSkeleton } from '@/components/profile/ProfileCompletionSkeleton';
import { MetricCard } from '@/components/ui/stats-card';

interface StudentProfile {
  gradeLevel: string;
  subjects: string[];
  learningGoals: string[];
  interests: string[];
  studyPreferences: string[];
  bio?: string;
  profileCompletionPercentage: number;
}

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  studentProfile?: StudentProfile;
}

export default function StudentDashboard() {
  const { user, loading: authLoading } = useClientAuth();
  const api = useAuthenticatedApi();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [completion, setCompletion] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCompletion, setLoadingCompletion] = useState(true);

  const fetchProfileData = useCallback(async () => {
    if (authLoading) return;
    
    try {
      const data = await api.get('/api/auth/profile');
      setProfileData(data.profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  }, [authLoading, api]);

  const fetchCompletionData = useCallback(async () => {
    if (authLoading) return;
    
    try {
      const data = await api.get('/api/profile/enhance');
      setCompletion(data.completion);
    } catch (error) {
      console.error('Failed to fetch completion data:', error);
    } finally {
      setLoadingCompletion(false);
    }
  }, [authLoading, api]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchProfileData();
      fetchCompletionData();
    }
  }, [user, authLoading, fetchProfileData, fetchCompletionData]);

  const handleEnhanceProfile = () => {
    router.push('/profile/enhance');
  };

  const getInitials = () => {
    if (profileData) {
      return `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase();
    }
    return user?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'ST';
  };

  const userName = profileData?.firstName || user?.displayName?.split(' ')[0] || 'Student';
  const fullName = profileData ? `${profileData.firstName} ${profileData.lastName}` : user?.displayName || 'Student';

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userName}! 👋
              </h1>
              <p className="text-gray-600 mt-1">Ready to continue your learning journey?</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-blue-100 text-blue-800">
                <GraduationCap className="h-3 w-3 mr-1" />
                Student
              </Badge>
              <Badge variant="outline">
                Level 2 Learner
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Banner */}
        {loadingCompletion ? (
          <div className="mb-8">
            <ProfileCompletionSkeleton />
          </div>
        ) : completion && completion.percentage < 100 && (
          <div className="mb-8">
            <ProfileCompletionBanner 
              completion={completion} 
              onEnhanceClick={handleEnhanceProfile}
            />
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Courses Enrolled"
            value="12"
            trendValue="+2"
            trendLabel="this month"
            icon={BookOpen}
            iconColor="text-blue-500"
            bgColor="bg-blue-100"
            trendColor="text-green-600"
          />
          
          <MetricCard
            title="Study Time"
            value="24h"
            trendValue="+6h"
            trendLabel="this week"
            icon={Clock}
            iconColor="text-green-500"
            bgColor="bg-green-100"
            trendColor="text-green-600"
          />
          
          <MetricCard
            title="Achievements"
            value="8"
            trendValue="+3"
            trendLabel="unlocked"
            icon={Award}
            iconColor="text-yellow-500"
            bgColor="bg-yellow-100"
            trendColor="text-yellow-600"
          />
          
          <MetricCard
            title="Avg Score"
            value="85%"
            trendValue="+5%"
            trendLabel="improvement"
            icon={TrendingUp}
            iconColor="text-purple-500"
            bgColor="bg-purple-100"
            trendColor="text-purple-600"
          />
        </div>

        {/* Profile Overview Section */}
        {profileData && (
          <div className="mb-8">
            <Card className="border-2 border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-32"></div>
              <CardContent className="relative pt-0 pb-6">
                <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
                  {/* Avatar */}
                  <div className="-mt-16 mb-4 md:mb-0">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                      <AvatarImage src={profileData.profilePicture || ''} alt={fullName} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          {fullName}
                          {profileData.emailVerified && (
                            <CheckCircle2 className="h-5 w-5 text-blue-500" />
                          )}
                        </h2>
                        <p className="text-gray-600 flex items-center gap-2 mt-1">
                          <Mail className="h-4 w-4" />
                          {profileData.email}
                        </p>
                      </div>
                      <Button onClick={handleEnhanceProfile} className="mt-4 md:mt-0">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>

                    {/* Profile Stats Bar */}
                    {profileData.studentProfile && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                          <span className="text-sm font-bold text-blue-600">
                            {profileData.studentProfile.profileCompletionPercentage}%
                          </span>
                        </div>
                        <Progress value={profileData.studentProfile.profileCompletionPercentage} className="h-2" />
                      </div>
                    )}

                    {/* Bio */}
                    {profileData.studentProfile?.bio && (
                      <p className="text-gray-700 mb-4 italic">&ldquo;{profileData.studentProfile.bio}&rdquo;</p>
                    )}

                    {/* Quick Info Grid */}
                    {profileData.studentProfile && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Grade Level */}
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <GraduationCap className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Grade Level</p>
                            <p className="font-semibold text-gray-900">{profileData.studentProfile.gradeLevel}</p>
                          </div>
                        </div>

                        {/* Subjects */}
                        {profileData.studentProfile.subjects.length > 0 && (
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <BookOpen className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Subjects</p>
                              <p className="font-semibold text-gray-900">
                                {profileData.studentProfile.subjects.length} Selected
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Learning Goals */}
                        {profileData.studentProfile.learningGoals.length > 0 && (
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Target className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Goals</p>
                              <p className="font-semibold text-gray-900">
                                {profileData.studentProfile.learningGoals.length} Active
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags Section */}
                {profileData.studentProfile && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Interests */}
                      {profileData.studentProfile.interests.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Heart className="h-4 w-4 text-pink-500" />
                            Interests
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {profileData.studentProfile.interests.slice(0, 5).map((interest, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-pink-50 text-pink-700 border-pink-200">
                                {interest}
                              </Badge>
                            ))}
                            {profileData.studentProfile.interests.length > 5 && (
                              <Badge variant="outline">+{profileData.studentProfile.interests.length - 5} more</Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Study Preferences */}
                      {profileData.studentProfile.studyPreferences.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-indigo-500" />
                            Study Preferences
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {profileData.studentProfile.studyPreferences.slice(0, 4).map((pref, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                {pref}
                              </Badge>
                            ))}
                            {profileData.studentProfile.studyPreferences.length > 4 && (
                              <Badge variant="outline">+{profileData.studentProfile.studyPreferences.length - 4} more</Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Learning Goals List */}
                    {profileData.studentProfile.learningGoals.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Rocket className="h-4 w-4 text-orange-500" />
                          Learning Goals
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {profileData.studentProfile.learningGoals.slice(0, 4).map((goal, idx) => (
                            <div key={idx} className="flex items-start space-x-2 text-sm">
                              <Zap className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                              <span className="text-gray-700">{goal}</span>
                            </div>
                          ))}
                        </div>
                        {profileData.studentProfile.learningGoals.length > 4 && (
                          <Button variant="link" className="mt-2 p-0 h-auto" onClick={handleEnhanceProfile}>
                            View all {profileData.studentProfile.learningGoals.length} goals →
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Learning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>Continue Learning</span>
                </CardTitle>
                <CardDescription>
                  Pick up where you left off
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">Advanced Mathematics</h4>
                      <p className="text-sm text-gray-600">Chapter 5: Calculus Fundamentals</p>
                    </div>
                    <Badge variant="outline">75% Complete</Badge>
                  </div>
                  <Progress value={75} className="mb-3" />
                  <Button size="sm">Continue Lesson</Button>
                </div>
                
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">Computer Science Basics</h4>
                      <p className="text-sm text-gray-600">Module 3: Data Structures</p>
                    </div>
                    <Badge variant="outline">45% Complete</Badge>
                  </div>
                  <Progress value={45} className="mb-3" />
                  <Button size="sm">Continue Lesson</Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Math Tutoring with Sarah</h4>
                    <p className="text-sm text-gray-600">Today at 3:00 PM</p>
                  </div>
                  <Button size="sm" variant="outline">Join</Button>
                </div>
                
                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Study Group: Physics</h4>
                    <p className="text-sm text-gray-600">Tomorrow at 7:00 PM</p>
                  </div>
                  <Button size="sm" variant="outline">Join</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/courses">
                  <Button className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Courses
                  </Button>
                </Link>
                <Link href="/dashboard/student/courses">
                  <Button variant="outline" className="w-full justify-start">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    My Courses
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Find Study Groups
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Tutoring
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ask Questions
                </Button>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Recent Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Math Master</p>
                    <p className="text-xs text-gray-600">Completed 10 math lessons</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Goal Achiever</p>
                    <p className="text-xs text-gray-600">Reached weekly study goal</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Team Player</p>
                    <p className="text-xs text-gray-600">Joined 5 study groups</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Study Streak */}
            <Card>
              <CardHeader>
                <CardTitle>Study Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricCard
                  title="Current Streak"
                  value="7"
                  trendValue="🔥"
                  trendLabel="Days in a row!"
                  icon={Zap}
                  iconColor="text-orange-500"
                  bgColor="bg-orange-100"
                  textColor="text-orange-600"
                  trendColor="text-orange-600"
                  className="border-0 shadow-none bg-transparent"
                />
                <div className="flex justify-center space-x-1 mt-4">
                  {[1,2,3,4,5,6,7].map((day) => (
                    <div key={day} className="w-6 h-6 bg-orange-500 rounded-full"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Need help or want to explore more?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/welcome">
              <Button variant="outline" size="sm">
                <GraduationCap className="h-4 w-4 mr-2" />
                Back to Welcome
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Platform Demo
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <GraduationCap className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
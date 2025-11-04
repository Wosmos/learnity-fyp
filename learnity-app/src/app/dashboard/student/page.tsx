'use client';

/**
 * Student Dashboard
 * Main dashboard for students with learning tools and progress tracking
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useClientAuth } from '@/hooks/useClientAuth';
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
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user } = useClientAuth();
  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-gray-600">Courses Enrolled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">24h</p>
                  <p className="text-xs text-gray-600">Study Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs text-gray-600">Achievements</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-xs text-gray-600">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                <Button className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
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
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">7</div>
                  <p className="text-sm text-gray-600 mb-4">Days in a row!</p>
                  <div className="flex justify-center space-x-1">
                    {[1,2,3,4,5,6,7].map((day) => (
                      <div key={day} className="w-6 h-6 bg-orange-500 rounded-full"></div>
                    ))}
                  </div>
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
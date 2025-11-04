'use client';

/**
 * Teacher Dashboard
 * Comprehensive dashboard for teachers with session management, student progress, and content tools
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  Star,
  MessageSquare,
  FileText,
  Video,
  DollarSign,
  Award,
  Bell,
  Settings,
  Plus,
  Eye,
  Edit,
  BarChart3,
  CheckCircle,
  AlertCircle,
  User,
  GraduationCap
} from 'lucide-react';

interface TeacherStats {
  totalStudents: number;
  activeSessions: number;
  completedSessions: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  upcomingSessions: number;
  contentUploads: number;
}

interface UpcomingSession {
  id: string;
  studentName: string;
  subject: string;
  time: string;
  duration: number;
  type: 'one-on-one' | 'group';
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface RecentActivity {
  id: string;
  type: 'session_completed' | 'new_student' | 'review_received' | 'content_uploaded';
  message: string;
  time: string;
  icon: React.ReactNode;
}

export default function TeacherDashboard() {
  const { user, loading, isAuthenticated } = useClientAuth();
  const router = useRouter();
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 24,
    activeSessions: 8,
    completedSessions: 156,
    totalEarnings: 2840,
    averageRating: 4.8,
    totalReviews: 89,
    upcomingSessions: 5,
    contentUploads: 12
  });

  const [upcomingSessions] = useState<UpcomingSession[]>([
    {
      id: '1',
      studentName: 'Alice Johnson',
      subject: 'Mathematics',
      time: '2:00 PM Today',
      duration: 60,
      type: 'one-on-one',
      status: 'confirmed'
    },
    {
      id: '2',
      studentName: 'Bob Smith',
      subject: 'Physics',
      time: '4:30 PM Today',
      duration: 45,
      type: 'one-on-one',
      status: 'confirmed'
    },
    {
      id: '3',
      studentName: 'Study Group A',
      subject: 'Chemistry',
      time: '10:00 AM Tomorrow',
      duration: 90,
      type: 'group',
      status: 'pending'
    }
  ]);

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'session_completed',
      message: 'Completed session with Sarah Wilson - Algebra',
      time: '2 hours ago',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    },
    {
      id: '2',
      type: 'review_received',
      message: 'Received 5-star review from Mike Chen',
      time: '4 hours ago',
      icon: <Star className="h-4 w-4 text-yellow-500" />
    },
    {
      id: '3',
      type: 'new_student',
      message: 'New student enrolled: Emma Davis',
      time: '1 day ago',
      icon: <User className="h-4 w-4 text-blue-500" />
    },
    {
      id: '4',
      type: 'content_uploaded',
      message: 'Uploaded new lesson: "Advanced Calculus"',
      time: '2 days ago',
      icon: <FileText className="h-4 w-4 text-purple-500" />
    }
  ]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard/teacher');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-500">Please log in to access your teacher dashboard.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {user?.displayName || user?.email || 'Teacher'}!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                <Badge className="ml-2 bg-red-500">3</Badge>
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  <p className="text-xs text-gray-500">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.activeSessions}</p>
                  <p className="text-xs text-gray-500">Active Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">${stats.totalEarnings}</p>
                  <p className="text-xs text-gray-500">Total Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Star className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.averageRating}</p>
                  <p className="text-xs text-gray-500">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Upcoming Sessions</span>
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          session.type === 'group' ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          {session.type === 'group' ? (
                            <Users className="h-4 w-4 text-purple-600" />
                          ) : (
                            <User className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{session.studentName}</p>
                          <p className="text-sm text-gray-500">{session.subject} • {session.duration} min</p>
                          <p className="text-sm text-gray-500">{session.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={session.status === 'confirmed' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Session Completion Rate</span>
                      <span className="text-sm text-gray-500">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Student Satisfaction</span>
                      <span className="text-sm text-gray-500">4.8/5.0</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-sm text-gray-500">2 hours</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Content Quality</span>
                      <span className="text-sm text-gray-500">Excellent</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and tools for managing your teaching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/dashboard/teacher/sessions">
                    <Button variant="outline" className="h-20 flex flex-col items-center space-y-2 w-full">
                      <Calendar className="h-6 w-6" />
                      <span className="text-xs">Manage Sessions</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard/teacher/students">
                    <Button variant="outline" className="h-20 flex flex-col items-center space-y-2 w-full">
                      <Users className="h-6 w-6" />
                      <span className="text-xs">View Students</span>
                    </Button>
                  </Link>
                  <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                    <FileText className="h-6 w-6" />
                    <span className="text-xs">Upload Content</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center space-y-2">
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-xs">View Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      {activity.icon}
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Student Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Student Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">AJ</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Alice Johnson</p>
                        <p className="text-xs text-gray-500">Mathematics</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">85%</p>
                      <p className="text-xs text-gray-500">Progress</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">BS</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Bob Smith</p>
                        <p className="text-xs text-gray-500">Physics</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">92%</p>
                      <p className="text-xs text-gray-500">Progress</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">ED</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Emma Davis</p>
                        <p className="text-xs text-gray-500">Chemistry</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-yellow-600">67%</p>
                      <p className="text-xs text-gray-500">Progress</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Earnings Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Earnings Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="font-medium">$1,240</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Month</span>
                    <span className="font-medium">$1,180</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-medium text-yellow-600">$420</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Earned</span>
                      <span className="font-bold text-green-600">${stats.totalEarnings}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
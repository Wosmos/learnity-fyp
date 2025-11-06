'use client';

/**
 * Teacher Students Management Page
 * View and manage student progress, communication, and performance
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Search,
  MessageSquare,
  TrendingUp,
  Calendar,
  Star,
  BookOpen,
  Clock,
  ArrowLeft,
  Eye,
  Mail,
  Phone
} from 'lucide-react';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  subjects: string[];
  totalSessions: number;
  completedSessions: number;
  progress: number;
  lastSession: string;
  nextSession?: string;
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
}

export default function TeacherStudentsPage() {
  const [students] = useState<Student[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice.johnson@email.com',
      avatar: 'AJ',
      subjects: ['Mathematics', 'Algebra'],
      totalSessions: 12,
      completedSessions: 10,
      progress: 85,
      lastSession: '2024-01-14',
      nextSession: '2024-01-15 14:00',
      rating: 4.8,
      status: 'active',
      joinedDate: '2023-12-01'
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob.smith@email.com',
      avatar: 'BS',
      subjects: ['Physics', 'Mechanics'],
      totalSessions: 8,
      completedSessions: 7,
      progress: 92,
      lastSession: '2024-01-13',
      nextSession: '2024-01-16 10:30',
      rating: 4.9,
      status: 'active',
      joinedDate: '2023-11-15'
    },
    {
      id: '3',
      name: 'Emma Davis',
      email: 'emma.davis@email.com',
      avatar: 'ED',
      subjects: ['Chemistry', 'Organic Chemistry'],
      totalSessions: 15,
      completedSessions: 12,
      progress: 67,
      lastSession: '2024-01-12',
      rating: 4.6,
      status: 'active',
      joinedDate: '2023-10-20'
    },
    {
      id: '4',
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      avatar: 'MC',
      subjects: ['Mathematics', 'Calculus'],
      totalSessions: 5,
      completedSessions: 3,
      progress: 45,
      lastSession: '2024-01-10',
      rating: 4.2,
      status: 'inactive',
      joinedDate: '2024-01-05'
    },
    {
      id: '5',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      avatar: 'SW',
      subjects: ['Physics', 'Quantum Physics'],
      totalSessions: 0,
      completedSessions: 0,
      progress: 0,
      lastSession: '',
      rating: 0,
      status: 'pending',
      joinedDate: '2024-01-14'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard/teacher">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <Users className="h-6 w-6 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
                <p className="text-sm text-gray-500">Track student progress and manage relationships</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-xs text-gray-500">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{students.filter(s => s.status === 'active').length}</p>
                  <p className="text-xs text-gray-500">Active Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Star className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {(students.filter(s => s.rating > 0).reduce((sum, s) => sum + s.rating, 0) / 
                      students.filter(s => s.rating > 0).length || 0).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {students.reduce((sum, s) => sum + s.completedSessions, 0)}
                  </p>
                  <p className="text-xs text-gray-500">Total Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Students ({filteredStudents.length})</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStudents.map((student) => (
                    <div 
                      key={student.id} 
                      className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedStudent?.id === student.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                            {student.avatar}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">{student.name}</p>
                              <Badge className={getStatusColor(student.status)}>
                                {student.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{student.email}</p>
                            <p className="text-sm text-gray-500">
                              {student.subjects.join(', ')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">
                              {student.rating > 0 ? student.rating.toFixed(1) : 'N/A'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {student.completedSessions}/{student.totalSessions} sessions
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`text-sm font-medium ${getProgressColor(student.progress)}`}>
                              {student.progress}%
                            </span>
                            <Progress value={student.progress} className="w-16 h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredStudents.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                      <p className="text-gray-500">
                        {searchTerm ? 'Try adjusting your search criteria' : 'Your students will appear here'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Details Sidebar */}
          <div>
            {selectedStudent ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {selectedStudent.avatar}
                    </div>
                    <span>{selectedStudent.name}</span>
                  </CardTitle>
                  <CardDescription>Student Details & Progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contact Info */}
                  <div>
                    <h4 className="font-medium mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{selectedStudent.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Joined {new Date(selectedStudent.joinedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Overview */}
                  <div>
                    <h4 className="font-medium mb-3">Progress Overview</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Overall Progress</span>
                        <span className={`font-medium ${getProgressColor(selectedStudent.progress)}`}>
                          {selectedStudent.progress}%
                        </span>
                      </div>
                      <Progress value={selectedStudent.progress} className="h-2" />
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Total Sessions</p>
                          <p className="font-medium">{selectedStudent.totalSessions}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Completed</p>
                          <p className="font-medium">{selectedStudent.completedSessions}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div>
                    <h4 className="font-medium mb-3">Subjects</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.subjects.map((subject, index) => (
                        <Badge key={index} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Session Info */}
                  <div>
                    <h4 className="font-medium mb-3">Session Information</h4>
                    <div className="space-y-2 text-sm">
                      {selectedStudent.lastSession && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Last Session</span>
                          <span>{new Date(selectedStudent.lastSession).toLocaleDateString()}</span>
                        </div>
                      )}
                      {selectedStudent.nextSession && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Next Session</span>
                          <span>{new Date(selectedStudent.nextSession).toLocaleDateString()}</span>
                        </div>
                      )}
                      {selectedStudent.rating > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Rating</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{selectedStudent.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button className="w-full" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Session
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
                    <p className="text-gray-500">
                      Click on a student from the list to view their details and progress
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for progress color
function getProgressColor(progress: number): string {
  if (progress >= 80) return 'text-green-600';
  if (progress >= 60) return 'text-yellow-600';
  return 'text-red-600';
}
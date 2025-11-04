'use client';

/**
 * Teacher Sessions Management Page
 * Manage tutoring sessions, schedule new ones, and track session history
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Users,
  Video,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface Session {
  id: string;
  studentName: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  type: 'one-on-one' | 'group';
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  studentCount?: number;
  earnings: number;
}

export default function TeacherSessionsPage() {
  const [sessions] = useState<Session[]>([
    {
      id: '1',
      studentName: 'Alice Johnson',
      subject: 'Mathematics',
      date: '2024-01-15',
      time: '14:00',
      duration: 60,
      type: 'one-on-one',
      status: 'scheduled',
      earnings: 45
    },
    {
      id: '2',
      studentName: 'Study Group A',
      subject: 'Physics',
      date: '2024-01-15',
      time: '16:30',
      duration: 90,
      type: 'group',
      status: 'scheduled',
      studentCount: 4,
      earnings: 120
    },
    {
      id: '3',
      studentName: 'Bob Smith',
      subject: 'Chemistry',
      date: '2024-01-14',
      time: '10:00',
      duration: 45,
      type: 'one-on-one',
      status: 'completed',
      earnings: 35
    },
    {
      id: '4',
      studentName: 'Emma Davis',
      subject: 'Mathematics',
      date: '2024-01-14',
      time: '15:00',
      duration: 60,
      type: 'one-on-one',
      status: 'completed',
      earnings: 45
    },
    {
      id: '5',
      studentName: 'Mike Chen',
      subject: 'Physics',
      date: '2024-01-13',
      time: '11:00',
      duration: 60,
      type: 'one-on-one',
      status: 'cancelled',
      earnings: 0
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(session => {
    const matchesFilter = filter === 'all' || session.status === filter;
    const matchesSearch = session.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
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
              <Calendar className="h-6 w-6 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
                <p className="text-sm text-gray-500">Manage your tutoring sessions and schedule</p>
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule New Session
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{sessions.filter(s => s.status === 'scheduled').length}</p>
                  <p className="text-xs text-gray-500">Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{sessions.filter(s => s.status === 'completed').length}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {sessions.reduce((total, session) => total + session.duration, 0)}
                  </p>
                  <p className="text-xs text-gray-500">Total Minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    ${sessions.filter(s => s.status === 'completed').reduce((total, session) => total + session.earnings, 0)}
                  </p>
                  <p className="text-xs text-gray-500">Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search sessions by student or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle>Sessions ({filteredSessions.length})</CardTitle>
            <CardDescription>
              Manage your tutoring sessions and track their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      session.type === 'group' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      {session.type === 'group' ? (
                        <Users className="h-5 w-5 text-purple-600" />
                      ) : (
                        <User className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{session.studentName}</p>
                        {session.type === 'group' && session.studentCount && (
                          <Badge variant="secondary">{session.studentCount} students</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{session.subject}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.date).toLocaleDateString()} at {session.time} • {session.duration} min
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge className={getStatusColor(session.status)}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(session.status)}
                          <span>{session.status}</span>
                        </span>
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        ${session.earnings}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {session.status === 'scheduled' && (
                        <Button variant="ghost" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {session.status === 'scheduled' && (
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredSessions.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || filter !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Schedule your first tutoring session to get started'
                    }
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule New Session
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
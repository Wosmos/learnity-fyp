'use client';

/**
 * Admin Teacher Applications Page
 * Dedicated page for managing teacher applications and approvals
 */

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { useToast } from '@/hooks/use-toast';
import {
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Video,
  Mail,
  Calendar,
  Award,
  BookOpen,
  Filter,
  Search,
  Download
} from 'lucide-react';

interface TeacherApplication {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  experience: string;
  submittedAt: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  documents: number;
  videoIntro: boolean;
  profileComplete: number;
  bio?: string;
  qualifications: string[];
  hourlyRate?: number;
}

interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  reviewing: number;
}

export default function TeacherApplicationsPage() {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    reviewing: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const api = useAuthenticatedApi();
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/teachers');
      setApplications(response.teachers || []);
    } catch (error) {
      console.error('Failed to fetch teacher applications:', error);
      toast({
        title: "Error",
        description: "Failed to load teacher applications.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/teachers/stats');
      setStats(response.stats || stats);
    } catch (error) {
      console.error('Failed to fetch application stats:', error);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject' | 'review') => {
    try {
      await api.patch('/api/admin/teachers', { teacherId: applicationId, action });
      
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'reviewing' }
            : app
        )
      );

      toast({
        title: `Application ${action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Under Review'}`,
        description: `Teacher application has been ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'marked for review'}.`,
        variant: action === 'reject' ? 'destructive' : 'default'
      });

      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Application action error:', error);
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive"
      });
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery === '' || 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'reviewing': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      case 'reviewing': return Eye;
      default: return Clock;
    }
  };

  return (
    <AdminLayout
      title="Teacher Applications"
      description="Review and manage teacher application submissions"
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      }
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-gray-500">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.reviewing}</p>
                <p className="text-xs text-gray-500">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-xs text-gray-500">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-xs text-gray-500">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle>Teacher Applications</CardTitle>
              <CardDescription>
                Review teacher qualifications and approve applications
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading applications...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredApplications.map((application) => {
                const StatusIcon = getStatusIcon(application.status);
                
                return (
                  <div key={application.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="h-6 w-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{application.name}</h3>
                            <Badge className={getStatusColor(application.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>{application.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4" />
                              <span>{application.subjects.join(', ')}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Award className="h-4 w-4" />
                              <span>{application.experience} experience</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>Applied {new Date(application.submittedAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {application.bio && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-700 line-clamp-2">{application.bio}</p>
                            </div>
                          )}

                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                              <span className="text-sm text-gray-500">{application.profileComplete}%</span>
                            </div>
                            <Progress value={application.profileComplete} className="h-2" />
                          </div>

                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center space-x-1">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">{application.documents} documents</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Video className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">
                                {application.videoIntro ? 'Video intro ✓' : 'No video intro'}
                              </span>
                            </div>
                            {application.hourlyRate && (
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-600">Rate: ${application.hourlyRate}/hr</span>
                              </div>
                            )}
                          </div>

                          {application.qualifications.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Qualifications:</p>
                              <div className="flex flex-wrap gap-1">
                                {application.qualifications.map((qual, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {qual}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Profile Preview",
                              description: "Opening teacher profile preview..."
                            });
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        
                        {application.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApplicationAction(application.id, 'review')}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApplicationAction(application.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleApplicationAction(application.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {application.status === 'reviewing' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApplicationAction(application.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleApplicationAction(application.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredApplications.length === 0 && (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                  <p className="text-gray-500">
                    {searchQuery || selectedStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No teacher applications have been submitted yet.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
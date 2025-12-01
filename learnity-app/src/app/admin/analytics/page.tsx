'use client';

/**
 * Admin Analytics Page
 * Platform analytics and insights for administrators
 */

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useToast } from '@/hooks/use-toast';
import {
  BarChart3,
  TrendingUp,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Calendar,
  Activity,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  userGrowth: {
    labels: string[];
    data: number[];
  };
  teacherApplications: {
    pending: number;
    approved: number;
    rejected: number;
  };
  platformMetrics: {
    totalRevenue: number;
    activeUsers: number;
    sessionCompletion: number;
    userSatisfaction: number;
  };
  monthlyStats: {
    newUsers: number;
    newTeachers: number;
    totalSessions: number;
    revenue: number;
  };
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { toast } = useToast();

  const fetchAnalytics = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);
      
      // For now, we'll use mock data since we don't have a dedicated analytics API
      // In a real implementation, this would call /api/admin/analytics
      const mockAnalytics: AnalyticsData = {
        userGrowth: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [120, 150, 180, 220, 280, 350]
        },
        teacherApplications: {
          pending: 15,
          approved: 45,
          rejected: 8
        },
        platformMetrics: {
          totalRevenue: 45680,
          activeUsers: 1250,
          sessionCompletion: 94.2,
          userSatisfaction: 4.7
        },
        monthlyStats: {
          newUsers: 89,
          newTeachers: 12,
          totalSessions: 456,
          revenue: 12450
        }
      };
      
      setAnalytics(mockAnalytics);
      
      if (showRefreshToast) {
        toast({
          title: "Analytics Updated",
          description: "Latest analytics data has been loaded.",
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Analytics" description="Platform analytics and insights">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${analytics?.platformMetrics.totalRevenue.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.platformMetrics.activeUsers.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-gray-500">Active Users</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+8.2%</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.platformMetrics.sessionCompletion || '0'}%
                </p>
                <p className="text-sm text-gray-500">Session Completion</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+2.1%</span>
              <span className="text-gray-500 ml-1">improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.platformMetrics.userSatisfaction || '0'}
                </p>
                <p className="text-sm text-gray-500">User Satisfaction</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">Excellent</span>
              <span className="text-gray-500 ml-1">rating</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>User Growth Trend</span>
            </CardTitle>
            <CardDescription>Monthly user registration growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-10 bg-gray-50 rounded-lg">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Chart visualization would go here</p>
                <p className="text-sm text-gray-500 mt-2">
                  Integration with charting library (Chart.js, Recharts, etc.)
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">350</p>
                  <p className="text-xs text-gray-500">This Month</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">+28%</p>
                  <p className="text-xs text-gray-500">Growth Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">1,250</p>
                  <p className="text-xs text-gray-500">Total Users</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-green-600" />
              <span>Teacher Applications</span>
            </CardTitle>
            <CardDescription>Application status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium">Pending Review</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">
                    {analytics?.teacherApplications.pending || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Approved</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {analytics?.teacherApplications.approved || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-medium">Rejected</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {analytics?.teacherApplications.rejected || 0}
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Approval Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics ? 
                      Math.round((analytics.teacherApplications.approved / 
                        (analytics.teacherApplications.approved + analytics.teacherApplications.rejected)) * 100) 
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <span>This Month&apos;s Performance</span>
          </CardTitle>
          <CardDescription>Key metrics for the current month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                {analytics?.monthlyStats.newUsers || 0}
              </p>
              <p className="text-sm text-gray-600">New Users</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <GraduationCap className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {analytics?.monthlyStats.newTeachers || 0}
              </p>
              <p className="text-sm text-gray-600">New Teachers</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">
                {analytics?.monthlyStats.totalSessions || 0}
              </p>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">
                ${analytics?.monthlyStats.revenue.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600">Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
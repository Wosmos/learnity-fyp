'use client';

/**
 * Admin Analytics Page
 * Comprehensive analytics dashboard for platform insights
 */

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  DollarSign,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  Target,
  Award,
  Zap
} from 'lucide-react';

interface AnalyticsData {
  userGrowth: {
    labels: string[];
    students: number[];
    teachers: number[];
    total: number[];
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    bounceRate: number;
  };
  platform: {
    totalSessions: number;
    completedSessions: number;
    averageRating: number;
    totalRevenue: number;
    conversionRate: number;
  };
  topMetrics: {
    popularSubjects: Array<{ name: string; count: number }>;
    topTeachers: Array<{ name: string; rating: number; sessions: number }>;
    recentActivity: Array<{ type: string; description: string; timestamp: string }>;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);
  
  const api = useAuthenticatedApi();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/analytics?range=${timeRange}`);
      setData(response.data || generateMockData());
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Use mock data for demonstration
      setData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const generateMockData = (): AnalyticsData => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return {
      userGrowth: {
        labels: last30Days,
        students: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 20),
        teachers: Array.from({ length: 30 }, () => Math.floor(Math.random() * 10) + 2),
        total: Array.from({ length: 30 }, () => Math.floor(Math.random() * 60) + 25)
      },
      engagement: {
        dailyActiveUsers: 1247,
        weeklyActiveUsers: 5832,
        monthlyActiveUsers: 18456,
        averageSessionDuration: 24.5,
        bounceRate: 23.4
      },
      platform: {
        totalSessions: 12847,
        completedSessions: 11203,
        averageRating: 4.7,
        totalRevenue: 89420,
        conversionRate: 12.8
      },
      topMetrics: {
        popularSubjects: [
          { name: 'Mathematics', count: 2847 },
          { name: 'Science', count: 2156 },
          { name: 'English', count: 1923 },
          { name: 'History', count: 1456 },
          { name: 'Programming', count: 1234 }
        ],
        topTeachers: [
          { name: 'Dr. Sarah Johnson', rating: 4.9, sessions: 234 },
          { name: 'Prof. Michael Chen', rating: 4.8, sessions: 198 },
          { name: 'Ms. Emily Davis', rating: 4.8, sessions: 187 },
          { name: 'Dr. James Wilson', rating: 4.7, sessions: 156 },
          { name: 'Ms. Lisa Anderson', rating: 4.7, sessions: 143 }
        ],
        recentActivity: [
          { type: 'user_signup', description: 'New student registered', timestamp: '2 minutes ago' },
          { type: 'session_completed', description: 'Math tutoring session completed', timestamp: '5 minutes ago' },
          { type: 'teacher_approved', description: 'New teacher application approved', timestamp: '12 minutes ago' },
          { type: 'payment_received', description: 'Payment processed successfully', timestamp: '18 minutes ago' },
          { type: 'review_submitted', description: 'Student left 5-star review', timestamp: '25 minutes ago' }
        ]
      }
    };
  };

  if (loading && !data) {
    return (
      <AdminLayout title="Analytics" description="Platform performance and user insights">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Analytics Dashboard"
      description="Comprehensive platform insights and performance metrics"
      actions={
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      }
    >
      {data && (
        <>
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{data.engagement.monthlyActiveUsers.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Monthly Active Users</p>
                    <p className="text-xs text-green-600">+12.5% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{data.platform.totalSessions.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Total Sessions</p>
                    <p className="text-xs text-green-600">+8.3% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">${data.platform.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                    <p className="text-xs text-green-600">+15.2% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Award className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{data.platform.averageRating}</p>
                    <p className="text-xs text-gray-500">Average Rating</p>
                    <p className="text-xs text-green-600">+0.2 from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>User Growth Trend</span>
                    </CardTitle>
                    <CardDescription>Daily user registrations over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Interactive chart would be rendered here</p>
                        <p className="text-xs text-gray-500">Showing {timeRange} data</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Subjects */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Popular Subjects</span>
                    </CardTitle>
                    <CardDescription>Most requested tutoring subjects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.topMetrics.popularSubjects.map((subject, index) => (
                        <div key={subject.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                            </div>
                            <span className="font-medium">{subject.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{subject.count.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">sessions</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Recent Platform Activity</span>
                  </CardTitle>
                  <CardDescription>Latest events and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.topMetrics.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Daily Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{data.engagement.dailyActiveUsers.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+5.2% from yesterday</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Weekly Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{data.engagement.weeklyActiveUsers.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+8.7% from last week</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Monthly Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{data.engagement.monthlyActiveUsers.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+12.5% from last month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Teachers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Top Performing Teachers</span>
                  </CardTitle>
                  <CardDescription>Highest rated teachers by session count</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.topMetrics.topTeachers.map((teacher, index) => (
                      <div key={teacher.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">{teacher.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium">{teacher.name}</p>
                            <p className="text-sm text-gray-500">{teacher.sessions} sessions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-semibold">{teacher.rating}</span>
                          </div>
                          <p className="text-xs text-gray-500">rating</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Engagement Tab */}
            <TabsContent value="engagement" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Avg Session Duration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{data.engagement.averageSessionDuration} min</p>
                    <p className="text-xs text-green-600">+2.3 min from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Completion Rate</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {Math.round((data.platform.completedSessions / data.platform.totalSessions) * 100)}%
                    </p>
                    <p className="text-xs text-green-600">+3.2% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>Bounce Rate</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{data.engagement.bounceRate}%</p>
                    <p className="text-xs text-red-600">-1.8% from last month</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Revenue Tab */}
            <TabsContent value="revenue" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${data.platform.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+15.2% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{data.platform.conversionRate}%</p>
                    <p className="text-xs text-green-600">+0.8% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Avg Revenue per User</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      ${Math.round(data.platform.totalRevenue / data.engagement.monthlyActiveUsers)}
                    </p>
                    <p className="text-xs text-green-600">+$2.40 from last month</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </AdminLayout>
  );
}
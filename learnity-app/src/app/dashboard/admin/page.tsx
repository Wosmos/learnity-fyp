'use client';

/**
 * Admin Dashboard Page
 * Main admin dashboard with real-time statistics and quick actions
 */

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  BookOpen,
  Shield,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  DollarSign,
  Star,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface PlatformStats {
  totalUsers: number;
  pendingTeachers: number;
  approvedTeachers: number;
  totalStudents: number;
  activeSessions: number;
  totalRevenue: number;
  monthlyGrowth: number;
  platformRating: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  recentSignups: number;
  sessionCompletionRate: number;
  teacherRetentionRate: number;
  revenueGrowth: number;
  monthlyRevenue: number;
  systemStatus: string;
  uptime: string;
  responseTime: string;
}

interface PlatformMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [metrics, setMetrics] = useState<PlatformMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const api = useAuthenticatedApi();
  const { toast } = useToast();

  const fetchDashboardData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);
      
      const response = await api.get('/api/admin/stats');
      setStats(response.stats);
      setMetrics(response.platformMetrics || []);
      
      if (showRefreshToast) {
        toast({
          title: "Dashboard Updated",
          description: "Latest statistics have been loaded.",
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchDashboardData(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard" description="Platform overview and key metrics">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
    >
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalUsers.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-gray-500">Total Users</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+{stats?.userGrowthRate || 0}%</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.approvedTeachers.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-gray-500">Active Teachers</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Clock className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-orange-600">{stats?.pendingTeachers || 0}</span>
              <span className="text-gray-500 ml-1">pending approval</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalStudents.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-gray-500">Students</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Activity className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-blue-600">{stats?.recentSignups || 0}</span>
              <span className="text-gray-500 ml-1">new this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats?.monthlyRevenue.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-gray-500">Monthly Revenue</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+{stats?.revenueGrowth || 0}%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Platform Performance</span>
            </CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>System Health</span>
            </CardTitle>
            <CardDescription>Platform status and reliability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">System Status</p>
                    <p className="text-sm text-gray-500">All systems operational</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {stats?.systemStatus || 'Healthy'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{stats?.uptime || '99.9%'}</p>
                  <p className="text-sm text-gray-500">Uptime</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{stats?.responseTime || '120ms'}</p>
                  <p className="text-sm text-gray-500">Response Time</p>
                </div>
              </div>

              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <p className="text-2xl font-bold text-gray-900">{stats?.platformRating || '4.7'}</p>
                </div>
                <p className="text-sm text-gray-500">Platform Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Users</p>
                    <p className="text-sm text-gray-500">View and manage all users</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/teachers">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <GraduationCap className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900">Teacher Applications</p>
                    <p className="text-sm text-gray-500">Review pending applications</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {stats?.pendingTeachers && stats.pendingTeachers > 0 && (
                    <Badge variant="secondary">{stats.pendingTeachers}</Badge>
                  )}
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">Security Dashboard</p>
                    <p className="text-sm text-gray-500">Monitor security events</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </AdminLayout>
  );
}
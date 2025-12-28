'use client';

/**
 * Admin Dashboard Page
 * Main admin dashboard with real-time statistics and quick actions
 */

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  CheckCircle,
  DollarSign,
  Star
} from 'lucide-react';
import { MetricCard } from '@/components/ui/stats-card';

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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const api = useAuthenticatedApi();
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async (showRefreshToast = false) => {
    try {
      const response = await api.get('/api/admin/stats');

      // Validate response structure
      if (response?.stats) {
        setStats(response.stats);
        setMetrics(response.platformMetrics || []);

        if (showRefreshToast) {
          toast({
            title: "Dashboard Updated",
            description: "Latest statistics have been loaded.",
          });
        }
      } else {
        console.warn('Invalid response structure:', response);
        // Only show warning toast on manual refresh
        if (showRefreshToast) {
          toast({
            title: "Warning",
            description: "Dashboard data may be incomplete.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);

      // Only show error toast if it's NOT the initial load
      if (!isInitialLoad) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [api, toast, isInitialLoad]);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchDashboardData(false), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

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
        <MetricCard
          title="Total Users"
          value={stats?.totalUsers.toLocaleString() || '0'}
          trendValue={`+${stats?.userGrowthRate || 0}%`}
          trendLabel="this month"
          icon={Users}
        />

        <MetricCard
          title="Active Teachers"
          value={stats?.approvedTeachers.toLocaleString() || '0'}
          trendValue={stats?.pendingTeachers?.toString() || '0'}
          trendLabel="pending approval"
          icon={GraduationCap}
        />

        <MetricCard
          title="Students"
          value={stats?.totalStudents.toLocaleString() || '0'}
          trendValue={stats?.recentSignups?.toString() || '0'}
          trendLabel="new this week"
          icon={BookOpen}
        />

        <MetricCard
          title="Monthly Revenue"
          value={`$${stats?.monthlyRevenue.toLocaleString() || '0'}`}
          trendValue={`+${stats?.revenueGrowth || 0}%`}
          trendLabel="vs last month"
          icon={DollarSign}
        />
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
                <MetricCard
                  title="Uptime"
                  value={stats?.uptime || '99.9%'}
                  trendValue=""
                  trendLabel=""
                  icon={CheckCircle}
                  className="border-0 shadow-none bg-gray-50"
                />
                <MetricCard
                  title="Response Time"
                  value={stats?.responseTime || '120ms'}
                  trendValue=""
                  trendLabel=""
                  icon={Activity}
                  className="border-0 shadow-none bg-gray-50"
                />
              </div>

              <MetricCard
                title="Platform Rating"
                value={stats?.platformRating || '4.7'}
                trendValue=""
                trendLabel=""
                icon={Star}
                className="border-0 shadow-none bg-slate-50"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/users" className="block">
          <MetricCard
            title="Manage Users"
            value="" // empty since it's not a number
            trendLabel="View and manage all users"
            trendValue=""
            icon={Users}
            className="h-32"
          />
        </Link>

        <Link href="/admin/teachers" className="block">
          <MetricCard
            title="Teacher Applications"
            value={stats?.pendingTeachers ? `${stats.pendingTeachers}` : ""}
            trendLabel="Review pending applications"
            trendValue=""
            icon={GraduationCap}
            className="h-32"
          />
        </Link>

        <Link href="/admin" className="block">
          <MetricCard
            title="Security Dashboard"
            value=""
            trendLabel="Monitor security events"
            trendValue=""
            icon={Shield}
            className="h-32"
          />
        </Link>
      </div>
    </AdminLayout>
  );
}
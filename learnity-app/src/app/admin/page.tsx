import { getCachedAdminStats } from '@/lib/cache/server-cache';

import { MetricCard } from '@/components/ui/stats-card';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Shield,
  CheckCircle,
  Activity,
  Star,
  TrendingDown,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  // 1. Fetch data directly on the server for optimization
  // Note: Basic authentication is handled by root middleware.ts
  // and role-based protection is handled by AdminLayout (client-side)
  const { stats, platformMetrics } = await getCachedAdminStats();

  // Helper for trend icons
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className='h-4 w-4 text-green-500' />;
      case 'down':
        return <TrendingDown className='h-4 w-4 text-red-500' />;
      default:
        return <Activity className='h-4 w-4 text-muted-foreground' />;
    }
  };

  // Helper for trend colors
  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <>
      {/* Key Metrics Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <MetricCard
          title='Total Users'
          value={stats.totalUsers.toLocaleString()}
          trendValue={`+${stats.userGrowthRate}%`}
          icon={Users}
        />

        <MetricCard
          title='Active Teachers'
          value={stats.approvedTeachers.toLocaleString()}
          trendValue={stats.pendingTeachers.toString()}
          icon={GraduationCap}
        />

        <MetricCard
          title='Students'
          value={stats.totalStudents.toLocaleString()}
          trendValue={stats.recentSignups.toString()}
          icon={BookOpen}
        />

        <MetricCard
          title='Monthly Revenue'
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          trendValue={`+${stats.revenueGrowth}%`}
          icon={DollarSign}
        />
      </div>

      {/* Performance Metrics */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <TrendingUp className='h-5 w-5 text-blue-600' />
              <span>Platform Performance</span>
            </CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {platformMetrics.map((metric, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between p-3 bg-background rounded-lg'
                >
                  <div>
                    <p className='font-medium text-foreground'>{metric.label}</p>
                    <p className='text-2xl font-bold text-foreground'>
                      {metric.value}
                    </p>
                  </div>
                  <div className='flex items-center space-x-2'>
                    {getTrendIcon(metric.trend)}
                    <span
                      className={`text-sm font-medium ${getTrendColor(metric.trend)}`}
                    >
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
            <CardTitle className='flex items-center space-x-2'>
              <Shield className='h-5 w-5 text-green-600' />
              <span>System Health</span>
            </CardTitle>
            <CardDescription>Platform status and reliability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                <div className='flex items-center space-x-3'>
                  <CheckCircle className='h-6 w-6 text-green-600' />
                  <div>
                    <p className='font-medium text-foreground'>System Status</p>
                    <p className='text-sm text-muted-foreground'>
                      {stats.systemStatus === 'operational'
                        ? 'All systems operational'
                        : 'System issues detected'}
                    </p>
                  </div>
                </div>
                <Badge className='bg-green-100 text-green-800'>
                  {stats.systemStatus || 'Healthy'}
                </Badge>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <MetricCard
                  title='Uptime'
                  value={stats.uptime}
                  trendValue=''
                  icon={CheckCircle}
                  className='border-0 shadow-none bg-background'
                />
                <MetricCard
                  title='Response Time'
                  value={stats.responseTime}
                  trendValue=''
                  icon={Activity}
                  className='border-0 shadow-none bg-background'
                />
              </div>

              <MetricCard
                title='Platform Rating'
                value={stats.platformRating}
                trendValue=''
                icon={Star}
                className='border-0 shadow-none bg-background'
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

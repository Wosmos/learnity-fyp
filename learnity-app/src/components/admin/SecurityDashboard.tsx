'use client';

/**
 * Security Dashboard Component
 * Provides comprehensive security monitoring and analytics for administrators
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  AuditSummary,
  SuspiciousPattern,
  FailedLoginAnalysis
} from '@/lib/services/audit.service';
import {
  AlertTriangle,
  Shield,
  Eye,
  Ban,
  Download
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { useClientAuth } from '@/hooks/useClientAuth';
import { MetricCard } from '@/components/ui/stats-card';

interface SecurityDashboardProps {
  className?: string;
}

interface DashboardStats {
  summary: AuditSummary;
  suspiciousPatterns: SuspiciousPattern[];
  failedLoginAnalysis: FailedLoginAnalysis;
  recentAlerts: SecurityAlert[];
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  createdAt: Date;
  resolved: boolean;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ className }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const api = useAuthenticatedApi();
  const { loading: authLoading, isAuthenticated } = useClientAuth();

  const fetchDashboardStats = useCallback(async () => {
    // Don't fetch if auth is still loading
    if (authLoading) {
      return;
    }

    // Don't fetch if not authenticated
    // if (!isAuthenticated) {
    //   setError('Not authenticated');
    //   setLoading(false);
    //   return;
    // }

    try {
      setError(null);
      setLoading(true);

      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      const timeRangeData = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };

      const [summary, patterns, failedLogins, alerts] = await Promise.all([
        api.post('/api/admin/security/summary', timeRangeData),
        api.post('/api/admin/security/patterns', timeRangeData),
        api.post('/api/admin/security/failed-logins', timeRangeData),
        api.get('/api/admin/security/alerts')
      ]);

      setStats({
        summary,
        suspiciousPatterns: patterns,
        failedLoginAnalysis: failedLogins,
        recentAlerts: alerts
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [timeRange, api, authLoading, isAuthenticated]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchDashboardStats]);

  /**
   * Generate security report
   */
  const handleGenerateReport = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days

      const response = await api.fetch('/api/admin/security/report', {
        method: 'POST',
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    }
  };

  /**
   * Get severity color
   */
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return null;
  }

  const successRate = stats.summary.totalEvents > 0
    ? (stats.summary.successfulLogins / stats.summary.totalEvents) * 100
    : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor authentication security and threat detection
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Time Range Selector */}
          <div className="flex rounded-md border">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="rounded-none first:rounded-l-md last:rounded-r-md"
              >
                {range}
              </Button>
            ))}
          </div>

          {/* Auto-refresh toggle */}
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto-refresh
          </Button>

          {/* Generate Report */}
          <Button onClick={handleGenerateReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {stats.recentAlerts.filter(alert => !alert.resolved && alert.severity === 'CRITICAL').length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Security Alerts:</strong> {stats.recentAlerts.filter(alert => !alert.resolved && alert.severity === 'CRITICAL').length} unresolved critical security events require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Events"
          value={stats.summary.totalEvents.toLocaleString()}
          trendValue=""
          trendLabel=""
          icon={Eye}
          iconColor="text-blue-500"
          bgColor="bg-slate-100"
        />

        <MetricCard
          title="Success Rate"
          value={`${successRate.toFixed(1)}%`}
          trendValue=""
          trendLabel=""
          icon={Shield}
          iconColor="text-green-500"
          bgColor="bg-green-100"
          textColor="text-green-600"
        />

        <MetricCard
          title="Failed Logins"
          value={stats.summary.failedLogins.toLocaleString()}
          trendValue=""
          trendLabel=""
          icon={AlertTriangle}
          iconColor="text-red-500"
          bgColor="bg-red-100"
          textColor="text-red-600"
        />

        <MetricCard
          title="Security Events"
          value={stats.summary.securityEvents.toLocaleString()}
          trendValue=""
          trendLabel=""
          icon={Ban}
          iconColor="text-orange-500"
          bgColor="bg-orange-100"
          textColor="text-orange-600"
        />
      </div>

      {/* Suspicious Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Suspicious Patterns Detected</span>
          </CardTitle>
          <CardDescription>
            Automated threat detection and pattern analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.suspiciousPatterns.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No suspicious patterns detected</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.suspiciousPatterns.map((pattern, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{pattern.type.replace(/_/g, ' ')}</h4>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                    </div>
                    <Badge className={getSeverityColor(pattern.severity)}>
                      {pattern.severity}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Events:</span>
                      <span className="ml-1 font-medium">{pattern.eventCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IPs:</span>
                      <span className="ml-1 font-medium">{pattern.ipAddresses.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Users:</span>
                      <span className="ml-1 font-medium">{pattern.affectedUsers.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time Range:</span>
                      <span className="ml-1 font-medium">
                        {formatDistanceToNow(new Date(pattern.timeRange.startDate))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Failed Login Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Failed Login Analysis</CardTitle>
            <CardDescription>
              Breakdown of authentication failures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold">{stats.failedLoginAnalysis.totalFailedLogins}</p>
                  <p className="text-xs text-muted-foreground">Total Failed Logins</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.failedLoginAnalysis.uniqueIpAddresses}</p>
                  <p className="text-xs text-muted-foreground">Unique IP Addresses</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Top Failure Reasons</h4>
                <div className="space-y-2">
                  {stats.failedLoginAnalysis.topFailureReasons.slice(0, 5).map((reason, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{reason.reason}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={reason.percentage} className="w-20" />
                        <span className="text-xs text-muted-foreground w-12">
                          {reason.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top IP Addresses</CardTitle>
            <CardDescription>
              Most active IP addresses by event count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.summary.topIpAddresses.slice(0, 8).map((ip, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {ip.ipAddress}
                    </code>
                    <div className="text-xs text-muted-foreground">
                      Success rate: {ip.successRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{ip.count}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(ip.lastSeen), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Alerts</CardTitle>
          <CardDescription>
            Latest security events requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentAlerts.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No recent security alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentAlerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="flex justify-between items-start p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <span className="font-medium">{alert.title}</span>
                      {alert.resolved && (
                        <Badge variant="outline">Resolved</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!alert.resolved && (
                    <Button variant="outline" size="sm">
                      Investigate
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
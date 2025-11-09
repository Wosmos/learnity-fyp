'use client';

/**
 * Admin Dashboard Page
 * Main admin interface with security monitoring and audit capabilities
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthenticatedLayout } from '@/components/layout/AppLayout';
import { SecurityDashboard } from '@/components/admin/SecurityDashboard';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { SecurityEventsViewer } from '@/components/admin/SecurityEventsViewer';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  Users, 
  Settings,
  BarChart3,
  Play,
  Menu,
  X
} from 'lucide-react';

type AdminView = 'dashboard' | 'audit-logs' | 'security-events' | 'users' | 'settings';

export default function AdminDashboardPage() {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickStats, setQuickStats] = useState({
    activeUsers: 0,
    todaysLogins: 0,
    securityEvents: 0,
    systemStatus: 'Loading...'
  });
  const api = useAuthenticatedApi();

  // Fetch quick stats
  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - 24);
        
        const summary = await api.post('/api/admin/security/summary', {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
        
        setQuickStats({
          activeUsers: summary.uniqueUsers || 0,
          todaysLogins: summary.successfulLogins || 0,
          securityEvents: summary.securityEvents || 0,
          systemStatus: 'Healthy'
        });
      } catch (error) {
        console.error('Failed to fetch quick stats:', error);
      }
    };
    
    fetchQuickStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchQuickStats, 30000);
    return () => clearInterval(interval);
  }, [api]);

  const navigationItems = [
    {
      id: 'dashboard' as AdminView,
      label: 'Security Dashboard',
      icon: BarChart3,
      description: 'Overview of security metrics and alerts'
    },
    {
      id: 'audit-logs' as AdminView,
      label: 'Audit Logs',
      icon: FileText,
      description: 'View authentication and system events'
    },
    {
      id: 'security-events' as AdminView,
      label: 'Security Events',
      icon: AlertTriangle,
      description: 'Monitor security threats and incidents'
    },
    {
      id: 'users' as AdminView,
      label: 'User Management',
      icon: Users,
      description: 'Manage users and permissions'
    },
    {
      id: 'settings' as AdminView,
      label: 'Settings',
      icon: Settings,
      description: 'System configuration and preferences'
    }
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <SecurityDashboard />;
      case 'audit-logs':
        return <AuditLogViewer />;
      case 'security-events':
        return <SecurityEventsViewer />;
      case 'users':
        return <UserManagementPlaceholder />;
      case 'settings':
        return <SettingsPlaceholder />;
      default:
        return <SecurityDashboard />;
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <Shield className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs md:text-sm text-gray-500 hidden sm:block">Learnity Platform Administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link href="/admin/test" className="hidden md:inline-block">
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Test Auth</span>
                </Button>
              </Link>
              <Link href="/admin/demo" className="hidden md:inline-block">
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Demo</span>
                </Button>
              </Link>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <span className="hidden sm:inline">System: </span>{quickStats.systemStatus}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="flex gap-4 md:gap-8">
          {/* Sidebar Navigation */}
          <aside className={`
            fixed lg:static inset-y-0 left-0 z-20 w-64 bg-white lg:bg-transparent
            transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            lg:flex-shrink-0 shadow-lg lg:shadow-none
            pt-16 lg:pt-0 px-4 lg:px-0
          `}>
            {/* Mobile overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-10"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            <nav className="space-y-2 relative z-20">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeView === item.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{item.label}</div>
                      <div className="text-xs text-gray-500 truncate hidden xl:block">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Quick Stats (24h)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-medium">{quickStats.activeUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Today&apos;s Logins</span>
                  <span className="font-medium">{quickStats.todaysLogins.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Security Events</span>
                  <span className={`font-medium ${
                    quickStats.securityEvents > 10 ? 'text-orange-600' : 'text-green-600'
                  }`}>{quickStats.securityEvents.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">System Status</span>
                  <span className={`font-medium ${
                    quickStats.systemStatus === 'Healthy' ? 'text-green-600' : 'text-gray-600'
                  }`}>{quickStats.systemStatus}</span>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {renderActiveView()}
          </main>
        </div>
      </div>
      </div>
    </AuthenticatedLayout>
  );
}

/**
 * Placeholder components for future implementation
 */
function UserManagementPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage users, roles, and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
          <p className="text-gray-500 mb-4">
            User management interface will be implemented in a future update.
          </p>
          <Button variant="outline">
            Coming Soon
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>
          Configure system preferences and security settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">System Settings</h3>
          <p className="text-gray-500 mb-4">
            System configuration interface will be implemented in a future update.
          </p>
          <Button variant="outline">
            Coming Soon
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
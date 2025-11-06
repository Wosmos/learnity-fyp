'use client';

/**
 * Admin Dashboard Page
 * Main admin interface with security monitoring and audit capabilities
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthenticatedLayout } from '@/components/layout/AppLayout';
import { SecurityDashboard } from '@/components/admin/SecurityDashboard';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { SecurityEventsViewer } from '@/components/admin/SecurityEventsViewer';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  Users, 
  Settings,
  BarChart3,
  Play
} from 'lucide-react';

type AdminView = 'dashboard' | 'audit-logs' | 'security-events' | 'users' | 'settings';

export default function AdminDashboardPage() {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');

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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Learnity Platform Administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/test">
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Test Auth
                </Button>
              </Link>
              <Link href="/admin/demo">
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Demo
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                Export Report
              </Button>
              <Button size="sm">
                System Health
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeView === item.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Today&apos;s Logins</span>
                  <span className="font-medium">456</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Security Events</span>
                  <span className="font-medium text-orange-600">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">System Status</span>
                  <span className="font-medium text-green-600">Healthy</span>
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
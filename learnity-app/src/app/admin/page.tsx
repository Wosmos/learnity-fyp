'use client';

/**
 * Admin Security Dashboard Page
 * Main security monitoring interface with audit capabilities
 */


import { AdminLayout } from '@/components/admin/AdminLayout';
import { SecurityDashboard } from '@/components/admin/SecurityDashboard';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { SecurityEventsViewer } from '@/components/admin/SecurityEventsViewer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { 
  FileText, 
  AlertTriangle, 
  Users, 
  Settings,
  Play,
  TestTube
} from 'lucide-react';

export default function AdminSecurityDashboardPage() {
  return (
    <AdminLayout
      title="Security Dashboard"
      description="Monitor security events, audit logs, and system health"
      actions={
        <div className="flex items-center space-x-2">
          <Link href="/admin/test">
            <Button variant="outline" size="sm">
              <TestTube className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Test Auth</span>
            </Button>
          </Link>
          <Link href="/admin/demo">
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Demo</span>
            </Button>
          </Link>
        </div>
      }
    >
      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">User Management</p>
                  <p className="text-xs text-gray-500">Manage users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/settings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Settings className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-900">Settings</p>
                  <p className="text-xs text-gray-500">Configure system</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Security Dashboard Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Security Overview</TabsTrigger>
          <TabsTrigger value="audit-logs">Recent Audit Logs</TabsTrigger>
          <TabsTrigger value="security-events">Security Events</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Audit Logs</span>
              </CardTitle>
              <CardDescription>
                Authentication and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditLogViewer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security-events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Security Events</span>
              </CardTitle>
              <CardDescription>
                Monitor security threats and suspicious activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityEventsViewer />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}


'use client';

/**
 * Admin Security Dashboard Page
 * Main security monitoring interface with audit capabilities
 */

import Link from 'next/link';
import {
  FileText,
  AlertTriangle,
  Users,
  Settings,
  Play,
  TestTube,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SecurityDashboard } from '@/components/admin/SecurityDashboard';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { SecurityEventsViewer } from '@/components/admin/SecurityEventsViewer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminSecurityDashboardPage() {
  return (
    <AdminLayout>
      {/* Main Security Dashboard Tabs */}
      <Tabs defaultValue='dashboard' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='dashboard'>Security Overview</TabsTrigger>
          <TabsTrigger value='audit-logs'>Recent Audit Logs</TabsTrigger>
          <TabsTrigger value='security-events'>Security Events</TabsTrigger>
        </TabsList>

        <TabsContent value='dashboard' className='space-y-6'>
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value='audit-logs' className='space-y-6'>
          <Card>
            <CardContent>
              <AuditLogViewer />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='security-events' className='space-y-6'>
          <Card>
            <CardContent>
              <SecurityEventsViewer />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

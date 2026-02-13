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

export default async function AdminSecurityDashboardPage() {
  // Role protection is handled by AdminLayout (client-side)
  // and basic auth by middleware.ts

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

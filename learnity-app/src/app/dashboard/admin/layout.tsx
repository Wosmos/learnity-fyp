'use client';

import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { AdminSidebarUnified } from '@/components/layout/AdminSidebarUnified';
import {
  DashboardNavbar,
  teacherNavbarConfig,
} from '@/components/layout/DashboardNavbar';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRoute>
      <div className='flex min-h-screen bg-background'>
        <AdminSidebarUnified />
        <div className='flex-1 flex flex-col overflow-x-hidden'>
          <DashboardNavbar config={{ ...teacherNavbarConfig, role: 'admin' }} />
          <main className='flex-1'>{children}</main>
        </div>
      </div>
    </AdminRoute>
  );
}

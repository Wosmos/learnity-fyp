'use client';

import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { AdminSidebarUnified } from '@/components/layout/AdminSidebarUnified';
import {
  DashboardNavbar,
  teacherNavbarConfig,
} from '@/components/layout/DashboardNavbar';

export default function AdminRouteLayout({
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
          <main className='flex-1'>
            <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8'>
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminRoute>
  );
}

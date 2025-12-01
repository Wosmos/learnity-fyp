/**
 * Admin Route Group Layout
 * Provides admin route protection at the route group level
 */

import { Metadata } from 'next';
import { ClientAdminProtection } from '@/components/auth/ClientAdminProtection';

export const metadata: Metadata = {
  title: 'Admin Panel - Learnity',
  description: 'Administrative interface for Learnity platform management',
};

import { RoleDashboardLayout } from '@/components/layout/RoleDashboardLayout';
import { UserRole } from '@/types/auth';

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientAdminProtection>
      <RoleDashboardLayout role={UserRole.ADMIN} roleLabel="Administrator">
        {children}
      </RoleDashboardLayout>
    </ClientAdminProtection>
  );
}
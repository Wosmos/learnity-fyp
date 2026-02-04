'use client';

/**
 * Admin Sidebar
 * Uses the unified DashboardSidebar with admin configuration.
 * Replaces the custom AdminSidebar implementation.
 */

import {
  DashboardSidebar,
  adminSidebarConfig,
  type DashboardSidebarProps,
} from '@/components/layout/DashboardSidebar';

// We omit 'config' because we supply it, but we can accept other props like className
export type AdminSidebarProps = Omit<DashboardSidebarProps, 'config'>;

export function AdminSidebar(props: AdminSidebarProps) {
  return <DashboardSidebar config={adminSidebarConfig} {...props} />;
}

export default AdminSidebar;

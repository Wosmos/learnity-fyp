'use client';

import {
  DashboardSidebar,
  adminSidebarConfig,
  type DashboardSidebarProps,
} from './DashboardSidebar';

export type AdminSidebarUnifiedProps = Omit<DashboardSidebarProps, 'config'>;

export function AdminSidebarUnified(props: AdminSidebarUnifiedProps) {
  return <DashboardSidebar config={adminSidebarConfig} {...props} />;
}

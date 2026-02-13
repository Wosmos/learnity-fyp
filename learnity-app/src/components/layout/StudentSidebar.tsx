'use client';

/**
 * Convenience wrapper for Student Sidebar
 * Uses the unified DashboardSidebar with student configuration
 */

import {
  DashboardSidebar,
  studentSidebarConfig,
  type DashboardSidebarProps,
} from './DashboardSidebar';

export type StudentSidebarProps = Omit<DashboardSidebarProps, 'config'>;

export function StudentSidebar(props: StudentSidebarProps) {
  return <DashboardSidebar config={studentSidebarConfig} {...props} />;
}

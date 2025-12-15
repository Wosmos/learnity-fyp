'use client';

/**
 * Convenience wrapper for Teacher Sidebar
 * Uses the unified DashboardSidebar with teacher configuration
 */

import { DashboardSidebar, teacherSidebarConfig, type DashboardSidebarProps } from './DashboardSidebar';

export type TeacherSidebarProps = Omit<DashboardSidebarProps, 'config'>;

export function TeacherSidebar(props: TeacherSidebarProps) {
  return <DashboardSidebar config={teacherSidebarConfig} {...props} />;
}
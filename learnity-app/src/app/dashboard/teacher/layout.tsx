/**
 * Teacher Dashboard Layout
 * Server Component that wraps client-side authentication
 * OPTIMIZED: Layout shell is server-rendered, auth is client-side
 */

import { TeacherLayoutClient } from '@/components/layout/TeacherLayoutClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teacher Dashboard - Learnity',
  description: 'Manage your courses and students',
};

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TeacherLayoutClient>{children}</TeacherLayoutClient>;
}

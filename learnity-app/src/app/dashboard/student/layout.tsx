/**
 * Student Dashboard Layout
 * Server Component that wraps client-side authentication
 * OPTIMIZED: Layout shell is server-rendered, auth is client-side
 */

import { StudentLayoutClient } from '@/components/layout/StudentLayoutClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Dashboard - Learnity',
  description: 'Your personalized learning dashboard',
};

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentLayoutClient>{children}</StudentLayoutClient>;
}

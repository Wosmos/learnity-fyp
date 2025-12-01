/**
 * Student Dashboard Layout
 * Protects student routes and provides common layout
 */

import { Metadata } from 'next';
import { ClientStudentProtection } from '@/components/auth/ClientStudentProtection';

export const metadata: Metadata = {
  title: 'Student Dashboard - Learnity',
  description: 'Student learning dashboard with courses, progress tracking, and study tools',
};

import { RoleDashboardLayout } from '@/components/layout/RoleDashboardLayout';
import { UserRole } from '@/types/auth';

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientStudentProtection>
      <RoleDashboardLayout role={UserRole.STUDENT} roleLabel="Student">
        {children}
      </RoleDashboardLayout>
    </ClientStudentProtection>
  );
}
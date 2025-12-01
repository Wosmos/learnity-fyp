/**
 * Teacher Dashboard Layout
 * Protects teacher routes and provides common layout
 */

import { Metadata } from 'next';
import { ClientTeacherProtection } from '@/components/auth/ClientTeacherProtection';

export const metadata: Metadata = {
  title: 'Teacher Dashboard - Learnity',
  description: 'Teacher dashboard with session management, student progress, and content tools',
};

import { RoleDashboardLayout } from '@/components/layout/RoleDashboardLayout';
import { UserRole } from '@/types/auth';

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientTeacherProtection>
      <RoleDashboardLayout role={UserRole.TEACHER} roleLabel="Teacher">
        {children}
      </RoleDashboardLayout>
    </ClientTeacherProtection>
  );
}
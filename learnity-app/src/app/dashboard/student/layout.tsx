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

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientStudentProtection>
      <div className="student-dashboard-layout">
        {children}
      </div>
    </ClientStudentProtection>
  );
}
/**
 * Teacher Dashboard Layout
 * Protects teacher routes and provides common layout
 */

import { Metadata } from 'next';
import { TeacherRoute } from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Teacher Dashboard - Learnity',
  description: 'Teacher dashboard with session management, student progress, and content tools',
};

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TeacherRoute>
      <div className="teacher-dashboard-layout">
        {children}
      </div>
    </TeacherRoute>
  );
}
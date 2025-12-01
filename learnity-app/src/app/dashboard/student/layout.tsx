/**
 * Student Dashboard Layout
 * Protects student routes and provides common layout
 */

import { Metadata } from 'next';
import { StudentRoute } from '@/components/auth/ProtectedRoute';

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
    <StudentRoute>
      <div className="student-dashboard-layout">
        {children}
      </div>
    </StudentRoute>
  );
}
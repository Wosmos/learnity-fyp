/**
 * Teacher Dashboard Layout
 * Provides consistent layout and navigation for teacher dashboard pages
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teacher Dashboard - Learnity',
  description: 'Manage your teaching sessions, students, and content on Learnity',
};

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="teacher-dashboard-layout">
      {children}
    </div>
  );
}
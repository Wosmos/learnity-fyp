/**
 * Teacher Dashboard Layout
 * Protects teacher routes and provides common layout
 */

import { Metadata } from 'next';
import { TeacherRoute } from '@/components/auth/ProtectedRoute';
import { TeacherSidebar } from '@/components/layout/TeacherSidebar';

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
      <div className="flex min-h-screen bg-slate-50">
              {/* Student Sidebar Navigation */}
              <TeacherSidebar/>
              
              {/* Main Content Area */}
              <div className="flex-1 overflow-x-hidden">
                {children}
              </div>
            </div>
    </TeacherRoute>
  );
}
/**
 * Student Dashboard Layout
 * Protects student routes and provides common layout with sidebar navigation
 */

'use client';

import { StudentRoute } from '@/components/auth/ProtectedRoute';
import { StudentSidebar } from '@/components/layout/StudentSidebar';

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudentRoute>
      <div className="flex min-h-screen bg-slate-50">
        {/* Student Sidebar Navigation */}
        <StudentSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </div>
    </StudentRoute>
  );
}
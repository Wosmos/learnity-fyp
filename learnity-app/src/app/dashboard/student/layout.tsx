/**
 * Student Dashboard Layout
 * Protects student routes and provides common layout with sidebar and navbar
 */

'use client';

import { StudentRoute } from '@/components/auth/ProtectedRoute';
import { StudentSidebar } from '@/components/layout/StudentSidebar';
import { DashboardNavbar, studentNavbarConfig } from '@/components/layout/DashboardNavbar';

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
        <div className="flex-1 flex flex-col overflow-x-hidden">
          {/* Top Navbar with Stats */}
          <DashboardNavbar config={studentNavbarConfig} />

          {/* Page Content */}
          <main className="flex-1 pb-32 md:pb-0">
            {children}
          </main>
        </div>
      </div>
    </StudentRoute>
  );
}

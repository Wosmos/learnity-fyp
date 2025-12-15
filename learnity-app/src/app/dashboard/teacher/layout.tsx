/**
 * Teacher Dashboard Layout
 * Protects teacher routes and provides common layout with sidebar and navbar
 */

'use client';

import { TeacherRoute } from '@/components/auth/ProtectedRoute';
import { TeacherSidebar } from '@/components/layout/TeacherSidebar';
import { DashboardNavbar, teacherNavbarConfig } from '@/components/layout/DashboardNavbar';
import { ClientTeacherProtection } from '@/components/auth/ClientTeacherProtection';

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TeacherRoute>
      <ClientTeacherProtection>
      <div className="flex min-h-screen bg-slate-50">
        {/* Teacher Sidebar Navigation */}
        <TeacherSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-x-hidden">
          {/* Top Navbar */}
          <DashboardNavbar config={teacherNavbarConfig} />
          
          {/* Page Content */}
          <main className="flex-1 ">
            {children}
          </main>
        </div>
      </div>
      </ClientTeacherProtection>
    </TeacherRoute>
  );
}

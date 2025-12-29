'use client';

/**
 * Teacher Layout Client Component
 * Handles client-side authentication and layout rendering
 * Separated from layout.tsx to allow server-side rendering of the layout shell
 */

import { TeacherRoute } from '@/components/auth/ProtectedRoute';
import { TeacherSidebar } from '@/components/layout/TeacherSidebar';
import { DashboardNavbar, teacherNavbarConfig } from '@/components/layout/DashboardNavbar';
import { ClientTeacherProtection } from '@/components/auth/ClientTeacherProtection';

interface TeacherLayoutClientProps {
  children: React.ReactNode;
}

export function TeacherLayoutClient({ children }: TeacherLayoutClientProps) {
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
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </ClientTeacherProtection>
    </TeacherRoute>
  );
}

export default TeacherLayoutClient;

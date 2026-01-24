/**
 * Student Dashboard Layout
 * Server Component that wraps client-side authentication
 * OPTIMIZED: Layout shell is server-rendered, auth is client-side
 */

import { StudentLayoutClient } from '@/components/layout/StudentLayoutClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Dashboard - Learnity',
  description: 'Your personalized learning dashboard',
};

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentLayoutClient>{children}</StudentLayoutClient>;

  //  <StudentRoute>
  //     <div className="flex min-h-screen bg-slate-50">
  //       {/* Student Sidebar Navigation */}
  //       <StudentSidebar />

  //       {/* Main Content Area */}
  //       <div className="flex-1 flex flex-col overflow-x-hidden">
  //         {/* Top Navbar with Stats */}
  //         <DashboardNavbar config={studentNavbarConfig} />

  //         {/* Page Content */}
  //         <main className="flex-1 pb-32 md:pb-0">
  //           {children}
  //         </main>
  //       </div>
  //     </div>
  //   </StudentRoute>
}

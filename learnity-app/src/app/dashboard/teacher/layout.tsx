/**
 * Teacher Dashboard Layout
 * Server Component that wraps client-side authentication
 * OPTIMIZED: Layout shell is server-rendered, auth is client-side
 */

import { TeacherLayoutClient } from '@/components/layout/TeacherLayoutClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teacher Dashboard - Learnity',
  description: 'Manage your courses and students',
};

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TeacherLayoutClient>{children}</TeacherLayoutClient>;

  // <TeacherRoute>
  //     <ClientTeacherProtection>
  //       <div className="flex min-h-screen bg-slate-50">
  //         {/* Teacher Sidebar Navigation */}
  //         <TeacherSidebar />

  //         {/* Main Content Area */}
  //         <div className="flex-1 flex flex-col overflow-x-hidden">
  //           {/* Top Navbar */}
  //           <DashboardNavbar config={teacherNavbarConfig} />

  //           {/* Page Content */}
  //           <main className="flex-1 pb-32 md:pb-0">
  //             {children}
  //           </main>
  //         </div>
  //       </div>
  //     </ClientTeacherProtection>
  //   </TeacherRoute>
}

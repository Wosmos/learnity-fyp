'use client';

/**
 * Student Layout Client Component
 * Handles client-side authentication and layout rendering
 * Separated from layout.tsx to allow server-side rendering of the layout shell
 */

import { StudentRoute } from '@/components/auth/ProtectedRoute';
import { StudentSidebar } from '@/components/layout/StudentSidebar';
import {
  DashboardNavbar,
  studentNavbarConfig,
} from '@/components/layout/DashboardNavbar';

interface StudentLayoutClientProps {
  children: React.ReactNode;
}

export function StudentLayoutClient({ children }: StudentLayoutClientProps) {
  return (
    <StudentRoute>
      <div className='flex min-h-screen bg-background'>
        <StudentSidebar />
        <div className='flex-1 flex flex-col overflow-x-hidden'>
          <DashboardNavbar config={studentNavbarConfig} />
          <main className='flex-1'>{children}</main>
        </div>
      </div>
    </StudentRoute>
  );
}

export default StudentLayoutClient;

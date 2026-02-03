'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Custom Route Label Mapping
 * Maps path segments to user-friendly titles
 */
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  student: 'Student Home',
  teacher: 'Teacher Panel',
  admin: 'Administration',
  courses: 'My Courses',
  'public-cources': 'Explore Courses',
  progress: 'Learning Activity',
  achievements: 'Achievements',
  profile: 'My Profile',
  enhance: 'Profile Optimization',
  curriculum: 'Curriculum Builder',
  edit: 'Editor',
  learn: 'Learning Mode',
  analytics: 'Performance Data',
  students: 'Enrolled Students',
  pending: 'Approvals',
  rejected: 'Registration Status',
  sessions: 'Live Sessions',
  security: 'Security Center',
  logs: 'System Logs',
};

/**
 * Breadcrumbs Component
 * Automatically generates navigation breadcrumbs based on the current URL
 */
export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();

  // Skip showing breadcrumbs on the root dashboard pages
  if (
    pathname === '/dashboard/student' ||
    pathname === '/dashboard/teacher' ||
    pathname === '/dashboard/admin'
  ) {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);

  // Generate items with cumulative paths
  const breadcrumbItems = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`;

    // Check if segment is a dynamic ID (usually long string or specific format)
    const isDynamicId =
      segment.length > 20 || /^[0-9a-fA-F-]{36}$/.test(segment);

    // Get label from mapping or capitalize segment
    let label =
      routeLabels[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    if (isDynamicId) {
      label = 'Details';
    }

    return {
      label,
      path,
      active: index === segments.length - 1,
    };
  });

  return (
    <nav
      aria-label='Breadcrumb'
      className={cn(
        'flex items-center space-x-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 py-4 px-10 max-w-[1600px] mx-auto overflow-x-auto no-scrollbar',
        className
      )}
    >
      <Link
        href='/'
        className='flex items-center hover:text-indigo-600 transition-colors duration-200'
      >
        <Home className='h-3 w-3 mr-1.5' />
        <span>Learnity</span>
      </Link>

      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          <ChevronRight className='h-3 w-3 text-slate-300 shrink-0' />
          <Link
            href={item.path}
            className={cn(
              'transition-all duration-200 hover:text-indigo-600 whitespace-nowrap',
              item.active
                ? 'text-indigo-600 font-black cursor-default pointer-events-none'
                : 'hover:translate-x-0.5'
            )}
            aria-current={item.active ? 'page' : undefined}
          >
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}

export default Breadcrumbs;

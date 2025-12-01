/**
 * Role-Based Navigation Component
 * Provides navigation menus that adapt based on user roles and permissions
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  useAuth, 
  useIsAdmin, 
  useIsTeacher, 
  useIsStudent, 
  useIsPendingTeacher
} from '@/hooks/useAuth';
import { UserRole, Permission } from '@/types/auth';
import {
  RequirePermission,
  AdminOnly,
  TeacherOnly,
  StudentOnly,
  PendingTeacherOnly
} from '@/components/auth/PermissionGate';

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  permission?: Permission;
  role?: UserRole;
  roles?: UserRole[];
  children?: NavigationItem[];
  external?: boolean;
}

export interface RoleBasedNavigationProps {
  items?: NavigationItem[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showIcons?: boolean;
}

import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Shield,
  Activity,
  UserCheck,
  GraduationCap,
  User
} from 'lucide-react';

/**
 * Default navigation items for different user roles
 */
export const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [
  // Student Navigation
  {
    label: 'Student Dashboard',
    href: '/dashboard/student',
    permission: Permission.VIEW_STUDENT_DASHBOARD,
    role: UserRole.STUDENT,
    icon: <LayoutDashboard className="w-5 h-5" />
  },
  {
    label: 'Study Groups',
    href: '/student/groups',
    permission: Permission.JOIN_STUDY_GROUPS,
    role: UserRole.STUDENT,
    icon: <Users className="w-5 h-5" />
  },
  {
    label: 'Book Tutoring',
    href: '/student/tutoring',
    permission: Permission.BOOK_TUTORING,
    role: UserRole.STUDENT,
    icon: <Calendar className="w-5 h-5" />
  },
  {
    label: 'Enhance Profile',
    href: '/profile/enhance',
    permission: Permission.ENHANCE_PROFILE,
    role: UserRole.STUDENT,
    icon: <User className="w-5 h-5" />
  },

  // Teacher Navigation
  {
    label: 'Teacher Dashboard',
    href: '/dashboard/teacher',
    permission: Permission.VIEW_TEACHER_DASHBOARD,
    roles: [UserRole.TEACHER, UserRole.ADMIN],
    icon: <LayoutDashboard className="w-5 h-5" />
  },
  {
    label: 'Manage Sessions',
    href: '/teacher/sessions',
    permission: Permission.MANAGE_SESSIONS,
    roles: [UserRole.TEACHER, UserRole.ADMIN],
    icon: <Calendar className="w-5 h-5" />
  },
  {
    label: 'Upload Content',
    href: '/teacher/content',
    permission: Permission.UPLOAD_CONTENT,
    roles: [UserRole.TEACHER, UserRole.ADMIN],
    icon: <FileText className="w-5 h-5" />
  },
  {
    label: 'Student Progress',
    href: '/teacher/progress',
    permission: Permission.VIEW_STUDENT_PROGRESS,
    roles: [UserRole.TEACHER, UserRole.ADMIN],
    icon: <Activity className="w-5 h-5" />
  },

  // Pending Teacher Navigation
  {
    label: 'Application Status',
    href: '/application/status',
    permission: Permission.VIEW_APPLICATION_STATUS,
    role: UserRole.PENDING_TEACHER,
    icon: <FileText className="w-5 h-5" />
  },
  {
    label: 'Update Application',
    href: '/application/update',
    permission: Permission.UPDATE_APPLICATION,
    role: UserRole.PENDING_TEACHER,
    icon: <User className="w-5 h-5" />
  },

  // Admin Navigation
  {
    label: 'Admin Dashboard',
    href: '/admin',
    permission: Permission.VIEW_ADMIN_PANEL,
    role: UserRole.ADMIN,
    icon: <LayoutDashboard className="w-5 h-5" />
  },
  {
    label: 'User Management',
    href: '/admin/users',
    permission: Permission.MANAGE_USERS,
    role: UserRole.ADMIN,
    icon: <Users className="w-5 h-5" />
  },
  {
    label: 'Teacher Applications',
    href: '/admin/teachers',
    permission: Permission.APPROVE_TEACHERS,
    role: UserRole.ADMIN,
    icon: <UserCheck className="w-5 h-5" />
  },
  {
    label: 'Audit Logs',
    href: '/admin/audit-logs',
    permission: Permission.VIEW_AUDIT_LOGS,
    role: UserRole.ADMIN,
    icon: <FileText className="w-5 h-5" />
  },
  {
    label: 'Security Events',
    href: '/admin/security-events',
    permission: Permission.VIEW_AUDIT_LOGS,
    role: UserRole.ADMIN,
    icon: <Shield className="w-5 h-5" />
  }
];

/**
 * Main role-based navigation component
 */
export function RoleBasedNavigation({
  items = DEFAULT_NAVIGATION_ITEMS,
  className,
  orientation = 'vertical',
  showIcons = true
}: RoleBasedNavigationProps) {
  const pathname = usePathname();
  const { user, loading, claims } = useAuth();

  if (loading) {
    return <NavigationSkeleton orientation={orientation} />;
  }

  if (!user) {
    return null;
  }

  const filteredItems = items.filter(item => {
    if (!claims) return false;

    // Check role-based access
    if (item.role && claims.role !== item.role) {
      return false;
    }

    // Check multiple roles access
    if (item.roles && !item.roles.includes(claims.role)) {
      return false;
    }

    // Check permission-based access
    if (item.permission && !claims.permissions.includes(item.permission)) {
      return false;
    }

    return true;
  });

  return (
    <nav className={cn(
      'role-based-navigation',
      orientation === 'horizontal' ? 'flex flex-row space-x-4' : 'flex flex-col space-y-2',
      className
    )}>
      {filteredItems.map((item, index) => (
        <NavigationItemComponent
          key={`${item.href}-${index}`}
          item={item}
          isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
          orientation={orientation}
          showIcons={showIcons}
        />
      ))}
    </nav>
  );
}

/**
 * Individual navigation item component
 */
function NavigationItemComponent({
  item,
  isActive,
  orientation,
  showIcons
}: {
  item: NavigationItem;
  isActive: boolean;
  orientation: 'horizontal' | 'vertical';
  showIcons: boolean;
}) {
  const baseClasses = cn(
    'navigation-item',
    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
    'hover:bg-gray-100 dark:hover:bg-gray-800',
    'focus:outline-none focus:ring-2 focus:ring-blue-500',
    isActive 
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
      : 'text-gray-700 dark:text-gray-300'
  );

  const content = (
    <>
      {showIcons && item.icon && (
        <span className={cn(
          'navigation-icon',
          orientation === 'horizontal' ? 'mr-2' : 'mr-3'
        )}>
          {item.icon}
        </span>
      )}
      <span className="navigation-label">{item.label}</span>
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} className={baseClasses}>
      {content}
    </Link>
  );
}



/**
 * Student-specific navigation component
 */
export function StudentNavigation(props: Omit<RoleBasedNavigationProps, 'items'>) {
  const studentItems = DEFAULT_NAVIGATION_ITEMS.filter(item => 
    item.role === UserRole.STUDENT
  );

  return (
    <StudentOnly>
      <RoleBasedNavigation {...props} items={studentItems} />
    </StudentOnly>
  );
}

/**
 * Teacher-specific navigation component
 */
export function TeacherNavigation(props: Omit<RoleBasedNavigationProps, 'items'>) {
  const teacherItems = DEFAULT_NAVIGATION_ITEMS.filter(item => 
    item.roles?.includes(UserRole.TEACHER) || item.role === UserRole.TEACHER
  );

  return (
    <TeacherOnly>
      <RoleBasedNavigation {...props} items={teacherItems} />
    </TeacherOnly>
  );
}

/**
 * Admin-specific navigation component
 */
export function AdminNavigation(props: Omit<RoleBasedNavigationProps, 'items'>) {
  const adminItems = DEFAULT_NAVIGATION_ITEMS.filter(item => 
    item.role === UserRole.ADMIN
  );

  return (
    <AdminOnly>
      <RoleBasedNavigation {...props} items={adminItems} />
    </AdminOnly>
  );
}

/**
 * Pending teacher-specific navigation component
 */
export function PendingTeacherNavigation(props: Omit<RoleBasedNavigationProps, 'items'>) {
  const pendingTeacherItems = DEFAULT_NAVIGATION_ITEMS.filter(item => 
    item.role === UserRole.PENDING_TEACHER
  );

  return (
    <PendingTeacherOnly>
      <RoleBasedNavigation {...props} items={pendingTeacherItems} />
    </PendingTeacherOnly>
  );
}

/**
 * Adaptive navigation that shows appropriate items based on current user role
 */
export function AdaptiveNavigation(props: RoleBasedNavigationProps) {
  const isAdmin = useIsAdmin();
  const isTeacher = useIsTeacher();
  const isStudent = useIsStudent();
  const isPendingTeacher = useIsPendingTeacher();

  if (isAdmin) {
    return <AdminNavigation {...props} />;
  }

  if (isTeacher) {
    return <TeacherNavigation {...props} />;
  }

  if (isPendingTeacher) {
    return <PendingTeacherNavigation {...props} />;
  }

  if (isStudent) {
    return <StudentNavigation {...props} />;
  }

  return null;
}

/**
 * Breadcrumb navigation component
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface RoleBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function RoleBreadcrumbs({ items, className }: RoleBreadcrumbsProps) {
  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ) : (
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Navigation skeleton for loading states
 */
function NavigationSkeleton({ orientation }: { orientation: 'horizontal' | 'vertical' }) {
  const skeletonItems = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div className={cn(
      'navigation-skeleton',
      orientation === 'horizontal' ? 'flex flex-row space-x-4' : 'flex flex-col space-y-2'
    )}>
      {skeletonItems.map((_, index) => (
        <div
          key={index}
          className="animate-pulse flex items-center px-3 py-2 rounded-md"
        >
          <div className="w-4 h-4 bg-gray-300 rounded mr-3" />
          <div className="h-4 bg-gray-300 rounded w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * Quick action navigation for common tasks
 */
export interface QuickActionProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionProps) {
  return (
    <div className={cn('quick-actions flex flex-wrap gap-2', className)}>
      <RequirePermission permission={Permission.ENHANCE_PROFILE}>
        <Link
          href="/profile/enhance"
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
        >
          Complete Profile
        </Link>
      </RequirePermission>

      <RequirePermission permission={Permission.BOOK_TUTORING}>
        <Link
          href="/student/tutoring"
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
        >
          Book Session
        </Link>
      </RequirePermission>

      <RequirePermission permission={Permission.MANAGE_SESSIONS}>
        <Link
          href="/teacher/sessions"
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200"
        >
          Manage Sessions
        </Link>
      </RequirePermission>

      <RequirePermission permission={Permission.APPROVE_TEACHERS}>
        <Link
          href="/admin/teachers"
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
        >
          Review Applications
        </Link>
      </RequirePermission>
    </div>
  );
}
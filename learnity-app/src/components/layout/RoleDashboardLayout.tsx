'use client';

import React from 'react';
import { DashboardLayout } from './DashboardLayout';
import { DEFAULT_NAVIGATION_ITEMS } from '@/components/navigation/RoleBasedNavigation';
import { UserRole } from '@/types/auth';

interface RoleDashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  roleLabel: string;
}

export function RoleDashboardLayout({ children, role, roleLabel }: RoleDashboardLayoutProps) {
  const items = DEFAULT_NAVIGATION_ITEMS.filter(item => {
    if (item.role === role) return true;
    if (item.roles && item.roles.includes(role)) return true;
    return false;
  });

  return (
    <DashboardLayout items={items} roleLabel={roleLabel}>
      {children}
    </DashboardLayout>
  );
}

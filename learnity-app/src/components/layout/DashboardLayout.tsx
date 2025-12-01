'use client';

import React, { useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { NavigationItem } from '@/components/navigation/RoleBasedNavigation';
import { AuthenticatedLayout } from './AppLayout';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  items: NavigationItem[];
  roleLabel?: string;
}

export function DashboardLayout({ 
  children, 
  items,
  roleLabel
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <AuthenticatedLayout showHeader={false} showNavigation={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <DashboardSidebar
          items={items}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          roleLabel={roleLabel}
          isCollapsed={isCollapsed}
          onCollapse={setIsCollapsed}
        />

        <div className={cn(
          "transition-all duration-300 ease-in-out flex flex-col min-h-screen",
          isCollapsed ? "lg:ml-20" : "lg:ml-72"
        )}>
          <DashboardHeader 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

'use client';

/**
 * Unified Admin Layout Component
 * Provides consistent layout for all admin pages with sidebar navigation
 * Implements proper authentication protection and responsive design
 */

import React, { useState, useEffect } from 'react';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { AdminAuthenticatedLayout } from '@/components/layout/AppLayout';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showBackButton?: boolean;
  backHref?: string;
  actions?: React.ReactNode;
}

interface QuickStats {
  activeUsers: number;
  todaysLogins: number;
  securityEvents: number;
  systemStatus: string;
}

export class AdminStatsService {
  private static instance: AdminStatsService;

  public static getInstance(): AdminStatsService {
    if (!AdminStatsService.instance) {
      AdminStatsService.instance = new AdminStatsService();
    }
    return AdminStatsService.instance;
  }

  public async fetchQuickStats(api: {
    post: (
      url: string,
      data: Record<string, string>
    ) => Promise<Record<string, number>>;
  }): Promise<QuickStats> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 24);

      const summary = await api.post('/api/admin/security/summary', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      return {
        activeUsers: summary.uniqueUsers || 0,
        todaysLogins: summary.successfulLogins || 0,
        securityEvents: summary.securityEvents || 0,
        systemStatus: 'Healthy',
      };
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      return {
        activeUsers: 0,
        todaysLogins: 0,
        securityEvents: 0,
        systemStatus: 'Unknown',
      };
    }
  }
}

export function AdminLayout({
  children,
  title,
  description,
  showBackButton = false,
  backHref = '/admin',
  actions,
}: AdminLayoutProps) {
  const api = useAuthenticatedApi();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    activeUsers: 0,
    todaysLogins: 0,
    securityEvents: 0,
    systemStatus: 'Loading...',
  });

  const statsService = AdminStatsService.getInstance();

  // Fetch quick stats - auth is already verified by AdminRoute wrapper
  useEffect(() => {
    const fetchStats = async () => {
      const stats = await statsService.fetchQuickStats(api);
      setQuickStats(stats);
    };

    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [api, statsService]);

  return (
    <AdminAuthenticatedLayout>
      <div className='min-h-screen bg-gray-50 flex'>
        {/* Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          quickStats={quickStats}
        />

        {/* Main Content Area */}
        <div className='flex-1 flex flex-col min-w-0 lg:ml-80'>
          {/* Top Header */}

          {/* Main Content */}
          <main className='flex-1 overflow-auto'>
            <div className='p-2'>{children}</div>
          </main>
        </div>
      </div>
    </AdminAuthenticatedLayout>
  );
}

export default AdminLayout;

'use client';

/**
 * Unified Admin Layout Component
 * Provides consistent layout for all admin pages with sidebar navigation
 * Implements proper authentication protection and responsive design
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth.unified';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/auth';
import { AdminSidebar } from './AdminSidebar';
import { AdminAuthenticatedLayout } from '@/components/layout/AppLayout';
import {
  Shield,
  Menu
} from 'lucide-react';

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

  public async fetchQuickStats(api: { post: (url: string, data: Record<string, string>) => Promise<Record<string, number>> }): Promise<QuickStats> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 24);
      
      const summary = await api.post('/api/admin/security/summary', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      return {
        activeUsers: summary.uniqueUsers || 0,
        todaysLogins: summary.successfulLogins || 0,
        securityEvents: summary.securityEvents || 0,
        systemStatus: 'Healthy'
      };
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      return {
        activeUsers: 0,
        todaysLogins: 0,
        securityEvents: 0,
        systemStatus: 'Unknown'
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
  actions 
}: AdminLayoutProps) {
  const { loading, isAuthenticated, claims, error } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const api = useAuthenticatedApi();

  // Debug logging
  console.log('AdminLayout - Auth State:', { loading, isAuthenticated, claims: claims?.role, error });
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    activeUsers: 0,
    todaysLogins: 0,
    securityEvents: 0,
    systemStatus: 'Loading...'
  });
  


  const statsService = AdminStatsService.getInstance();

  // Authentication and authorization check
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }
      
      if (isAuthenticated && claims && claims.role !== UserRole.ADMIN) {
        router.push('/dashboard');
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel.",
          variant: "destructive"
        });
        return;
      }
    }
  }, [loading, isAuthenticated, claims, router, toast]);

  // Fetch quick stats
  useEffect(() => {
    if (!loading && isAuthenticated && claims?.role === UserRole.ADMIN) {
      const fetchStats = async () => {
        const stats = await statsService.fetchQuickStats(api);
        setQuickStats(stats);
      };
      
      fetchStats();
      // Refresh every 30 seconds
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [loading, isAuthenticated, claims, api, statsService]);





  // Unauthorized state - only show if we're done loading and user is not authorized
  if (!loading && (!isAuthenticated || (claims && claims.role !== UserRole.ADMIN))) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">You need admin privileges to access this area.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Still loading or waiting for authentication to complete
  if (loading || (isAuthenticated && !claims)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading admin panel...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthenticatedLayout>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          quickStats={quickStats}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-80">
          {/* Top Header */}
        

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-2">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminAuthenticatedLayout>
  );
}

export default AdminLayout;
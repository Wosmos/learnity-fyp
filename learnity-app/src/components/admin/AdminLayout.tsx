'use client';

/**
 * Unified Admin Layout Component
 * Provides consistent layout for all admin pages with sidebar navigation
 * Implements proper authentication protection and responsive design
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useClientAuth } from '@/hooks/useClientAuth';
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
  const { user, loading, isAuthenticated, claims } = useClientAuth();
  const router = useRouter();
  const { toast } = useToast();
  const api = useAuthenticatedApi();
  
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
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
    } else if (!loading && isAuthenticated && claims) {
      if (claims.role !== UserRole.ADMIN) {
        router.push('/dashboard');
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel.",
          variant: "destructive"
        });
      }
    }
  }, [loading, isAuthenticated, claims, router, toast]);

  // Fetch quick stats
  useEffect(() => {
    if (isAuthenticated && claims?.role === UserRole.ADMIN) {
      const fetchStats = async () => {
        const stats = await statsService.fetchQuickStats(api);
        setQuickStats(stats);
      };
      
      fetchStats();
      // Refresh every 30 seconds
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, claims, api, statsService]);



  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading admin panel...</span>
        </div>
      </div>
    );
  }

  // Unauthorized state
  if (!isAuthenticated || claims?.role !== UserRole.ADMIN) {
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
          <header className="bg-white shadow-sm border-b rounded mx-2 mt-2 border-gray-200 top-0 z-30 bg">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                {/* Left side - Title and mobile menu */}
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  
                  {showBackButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(backHref)}
                      className="hidden sm:flex"
                    >
                      ← Back
                    </Button>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-blue-600 hidden lg:block" />
                    <div>
                      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                        {title || 'Admin Panel'}
                      </h1>
                      {description && (
                        <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side - Actions */}
                {actions && (
                  <div className="flex items-center space-x-2">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          </header>

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
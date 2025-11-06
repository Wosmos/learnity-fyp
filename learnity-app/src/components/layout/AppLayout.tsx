/**
 * Main Application Layout
 * Provides unified layout with authentication, navigation, and logout functionality
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useLogout } from '@/hooks/useLogout';
import { RoleBasedNavigation } from '@/components/navigation/RoleBasedNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  GraduationCap,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Home,
  Loader2
} from 'lucide-react';
import { UserRole } from '@/types/auth';
import { cn } from '@/lib/utils';

export interface AppLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showHeader?: boolean;
  className?: string;
}

export function AppLayout({ 
  children, 
  showNavigation = true, 
  showHeader = true,
  className 
}: AppLayoutProps) {
  const { user, loading, isAuthenticated, claims } = useClientAuth();
  const { logout, isLoggingOut } = useLogout();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrator';
      case UserRole.TEACHER:
        return 'Teacher';
      case UserRole.STUDENT:
        return 'Student';
      case UserRole.PENDING_TEACHER:
        return 'Pending Teacher';
      default:
        return 'User';
    }
  };

  const getRoleBadgeColor = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.TEACHER:
        return 'bg-green-100 text-green-800';
      case UserRole.STUDENT:
        return 'bg-blue-100 text-blue-800';
      case UserRole.PENDING_TEACHER:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDashboardRoute = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.TEACHER:
        return '/dashboard/teacher';
      case UserRole.STUDENT:
        return '/dashboard/student';
      case UserRole.PENDING_TEACHER:
        return '/application/status';
      default:
        return '/dashboard';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-blue-600 rounded-lg mr-3">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Loading Learnity...
              </h3>
              <p className="text-gray-500">
                Please wait while we set up your experience
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Header */}
      {showHeader && (
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Brand */}
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Learnity</span>
                </Link>

                {/* Desktop Navigation */}
                {isAuthenticated && showNavigation && (
                  <nav className="hidden md:flex items-center space-x-1">
                    <Link href={getDashboardRoute(claims?.role || UserRole.STUDENT)}>
                      <Button variant="ghost" size="sm">
                        <Home className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                  </nav>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    {/* Notifications */}
                    <Button variant="ghost" size="sm" className="hidden sm:flex">
                      <Bell className="h-4 w-4" />
                    </Button>

                    {/* User Info */}
                    <div className="hidden sm:flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.displayName || user?.email?.split('@')[0] || 'User'}
                        </p>
                        {claims?.role && (
                          <Badge className={cn('text-xs', getRoleBadgeColor(claims.role))}>
                            {getRoleDisplayName(claims.role)}
                          </Badge>
                        )}
                      </div>
                      <div className="p-2 bg-gray-100 rounded-full">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>

                    {/* Desktop Logout */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="hidden sm:flex"
                    >
                      {isLoggingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <LogOut className="h-4 w-4 mr-2" />
                      )}
                      {isLoggingOut ? 'Signing out...' : 'Sign out'}
                    </Button>

                    {/* Mobile Menu Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="md:hidden"
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                      {isMobileMenuOpen ? (
                        <X className="h-5 w-5" />
                      ) : (
                        <Menu className="h-5 w-5" />
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm">
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button size="sm">
                        Get started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isAuthenticated && isMobileMenuOpen && (
            <div className="md:hidden border-t bg-white">
              <div className="px-4 py-4 space-y-4">
                {/* User Info */}
                <div className="flex items-center space-x-3 pb-4 border-b">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.displayName || user?.email?.split('@')[0] || 'User'}
                    </p>
                    {claims?.role && (
                      <Badge className={cn('text-xs', getRoleBadgeColor(claims.role))}>
                        {getRoleDisplayName(claims.role)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Mobile Navigation */}
                {showNavigation && (
                  <div className="space-y-2">
                    <Link 
                      href={getDashboardRoute(claims?.role || UserRole.STUDENT)}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="ghost" className="w-full justify-start">
                        <Home className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </Button>
                  </div>
                )}

                {/* Mobile Logout */}
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <LogOut className="h-4 w-4 mr-2" />
                    )}
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <div className="p-1 bg-blue-600 rounded"></div>
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-gray-600">
                © 2024 Learnity. All rights reserved.
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-700">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-gray-700">
                Terms
              </Link>
              <Link href="/support" className="hover:text-gray-700">
                Support
              </Link>
            </div>
          </div>
      </footer>
    </div>
  );
}

/**
 * Layout wrapper for authenticated pages
 */
export function AuthenticatedLayout({ children, ...props }: AppLayoutProps) {
  const { isAuthenticated, loading } = useClientAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <AppLayout {...props}>{children}</AppLayout>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AppLayout {...props}>{children}</AppLayout>;
}

/**
 * Layout wrapper for public pages (no authentication required)
 */
export function PublicLayout({ children, ...props }: AppLayoutProps) {
  return <AppLayout {...props}>{children}</AppLayout>;
}
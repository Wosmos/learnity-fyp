/**
 * Main Application Layout
 * Provides unified layout with authentication, navigation, and logout functionality
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useLogout } from '@/hooks/useLogout';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GraduationCap,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Home,
  Loader2
} from 'lucide-react';
import { UserRole } from '@/types/auth';
import { cn } from '@/lib/utils';
import { getDashboardRoute, getRoleBadgeColor, getRoleDisplayName } from './utils';
import { Footer } from '../externals';


export interface AppLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showHeader?: boolean;
  className?: string;
  hideNavigationLinks?: boolean; // New prop to hide nav links but keep user menu
}

export function AppLayout({
  children,
  showNavigation = true,
  showHeader = true,
  className,
  hideNavigationLinks = false
}: AppLayoutProps) {
  const { user, loading, isAuthenticated, claims } = useClientAuth();
  const { logout, isLoggingOut } = useLogout();
  const api = useAuthenticatedApi();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState<{
    firstName: string;
    lastName: string;
    email?: string;
    profilePicture?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const fetchProfileData = async () => {
        try {
          const data = await api.get('/api/auth/profile');
          setProfileData(data.profile);
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      };

      fetchProfileData();
    }
  }, [loading, isAuthenticated, api]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = () => {
    if (profileData) {
      return `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase();
    }
    return user?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const fullName = profileData ? `${profileData.firstName} ${profileData.lastName}` : user?.displayName || 'User';

  // Debug: Log when profileData changes
  useEffect(() => {
    if (profileData) {
      console.log('ProfileData updated:', {
        hasProfilePicture: !!profileData.profilePicture,
        profilePictureType: typeof profileData.profilePicture,
        isDataUrl: profileData.profilePicture?.startsWith('data:'),
        firstName: profileData.firstName,
        lastName: profileData.lastName
      });
    }
  }, [profileData]);



  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-slate-600 rounded-lg mr-3">
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
        <header className="bg-slate-50/85 backdrop-blur-2xl shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Brand */}
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="p-2 bg-slate-600 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Learnity</span>
                </Link>

                {/* Desktop Navigation */}
                {!hideNavigationLinks && (
                  <nav className="hidden md:flex items-center space-x-1">
                    {isAuthenticated && showNavigation && (
                      <Link href={getDashboardRoute(claims?.role || UserRole.STUDENT)}>
                        <Button variant="onyx" size="sm">
                          <Home className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                    )}
                    <Link href="/teachers">
                      <Button variant="onyx" size="sm">
                        Our Teachers
                      </Button>
                    </Link>
                    <Link href="/about">
                      <Button variant="onyx" size="sm">
                        About Us
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
                    <Button variant="onyx" size="sm" className="hidden sm:flex">
                      <Bell className="h-4 w-4" />
                    </Button>

                    {/* User Dropdown Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="onyx" className="hidden sm:flex items-center space-x-3 h-auto py-2">
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
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={profileData?.profilePicture || ''}
                              alt={fullName}
                              onError={(e) => console.error('Avatar image failed to load:', e)}
                            />
                            <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white">
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{fullName}</p>
                            <p className="text-xs leading-none text-gray-500">
                              {profileData?.email || user?.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/profile/enhance')}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(getDashboardRoute(claims?.role || UserRole.STUDENT))}>
                          <Home className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                          {isLoggingOut ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <LogOut className="mr-2 h-4 w-4" />
                          )}
                          <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Mobile Menu Button */}
                    <Button
                      variant="onyx"
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
                      <Button variant="nova" size="sm">
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
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={profileData?.profilePicture || ''}
                      alt={fullName}
                      onError={(e) => console.error('Mobile avatar image failed to load:', e)}
                    />
                    <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
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
                <div className="space-y-2">
                  {showNavigation && !hideNavigationLinks && (
                    <>
                      <Link
                        href={getDashboardRoute(claims?.role || UserRole.STUDENT)}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button variant="onyx" className="w-full justify-start">
                          <Home className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="onyx"
                        className="w-full justify-start"
                        onClick={() => {
                          router.push('/profile/enhance');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                      <Button variant="onyx" className="w-full justify-start">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                      </Button>
                    </>
                  )}
                  {!hideNavigationLinks && (
                    <>
                      <Link
                        href="/teachers"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button variant="onyx" className="w-full justify-start">
                          Our Teachers
                        </Button>
                      </Link>
                      <Link
                        href="/about"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button variant="onyx" className="w-full justify-start">
                          About Us
                        </Button>
                      </Link>
                    </>
                  )}
                </div>

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
      <Footer
      status={{
        text: 'All Systems Operational',
        online: true,
      }}
    />
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
 * Layout wrapper for admin pages (hides navigation links but keeps user menu)
 */
export function AdminAuthenticatedLayout({ children, ...props }: AppLayoutProps) {
  const { isAuthenticated, loading } = useClientAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <AppLayout {...props} hideNavigationLinks={true}>{children}</AppLayout>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AppLayout {...props} hideNavigationLinks={true}>{children}</AppLayout>;
}

/**
 * Layout wrapper for public pages (no authentication required)
 */
export function PublicLayout({ children, ...props }: AppLayoutProps) {
  return <AppLayout {...props}>
    {children}
    
  </AppLayout>;
}
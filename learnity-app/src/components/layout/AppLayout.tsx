/**
 * Main Application Layout
 * Provides unified layout with premium aesthetics and smooth transitions
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Home,
  Loader2,
  ChevronRight,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useLogout } from '@/hooks/useLogout';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRole } from '@/types/auth';
import { cn } from '@/lib/utils';
import { Footer } from '../externals';
import {
  getDashboardRoute,
  getRoleBadgeColor,
  getRoleDisplayName,
} from './utils';

export interface AppLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showHeader?: boolean;
  className?: string;
  hideNavigationLinks?: boolean;
}

export function AppLayout({
  children,
  showNavigation = true,
  showHeader = true,
  className,
  hideNavigationLinks = false,
}: AppLayoutProps) {
  const { user, loading, isAuthenticated, claims } = useClientAuth();
  const { logout, isLoggingOut } = useLogout();
  const api = useAuthenticatedApi();
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileData, setProfileData] = useState<{
    firstName: string;
    lastName: string;
    email?: string;
    profilePicture?: string | null;
  } | null>(null);

  // Handle scroll for header effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch profile data
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
    } else if (!loading && !isAuthenticated) {
      // Clear profile data when user is not authenticated
      setProfileData(null);
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
    return (
      user?.displayName
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase() || 'U'
    );
  };

  const fullName = profileData
    ? `${profileData.firstName} ${profileData.lastName}`
    : user?.displayName || 'User';

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className='text-center'
        >
          <div className='inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-xl border border-slate-100 mb-6'>
            <GraduationCap className='h-10 w-10 text-slate-800' />
          </div>
          <div className='flex flex-col items-center gap-3'>
            <Loader2 className='h-6 w-6 animate-spin text-slate-900' />
            <p className='text-sm font-medium text-slate-600 animate-pulse'>
              Initializing Learnity...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const navLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Our Teachers', href: '/teachers' },
    { label: 'Courses', href: '/courses' },
  ];

  const dashboardRoute = getDashboardRoute(claims?.role || UserRole.STUDENT);

  return (
    <div className={cn('min-h-screen flex flex-col bg-[#F8FAFC]', className)}>
      {showHeader && (
        <header
          className={cn(
            'sticky top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
            scrolled
              ? 'bg-white/80 backdrop-blur-xl border-slate-200 shadow-sm py-2'
              : 'bg-slate-50 border-transparent py-4'
          )}
        >
          <div className='w-full px-4 text-slate-900 font-medium'>
            <div className='flex justify-between items-center h-12'>
              {/* Logo */}
              <div className='flex items-center gap-8'>
                <Link
                  href='/'
                  className='group flex items-center gap-2.5 transition-transform active:scale-95'
                >
                  <div className='p-2 bg-slate-900 rounded-xl group-hover:rotate-6 transition-transform flex items-center justify-center'>
                    <img src='/logo.svg' alt='Learnity' className='h-5 w-5' />
                  </div>
                  <span className='text-xl font-bold tracking-tight text-slate-900'>
                    Learnity
                  </span>
                </Link>

                {/* Desktop Nav */}
                {!hideNavigationLinks && (
                  <nav className='hidden md:flex items-center gap-1'>
                    {isAuthenticated && user?.emailVerified && showNavigation && (
                      <Link href={dashboardRoute}>
                        <Button
                          variant='ghost'
                          size='sm'
                          className={cn(
                            'text-slate-600 hover:text-slate-900',
                            pathname === dashboardRoute &&
                            'bg-slate-100/50 text-slate-900'
                          )}
                        >
                          Dashboard
                        </Button>
                      </Link>
                    )}
                    {navLinks.map(link => (
                      <Link key={link.href} href={link.href}>
                        <Button
                          variant='ghost'
                          size='sm'
                          className={cn(
                            'text-slate-600 hover:text-slate-900',
                            pathname === link.href &&
                            'bg-slate-100/50 text-slate-900'
                          )}
                        >
                          {link.label}
                        </Button>
                      </Link>
                    ))}
                  </nav>
                )}
              </div>

              {/* User Menu / Auth */}
              <div className='flex items-center gap-3'>
                {isAuthenticated && user?.emailVerified ? (
                  <>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='hidden sm:flex rounded-full text-slate-500 hover:text-slate-900'
                    >
                      <Bell className='h-5 w-5' />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          className='h-10 pl-2 pr-1 rounded-full border border-slate-200 hover:bg-white hover:shadow-sm transition-all'
                        >
                          <span className='hidden lg:inline mr-2 text-sm font-medium text-slate-700'>
                            {user?.displayName?.split(' ')[0] || 'User'}
                          </span>
                          <Avatar className='h-8 w-8 border border-slate-100 shadow-xs'>
                            <AvatarImage
                              src={profileData?.profilePicture || ''}
                            />
                            <AvatarFallback className='bg-slate-900 text-white text-[10px]'>
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align='end'
                        className='w-64 p-2 rounded-2xl shadow-2xl border-slate-100'
                      >
                        <DropdownMenuLabel className='px-3 py-2'>
                          <div className='flex flex-col gap-0.5'>
                            <p className='text-sm font-semibold text-slate-900 leading-none'>
                              {fullName}
                            </p>
                            <p className='text-[11px] text-slate-500 truncate'>
                              {user?.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className='my-1' />
                        <DropdownMenuItem
                          onClick={() => router.push('/profile/enhance')}
                          className='rounded-lg gap-2.5 py-2 cursor-pointer'
                        >
                          <User className='h-4 w-4 text-slate-500' />
                          <span className='text-sm'>My Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(dashboardRoute)}
                          className='rounded-lg gap-2.5 py-2 cursor-pointer'
                        >
                          <LayoutDashboard className='h-4 w-4 text-slate-500' />
                          <span className='text-sm'>Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className='rounded-lg gap-2.5 py-2 cursor-pointer'>
                          <Settings className='h-4 w-4 text-slate-500' />
                          <span className='text-sm'>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className='my-1' />
                        <DropdownMenuItem
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className='rounded-lg gap-2.5 py-2 text-red-600 hover:text-red-700 focus:bg-red-50 cursor-pointer'
                        >
                          {isLoggingOut ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : (
                            <LogOut className='h-4 w-4' />
                          )}
                          <span className='text-sm'>Sign Out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant='ghost'
                      size='icon'
                      className='md:hidden rounded-full'
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                      {isMobileMenuOpen ? (
                        <X className='h-5 w-5' />
                      ) : (
                        <Menu className='h-5 w-5' />
                      )}
                    </Button>
                  </>
                ) : (
                  <div className='flex items-center gap-2'>
                    <Link href='/auth/login'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='rounded-full'
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href='/auth/register'>
                      <Button
                        size='sm'
                        className='rounded-full bg-slate-900 hover:bg-slate-800 shadow-md transition-all active:scale-95'
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl'
              >
                <div className='px-4 py-6 space-y-6'>
                  {isAuthenticated && user?.emailVerified && (
                    <div className='flex items-center gap-4 p-4 bg-slate-50 rounded-2xl'>
                      <Avatar className='h-12 w-12 border-2 border-white shadow-sm'>
                        <AvatarImage src={profileData?.profilePicture || ''} />
                        <AvatarFallback className='bg-slate-900 text-white'>
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className='font-bold text-slate-900'>{fullName}</h4>
                        <Badge
                          variant='outline'
                          className={cn(
                            'mt-1',
                            getRoleBadgeColor(claims?.role || UserRole.STUDENT)
                          )}
                        >
                          {getRoleDisplayName(claims?.role || UserRole.STUDENT)}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className='grid gap-2'>
                    {isAuthenticated && user?.emailVerified && (
                      <Link
                        href={dashboardRoute}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant='ghost'
                          className='w-full justify-between items-center px-4 py-6 rounded-xl hover:bg-slate-50 group'
                        >
                          <span className='flex items-center gap-3'>
                            <LayoutDashboard className='h-5 w-5 text-slate-500 group-hover:text-slate-900' />
                            Dashboard
                          </span>
                          <ChevronRight className='h-4 w-4 text-slate-300 group-hover:text-slate-500' />
                        </Button>
                      </Link>
                    )}
                    {navLinks.map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant='ghost'
                          className='w-full justify-between items-center px-4 py-6 rounded-xl hover:bg-slate-50 group'
                        >
                          <span className='flex items-center gap-3'>
                            <div className='w-5 h-5 bg-slate-100 rounded group-hover:bg-slate-200' />
                            {link.label}
                          </span>
                          <ChevronRight className='h-4 w-4 text-slate-300 group-hover:text-slate-500' />
                        </Button>
                      </Link>
                    ))}
                  </div>

                  {isAuthenticated && (
                    <div className='pt-4 border-t border-slate-100'>
                      <Button
                        variant='ghost'
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className='w-full justify-start gap-3 py-6 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl'
                      >
                        <LogOut className='h-5 w-5' />
                        Sign Out
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      )}

      {/* Main Content */}
      <main className='flex-1'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>

      <Footer status={{ text: 'All Systems Operational', online: true }} />
    </div>
  );
}

// Higher Order Components for protected layouts
export function AuthenticatedLayout({ children, ...props }: AppLayoutProps) {
  const { user, isAuthenticated, loading } = useClientAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (!user?.emailVerified) {
        router.push('/auth/verify-email');
      }
    }
  }, [loading, isAuthenticated, user?.emailVerified, router]);

  return (
    <AppLayout {...props}>
      {!loading && isAuthenticated && user?.emailVerified ? children : null}
    </AppLayout>
  );
}

export function AdminAuthenticatedLayout({
  children,
  ...props
}: AppLayoutProps) {
  return (
    <AuthenticatedLayout {...props} hideNavigationLinks={true}>
      {children}
    </AuthenticatedLayout>
  );
}

export function PublicLayout({ children, ...props }: AppLayoutProps) {
  return <AppLayout {...props}>{children}</AppLayout>;
}

'use client';

/**
 * Unified Dashboard Sidebar Component
 * Features:
 * - Desktop: Collapsible Side Navigation with sleek transitions
 * - Mobile: Native iOS-style Bottom Tab Bar with haptic-like animations
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  BookOpen,
  GraduationCap,
  Users,
  Award,
  User,
  Search,
  Settings,
  Menu,
  LogOut,
  Sparkles,
  Plus,
  Video,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Shield,
  BarChart3,
  UserCheck,
  Play,
  Lock,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLogout } from '@/hooks/useLogout';

// --- Types ---
export type SidebarRole = 'teacher' | 'student' | 'admin';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  description?: string;
}

export interface SidebarConfig {
  role: SidebarRole;
  brandName: string;
  brandSubtitle: string;
  brandIcon: React.ElementType;
  brandGradient: string;
  navItems: NavItem[];
  theme: 'light' | 'dark';
  upgradePromo?: {
    title: string;
    description: string;
    link: string;
  };
}

// --- Navigation Configurations ---
const teacherNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/teacher', icon: Home },
  { label: 'My Courses', href: '/dashboard/teacher/courses', icon: BookOpen },
  {
    label: 'Create Course',
    href: '/dashboard/teacher/courses/new',
    icon: Plus,
  },
  { label: 'Students', href: '/dashboard/teacher/students', icon: Users },
  { label: 'Live Sessions', href: '/dashboard/teacher/sessions', icon: Video },
  { label: 'Profile', href: '/dashboard/teacher/profile/enhance', icon: User },
];

const studentNavItems: NavItem[] = [
  { label: 'Home', href: '/dashboard/student', icon: Home },
  { label: 'Courses', href: '/dashboard/student/courses', icon: BookOpen },
  { label: 'Browse', href: '/dashboard/student/public-cources', icon: Search },
  {
    label: 'Progress',
    href: '/dashboard/student/progress',
    icon: GraduationCap,
  },
  { label: 'Awards', href: '/dashboard/student/achievements', icon: Award },
  { label: 'Profile', href: '/dashboard/student/profile/enhance', icon: User },
];

const adminNavItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard/admin', icon: Home },
  { label: 'Security Hub', href: '/admin', icon: Shield },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Users', href: '/admin/users', icon: Users },
  {
    label: 'Applications',
    href: '/admin/teachers',
    icon: UserCheck,
  },
  { label: 'Demo Tools', href: '/admin/demo', icon: Play },
  { label: 'Auth Debug', href: '/admin/auth-test', icon: Lock },

];

export const teacherSidebarConfig: SidebarConfig = {
  role: 'teacher',
  brandName: 'Learnity',
  brandSubtitle: 'Teacher Portal',
  brandIcon: BookOpen,
  brandGradient: 'from-blue-600 to-indigo-600',
  navItems: teacherNavItems,
  theme: 'dark',
  upgradePromo: {
    title: 'Pro Teacher',
    description: 'Access advanced analytics & priority support.',
    link: '#',
  },
};

export const studentSidebarConfig: SidebarConfig = {
  role: 'student',
  brandName: 'Learnity',
  brandSubtitle: 'Student Dashboard',
  brandIcon: GraduationCap,
  brandGradient: 'from-emerald-600 to-teal-600',
  navItems: studentNavItems,
  theme: 'dark',
  upgradePromo: {
    title: 'Premium Student',
    description: 'Get unlimited access to all courses & features.',
    link: '#',
  },
};

export const adminSidebarConfig: SidebarConfig = {
  role: 'admin',
  brandName: 'Learnity',
  brandSubtitle: 'Admin Panel',
  brandIcon: Layers,
  brandGradient: 'from-purple-600 to-pink-600',
  navItems: adminNavItems,
  theme: 'dark',
};

// --- Helper: Active Route Checker ---
const useActiveRoute = (
  pathname: string,
  role: string,
  navItems: NavItem[]
) => {
  return (href: string) => {
    if (pathname === href) return true;
    const basePath = `/dashboard/${role}`;
    // Exact match for base dashboard route
    if (href === basePath) return pathname === href;

    // Prefix match for sub-routes
    if (pathname.startsWith(href)) {
      const remainder = pathname.slice(href.length);
      // Ensure we match full path segments
      if (remainder !== '' && !remainder.startsWith('/')) return false;

      // Ensure no *other* nav item is a better match (e.g. /courses vs /courses/new)
      const hasBetterMatch = navItems.some(
        item =>
          item.href !== href &&
          item.href.length > href.length &&
          pathname.startsWith(item.href)
      );
      return !hasBetterMatch;
    }
    return false;
  };
};

// --- Sub-Component: Desktop Sidebar Content ---
const DesktopSidebarContent = ({
  config,
  isCollapsed,
  pathname,
  onLogout,
}: {
  config: SidebarConfig;
  isCollapsed: boolean;
  pathname: string;
  onLogout: () => Promise<void>;
}) => {
  const isActive = useActiveRoute(pathname, config.role, config.navItems);
  const isDark = config.theme === 'dark';
  const BrandIcon = config.brandIcon;

  return (
    <div
      className={cn(
        'flex flex-col h-full transition-colors duration-300',
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'h-16 flex items-center flex-shrink-0 border-b transition-all duration-300',
          isDark ? 'border-slate-800/60' : 'border-slate-100',
          isCollapsed ? 'justify-center px-0' : 'px-6'
        )}
      >
        <div className='flex items-center gap-3 overflow-hidden'>
          <div
            className={cn(
              'p-2 rounded-xl flex-shrink-0 transition-transform duration-300 flex items-center justify-center',
              `bg-gradient-to-br ${config.brandGradient}`,
              !isCollapsed && 'shadow-lg shadow-blue-900/20'
            )}
          >
            <img src='/logo.svg' alt='Learnity' className='h-5 w-5' />
          </div>
          <div
            className={cn(
              'flex flex-col transition-opacity duration-300',
              isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'
            )}
          >
            <span className='font-bold text-sm tracking-tight'>
              {config.brandName}
            </span>
            <span
              className={cn(
                'text-[10px] uppercase font-semibold tracking-wider',
                isDark ? 'text-slate-500' : 'text-slate-400'
              )}
            >
              {config.brandSubtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <ScrollArea className='flex-1 py-6'>
        <nav className={cn('space-y-1.5', isCollapsed ? 'px-2' : 'px-4')}>
          {config.navItems.map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className='block group'>
                <div
                  className={cn(
                    'relative flex items-center h-10 rounded-lg transition-all duration-200 overflow-hidden',
                    isCollapsed ? 'justify-center px-0' : 'px-3',
                    active
                      ? isDark
                        ? 'bg-blue-600/10 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : isDark
                        ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  {/* Active Indicator Bar (Left) */}
                  {active && (
                    <div className='absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-current' />
                  )}

                  <item.icon
                    className={cn(
                      'h-[18px] w-[18px] flex-shrink-0 transition-colors',
                      !isCollapsed && 'mr-3'
                    )}
                  />

                  {!isCollapsed && (
                    <span className='text-sm font-medium tracking-tight whitespace-nowrap'>
                      {item.label}
                    </span>
                  )}

                  {!isCollapsed && item.badge && (
                    <Badge
                      className={cn(
                        'ml-auto h-5 px-1.5 rounded-full text-[10px] font-bold border-0',
                        isDark
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div
        className={cn(
          'p-4 border-t mt-auto space-y-2 flex-shrink-0',
          isDark
            ? 'border-slate-800/60 bg-slate-900/30'
            : 'border-slate-100 bg-slate-50/50'
        )}
      >
        {!isCollapsed && config.upgradePromo && (
          <div
            className={cn(
              'mb-4 p-4 rounded-xl border relative overflow-hidden group transition-all hover:scale-[1.02]',
              isDark
                ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50'
                : 'bg-white border-slate-200 shadow-sm'
            )}
          >
            <div className='absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity'>
              <Sparkles className='w-10 h-10' />
            </div>
            <h4 className='text-xs font-bold mb-1'>
              {config.upgradePromo.title}
            </h4>
            <p className='text-[10px] text-slate-500 mb-2 leading-relaxed'>
              {config.upgradePromo.description}
            </p>
            <Link
              href={config.upgradePromo.link}
              className='text-[10px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1'
            >
              Upgrade <ChevronRight className='w-3 h-3' />
            </Link>
          </div>
        )}

        <Link href={`/${config.role}/settings`} className='block'>
          <Button
            variant='ghost'
            className={cn(
              'w-full justify-start h-9',
              isCollapsed ? 'px-0 justify-center' : 'px-2',
              isDark
                ? 'hover:bg-slate-800 text-slate-400'
                : 'hover:bg-slate-200/50 text-slate-600'
            )}
          >
            <Settings className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
            {!isCollapsed && 'Settings'}
          </Button>
        </Link>

        <Button
          variant='ghost'
          onClick={onLogout}
          className={cn(
            'w-full justify-start h-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30',
            isCollapsed ? 'px-0 justify-center' : 'px-2'
          )}
        >
          <LogOut className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
          {!isCollapsed && 'Log out'}
        </Button>
      </div>
    </div>
  );
};

// --- Sub-Component: Mobile Bottom Nav ---
const MobileBottomNav = ({
  config,
  pathname,
  onLogout,
}: {
  config: SidebarConfig;
  pathname: string;
  onLogout: () => Promise<void>;
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const isActive = useActiveRoute(pathname, config.role, config.navItems);

  // Adaptive Grid: Show 4 items on small, 5 on larger mobile
  const mainItems = config.navItems.slice(0, 4);
  const moreItems = config.navItems.slice(4);

  return (
    <>
      {/* ONYX FLOATING DOCK */}
      <div className='md:hidden fixed bottom-6 left-0 right-0 px-4 z-[50] flex justify-center pointer-events-none'>
        <motion.nav
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          className='pointer-events-auto flex items-center bg-slate-950/90 backdrop-blur-3xl rounded-[32px] p-1.5 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
        >
          {mainItems.map((item: NavItem, index: number) => {
            const active = isActive(item.href);
            // Center Item (Home) gets the high-contrast Squircle treatment
            if (index === 0)
              return (
                <Link key={item.href} href={item.href} className='mx-1'>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500',
                      active
                        ? 'bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                        : 'bg-slate-900 text-slate-500'
                    )}
                  >
                    <item.icon className='w-5 h-5 stroke-[2.5px]' />
                  </motion.div>
                </Link>
              );

            return (
              <Link
                key={item.href}
                href={item.href}
                className='relative w-12 h-12 flex items-center justify-center'
              >
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  className={cn(
                    'relative z-10',
                    active ? 'text-white' : 'text-slate-500'
                  )}
                >
                  <item.icon className='w-5 h-5 stroke-[2px]' />
                </motion.div>
                {active && (
                  <motion.div
                    layoutId='onyxPill'
                    className='absolute inset-1 bg-white/10 rounded-2xl'
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}

          <div className='w-[1px] h-6 bg-white/10 mx-1' />

          {/* MENU TRIGGER */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMoreOpen(true)}
            className='w-12 h-12 flex items-center justify-center text-slate-400'
          >
            <Menu className='w-5 h-5' />
          </motion.button>
        </motion.nav>
      </div>

      {/* ONYX DRAW OVERLAY (Custom Implementation) */}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div className='fixed inset-0 z-[100] md:hidden'>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className='absolute inset-0 bg-slate-950/80 backdrop-blur-xl'
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag='y'
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setIsMoreOpen(false);
              }}
              className='absolute bottom-0 left-0 right-0 bg-slate-950 rounded-t-[48px] border-t border-white/10 shadow-[0_-20px_80px_rgba(0,0,0,0.8)] flex flex-col max-h-[94vh] overflow-hidden'
            >
              <div className='mx-auto mt-4 mb-6 w-14 h-1.5 bg-white/10 rounded-full flex-shrink-0 cursor-grab active:cursor-grabbing' />

              <div className='px-8 pb-16 overflow-y-auto custom-scrollbar'>
                <header className='mb-10 pt-2'>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <span className='text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-2 block'>
                      Navigation
                    </span>
                    <h2 className='text-4xl font-black italic tracking-tighter uppercase leading-none text-white'>
                      Explore <span className='text-indigo-500'>More</span>
                    </h2>
                  </motion.div>
                </header>

                <div className='space-y-3'>
                  {moreItems.map((item: NavItem, index: number) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMoreOpen(false)}
                        className='flex items-center gap-5 p-4 bg-white/[0.03] border border-white/5 rounded-[24px] hover:bg-white/[0.06] active:scale-[0.97] transition-all group'
                      >
                        <div className='w-12 h-12 rounded-[18px] bg-slate-900 border border-white/10 flex items-center justify-center text-indigo-400'>
                          <item.icon className='w-6 h-6 stroke-[2.4px]' />
                        </div>
                        <div className='flex flex-col'>
                          <span className='text-[15px] font-black uppercase tracking-tight text-white italic group-hover:text-indigo-400 transition-colors'>
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight className='ml-auto w-5 h-5 text-slate-800 group-hover:text-slate-500 transition-colors' />
                      </Link>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + moreItems.length * 0.05 }}
                  >
                    <Link
                      href={`/dashboard/${config.role}/settings`}
                      onClick={() => setIsMoreOpen(false)}
                      className='flex items-center gap-5 p-4 bg-white/[0.015] border border-white/5 rounded-[24px] group'
                    >
                      <div className='w-12 h-12 rounded-[18px] bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500'>
                        <Settings className='w-6 h-6 stroke-[1.5px]' />
                      </div>
                      <div className='flex flex-col text-left'>
                        <span className='text-[15px] font-black uppercase tracking-tight text-slate-400 italic'>
                          Settings
                        </span>
                      </div>
                      <ChevronRight className='ml-auto w-5 h-5 text-slate-800' />
                    </Link>
                  </motion.div>
                </div>

                <motion.div
                  className='mt-12'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant='destructive'
                    onClick={() => {
                      setIsMoreOpen(false);
                      onLogout();
                    }}
                    className='w-full h-16 rounded-[24px] bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-black uppercase italic tracking-[0.3em] text-[11px] transition-all'
                  >
                    Terminate Session
                  </Button>

                  <button
                    onClick={() => setIsMoreOpen(false)}
                    className='w-full text-center text-[9px] font-black uppercase tracking-[0.8em] text-slate-700 hover:text-slate-500 transition-colors mt-8 mb-6'
                  >
                    Dismiss Modal
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Main Exported Component ---
export interface DashboardSidebarProps {
  config: SidebarConfig;
  className?: string;
  defaultCollapsed?: boolean;
}

export function DashboardSidebar({
  config,
  className,
  defaultCollapsed = false,
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useLogout();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const isDark = config.theme === 'dark';

  return (
    <>
      <MobileBottomNav
        config={config}
        pathname={pathname}
        onLogout={handleLogout}
      />

      <aside
        className={cn(
          'hidden md:block fixed top-0 left-0 h-screen z-30 transition-all duration-300 border-r',
          collapsed ? 'w-[72px]' : 'w-64',
          isDark
            ? 'border-slate-800 bg-slate-950'
            : 'border-slate-200 bg-white',
          className
        )}
      >
        <DesktopSidebarContent
          config={config}
          isCollapsed={collapsed}
          pathname={pathname}
          onLogout={handleLogout}
        />

        {/* Floating Toggle Button */}
        <div className='absolute -right-3 top-20 z-50'>
          <Button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'h-6 w-6 rounded-full p-0 border shadow-md transition-transform hover:scale-110',
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            )}
          >
            {collapsed ? (
              <ChevronRight className='h-3 w-3' />
            ) : (
              <ChevronLeft className='h-3 w-3' />
            )}
          </Button>
        </div>
      </aside>

      {/* Layout Spacer to push content */}
      <div
        className={cn(
          'hidden md:block flex-shrink-0 transition-[width] duration-300',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      />

      {/* Mobile Bottom Nav Spacer */}
      <div className='md:hidden h-[60px] flex-shrink-0' />
    </>
  );
}

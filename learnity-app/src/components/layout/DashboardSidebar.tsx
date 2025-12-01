'use client';

/**
 * Unified Dashboard Sidebar Component
 * Supports both Teacher and Student roles with role-based navigation
 * Following React best practices for reusable components
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  BookOpen,
  GraduationCap,
  Users,
  Award,
  User,
  Search,
  Clock,
  Star,
  Settings,
  Menu,
  LogOut,
  Sparkles,
  Plus,
  Video,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AsyncButton } from '@/components/ui/async-button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLogout } from '@/hooks/useLogout';
import { Squircle } from "@squircle-js/react";

// --- Types ---
export type SidebarRole = 'teacher' | 'student';

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
  showStats?: boolean;
  stats?: {
    studyTime?: string;
    xpPoints?: number;
    streak?: number;
  };
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
  { label: 'Create Course', href: '/dashboard/teacher/courses/new', icon: Plus },
  { label: 'Students', href: '/dashboard/teacher/students', icon: Users },
  { label: 'Live Sessions', href: '/dashboard/teacher/sessions', icon: Video },
  { label: 'Profile', href: '/dashboard/teacher/profile/enhance', icon: User },
];

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/student', icon: Home },
  { label: 'Browse Courses', href: '/courses', icon: Search },
  { label: 'My Courses', href: '/dashboard/student/courses', icon: BookOpen },
  { label: 'My Progress', href: '/dashboard/student/progress', icon: GraduationCap },
  { label: 'Achievements', href: '/dashboard/student/achievements', icon: Award },
  { label: 'Profile', href: '/profile/enhance', icon: User },
];

// --- Default Configurations ---
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
    link: '#'
  }
};

export const studentSidebarConfig: SidebarConfig = {
  role: 'student',
  brandName: 'Learnity',
  brandSubtitle: 'Student',
  brandIcon: GraduationCap,
  brandGradient: 'from-indigo-500 to-purple-600',
  navItems: studentNavItems,
  theme: 'light',
  showStats: true,
  stats: {
    studyTime: '24h',
    xpPoints: 1250,
    streak: 7
  }
};

// --- Sub-Component: Navigation Content ---
interface NavContentProps {
  config: SidebarConfig;
  isCollapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
  onLogout: () => Promise<void>;
}

const NavContent = ({ 
  config, 
  isCollapsed, 
  pathname,
  onNavigate,
  onLogout
}: NavContentProps) => {
  const isActive = (href: string) => {
    const basePath = `/dashboard/${config.role}`;
    if (href === basePath) return pathname === href;
    return pathname.startsWith(href);
  };

  const isDark = config.theme === 'dark';
  const BrandIcon = config.brandIcon;

  return (
    <div className={cn(
      "flex flex-col h-full",
      isDark ? "bg-slate-950 text-slate-100" : "bg-white text-gray-900"
    )}>
      
      {/* Header Logo Area */}
      <div className={cn(
        "flex items-center h-16 border-b flex-shrink-0",
        isDark ? "border-slate-800/60" : "border-gray-100",
        isCollapsed ? "justify-center" : "px-6"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl shadow-lg",
            `bg-gradient-to-tr ${config.brandGradient}`,
            isDark && "shadow-blue-900/20"
          )}>
            <BrandIcon className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className={cn(
                "text-sm font-bold leading-none tracking-wide",
                isDark ? "text-white" : "text-gray-900"
              )}>
                {config.brandName}
              </h2>
              <span className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                isDark ? "text-slate-400" : "text-gray-500"
              )}>
                {config.brandSubtitle}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Line (Dark theme only) */}
      {isDark && (
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
      )}

      {/* Student Stats Panel */}
      {!isCollapsed && config.showStats && config.stats && (
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-4 border border-indigo-100/50 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">Daily Overview</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm group">
                <span className="text-gray-600 flex items-center gap-2 group-hover:text-gray-900 transition-colors">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs">Study Time</span>
                </span>
                <span className="font-bold text-gray-800 text-xs bg-white px-2 py-0.5 rounded-full shadow-sm">
                  {config.stats.studyTime}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm group">
                <span className="text-gray-600 flex items-center gap-2 group-hover:text-gray-900 transition-colors">
                  <Star className="h-3.5 w-3.5" />
                  <span className="text-xs">XP Points</span>
                </span>
                <span className="font-bold text-gray-800 text-xs bg-white px-2 py-0.5 rounded-full shadow-sm">
                  {config.stats.xpPoints?.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm group">
                <span className="text-gray-600 flex items-center gap-2 group-hover:text-gray-900 transition-colors">
                  <Award className="h-3.5 w-3.5" />
                  <span className="text-xs">Streak</span>
                </span>
                <span className="font-bold text-orange-600 text-xs bg-white px-2 py-0.5 rounded-full shadow-sm border border-orange-100">
                  {config.stats.streak} days 🔥
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Nav Links */}
      <ScrollArea className="flex-1 py-4">
        <nav className={cn("space-y-1", isCollapsed ? "px-2" : "px-3")}>
          {config.navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onNavigate}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-10 mb-2 transition-all duration-300 relative group overflow-hidden",
                    isCollapsed ? "px-0 justify-center" : "px-4",
                    active 
                      ? isDark
                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/20 hover:bg-blue-600 hover:text-white"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
                      : isDark
                        ? "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className={cn(
                    "h-[18px] w-[18px] transition-colors",
                    active 
                      ? isDark ? "text-white" : "text-indigo-600"
                      : isDark ? "text-slate-400 group-hover:text-white" : "text-gray-500",
                    !isCollapsed && "mr-3"
                  )} />
                  
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium tracking-tight">{item.label}</span>
                      {item.badge && (
                        <Badge className={cn(
                          "ml-auto border-0 px-2 py-0.5 h-5 flex items-center justify-center rounded-full text-xs font-semibold",
                          isDark 
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-indigo-100 text-indigo-700"
                        )}>
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                  
                  {/* Active Indicator Bar (Left Side) */}
                  {active && isCollapsed && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-white" />
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer Area */}
      <div className={cn(
        "p-4 border-t space-y-2 mt-auto",
        isDark ? "border-slate-800/60 bg-slate-950/50" : "border-gray-100",
        isCollapsed && "flex flex-col items-center p-2"
      )}>
        
        {/* Upgrade Promo Box (Dark theme only, hidden if collapsed) */}
        {!isCollapsed && config.upgradePromo && isDark && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h4 className="text-xs font-semibold text-white mb-1 relative z-10">
              {config.upgradePromo.title}
            </h4>
            <p className="text-[10px] text-slate-400 mb-2 relative z-10">
              {config.upgradePromo.description}
            </p>
            <Link href={config.upgradePromo.link} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 relative z-10">
              Upgrade Now &rarr;
            </Link>
          </div>
        )}

        <Link href={`/dashboard/${config.role}/settings`} onClick={onNavigate}>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full h-10 justify-start transition-colors",
              isCollapsed ? "px-0 justify-center" : "px-4",
              isDark 
                ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Settings className={cn(
              "h-[18px] w-[18px]",
              isDark ? "text-slate-400" : "text-gray-500",
              !isCollapsed && "mr-3"
            )} />
            {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
          </Button>
        </Link>
        
        <AsyncButton 
          variant="ghost" 
          onClick={onLogout}
          loadingText={isCollapsed ? undefined : "Logging out..."}
          className={cn(
            "w-full h-10 justify-start",
            isCollapsed ? "px-0 justify-center" : "px-4",
            isDark
              ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
              : "text-red-600 hover:text-red-700 hover:bg-red-50"
          )}
        >
          <LogOut className={cn("h-[18px] w-[18px]", !isCollapsed && "mr-3")} />
          {!isCollapsed && <span className="text-sm font-medium">Log out</span>}
        </AsyncButton>
      </div>
    </div>
  );
};

// --- Main Component ---
export interface DashboardSidebarProps {
  config: SidebarConfig;
  className?: string;
  defaultCollapsed?: boolean;
}

export function DashboardSidebar({ 
  config, 
  className, 
  defaultCollapsed = false 
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
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
      {/* MOBILE TRIGGER */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button 
              variant={isDark ? "secondary" : "outline"} 
              size="icon" 
              className={cn(
                "shadow-lg",
                isDark 
                  ? "bg-slate-900 border border-slate-800 text-white hover:bg-slate-800"
                  : "bg-white border-gray-200"
              )}
            >
              <Menu className={cn("h-5 w-5", isDark ? "text-white" : "text-gray-700")} />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className={cn(
              "p-0 w-72",
              isDark ? "border-r-slate-800 bg-slate-950 text-white" : "bg-white"
            )}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <NavContent 
              config={config}
              isCollapsed={false} 
              pathname={pathname} 
              onNavigate={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen fixed top-0 left-0 border-r shadow-xl z-30 transition-all duration-300 ease-out",
          isDark 
            ? "bg-slate-950 border-slate-800" 
            : "bg-white border-gray-200 shadow-sm",
          collapsed ? "w-[80px]" : "w-72",
          className
        )}
      >
        <NavContent 
          config={config}
          isCollapsed={collapsed} 
          pathname={pathname}
          onLogout={handleLogout}
        />

        {/* Floating Collapse Toggle */}
        {isDark ? (
          <Squircle
            cornerRadius={10}
            cornerSmoothing={3}
            className="absolute -right-3 bottom-64 rounded-full p-0 bg-blue-600 hover:bg-blue-500 border-2 border-blue-600 shadow-md flex items-center justify-center text-white transition-all hover:scale-110"
          >
            <Button 
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 hover:cursor-pointer"
            >
              {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>
          </Squircle>
        ) : (
          <div className="absolute -right-3 top-20">
            <Button 
              variant="secondary" 
              size="icon"
              className="h-6 w-6 rounded-full shadow border border-gray-200 bg-white hover:bg-gray-100 text-gray-500"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <div className="text-xs">»</div> : <div className="text-xs">«</div>}
            </Button>
          </div>
        )}
      </aside>

      {/* LAYOUT SPACER */}
      <div 
        className={cn(
          "hidden md:block transition-all duration-300 ease-in-out shrink-0", 
          collapsed ? "w-[80px]" : "w-72"
        )} 
      />
    </>
  );
}

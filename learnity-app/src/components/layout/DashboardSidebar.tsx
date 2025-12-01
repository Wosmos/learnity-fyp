'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { cn } from '@/lib/utils';
import {
  X,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  User
} from 'lucide-react';
import { NavigationItem } from '@/components/navigation/RoleBasedNavigation';
import { useLogout } from '@/hooks/useLogout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useClientAuth } from '@/hooks/useClientAuth';

interface DashboardSidebarProps {
  items: NavigationItem[];
  isOpen: boolean;
  onToggle: () => void;
  roleLabel?: string;
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export function DashboardSidebar({ 
  items, 
  isOpen, 
  onToggle,
  roleLabel = 'Dashboard',
  isCollapsed,
  onCollapse
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { logout } = useLogout();
  const { user } = useClientAuth();

  const isActiveRoute = (href: string) => {
    if (href === pathname) return true;
    if (href !== '/admin' && href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  const toggleCollapse = () => {
    onCollapse(!isCollapsed);
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-72';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out flex flex-col shadow-xl",
          sidebarWidth,
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className={cn(
          "h-16 flex items-center border-b border-gray-100 dark:border-gray-800 px-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-blue-600 rounded-xl shrink-0">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg text-gray-900 dark:text-white leading-none">Learnity</span>
                <span className="text-xs text-gray-500 font-medium mt-1">{roleLabel}</span>
              </div>
            )}
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={onToggle}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {items.map((item, index) => {
              const isActive = isActiveRoute(item.href);
              const Icon = item.icon as React.ElementType;

              return (
                <Link 
                  key={index} 
                  href={item.href}
                  onClick={() => window.innerWidth < 1024 && onToggle()}
                >
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    isActive 
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                  )}>
                    {/* Active Indicator Strip */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                    )}

                    {/* Icon */}
                    <div className={cn(
                      "shrink-0",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                    )}>
                      {item.icon}
                    </div>

                    {/* Label */}
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile / Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <Avatar className="h-9 w-9 border border-white dark:border-gray-700 shadow-sm">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-xs">
                  {user?.displayName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
             <div className="flex justify-center">
                <Button variant="ghost" size="icon" onClick={() => logout()}>
                  <LogOut className="h-5 w-5 text-gray-400 hover:text-red-500" />
                </Button>
             </div>
          )}
        </div>
        
        {/* Collapse Toggle (Desktop only) */}
        <div className="hidden lg:flex justify-end p-2">
           <Button 
             variant="ghost" 
             size="sm" 
             className="w-full h-6 text-gray-400 hover:text-gray-600"
             onClick={toggleCollapse}
           >
             {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
           </Button>
        </div>
      </aside>
    </>
  );
}

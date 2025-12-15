'use client';

/**
 * Admin Sidebar Component
 * Full-screen height sidebar with logo, clean navigation, and proper scrolling
 * Modern design optimized for admin interface
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  Shield,
  BarChart3,
  Users,
  Settings,
  Play,
  TestTube,
  Search,
  X,
  Home,
  UserCheck,
  TrendingUp,
  GraduationCap
} from 'lucide-react';

interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  category: 'main' | 'security' | 'management' | 'tools';
}

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  quickStats?: {
    activeUsers: number;
    todaysLogins: number;
    securityEvents: number;
    systemStatus: string;
  };
}

export class AdminNavigationService {
  private static instance: AdminNavigationService;

  public static getInstance(): AdminNavigationService {
    if (!AdminNavigationService.instance) {
      AdminNavigationService.instance = new AdminNavigationService();
    }
    return AdminNavigationService.instance;
  }

  public getNavigationItems(): AdminNavItem[] {
    return [
      // Main Dashboard
      {
        id: 'dashboard',
        label: 'Admin Dashboard',
        href: '/dashboard/admin',
        icon: Home,
        category: 'main'
      },

      // Security Section
      {
        id: 'security-dashboard',
        label: 'Security Dashboard',
        href: '/admin',
        icon: Shield,
        category: 'security'
      },
      {
        id: 'user-management',
        label: 'User Management',
        href: '/admin/users',
        icon: Users,
        category: 'management'
      },
      {
        id: 'teacher-applications',
        label: 'Teacher Applications',
        href: '/admin/teachers',
        icon: UserCheck,
        category: 'management'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        category: 'management'
      },

      // Tools Section
      {
        id: 'demo',
        label: 'Demo Tools',
        href: '/admin/demo',
        icon: Play,
        category: 'tools'
      },
      {
        id: 'test',
        label: 'Auth Test',
        href: '/admin/test',
        icon: TestTube,
        category: 'tools'
      },
      {
        id: 'auth-debug',
        label: 'Auth Debug',
        href: '/admin/auth-test',
        icon: TestTube,
        category: 'tools'
      },
      {
        id: 'admin-setup',
        label: 'Admin Setup',
        href: '/admin/setup',
        icon: Shield,
        category: 'tools'
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        category: 'tools'
      }
    ];
  }

  public filterItems(items: AdminNavItem[], searchQuery: string): AdminNavItem[] {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.label.toLowerCase().includes(query)
    );
  }

  public groupItemsByCategory(items: AdminNavItem[]): Record<string, AdminNavItem[]> {
    return items.reduce((groups, item) => {
      const category = item.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {} as Record<string, AdminNavItem[]>);
  }
}

export function AdminSidebar({ isOpen, onToggle, quickStats }: AdminSidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const navigationService = AdminNavigationService.getInstance();

  const allItems = navigationService.getNavigationItems();
  const filteredItems = useMemo(() =>
    navigationService.filterItems(allItems, searchQuery),
    [allItems, searchQuery, navigationService]
  );



  const isActiveRoute = (href: string): boolean => {
    if (href === '/admin' && pathname === '/admin') return true;
    if (href !== '/admin' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:shrink-0 shadow-xl border-r border-gray-200
        flex flex-col h-screen
      `}>
        {/* Logo Header */}
        <div className="flex items-center justify-between p-6  ">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-600 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Learnity</span>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">Admin</Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search admin features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <Link key={item.id} href={item.href} onClick={() => onToggle()}>
                  <div className={`
                    group flex items-center space-x-3 px-3 py-3 text-sm rounded-lg
                    transition-all duration-200 cursor-pointer
                    ${isActive
                      ? 'bg-slate-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}>
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                      }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Quick Stats - Fixed at bottom */}
        {quickStats && (
          <div className="py-4 px-4 border-t border-gray-200 bg-gray-50">
            <Card className="bg-linear-to-br from-blue-50/60 to-indigo-50/60 border border-blue-200 rounded-lg">
              <CardHeader className="">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-gray-700 uppercase tracking-wide">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-x-4 ">
                  {/* Active Users */}
                  <div className="text-center">
                    <div className="text-[10px] text-gray-500 uppercase tracking-tight">Active</div>
                    <div className="text-sm font-bold text-gray-900 mt-0.5">
                      {quickStats.activeUsers.toLocaleString()}
                    </div>
                  </div>

                  {/* Logins */}
                  <div className="text-center">
                    <div className="text-[10px] text-gray-500 uppercase tracking-tight">Logins</div>
                    <div className="text-sm font-bold text-gray-900 mt-0.5">
                      {quickStats.todaysLogins.toLocaleString()}
                    </div>
                  </div>

                  {/* Security Events */}
                  <div className="text-center">
                    <div className="text-[10px] text-gray-500 uppercase tracking-tight">Security</div>
                    <div
                      className={`text-sm font-bold mt-0.5 ${quickStats.securityEvents > 10 ? 'text-orange-600' : 'text-green-600'
                        }`}
                    >
                      {quickStats.securityEvents.toLocaleString()}
                    </div>
                  </div>

                  {/* System */}
                  <div className="text-center">
                    <div className="text-[10px] text-gray-500 uppercase tracking-tight">System</div>
                    <div
                      className={`text-sm font-bold mt-0.5 ${quickStats.systemStatus === 'Healthy' ? 'text-green-600' : 'text-gray-600'
                        }`}
                    >
                      {quickStats.systemStatus}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </aside>
    </>
  );
}

export default AdminSidebar;
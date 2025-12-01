'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useLogout } from '@/hooks/useLogout';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  onMenuToggle: () => void;
  className?: string;
}

export function DashboardHeader({ onMenuToggle, className }: DashboardHeaderProps) {
  const { user } = useClientAuth();
  const { logout } = useLogout();

  return (
    <header className={cn(
      "h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sticky top-0 z-40 transition-all duration-300",
      className
    )}>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuToggle}>
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Search (Optional) */}
        <div className="hidden md:flex items-center relative max-w-md w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search..." 
            className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-4 rounded-full hover:bg-gray-100">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {user?.displayName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.displayName || 'User'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => logout()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

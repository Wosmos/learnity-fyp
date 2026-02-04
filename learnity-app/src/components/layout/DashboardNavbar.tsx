'use client';

/**
 * Dashboard Navbar Component
 * Enhanced UI/UX with micro-animations, glassmorphism, and real user data.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Clock, Star, Search, User, Menu, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';

// --- Types ---

export type NavbarRole = 'teacher' | 'student';

export interface NavbarStats {
  studyTime?: string;
  xpPoints?: number;
  streak?: number;
}

export interface NavbarConfig {
  role: NavbarRole;
  showStats?: boolean;
  stats?: NavbarStats;
  showSearch?: boolean;
}

export interface DashboardNavbarProps {
  config: NavbarConfig;
  className?: string;
}

// --- Internal Components (Custom Assets) ---

/**
 * Custom Animated Flame Component for Streak
 */
const FlameIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <defs>
      <linearGradient
        id='flameGradient'
        x1='12'
        y1='2'
        x2='12'
        y2='22'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#f59e0b' />
        <stop offset='1' stopColor='#ef4444' />
      </linearGradient>
      <style>
        {`
          @keyframes flameWiggle {
            0%, 100% { transform: scale(1) rotate(-3deg); }
            50% { transform: scale(1.1) rotate(3deg); }
          }
          .animate-flame {
            animation: flameWiggle 2s ease-in-out infinite;
            transform-origin: center bottom;
          }
        `}
      </style>
    </defs>
    <path
      d='M12 22C10.5 22 9 21.5 7.5 20.5C6 19.5 5 18 5 16C5 13.5 7 11 9 8C10 6.5 11 5 12 2C13 5 14 6.5 15 8C17 11 19 13.5 19 16C19 18 18 19.5 16.5 20.5C15 21.5 13.5 22 12 22Z'
      fill='url(#flameGradient)'
      className='animate-flame'
    />
    <path
      d='M12 18C13.1046 18 14 17.1046 14 16C14 14.8954 13.1046 13 12 13C10.8954 13 10 14.8954 10 16C10 17.1046 10.8954 18 12 18Z'
      fill='#fff'
      opacity='0.6'
      className='animate-flame'
    />
  </svg>
);

// --- Main Component ---

export function DashboardNavbar({ config, className }: DashboardNavbarProps) {
  const { role, showStats, stats, showSearch = true } = config;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading: authLoading } = useClientAuth();
  const api = useAuthenticatedApi();

  const [profileData, setProfileData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string | null;
  } | null>(null);

  // Fetch real user profile data
  useEffect(() => {
    if (!authLoading && user) {
      const fetchProfile = async () => {
        try {
          const response = await api.get('/api/auth/profile');
          if (response?.data) {
            setProfileData({
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              email: response.data.email,
              profilePicture: response.data.profilePicture,
            });
          }
        } catch (error) {
          console.error('Failed to fetch profile for navbar:', error);
          // Fallback to Firebase user data
          if (user) {
            const names = user.displayName?.split(' ') || ['User'];
            setProfileData({
              firstName: names[0] || 'User',
              lastName: names.slice(1).join(' ') || '',
              email: user.email || '',
              profilePicture: user.photoURL,
            });
          }
        }
      };
      fetchProfile();
    }
  }, [authLoading, user, api]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const fullName = profileData
    ? `${profileData.firstName} ${profileData.lastName}`.trim()
    : user?.displayName || 'User';

  return (
    <header
      className={cn(
        'h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-40 transition-all duration-200',
        className
      )}
    >
      <div className='h-full px-4 md:px-6 mx-auto flex items-center justify-between gap-4 max-w-[1600px]'>
        {/* Left Side: Mobile Menu Button Hidden (Navigation moved to bottom navbar) */}
        <div className='flex items-center gap-3 flex-1 md:hidden' />

        {/* Center/Right: Gamification Stats (Student Context) */}
        {showStats && stats && (
          <div className='hidden md:flex items-center gap-3'>
            {stats.studyTime && (
              <div
                className='group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all duration-300 cursor-default'
                title='Time spent learning today'
              >
                <div className='p-1 rounded-full bg-slate-200/50 group-hover:bg-slate-100/50 transition-colors'>
                  <Clock className='h-3.5 w-3.5 text-slate-600 group-hover:text-blue-600 transition-colors' />
                </div>
                <span className='text-sm font-semibold text-slate-600 group-hover:text-slate-900'>
                  {stats.studyTime}
                </span>
              </div>
            )}

            {stats.xpPoints !== undefined && (
              <div
                className='group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-white border border-transparent hover:border-indigo-100 hover:shadow-sm hover:shadow-indigo-100/50 transition-all duration-300 cursor-default'
                title='Total Experience Points'
              >
                <div className='p-1 rounded-full bg-slate-200/50 group-hover:bg-indigo-100/50 transition-colors'>
                  <Zap className='h-3.5 w-3.5 text-slate-600 group-hover:text-indigo-600 group-hover:fill-indigo-600 transition-all duration-300' />
                </div>
                <span className='text-sm font-bold bg-gradient-to-r from-slate-700 to-slate-900 group-hover:from-indigo-600 group-hover:to-purple-600 bg-clip-text text-transparent transition-all'>
                  {stats.xpPoints.toLocaleString()}{' '}
                  <span className='text-xs font-medium text-slate-400 group-hover:text-indigo-400'>
                    XP
                  </span>
                </span>
              </div>
            )}

            {stats.streak !== undefined && stats.streak > 0 && (
              <div
                className='group relative flex items-center gap-2 pr-4 pl-3 py-1.5 rounded-full bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 hover:from-orange-100 hover:via-amber-100 hover:to-yellow-100 border border-orange-100 hover:border-orange-200 hover:shadow-md hover:shadow-orange-100 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer'
                title='Current Learning Streak'
              >
                <div className='relative flex items-center justify-center w-6 h-6'>
                  <FlameIcon className='w-6 h-6 drop-shadow-sm filter' />
                </div>
                <div className='flex flex-col items-start leading-none -space-y-0.5'>
                  <span className='text-xs font-bold text-orange-700'>
                    {stats.streak} Day
                  </span>
                  <span className='text-[10px] font-medium text-orange-600/80 uppercase tracking-wide'>
                    Streak
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right: Actions & User */}
        <div className='flex items-center gap-1.5 md:gap-3 justify-end flex-1 md:flex-none'>
          {showSearch && (
            <Button
              variant='ghost'
              size='icon'
              className='md:hidden text-slate-500'
            >
              <Search className='h-5 w-5' />
            </Button>
          )}

          {/* Notifications */}
          <div className='relative'>
            <Button
              variant='ghost'
              size='icon'
              className='relative h-10 w-10 text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 rounded-full transition-all duration-200'
            >
              <Bell className='h-5 w-5' />
              <span className='absolute top-2.5 right-2.5 flex h-2.5 w-2.5'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white'></span>
              </span>
            </Button>
          </div>

          <div className='h-6 w-px bg-slate-200 mx-1 hidden sm:block' />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='pl-1 pr-2 h-10 gap-2 hover:bg-slate-100/50 rounded-full transition-all duration-200 group'
              >
                <div className='relative'>
                  <Avatar className='h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100 group-hover:ring-indigo-200 transition-all duration-300'>
                    <AvatarImage
                      src={profileData?.profilePicture || ''}
                      alt={fullName}
                    />
                    <AvatarFallback className='bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium text-xs'>
                      {getInitials(
                        profileData?.firstName || '',
                        profileData?.lastName || ''
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className='absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full'></div>
                </div>
                <div className='hidden sm:flex flex-col items-start text-left'>
                  <span className='text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors'>
                    {profileData?.firstName ||
                      user?.displayName?.split(' ')[0] ||
                      'User'}
                  </span>
                  <span className='text-[10px] text-slate-400 font-medium leading-none mt-0.5 capitalize'>
                    {role}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='w-56 mt-2 rounded-xl border-slate-100 shadow-lg shadow-slate-200/50 p-2'
            >
              <DropdownMenuLabel className='px-2 pb-2 pt-3'>
                <div className='flex flex-col gap-1'>
                  <span className='text-sm font-semibold text-slate-800'>
                    {fullName}
                  </span>
                  <span className='text-xs text-slate-500 font-normal'>
                    {profileData?.email || user?.email || ''}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className='bg-slate-100' />
              <DropdownMenuItem
                asChild
                className='cursor-pointer rounded-lg focus:bg-slate-50'
              >
                <Link
                  href={
                    role === 'teacher'
                      ? '/dashboard/teacher/profile/enhance'
                      : '/profile/enhance'
                  }
                >
                  <User className='mr-2 h-4 w-4 text-slate-500' />
                  Profile
                </Link>
              </DropdownMenuItem>
              {role === 'student' && (
                <DropdownMenuItem
                  asChild
                  className='cursor-pointer rounded-lg focus:bg-slate-50'
                >
                  <Link href='/dashboard/student/progress'>
                    <Star className='mr-2 h-4 w-4 text-slate-500' />
                    My Progress
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Stats Bar */}
      {/* {showStats && stats && (
        <div className="md:hidden border-t border-slate-100 bg-slate-50/50 backdrop-blur-sm overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-around py-2.5 px-4 min-w-[320px]">
            {stats.streak !== undefined && stats.streak > 0 && (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-orange-600">
                  <FlameIcon className="h-4 w-4" />
                  <span className="font-bold text-sm">{stats.streak}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Streak</span>
              </div>
            )}
            <div className="w-px h-6 bg-slate-200" />
            {stats.xpPoints !== undefined && (
              <div className="flex flex-col items-center">
                <span className="font-bold text-sm text-indigo-600">{stats.xpPoints.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 font-medium">Total XP</span>
              </div>
            )}
            <div className="w-px h-6 bg-slate-200" />
            {stats.studyTime && (
              <div className="flex flex-col items-center">
                <span className="font-bold text-sm text-slate-700">{stats.studyTime}</span>
                <span className="text-[10px] text-slate-500 font-medium">Time</span>
              </div>
            )}
          </div>
        </div>
      )} */}
    </header>
  );
}

// Pre-configured navbar for teachers (no placeholder user data)
export const teacherNavbarConfig: NavbarConfig = {
  role: 'teacher',
  showStats: false,
  showSearch: true,
};

// Pre-configured navbar for students (no placeholder user data, stats are placeholders for now)
export const studentNavbarConfig: NavbarConfig = {
  role: 'student',
  showStats: true,
  showSearch: true,
  stats: {
    studyTime: '0h',
    xpPoints: 0,
    streak: 0,
  },
};

export default DashboardNavbar;

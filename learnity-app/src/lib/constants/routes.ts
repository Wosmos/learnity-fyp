/**
 * Route Constants
 * Centralized route definitions to avoid magic strings
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  ABOUT: '/about',
  TEACHERS: '/teachers',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REGISTER_STUDENT: '/auth/register/student',
  REGISTER_TEACHER: '/auth/register/teacher',
  FORGOT_PASSWORD: '/auth/forgot-password',
  
  // Dashboard routes (consistent pattern: /dashboard/{role})
  DASHBOARD: '/dashboard',
  DASHBOARD_STUDENT: '/dashboard/student',
  DASHBOARD_TEACHER: '/dashboard/teacher',
  DASHBOARD_ADMIN: '/dashboard/admin',
  
  // Legacy admin route (redirects to /dashboard/admin)
  ADMIN: '/dashboard/admin',
  ADMIN_SETUP: '/admin-setup',
  
  // Profile routes
  PROFILE_ENHANCE: '/profile/enhance',
  
  // Utility routes
  UNAUTHORIZED: '/unauthorized',
  WELCOME: '/welcome',
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];


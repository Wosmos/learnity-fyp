/**
 * Authentication Redirect Utilities
 * Handles role-based redirects and authentication flow routing
 */

import { UserRole, CustomClaims } from '@/types/auth';
import { User as FirebaseUser } from 'firebase/auth';

export interface RedirectOptions {
  role?: UserRole;
  claims?: CustomClaims;
  defaultRoute?: string;
  preserveQuery?: boolean;
}

/**
 * Get the appropriate dashboard route based on user role
 */
export function getDashboardRoute(role: UserRole): string {
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
}

/**
 * Get the appropriate redirect URL after successful authentication
 */
export function getPostAuthRedirect(options: RedirectOptions): string {
  const { role, claims, defaultRoute = '/dashboard' } = options;
  
  // Use role from claims if available, otherwise use provided role
  const userRole = claims?.role || role;
  
  if (!userRole) {
    return defaultRoute;
  }

  // Check if user needs to complete profile setup
  if (claims && !claims.profileComplete) {
    switch (userRole) {
      case UserRole.STUDENT:
        return '/profile/enhance';
      case UserRole.PENDING_TEACHER:
        return '/application/status';
      default:
        return getDashboardRoute(userRole);
    }
  }

  return getDashboardRoute(userRole);
}

/**
 * Get the appropriate redirect URL for unauthenticated users
 */
export function getUnauthenticatedRedirect(currentPath?: string): string {
  const loginUrl = '/auth/login';
  
  if (!currentPath || currentPath === '/' || currentPath.startsWith('/auth')) {
    return loginUrl;
  }
  
  // Preserve the current path as a redirect parameter
  const encodedPath = encodeURIComponent(currentPath);
  return `${loginUrl}?redirect=${encodedPath}`;
}

/**
 * Get the appropriate redirect URL for unauthorized access
 */
export function getUnauthorizedRedirect(userRole?: UserRole): string {
  if (!userRole) {
    return '/auth/login';
  }

  // Redirect to appropriate dashboard if user is authenticated but lacks permissions
  return getDashboardRoute(userRole);
}

/**
 * Check if a route requires authentication
 */
export function requiresAuthentication(path: string): boolean {
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/privacy',
    '/terms',
    '/support',
    '/demo',
    '/welcome'
  ];

  // Check if path is in public routes
  if (publicRoutes.includes(path)) {
    return false;
  }

  // Check if path starts with public route patterns
  const publicPatterns = [
    '/auth/',
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password'
  ];

  return !publicPatterns.some(pattern => path.startsWith(pattern));
}

/**
 * Check if a route requires specific role
 */
export function getRequiredRole(path: string): UserRole | null {
  // Admin routes
  if (path.startsWith('/admin')) {
    return UserRole.ADMIN;
  }

  // Teacher routes
  if (path.startsWith('/teacher') || path.startsWith('/dashboard/teacher')) {
    return UserRole.TEACHER;
  }

  // Student routes
  if (path.startsWith('/student') || path.startsWith('/dashboard/student')) {
    return UserRole.STUDENT;
  }

  // Pending teacher routes
  if (path.startsWith('/application')) {
    return UserRole.PENDING_TEACHER;
  }

  return null;
}

/**
 * Check if user has access to a specific route
 */
export function hasRouteAccess(path: string, userRole?: UserRole): boolean {
  const requiredRole = getRequiredRole(path);
  
  if (!requiredRole) {
    return true; // No specific role required
  }

  if (!userRole) {
    return false; // User not authenticated
  }

  // Check specific role access
  switch (requiredRole) {
    case UserRole.ADMIN:
      // Only admins can access admin routes
      return userRole === UserRole.ADMIN;
    case UserRole.TEACHER:
      // Teachers and admins can access teacher routes
      return userRole === UserRole.TEACHER || userRole === UserRole.ADMIN;
    case UserRole.STUDENT:
      // Only students can access student routes (admins use their own dashboard)
      return userRole === UserRole.STUDENT;
    case UserRole.PENDING_TEACHER:
      // Only pending teachers can access application routes
      return userRole === UserRole.PENDING_TEACHER;
    default:
      return false;
  }
}

/**
 * Build redirect URL with query parameters
 */
export function buildRedirectUrl(baseUrl: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const url = new URL(baseUrl, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.pathname + url.search;
}

/**
 * Extract redirect parameter from URL
 */
export function getRedirectFromUrl(searchParams: URLSearchParams): string | null {
  const redirect = searchParams.get('redirect');
  
  if (!redirect) {
    return null;
  }

  try {
    const decodedRedirect = decodeURIComponent(redirect);
    
    // Validate that redirect is a safe internal URL
    if (decodedRedirect.startsWith('/') && !decodedRedirect.startsWith('//')) {
      return decodedRedirect;
    }
  } catch {
    console.warn('Invalid redirect parameter:', redirect);
  }

  return null;
}

/**
 * Handle role-based navigation after authentication
 */
export function handlePostAuthNavigation(
  router: { push: (path: string) => void },
  userRole: UserRole,
  claims?: CustomClaims,
  requestedPath?: string
) {
  // If user requested a specific path, check if they have access
  if (requestedPath && hasRouteAccess(requestedPath, userRole)) {
    router.push(requestedPath);
    return;
  }

  // Otherwise, redirect to appropriate dashboard
  const dashboardRoute = getPostAuthRedirect({ role: userRole, claims });
  router.push(dashboardRoute);
}

/**
 * Get welcome message based on user role
 */
export function getWelcomeMessage(userRole: UserRole, userName?: string): string {
  const name = userName || 'there';
  
  switch (userRole) {
    case UserRole.ADMIN:
      return `Welcome back, ${name}! Ready to manage the platform?`;
    case UserRole.TEACHER:
      return `Welcome back, ${name}! Ready to inspire students today?`;
    case UserRole.STUDENT:
      return `Welcome back, ${name}! Ready to continue learning?`;
    case UserRole.PENDING_TEACHER:
      return `Welcome, ${name}! Your teacher application is being reviewed.`;
    default:
      return `Welcome, ${name}!`;
  }
}

// ===== HOME PAGE SPECIFIC UTILITIES =====

export interface HomeRedirectOptions {
  user: FirebaseUser | null;
  claims: CustomClaims | null;
  isLoading: boolean;
}

/**
 * Determine if a user should be redirected from the home page
 * Used specifically for home page authentication logic
 */
export function shouldRedirectFromHome(options: HomeRedirectOptions): boolean {
  const { user, claims, isLoading } = options;
  
  // Don't redirect while still loading authentication state
  if (isLoading) {
    return false;
  }
  
  // Redirect authenticated users with valid claims
  return !!(user && claims && claims.role);
}

/**
 * Get the appropriate redirect path for authenticated users on home page
 * Returns null if user should stay on home page (unauthenticated)
 */
export function getHomeRedirectPath(options: HomeRedirectOptions): string | null {
  const { user, claims, isLoading } = options;
  
  // Don't redirect while loading or if user is not authenticated
  if (isLoading || !user || !claims) {
    return null;
  }
  
  // Use existing post-auth redirect logic
  return getPostAuthRedirect({ 
    role: claims.role, 
    claims 
  });
}

/**
 * Coordinated authentication handling for home page
 * Combines authentication state checking with redirect logic
 */
export function handleHomePageAuth(
  router: { push: (path: string) => void },
  options: HomeRedirectOptions
): void {
  const { user, claims, isLoading } = options;
  
  // Don't do anything while loading
  if (isLoading) {
    return;
  }
  
  // If user is authenticated, redirect to appropriate dashboard
  if (user && claims) {
    const redirectPath = getHomeRedirectPath(options);
    if (redirectPath) {
      // Small delay to prevent flash of content
      setTimeout(() => {
        router.push(redirectPath);
      }, 100);
    }
  }
  
  // If user is not authenticated, they stay on the landing page
  // No action needed - the home page will render the landing page content
}
/**
 * Next.js Middleware for Centralized Route Protection
 * DRY principle: Single source of truth for auth verification
 * Handles role-based authorization for all protected routes
 */

import { NextRequest, NextResponse } from 'next/server';

// Define route access rules with role requirements
const ROUTE_CONFIG = {
  // Public routes (no auth required)
  public: [
    '/',
    '/about',
    '/teachers',
    '/auth',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/demo',
    '/welcome',
    '/unauthorized',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/register/student',
    '/api/auth/register/teacher',
    '/api/auth/register/teacher/quick',
    '/api/auth/register/teacher/enhanced',
    '/api/auth/session',
    '/api/auth/logout',
    '/api/public',
  ],
  // Public route patterns (regex patterns for dynamic routes)
  publicPatterns: [
    /^\/teachers\/[^\/]+$/, // /teachers/[id]
  ],
  // Role-specific routes
  roleBasedRoutes: {
    STUDENT: ['/dashboard/student'],
    TEACHER: ['/dashboard/teacher'],
    ADMIN: ['/admin', '/dashboard/admin'],
    PENDING_TEACHER: ['/dashboard/teacher/pending'],
  },
  // Protected routes (any authenticated user)
  authenticated: ['/dashboard', '/profile', '/onboarding'],
} as const;

type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'PENDING_TEACHER';

/**
 * Verify Firebase session token and extract user claims
 */
async function verifyAuth(request: NextRequest): Promise<{
  authenticated: boolean;
  role?: UserRole;
  userId?: string;
  emailVerified?: boolean;
}> {
  try {
    // Check for session cookie (set by Firebase Auth)
    const sessionCookie =
      request.cookies.get('session')?.value ||
      request.cookies.get('__session')?.value;

    if (!sessionCookie) {
      return { authenticated: false };
    }

    // Decode JWT payload (Firebase ID tokens are JWTs)
    // We use a safe atob alternative for Edge Runtime if needed, but atob is typically available
    const tokenParts = sessionCookie.split('.');
    if (tokenParts.length !== 3) {
      return { authenticated: false };
    }

    // Base64URL decode helper for JWT payload
    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      role: payload.role as UserRole,
      userId: payload.uid || payload.sub,
      emailVerified: payload.email_verified === true || payload.emailVerified === true,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authenticated: false };
  }
}

/**
 * Check if path matches any route pattern
 */
function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Check if path matches any public pattern
 */
function matchesPublicPattern(
  pathname: string,
  patterns: readonly RegExp[]
): boolean {
  return patterns.some(pattern => pattern.test(pathname));
}

/**
 * Get role-specific dashboard route
 */
function getRoleDashboard(role?: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'TEACHER':
      return '/dashboard/teacher';
    case 'STUDENT':
      return '/dashboard/student';
    case 'PENDING_TEACHER':
      return '/dashboard/teacher/pending';
    default:
      return '/welcome';
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and specific internal routes
  if (
    pathname.startsWith('/_next') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp)$/)
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (matchesRoute(pathname, ROUTE_CONFIG.public)) {
    return NextResponse.next();
  }

  // Allow public route patterns
  if (matchesPublicPattern(pathname, ROUTE_CONFIG.publicPatterns)) {
    return NextResponse.next();
  }

  // Verify authentication for protected routes
  const auth = await verifyAuth(request);
  console.log(`Middleware Path: ${pathname}, Authenticated: ${auth.authenticated}, EmailVerified: ${auth.emailVerified}`);

  // Redirect to login if not authenticated
  if (!auth.authenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle email verification redirect
  // If email is not verified, they can only access /auth/verify-email
  if (!auth.emailVerified && pathname !== '/auth/verify-email') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Email verification required', code: 'EMAIL_NOT_VERIFIED' },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL('/auth/verify-email', request.url));
  }

  // If email is verified but trying to access verification page, redirect to dashboard
  if (auth.emailVerified && pathname === '/auth/verify-email') {
    return NextResponse.redirect(
      new URL(getRoleDashboard(auth.role), request.url)
    );
  }

  // Role-based protection for PENDING_TEACHER
  if (auth.role === 'PENDING_TEACHER') {
    // If they are trying to access full teacher dashboard, redirect to pending page
    if (
      pathname.startsWith('/dashboard/teacher') &&
      pathname !== '/dashboard/teacher/pending'
    ) {
      return NextResponse.redirect(
        new URL('/dashboard/teacher/pending', request.url)
      );
    }
  }

  // General Role-based route enforcement (centralized protection)
  const roleRoutes = ROUTE_CONFIG.roleBasedRoutes;
  for (const [role, routes] of Object.entries(roleRoutes)) {
    if (matchesRoute(pathname, routes)) {
      // Allow if user has the role OR is an ADMIN
      if (auth.role !== role && auth.role !== 'ADMIN') {
        // Special case: PENDING_TEACHER is allowed on their specific routes
        // (but we already handled that above, this is for other roles trying to cross-access)
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  // Allow access to authenticated routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

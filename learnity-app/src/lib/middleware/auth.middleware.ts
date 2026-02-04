/**
 * Authentication Middleware for Route Protection
 * Implements role-based access control and permission checking
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/config/firebase-admin';
import { roleManager } from '@/lib/services/role-manager.service';
import {
  UserRole,
  Permission,
  AuthErrorCode,
  CustomClaims,
} from '@/types/auth';

export interface AuthMiddlewareOptions {
  requiredRole?: UserRole;
  requiredPermissions?: Permission[];
  allowMultipleRoles?: UserRole[];
  skipEmailVerification?: boolean;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    firebaseUid: string;
    email: string;
    emailVerified: boolean;
    claims: CustomClaims;
  };
}

/**
 * Main authentication middleware function
 */
export async function authMiddleware(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<NextResponse | { user: any }> {
  try {
    // Extract Firebase ID token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse(
        AuthErrorCode.TOKEN_INVALID,
        'Missing or invalid authorization header'
      );
    }

    const idToken = authHeader.substring(7);

    // Verify Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    // Get user claims and profile
    const claims = await roleManager.getCustomClaims(firebaseUid);

    // Check email verification if required
    if (!options.skipEmailVerification && !decodedToken.email_verified) {
      return createErrorResponse(
        AuthErrorCode.EMAIL_NOT_VERIFIED,
        'Email verification required'
      );
    }

    // Check role requirements
    if (options.requiredRole && claims.role !== options.requiredRole) {
      // Check if user has one of the allowed roles
      if (
        options.allowMultipleRoles &&
        !options.allowMultipleRoles.includes(claims.role)
      ) {
        return createErrorResponse(
          AuthErrorCode.INSUFFICIENT_PERMISSIONS,
          'Insufficient role permissions'
        );
      } else if (!options.allowMultipleRoles) {
        return createErrorResponse(
          AuthErrorCode.INSUFFICIENT_PERMISSIONS,
          'Insufficient role permissions'
        );
      }
    }

    // Check permission requirements
    if (options.requiredPermissions && options.requiredPermissions.length > 0) {
      const hasAllPermissions = options.requiredPermissions.every(permission =>
        claims.permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return createErrorResponse(
          AuthErrorCode.INSUFFICIENT_PERMISSIONS,
          'Insufficient permissions'
        );
      }
    }

    // Create authenticated user object
    const authenticatedUser = {
      firebaseUid,
      email: decodedToken.email || '',
      emailVerified: decodedToken.email_verified || false,
      claims,
    };

    // Log successful authentication for audit
    await logAuthenticationEvent(request, authenticatedUser, true);

    return { user: authenticatedUser };
  } catch (error: any) {
    console.error('Authentication middleware error:', error);

    // Log failed authentication attempt
    await logAuthenticationEvent(request, null, false, error.message);

    if (error.code === 'auth/id-token-expired') {
      return createErrorResponse(
        AuthErrorCode.TOKEN_EXPIRED,
        'Token has expired'
      );
    }

    if (error.code === 'auth/id-token-revoked') {
      return createErrorResponse(
        AuthErrorCode.TOKEN_REVOKED,
        'Token has been revoked'
      );
    }

    return createErrorResponse(
      AuthErrorCode.TOKEN_INVALID,
      'Invalid authentication token'
    );
  }
}

/**
 * Middleware factory for specific role requirements
 */
export function requireRole(
  role: UserRole,
  options: Omit<AuthMiddlewareOptions, 'requiredRole'> = {}
) {
  return (request: NextRequest) =>
    authMiddleware(request, { ...options, requiredRole: role });
}

/**
 * Middleware factory for specific permission requirements
 */
export function requirePermissions(
  permissions: Permission[],
  options: Omit<AuthMiddlewareOptions, 'requiredPermissions'> = {}
) {
  return (request: NextRequest) =>
    authMiddleware(request, { ...options, requiredPermissions: permissions });
}

/**
 * Middleware factory for admin-only routes
 */
export function requireAdmin(
  options: Omit<AuthMiddlewareOptions, 'requiredRole'> = {}
) {
  return requireRole(UserRole.ADMIN, options);
}

/**
 * Middleware factory for teacher-only routes (including approved teachers)
 */
export function requireTeacher(
  options: Omit<
    AuthMiddlewareOptions,
    'requiredRole' | 'allowMultipleRoles'
  > = {}
) {
  return (request: NextRequest) =>
    authMiddleware(request, {
      ...options,
      allowMultipleRoles: [UserRole.TEACHER, UserRole.ADMIN],
    });
}

/**
 * Middleware factory for student-only routes
 */
export function requireStudent(
  options: Omit<AuthMiddlewareOptions, 'requiredRole'> = {}
) {
  return requireRole(UserRole.STUDENT, options);
}

/**
 * Middleware for routes that require any authenticated user
 */
export function requireAuth(options: AuthMiddlewareOptions = {}) {
  return (request: NextRequest) => authMiddleware(request, options);
}

/**
 * Route-based protection middleware
 */
export async function routeProtectionMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname;

  // Define route protection rules
  const protectedRoutes: Record<string, AuthMiddlewareOptions> = {
    // Admin routes
    '/admin': { requiredRole: UserRole.ADMIN },
    '/admin/users': { requiredPermissions: [Permission.MANAGE_USERS] },
    '/admin/teachers': { requiredPermissions: [Permission.APPROVE_TEACHERS] },
    '/admin/audit': { requiredPermissions: [Permission.VIEW_AUDIT_LOGS] },

    // Teacher routes
    '/teacher': { allowMultipleRoles: [UserRole.TEACHER, UserRole.ADMIN] },
    '/teacher/sessions': { requiredPermissions: [Permission.MANAGE_SESSIONS] },
    '/teacher/content': { requiredPermissions: [Permission.UPLOAD_CONTENT] },

    // Student routes
    '/student': { requiredRole: UserRole.STUDENT },
    '/student/groups': { requiredPermissions: [Permission.JOIN_STUDY_GROUPS] },
    '/student/tutoring': { requiredPermissions: [Permission.BOOK_TUTORING] },

    // Dashboard routes
    '/dashboard/admin': { requiredPermissions: [Permission.VIEW_ADMIN_PANEL] },
    '/dashboard/teacher': {
      requiredPermissions: [Permission.VIEW_TEACHER_DASHBOARD],
    },
    '/dashboard/student': {
      requiredPermissions: [Permission.VIEW_STUDENT_DASHBOARD],
    },

    // Profile routes
    '/profile/enhance': { requiredPermissions: [Permission.ENHANCE_PROFILE] },

    // Application routes
    '/application/status': {
      requiredPermissions: [Permission.VIEW_APPLICATION_STATUS],
    },
    '/application/update': {
      requiredPermissions: [Permission.UPDATE_APPLICATION],
    },
  };

  // Check if route needs protection
  const routeConfig = findMatchingRoute(pathname, protectedRoutes);
  if (!routeConfig) {
    return null; // Route doesn't need protection
  }

  // Apply authentication middleware
  const authResult = await authMiddleware(request, routeConfig);

  if (authResult instanceof NextResponse) {
    return authResult; // Return error response
  }

  // Add user to request headers for API routes
  const response = NextResponse.next();
  response.headers.set('x-user-data', JSON.stringify(authResult.user));

  return response;
}

/**
 * Find matching route configuration
 */
function findMatchingRoute(
  pathname: string,
  routes: Record<string, AuthMiddlewareOptions>
): AuthMiddlewareOptions | null {
  // Check exact match first
  if (routes[pathname]) {
    return routes[pathname];
  }

  // Check for prefix matches
  for (const [route, config] of Object.entries(routes)) {
    if (pathname.startsWith(route + '/')) {
      return config;
    }
  }

  return null;
}

/**
 * Create standardized error response
 */
function createErrorResponse(
  code: AuthErrorCode,
  message: string
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status: getStatusCodeForError(code) }
  );
}

/**
 * Get HTTP status code for auth error
 */
function getStatusCodeForError(code: AuthErrorCode): number {
  switch (code) {
    case AuthErrorCode.TOKEN_INVALID:
    case AuthErrorCode.TOKEN_EXPIRED:
    case AuthErrorCode.TOKEN_REVOKED:
      return 401;

    case AuthErrorCode.INSUFFICIENT_PERMISSIONS:
    case AuthErrorCode.ROLE_NOT_APPROVED:
      return 403;

    case AuthErrorCode.EMAIL_NOT_VERIFIED:
      return 403;

    default:
      return 500;
  }
}

/**
 * Log authentication events for audit trail
 */
async function logAuthenticationEvent(
  request: NextRequest,
  user: any | null,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  try {
    // This would typically use the security service for logging
    // For now, we'll use console logging
    const logData = {
      timestamp: new Date().toISOString(),
      path: request.nextUrl.pathname,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      ip:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip'),
      firebaseUid: user?.firebaseUid,
      success,
      errorMessage,
    };

    console.log('Auth middleware event:', logData);
  } catch (error) {
    console.error('Failed to log authentication event:', error);
  }
}

/**
 * Extract user data from request headers (for API routes)
 */
export function getUserFromRequest(request: NextRequest): any | null {
  try {
    const userData = request.headers.get('x-user-data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to parse user data from request:', error);
    return null;
  }
}

/**
 * Higher-order function for API route protection
 */
export function withAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authMiddleware(request, options);

    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }

    return handler(request, authResult.user);
  };
}

/**
 * Higher-order function for admin-only API routes
 */
export function withAdminAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return withAuth(handler, { requiredRole: UserRole.ADMIN });
}

/**
 * Higher-order function for teacher-only API routes
 */
export function withTeacherAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return withAuth(handler, {
    allowMultipleRoles: [UserRole.TEACHER, UserRole.ADMIN],
  });
}

/**
 * Higher-order function for student-only API routes
 */
export function withStudentAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return withAuth(handler, { requiredRole: UserRole.STUDENT });
}

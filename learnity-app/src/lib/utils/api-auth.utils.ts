/**
 * API Authentication Utilities
 * Helper functions for protecting API routes and handling authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  authMiddleware, 
  AuthMiddlewareOptions,
  getUserFromRequest 
} from '@/lib/middleware/auth.middleware';
import { 
  UserRole, 
  Permission, 
  AuthErrorCode 
} from '@/types/auth';

/**
 * Protect API route with authentication
 */
export async function protectApiRoute(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<{ user: any } | NextResponse> {
  const authResult = await authMiddleware(request, options);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Return error response
  }

  return authResult;
}

/**
 * Get authenticated user from API request
 */
export function getAuthenticatedUser(request: NextRequest): any | null {
  return getUserFromRequest(request);
}

/**
 * Create API error response
 */
export function createApiErrorResponse(
  code: AuthErrorCode,
  message: string,
  statusCode?: number
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message
      }
    },
    { status: statusCode || getDefaultStatusCode(code) }
  );
}

/**
 * Create API success response
 */
export function createApiSuccessResponse(
  data: any,
  message?: string
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message
  });
}

/**
 * Validate user permissions for API endpoint
 */
export async function validateApiPermissions(
  user: any,
  requiredPermissions: Permission[]
): Promise<boolean> {
  if (!user || !user.claims || !user.claims.permissions) {
    return false;
  }

  return requiredPermissions.every(permission =>
    user.claims.permissions.includes(permission)
  );
}

/**
 * Validate user role for API endpoint
 */
export function validateApiRole(
  user: any,
  requiredRole: UserRole
): boolean {
  if (!user || !user.claims || !user.claims.role) {
    return false;
  }

  return user.claims.role === requiredRole;
}

/**
 * Validate multiple roles for API endpoint
 */
export function validateApiRoles(
  user: any,
  allowedRoles: UserRole[]
): boolean {
  if (!user || !user.claims || !user.claims.role) {
    return false;
  }

  return allowedRoles.includes(user.claims.role);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: any): boolean {
  return validateApiRole(user, UserRole.ADMIN);
}

/**
 * Check if user is teacher or admin
 */
export function isTeacherOrAdmin(user: any): boolean {
  return validateApiRoles(user, [UserRole.TEACHER, UserRole.ADMIN]);
}

/**
 * Check if user is student
 */
export function isStudent(user: any): boolean {
  return validateApiRole(user, UserRole.STUDENT);
}

/**
 * Check if user can manage other users
 */
export async function canManageUsers(user: any): Promise<boolean> {
  return validateApiPermissions(user, [Permission.MANAGE_USERS]);
}

/**
 * Check if user can approve teachers
 */
export async function canApproveTeachers(user: any): Promise<boolean> {
  return validateApiPermissions(user, [Permission.APPROVE_TEACHERS]);
}

/**
 * Check if user can view audit logs
 */
export async function canViewAuditLogs(user: any): Promise<boolean> {
  return validateApiPermissions(user, [Permission.VIEW_AUDIT_LOGS]);
}

/**
 * Extract client information from request
 */
export function getClientInfo(request: NextRequest): {
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
} {
  const ipAddress = 
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  const userAgent = request.headers.get('user-agent') || 'Unknown';
  
  // Simple device fingerprint based on user agent and IP
  const deviceFingerprint = Buffer.from(`${ipAddress}-${userAgent}`).toString('base64');

  return {
    ipAddress,
    userAgent,
    deviceFingerprint
  };
}

/**
 * Log API access for audit trail
 */
export function logApiAccess(
  request: NextRequest,
  user: any | null,
  action: string,
  success: boolean,
  errorMessage?: string
): void {
  const clientInfo = getClientInfo(request);
  
  const logData = {
    timestamp: new Date().toISOString(),
    method: request.method,
    path: request.nextUrl.pathname,
    action,
    firebaseUid: user?.firebaseUid,
    role: user?.claims?.role,
    success,
    errorMessage,
    ...clientInfo
  };

  console.log('API Access Log:', logData);
}

/**
 * Wrapper for API route handlers with authentication
 */
export function withApiAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const authResult = await protectApiRoute(request, options);
      
      if (authResult instanceof NextResponse) {
        return authResult; // Return error response
      }

      const response = await handler(request, authResult.user);
      
      // Log successful API access
      logApiAccess(request, authResult.user, 'API_ACCESS', true);
      
      return response;
    } catch (error: any) {
      console.error('API route error:', error);
      
      // Log failed API access
      logApiAccess(request, null, 'API_ACCESS', false, error.message);
      
      return createApiErrorResponse(
        AuthErrorCode.INTERNAL_ERROR,
        'Internal server error'
      );
    }
  };
}

/**
 * Wrapper for admin-only API routes
 */
export function withAdminApiAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return withApiAuth(handler, { requiredRole: UserRole.ADMIN });
}

/**
 * Wrapper for teacher API routes
 */
export function withTeacherApiAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return withApiAuth(handler, { allowMultipleRoles: [UserRole.TEACHER, UserRole.ADMIN] });
}

/**
 * Wrapper for student API routes
 */
export function withStudentApiAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return withApiAuth(handler, { requiredRole: UserRole.STUDENT });
}

/**
 * Get default HTTP status code for auth error
 */
function getDefaultStatusCode(code: AuthErrorCode): number {
  switch (code) {
    case AuthErrorCode.TOKEN_INVALID:
    case AuthErrorCode.TOKEN_EXPIRED:
    case AuthErrorCode.TOKEN_REVOKED:
      return 401;
    
    case AuthErrorCode.INSUFFICIENT_PERMISSIONS:
    case AuthErrorCode.ROLE_NOT_APPROVED:
    case AuthErrorCode.EMAIL_NOT_VERIFIED:
      return 403;
    
    case AuthErrorCode.ACCOUNT_NOT_FOUND:
      return 404;
    
    case AuthErrorCode.RATE_LIMIT_EXCEEDED:
    case AuthErrorCode.TOO_MANY_ATTEMPTS:
      return 429;
    
    default:
      return 500;
  }
}

/**
 * Validate request method
 */
export function validateMethod(
  request: NextRequest,
  allowedMethods: string[]
): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${request.method} not allowed`
        }
      },
      { status: 405 }
    );
  }
  
  return null;
}

/**
 * Parse JSON request body safely
 */
export async function parseRequestBody<T>(request: NextRequest): Promise<T | null> {
  try {
    return await request.json();
  } catch (error) {
    console.error('Failed to parse request body:', error);
    return null;
  }
}
/**
 * API Authentication Utilities
 * Centralized authentication and authorization helpers for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/config/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthResult {
  success: boolean;
  decodedToken?: DecodedIdToken;
  error?: string;
  response?: NextResponse;
}

/**
 * Extract and verify Firebase ID token from request headers
 * Returns standardized auth result with decoded token or error response
 */
export async function verifyAuthToken(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      success: false,
      error: 'Missing or invalid authorization header',
      response: NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    };
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return {
      success: true,
      decodedToken
    };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid or expired token',
      response: NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    };
  }
}

/**
 * Extract Firebase UID from various header sources
 * Supports both Authorization header and X-Firebase-UID header
 */
export async function extractFirebaseUid(request: NextRequest): Promise<{
  success: boolean;
  uid?: string;
  error?: string;
  response?: NextResponse;
}> {
  // Try X-Firebase-UID header first (for client-side authenticated requests)
  const firebaseUid = request.headers.get('X-Firebase-UID');
  if (firebaseUid) {
    return {
      success: true,
      uid: firebaseUid
    };
  }

  // Fall back to Authorization header verification
  const authResult = await verifyAuthToken(request);
  if (authResult.success && authResult.decodedToken) {
    return {
      success: true,
      uid: authResult.decodedToken.uid
    };
  }

  return {
    success: false,
    error: authResult.error || 'Unable to extract Firebase UID',
    response: authResult.response || NextResponse.json(
      { error: 'Firebase UID is required. User must be authenticated.' },
      { status: 401 }
    )
  };
}

/**
 * Verify user has required role
 */
export async function verifyUserRole(
  decodedToken: DecodedIdToken, 
  requiredRoles: string[]
): Promise<{
  success: boolean;
  error?: string;
  response?: NextResponse;
}> {
  const userRole = decodedToken.role;
  
  if (!userRole || !requiredRoles.includes(userRole)) {
    return {
      success: false,
      error: 'Insufficient permissions',
      response: NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    };
  }

  return { success: true };
}

/**
 * Verify user has required permission
 */
export async function verifyUserPermission(
  decodedToken: DecodedIdToken, 
  requiredPermission: string
): Promise<{
  success: boolean;
  error?: string;
  response?: NextResponse;
}> {
  const permissions = decodedToken.permissions || [];
  
  if (!permissions.includes(requiredPermission)) {
    return {
      success: false,
      error: 'Insufficient permissions',
      response: NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    };
  }

  return { success: true };
}

/**
 * Combined auth middleware for API routes
 * Handles token verification, role checking, and permission validation
 */
export async function authenticateApiRequest(
  request: NextRequest,
  options: {
    requiredRoles?: string[];
    requiredPermissions?: string[];
    allowUidHeader?: boolean;
  } = {}
): Promise<{
  success: boolean;
  decodedToken?: DecodedIdToken;
  uid?: string;
  error?: string;
  response?: NextResponse;
}> {
  // Extract UID based on options
  if (options.allowUidHeader) {
    const uidResult = await extractFirebaseUid(request);
    if (!uidResult.success) {
      return uidResult;
    }
    
    // If we only got UID from header, we need to verify token for role/permission checks
    if (options.requiredRoles || options.requiredPermissions) {
      const authResult = await verifyAuthToken(request);
      if (!authResult.success) {
        return authResult;
      }
      
      // Verify role if required
      if (options.requiredRoles && authResult.decodedToken) {
        const roleResult = await verifyUserRole(authResult.decodedToken, options.requiredRoles);
        if (!roleResult.success) {
          return roleResult;
        }
      }
      
      // Verify permissions if required
      if (options.requiredPermissions && authResult.decodedToken) {
        for (const permission of options.requiredPermissions) {
          const permResult = await verifyUserPermission(authResult.decodedToken, permission);
          if (!permResult.success) {
            return permResult;
          }
        }
      }
      
      return {
        success: true,
        decodedToken: authResult.decodedToken,
        uid: uidResult.uid
      };
    }
    
    return {
      success: true,
      uid: uidResult.uid
    };
  } else {
    // Standard token verification
    const authResult = await verifyAuthToken(request);
    if (!authResult.success) {
      return authResult;
    }
    
    const decodedToken = authResult.decodedToken!;
    
    // Verify role if required
    if (options.requiredRoles) {
      const roleResult = await verifyUserRole(decodedToken, options.requiredRoles);
      if (!roleResult.success) {
        return roleResult;
      }
    }
    
    // Verify permissions if required
    if (options.requiredPermissions) {
      for (const permission of options.requiredPermissions) {
        const permResult = await verifyUserPermission(decodedToken, permission);
        if (!permResult.success) {
          return permResult;
        }
      }
    }
    
    return {
      success: true,
      decodedToken,
      uid: decodedToken.uid
    };
  }
}
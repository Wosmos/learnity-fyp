/**
 * API Response Utilities
 * Standardized response helpers for consistent API responses
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, any>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: Record<string, any>;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  meta?: Record<string, any>,
  status: number = 200
): NextResponse {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    ...(meta && { meta })
  };

  return NextResponse.json(response, { status });
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: any,
  status: number = 400,
  meta?: Record<string, any>
): NextResponse {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    },
    ...(meta && { meta })
  };

  return NextResponse.json(response, { status });
}

/**
 * Create validation error response from Zod error
 */
export function createValidationErrorResponse(
  zodError: ZodError,
  message: string = 'Invalid input data'
): NextResponse {
  return createErrorResponse(
    'VALIDATION_ERROR',
    message,
    zodError.flatten(),
    400
  );
}

/**
 * Create authentication error response
 */
export function createAuthErrorResponse(
  message: string = 'Authentication required'
): NextResponse {
  return createErrorResponse(
    'AUTH_ERROR',
    message,
    undefined,
    401
  );
}

/**
 * Create authorization error response
 */
export function createAuthorizationErrorResponse(
  message: string = 'Insufficient permissions'
): NextResponse {
  return createErrorResponse(
    'AUTHORIZATION_ERROR',
    message,
    undefined,
    403
  );
}

/**
 * Create not found error response
 */
export function createNotFoundErrorResponse(
  resource: string = 'Resource'
): NextResponse {
  return createErrorResponse(
    'NOT_FOUND',
    `${resource} not found`,
    undefined,
    404
  );
}

/**
 * Create internal server error response
 */
export function createInternalErrorResponse(
  message: string = 'Internal server error',
  details?: any
): NextResponse {
  return createErrorResponse(
    'INTERNAL_ERROR',
    message,
    details,
    500
  );
}

/**
 * Create rate limit error response
 */
export function createRateLimitErrorResponse(
  message: string = 'Rate limit exceeded'
): NextResponse {
  return createErrorResponse(
    'RATE_LIMIT_ERROR',
    message,
    undefined,
    429
  );
}

/**
 * Handle common API errors with standardized responses
 */
export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return createValidationErrorResponse(error);
  }

  // Handle known error types
  if (error.code) {
    switch (error.code) {
      case 'auth/invalid-id-token':
      case 'auth/id-token-expired':
        return createAuthErrorResponse('Invalid or expired token');
      
      case 'auth/insufficient-permission':
        return createAuthorizationErrorResponse();
      
      case 'auth/user-not-found':
        return createNotFoundErrorResponse('User');
      
      default:
        return createInternalErrorResponse(error.message || 'Unknown error occurred');
    }
  }

  // Handle generic errors
  if (error.message) {
    return createInternalErrorResponse(error.message);
  }

  return createInternalErrorResponse();
}

/**
 * Async wrapper for API route handlers with error handling
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
/**
 * Admin Security Events API Endpoint
 * Provides secure access to security events for administrators
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auditService } from '@/lib/services/audit.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { Permission, SecurityEventType, RiskLevel } from '@/types/auth';
import { SecurityEventFilters } from '@/lib/services/audit.service';

// Validation schema for security event filters
const securityEventFiltersSchema = z.object({
  firebaseUid: z.string().optional(),
  eventType: z.nativeEnum(SecurityEventType).optional(),
  riskLevel: z.nativeEnum(RiskLevel).optional(),
  blocked: z.boolean().optional(),
  ipAddress: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  searchTerm: z.string().optional(),
});

/**
 * GET /api/admin/security-events
 * Retrieve security events with filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize admin access
    const authResult = await authMiddleware(request, {
      requiredPermissions: [Permission.VIEW_AUDIT_LOGS],
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const filters: SecurityEventFilters = {
      firebaseUid: searchParams.get('firebaseUid') || undefined,
      eventType:
        (searchParams.get('eventType') as SecurityEventType) || undefined,
      riskLevel: (searchParams.get('riskLevel') as RiskLevel) || undefined,
      blocked: searchParams.get('blocked')
        ? searchParams.get('blocked') === 'true'
        : undefined,
      ipAddress: searchParams.get('ipAddress') || undefined,
      startDate: searchParams.get('startDate')
        ? new Date(searchParams.get('startDate')!)
        : undefined,
      endDate: searchParams.get('endDate')
        ? new Date(searchParams.get('endDate')!)
        : undefined,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 50,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!)
        : 0,
    };

    const securityEvents = await auditService.getSecurityEvents(filters);

    // Log admin access to security events
    await auditService.logAdminAction({
      adminFirebaseUid: authResult.user.firebaseUid,
      action: 'VIEW_SECURITY_EVENTS',
      targetResource: 'security_events',
      ipAddress:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      newValues: { filters },
    });

    return NextResponse.json(securityEvents);
  } catch (error) {
    console.error('Failed to fetch security events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/security-events
 * Retrieve security events with complex filtering (supports request body)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize admin access
    const authResult = await authMiddleware(request, {
      requiredPermissions: [Permission.VIEW_AUDIT_LOGS],
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();

    // Validate filters
    const validationResult = securityEventFiltersSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid filter parameters',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const filters: SecurityEventFilters = {
      ...validationResult.data,
      startDate: validationResult.data.startDate
        ? new Date(validationResult.data.startDate)
        : undefined,
      endDate: validationResult.data.endDate
        ? new Date(validationResult.data.endDate)
        : undefined,
    };

    // Apply search term filtering if provided
    if (body.searchTerm) {
      // Search in IP address or user information
      const searchTerm = body.searchTerm.toLowerCase();
      if (searchTerm.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        // If search term looks like an IP address
        filters.ipAddress = searchTerm;
      }
      // Additional search logic could be implemented here
    }

    const securityEvents = await auditService.getSecurityEvents(filters);

    // Log admin access to security events
    await auditService.logAdminAction({
      adminFirebaseUid: authResult.user.firebaseUid,
      action: 'VIEW_SECURITY_EVENTS',
      targetResource: 'security_events',
      ipAddress:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      newValues: { filters },
    });

    return NextResponse.json(securityEvents);
  } catch (error) {
    console.error('Failed to fetch security events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Admin Audit Logs API Endpoint
 * Provides secure access to audit logs for administrators
 */

import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/lib/services/audit.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { Permission } from '@/types/auth';
import { AuditFilters } from '@/lib/interfaces/auth';
import { z } from 'zod';

// Validation schema for audit log filters
const auditFiltersSchema = z.object({
  userId: z.string().optional(),
  firebaseUid: z.string().optional(),
  eventType: z.string().optional(),
  success: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  searchTerm: z.string().optional()
});

/**
 * GET /api/admin/audit-logs
 * Retrieve audit logs with filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize admin access
    const authResult = await authMiddleware(request, { requiredPermissions: [Permission.VIEW_AUDIT_LOGS] });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const filters: AuditFilters = {
      userId: searchParams.get('userId') || undefined,
      firebaseUid: searchParams.get('firebaseUid') || undefined,
      eventType: searchParams.get('eventType') || undefined,
      success: searchParams.get('success') ? searchParams.get('success') === 'true' : undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    };

    const auditLogs = await auditService.getAuditLogs(filters);

    // Log admin access to audit logs
    await auditService.logAdminAction({
      adminFirebaseUid: authResult.user.firebaseUid,
      action: 'VIEW_AUDIT_LOGS',
      targetResource: 'audit_logs',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      newValues: { filters }
    });

    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/audit-logs
 * Retrieve audit logs with complex filtering (supports request body)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize admin access
    const authResult = await authMiddleware(request, { requiredPermissions: [Permission.VIEW_AUDIT_LOGS] });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    
    // Validate filters
    const validationResult = auditFiltersSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid filter parameters', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const filters: AuditFilters = {
      ...validationResult.data,
      startDate: validationResult.data.startDate ? new Date(validationResult.data.startDate) : undefined,
      endDate: validationResult.data.endDate ? new Date(validationResult.data.endDate) : undefined
    };

    const auditLogs = await auditService.getAuditLogs(filters);

    // Log admin access to audit logs
    await auditService.logAdminAction({
      adminFirebaseUid: authResult.user.firebaseUid,
      action: 'VIEW_AUDIT_LOGS',
      targetResource: 'audit_logs',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      newValues: { filters }
    });

    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
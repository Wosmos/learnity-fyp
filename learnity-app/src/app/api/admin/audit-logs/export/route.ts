/**
 * Admin Audit Logs Export API Endpoint
 * Provides CSV export functionality for audit logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auditService } from '@/lib/services/audit.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { Permission } from '@/types/auth';
import { AuditFilters } from '@/lib/interfaces/auth';

// Validation schema for export filters
const exportFiltersSchema = z.object({
  userId: z.string().optional(),
  firebaseUid: z.string().optional(),
  eventType: z.string().optional(),
  success: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(50000).optional(),
  searchTerm: z.string().optional(),
});

/**
 * POST /api/admin/audit-logs/export
 * Export audit logs as CSV
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
    const validationResult = exportFiltersSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid export parameters',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const filters: AuditFilters = {
      ...validationResult.data,
      startDate: validationResult.data.startDate
        ? new Date(validationResult.data.startDate)
        : undefined,
      endDate: validationResult.data.endDate
        ? new Date(validationResult.data.endDate)
        : undefined,
      limit: validationResult.data.limit || 10000, // Default export limit
    };

    const auditLogs = await auditService.getAuditLogs(filters);

    // Convert to CSV format
    const csvContent = convertAuditLogsToCsv(auditLogs.logs);

    // Log admin export action
    await auditService.logAdminAction({
      adminFirebaseUid: authResult.user.firebaseUid,
      action: 'EXPORT_AUDIT_LOGS',
      targetResource: 'audit_logs',
      ipAddress:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      newValues: {
        filters,
        exportedRecords: auditLogs.logs.length,
      },
    });

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Failed to export audit logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Convert audit logs to CSV format
 */
function convertAuditLogsToCsv(logs: any[]): string {
  if (logs.length === 0) {
    return 'No data available';
  }

  // CSV headers
  const headers = [
    'ID',
    'Timestamp',
    'Firebase UID',
    'Event Type',
    'Action',
    'Resource',
    'Success',
    'IP Address',
    'User Agent',
    'Device Fingerprint',
    'Error Message',
    'Old Values',
    'New Values',
    'Metadata',
  ];

  // Convert logs to CSV rows
  const rows = logs.map(log => [
    log.id,
    new Date(log.createdAt).toISOString(),
    log.firebaseUid || '',
    log.eventType,
    log.action,
    log.resource || '',
    log.success ? 'Success' : 'Failed',
    log.ipAddress,
    `"${log.userAgent.replace(/"/g, '""')}"`, // Escape quotes in user agent
    log.deviceFingerprint || '',
    log.errorMessage || '',
    log.oldValues
      ? `"${JSON.stringify(log.oldValues).replace(/"/g, '""')}"`
      : '',
    log.newValues
      ? `"${JSON.stringify(log.newValues).replace(/"/g, '""')}"`
      : '',
    log.metadata ? `"${JSON.stringify(log.metadata).replace(/"/g, '""')}"` : '',
  ]);

  // Combine headers and rows
  const csvLines = [headers.join(','), ...rows.map(row => row.join(','))];

  return csvLines.join('\n');
}

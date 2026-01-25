/**
 * Security Report Generation API Endpoint
 * Generates comprehensive security reports for download
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auditService } from '@/lib/services/audit.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { Permission } from '@/types/auth';

// Validation schema for report request
const reportRequestSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  format: z.enum(['pdf', 'json']).optional().default('json'),
});

/**
 * POST /api/admin/security/report
 * Generate comprehensive security report
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

    // Validate request
    const validationResult = reportRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid report parameters',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { startDate, endDate, format } = validationResult.data;
    const timeRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    const report = await auditService.generateSecurityReport(timeRange);

    // Log admin action
    await auditService.logAdminAction({
      adminFirebaseUid: authResult.user.firebaseUid,
      action: 'GENERATE_SECURITY_REPORT',
      targetResource: 'security_report',
      ipAddress:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      newValues: {
        timeRange,
        format,
        totalEvents: report.summary.totalEvents,
        suspiciousPatterns: report.suspiciousPatterns.length,
      },
    });

    if (format === 'pdf') {
      // For now, return JSON with a note about PDF generation
      // In a real implementation, you would use a PDF generation library
      return NextResponse.json(
        {
          ...report,
          note: 'PDF generation not implemented yet. This is the JSON version of the report.',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="security-report-${new Date().toISOString().split('T')[0]}.json"`,
          },
        }
      );
    }

    return NextResponse.json(report, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="security-report-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate security report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

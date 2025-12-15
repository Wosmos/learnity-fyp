/**
 * Security Alerts API Endpoint
 * Provides security alerts for admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/lib/services/audit.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { Permission } from '@/types/auth';

/**
 * GET /api/admin/security/alerts
 * Get recent security alerts
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize admin access
    const authResult = await authMiddleware(request, { requiredPermissions: [Permission.VIEW_AUDIT_LOGS] });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const alerts = await auditService.checkForAlerts();

    // Log admin access
    await auditService.logAdminAction({
      adminFirebaseUid: authResult.user.firebaseUid,
      action: 'VIEW_SECURITY_ALERTS',
      targetResource: 'security_alerts',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      newValues: { alertCount: alerts.length }
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Failed to get security alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
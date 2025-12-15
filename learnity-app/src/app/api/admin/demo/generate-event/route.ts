/**
 * Demo Event Generation API
 * Generates test audit events for demonstration purposes
 */

import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/lib/services/audit.service';
import { EventType, SecurityEventType, RiskLevel } from '@/types/auth';
import { generateDeviceFingerprintLegacy } from '@/lib/utils/device-fingerprint';

/**
 * POST /api/admin/demo/generate-event
 * Generate test audit events for demonstration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, description } = body;

    // Get client information
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '192.168.1.100'; // Demo IP
    const userAgent = request.headers.get('user-agent') || 'Demo User Agent';
    const deviceFingerprint = generateDeviceFingerprintLegacy(userAgent, clientIP);

    // Generate different types of events based on the request
    switch (eventType) {
      case 'login_success':
        await auditService.logAuthenticationEvent({
          firebaseUid: 'demo-user-' + Math.random().toString(36).substr(2, 9),
          email: 'demo@example.com',
          eventType: EventType.AUTH_LOGIN,
          action: 'demo_login_success',
          success: true,
          ipAddress: clientIP,
          userAgent,
          deviceFingerprint,
          metadata: {
            demo: true,
            description,
            timestamp: new Date().toISOString()
          }
        });
        break;

      case 'login_failure':
        await auditService.logAuthenticationEvent({
          email: 'demo@example.com',
          eventType: EventType.AUTH_LOGIN,
          action: 'demo_login_failed',
          success: false,
          ipAddress: clientIP,
          userAgent,
          deviceFingerprint,
          errorMessage: 'Invalid credentials (demo)',
          metadata: {
            demo: true,
            description,
            timestamp: new Date().toISOString()
          }
        });
        break;

      case 'security_event':
        await auditService.logSecurityEvent({
          firebaseUid: 'demo-user-' + Math.random().toString(36).substr(2, 9),
          eventType: SecurityEventType.SUSPICIOUS_LOGIN,
          riskLevel: RiskLevel.MEDIUM,
          ipAddress: clientIP,
          userAgent,
          deviceFingerprint,
          blocked: false,
          reason: 'Demo suspicious activity detected',
          metadata: {
            demo: true,
            description,
            timestamp: new Date().toISOString()
          }
        });
        break;

      case 'admin_action':
        await auditService.logAdminAction({
          adminFirebaseUid: 'demo-admin-' + Math.random().toString(36).substr(2, 9),
          action: 'demo_admin_action',
          targetResource: 'demo_resource',
          ipAddress: clientIP,
          userAgent,
          success: true,
          newValues: {
            demo: true,
            description,
            timestamp: new Date().toISOString()
          }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown event type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Demo ${eventType} event generated successfully`,
      eventType,
      description
    });

  } catch (error) {
    console.error('Failed to generate demo event:', error);
    return NextResponse.json(
      { error: 'Failed to generate demo event' },
      { status: 500 }
    );
  }
}
/**
 * Security Patterns API Endpoint
 * Provides suspicious pattern detection for admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auditService } from '@/lib/services/audit.service';
import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { Permission } from '@/types/auth';

// Validation schema for time range
const timeRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

/**
 * POST /api/admin/security/patterns
 * Detect suspicious patterns in authentication data
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

    // Validate time range
    const validationResult = timeRangeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid time range parameters',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const timeRange = {
      startDate: new Date(validationResult.data.startDate),
      endDate: new Date(validationResult.data.endDate),
    };

    const patterns = await auditService.detectSuspiciousPatterns(timeRange);

    // Log admin access
    await auditService.logAdminAction({
      adminFirebaseUid: authResult.user.firebaseUid,
      action: 'VIEW_SUSPICIOUS_PATTERNS',
      targetResource: 'security_patterns',
      ipAddress:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      newValues: { timeRange, patternsFound: patterns.length },
    });

    return NextResponse.json(patterns);
  } catch (error) {
    console.error('Failed to detect suspicious patterns:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

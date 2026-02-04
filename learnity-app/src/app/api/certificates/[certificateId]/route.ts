/**
 * Individual Certificate API Routes
 * GET /api/certificates/[certificateId] - Get certificate details by ID
 *
 * Requirements covered:
 * - 10.2: Certificate with student name, course title, date, unique ID
 * - 10.5: Display completed courses in student profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { certificateService } from '@/lib/services/certificate.service';
import { CertificateError } from '@/lib/interfaces/certificate.interface';
import {
  createSuccessResponse,
  createErrorResponse,
  createInternalErrorResponse,
  createNotFoundErrorResponse,
} from '@/lib/utils/api-response.utils';

interface RouteParams {
  params: Promise<{ certificateId: string }>;
}

/**
 * GET /api/certificates/[certificateId]
 * Get certificate details by its unique certificate ID
 * This is a public endpoint for certificate verification
 * Requirements: 10.2
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { certificateId } = await params;

    if (!certificateId) {
      return createErrorResponse(
        'INVALID_CERTIFICATE_ID',
        'Certificate ID is required',
        undefined,
        400
      );
    }

    // Get certificate using service (public verification)
    const certificate = await certificateService.getCertificate(certificateId);

    if (!certificate) {
      return createNotFoundErrorResponse('Certificate');
    }

    return createSuccessResponse(
      {
        certificate,
        verified: true,
        verifiedAt: new Date().toISOString(),
      },
      'Certificate verified successfully'
    );
  } catch (error) {
    console.error('Error getting certificate:', error);

    if (error instanceof CertificateError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to get certificate');
  }
}

/**
 * Certificate Download API Route
 * GET /api/certificates/[certificateId]/download - Download certificate as PDF
 *
 * Requirements covered:
 * - 10.3: Allow students to download certificate as PDF
 */

import { NextRequest, NextResponse } from 'next/server';
import { certificateService } from '@/lib/services/certificate.service';
import { CertificateError } from '@/lib/interfaces/certificate.interface';
import {
  createErrorResponse,
  createInternalErrorResponse,
  createNotFoundErrorResponse,
} from '@/lib/utils/api-response.utils';

interface RouteParams {
  params: Promise<{ certificateId: string }>;
}

/**
 * GET /api/certificates/[certificateId]/download
 * Download certificate as PDF
 * Requirements: 10.3
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

    // First verify the certificate exists
    const certificate = await certificateService.getCertificate(certificateId);

    if (!certificate) {
      return createNotFoundErrorResponse('Certificate');
    }

    // Generate PDF
    const pdfBuffer =
      await certificateService.downloadCertificatePDF(certificateId);

    // Create filename from certificate details
    const studentName =
      `${certificate.student.firstName}_${certificate.student.lastName}`.replace(
        /\s+/g,
        '_'
      );
    const courseTitle = certificate.course.title
      .replace(/\s+/g, '_')
      .substring(0, 30);
    const filename = `Certificate_${courseTitle}_${studentName}.pdf`;

    // Return PDF as downloadable file
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error downloading certificate:', error);

    if (error instanceof CertificateError) {
      return createErrorResponse(
        error.code,
        error.message,
        undefined,
        error.statusCode
      );
    }

    return createInternalErrorResponse('Failed to download certificate');
  }
}

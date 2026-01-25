/**
 * Certificate Display Page
 * Public page to view and verify certificates
 *
 * Requirements covered:
 * - 10.2: Display certificate with student name, course title, date, unique ID
 * - 10.3: Download certificate as PDF
 * - 10.5: Share certificate
 */

import * as React from 'react';
import { notFound } from 'next/navigation';
import { certificateService } from '@/lib/services/certificate.service';
import { CertificatePageClient } from './CertificatePageClient';

interface CertificatePageProps {
  params: Promise<{
    certificateId: string;
  }>;
}

/**
 * Certificate Display Page
 * Public page accessible to anyone with the certificate ID
 * Requirements: 10.2, 10.3, 10.5
 */
export default async function CertificateViewPage({
  params,
}: CertificatePageProps) {
  const { certificateId } = await params;

  // Fetch certificate data
  const certificate = await certificateService.getCertificate(certificateId);

  // If certificate not found, show 404
  if (!certificate) {
    notFound();
  }

  // Prepare data for the component
  const studentName = `${certificate.student.firstName} ${certificate.student.lastName}`;

  // Type assertion for certificate properties that exist but aren't in the type
  const cert = certificate as typeof certificate & {
    certificateId: string;
    issuedAt: Date;
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4'>
      <CertificatePageClient
        certificateId={cert.certificateId}
        studentName={studentName}
        courseTitle={certificate.course.title}
        courseDescription={certificate.course.description}
        difficulty={certificate.course.difficulty}
        issuedAt={cert.issuedAt}
      />
    </div>
  );
}

/**
 * Generate metadata for the certificate page
 */
export async function generateMetadata({ params }: CertificatePageProps) {
  const { certificateId } = await params;

  try {
    const certificate = await certificateService.getCertificate(certificateId);

    if (!certificate) {
      return {
        title: 'Certificate Not Found',
      };
    }

    const studentName = `${certificate.student.firstName} ${certificate.student.lastName}`;

    return {
      title: `Certificate - ${certificate.course.title}`,
      description: `Certificate of completion for ${studentName} - ${certificate.course.title}`,
      openGraph: {
        title: `${studentName} completed ${certificate.course.title}`,
        description: `Certificate of completion issued by Learnity`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${studentName} completed ${certificate.course.title}`,
        description: `Certificate of completion issued by Learnity`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Certificate',
    };
  }
}

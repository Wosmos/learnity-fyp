/**
 * Certificate Page Client Component
 * Client-side wrapper for certificate page with download functionality
 *
 * Requirements covered:
 * - 10.3: Download certificate as PDF
 */

'use client';

import * as React from 'react';
import {
  CertificatePage,
  CertificatePageProps,
} from '@/components/courses/CertificatePage';
import { useToast } from '@/hooks/use-toast';

interface CertificatePageClientProps extends Omit<
  CertificatePageProps,
  'onDownload' | 'isDownloading'
> {}

/**
 * Client-side certificate page with download functionality
 * Requirements: 10.3
 */
export function CertificatePageClient(props: CertificatePageClientProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      // Call the download API endpoint
      const response = await fetch(
        `/api/certificates/${props.certificateId}/download`
      );

      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'certificate.pdf';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success!',
        description: 'Certificate downloaded successfully',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Error',
        description: 'Failed to download certificate. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <CertificatePage
      {...props}
      onDownload={handleDownload}
      isDownloading={isDownloading}
    />
  );
}

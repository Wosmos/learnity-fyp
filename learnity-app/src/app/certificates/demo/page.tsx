/**
 * Certificate Demo Page
 * For testing and demonstrating the CertificatePage component
 */

'use client';

import * as React from 'react';
import { CertificatePage } from '@/components/courses/CertificatePage';
import { useToast } from '@/hooks/use-toast';

export default function CertificateDemoPage() {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);

    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: 'Demo Mode',
      description: 'In production, this would download the PDF certificate',
    });

    setIsDownloading(false);
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4'>
      <div className='max-w-4xl mx-auto mb-8'>
        <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4'>
          <h2 className='text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2'>
            Demo Mode
          </h2>
          <p className='text-sm text-yellow-700 dark:text-yellow-300'>
            This is a demonstration of the CertificatePage component. In
            production, this would display a real certificate fetched from the
            database and allow downloading as PDF.
          </p>
        </div>
      </div>

      <CertificatePage
        certificateId='CERT-DEMO1234-5678'
        studentName='John Doe'
        courseTitle='Introduction to React and Next.js'
        courseDescription='Learn the fundamentals of React and Next.js, including components, hooks, routing, and server-side rendering.'
        difficulty='INTERMEDIATE'
        issuedAt={new Date()}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
    </div>
  );
}

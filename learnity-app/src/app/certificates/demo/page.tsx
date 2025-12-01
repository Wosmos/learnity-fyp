/**
 * Certificate Demo Page
 * For testing and demonstrating the CertificatePage component
 * This demo uses a real certificate from the database if available
 */

"use client";

import * as React from "react";
import { CertificatePage } from "@/components/courses/CertificatePage";
import { useToast } from "@/hooks/use-toast";

export default function CertificateDemoPage() {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [certificateId, setCertificateId] = React.useState<string>("");
  const [useRealCertificate, setUseRealCertificate] = React.useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      // If using a real certificate ID, download it
      if (useRealCertificate && certificateId) {
        const response = await fetch(`/api/certificates/${certificateId}/download`);
        
        if (!response.ok) {
          throw new Error('Failed to download certificate');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
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
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Success!",
          description: "Certificate downloaded successfully",
        });
      } else {
        // Demo mode - just show a message
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: "Demo Mode",
          description: "Enter a real certificate ID above to test actual PDF download",
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download certificate. Make sure the certificate ID is valid.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto mb-8 space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Demo Mode
          </h2>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
            This is a demonstration of the CertificatePage component. You can test with mock data or
            enter a real certificate ID to download an actual PDF.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useReal"
                checked={useRealCertificate}
                onChange={(e) => setUseRealCertificate(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="useReal" className="text-sm text-yellow-700 dark:text-yellow-300">
                Use real certificate ID for download
              </label>
            </div>
            
            {useRealCertificate && (
              <div className="space-y-2">
                <label htmlFor="certId" className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Certificate ID:
                </label>
                <input
                  type="text"
                  id="certId"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="CERT-XXXXXXXX-XXXX"
                  className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Enter a valid certificate ID from your database to test actual PDF download
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CertificatePage
        certificateId={useRealCertificate && certificateId ? certificateId : "CERT-DEMO1234-5678"}
        studentName="John Doe"
        courseTitle="Introduction to React and Next.js"
        courseDescription="Learn the fundamentals of React and Next.js, including components, hooks, routing, and server-side rendering."
        difficulty="INTERMEDIATE"
        issuedAt={new Date()}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
    </div>
  );
}

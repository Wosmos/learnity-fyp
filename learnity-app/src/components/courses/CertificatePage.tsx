/**
 * CertificatePage Component
 * Displays a certificate with download and share options
 *
 * Requirements covered:
 * - 10.2: Certificate display with student name, course title, date, unique ID
 * - 10.3: Download PDF button
 * - 10.5: Share options
 */

'use client';

import * as React from 'react';
import {
  Download,
  Share2,
  Award,
  Calendar,
  CheckCircle,
  ExternalLink,
  Copy,
  Twitter,
  Linkedin,
  Facebook,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Difficulty badge color mapping
const difficultyColors: Record<string, string> = {
  BEGINNER:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INTERMEDIATE:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  ADVANCED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export interface CertificatePageProps {
  certificateId: string;
  studentName: string;
  courseTitle: string;
  courseDescription?: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  issuedAt: Date;
  className?: string;
  onDownload?: () => void;
  isDownloading?: boolean;
}

/**
 * CertificatePage Component
 * Displays certificate details with download and share functionality
 * Requirements: 10.2, 10.3, 10.5
 */
export function CertificatePage({
  certificateId,
  studentName,
  courseTitle,
  courseDescription,
  difficulty,
  issuedAt,
  className,
  onDownload,
  isDownloading = false,
}: CertificatePageProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = React.useState(false);

  // Format the issued date
  const formattedDate = new Date(issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Certificate verification URL
  const verificationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/certificates/${certificateId}`
      : '';

  // Handle copy certificate ID
  const handleCopyCertificateId = async () => {
    try {
      await navigator.clipboard.writeText(certificateId);
      setIsCopied(true);
      toast({
        title: 'Copied!',
        description: 'Certificate ID copied to clipboard',
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy certificate ID',
        variant: 'destructive',
      });
    }
  };

  // Handle copy verification link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      toast({
        title: 'Copied!',
        description: 'Verification link copied to clipboard',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy verification link',
        variant: 'destructive',
      });
    }
  };

  // Handle social media sharing
  const handleShare = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    const shareText = `I just completed "${courseTitle}" on Learnity! 🎓`;
    const shareUrl = verificationUrl;

    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  // Handle native share (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Certificate',
          text: `I just completed "${courseTitle}" on Learnity!`,
          url: verificationUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.error('Share failed:', error);
      }
    }
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto space-y-6', className)}>
      {/* Certificate Display Card */}
      <Card variant='elevated' className='overflow-hidden'>
        {/* Decorative Header */}
        <div className='h-2 bg-linear-to-r from-blue-600 via-purple-600 to-blue-600' />

        <CardContent className='p-8 md:p-12'>
          {/* Certificate Icon and Title */}
          <div className='flex flex-col items-center text-center space-y-6'>
            {/* Award Icon */}
            <div className='relative'>
              <div className='absolute inset-0 bg-primary/20 blur-2xl rounded-full' />
              <div className='relative bg-linear-to-br from-blue-600 to-purple-600 p-6 rounded-full'>
                <Award className='h-16 w-16 text-white' />
              </div>
            </div>

            {/* Certificate Title */}
            <div className='space-y-2'>
              <h1 className='text-3xl md:text-4xl font-bold text-primary'>
                Certificate of Completion
              </h1>
              <p className='text-muted-foreground'>This is to certify that</p>
            </div>

            {/* Student Name */}
            <div className='space-y-2'>
              <h2 className='text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                {studentName}
              </h2>
              <p className='text-muted-foreground'>
                has successfully completed the course
              </p>
            </div>

            {/* Course Title */}
            <div className='space-y-3 max-w-2xl'>
              <h3 className='text-2xl md:text-3xl font-bold text-foreground'>
                {courseTitle}
              </h3>
              {courseDescription && (
                <p className='text-sm text-muted-foreground line-clamp-2'>
                  {courseDescription}
                </p>
              )}

              {/* Difficulty Badge */}
              <div className='flex justify-center'>
                <Badge
                  className={cn(
                    'text-sm font-medium px-4 py-1',
                    difficultyColors[difficulty]
                  )}
                >
                  Level:{' '}
                  {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
                </Badge>
              </div>
            </div>

            <Separator className='my-6' />

            {/* Issue Date and Certificate ID */}
            <div className='flex flex-col md:flex-row items-center gap-6 text-sm text-muted-foreground'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                <span>Issued on {formattedDate}</span>
              </div>
              <div className='hidden md:block'>•</div>
              <div className='flex items-center gap-2'>
                <CheckCircle className='h-4 w-4 text-green-600' />
                <span className='font-mono'>{certificateId}</span>
                <Button
                  variant='ghost'
                  size='icon-sm'
                  onClick={handleCopyCertificateId}
                  className='h-6 w-6'
                >
                  <Copy
                    className={cn('h-3 w-3', isCopied && 'text-green-600')}
                  />
                </Button>
              </div>
            </div>

            {/* Verification Note */}
            <p className='text-xs text-muted-foreground italic'>
              This certificate can be verified at learnity.com/verify
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Certificate Actions</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Download Button */}
          <div className='flex flex-col sm:flex-row gap-3'>
            <Button
              onClick={onDownload}
              disabled={isDownloading}
              className='flex-1'
              size='lg'
            >
              <Download className='h-5 w-5' />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </Button>

            {/* Share Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='lg'
                  className='flex-1 sm:flex-none'
                >
                  <Share2 className='h-5 w-5' />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className='h-4 w-4' />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('twitter')}>
                  <Twitter className='h-4 w-4' />
                  Share on Twitter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                  <Linkedin className='h-4 w-4' />
                  Share on LinkedIn
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('facebook')}>
                  <Facebook className='h-4 w-4' />
                  Share on Facebook
                </DropdownMenuItem>
                {typeof window !== 'undefined' && 'share' in navigator && (
                  <DropdownMenuItem onClick={handleNativeShare}>
                    <Share2 className='h-4 w-4' />
                    More Options
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Verification Link */}
          <div className='p-4 bg-muted rounded-lg space-y-2'>
            <p className='text-sm font-medium'>Verification Link</p>
            <div className='flex items-center gap-2'>
              <code className='flex-1 text-xs bg-background px-3 py-2 rounded border truncate'>
                {verificationUrl}
              </code>
              <Button variant='outline' size='icon-sm' onClick={handleCopyLink}>
                <Copy className='h-4 w-4' />
              </Button>
              <Button variant='outline' size='icon-sm' asChild>
                <a
                  href={verificationUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <ExternalLink className='h-4 w-4' />
                </a>
              </Button>
            </div>
            <p className='text-xs text-muted-foreground'>
              Share this link to allow others to verify your certificate
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Platform Branding */}
      <div className='text-center space-y-2 py-6'>
        <h4 className='text-xl font-bold text-primary'>Learnity</h4>
        <p className='text-sm text-muted-foreground'>
          Empowering Learning, One Course at a Time
        </p>
      </div>
    </div>
  );
}

export default CertificatePage;

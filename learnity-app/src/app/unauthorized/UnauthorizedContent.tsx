/**
 * Unauthorized Content Component
 * Client component that uses useSearchParams
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  Home,
  ArrowLeft,
  Shield,
  User,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClientAuth } from '@/hooks/useClientAuth';
import { UserRole } from '@/types/auth';
import { auditLogger } from '@/lib/services/audit-logger.service';

export function UnauthorizedContent() {
  const { user, claims } = useClientAuth();
  const searchParams = useSearchParams();

  // Derive values directly instead of using state
  const attemptedResource =
    searchParams.get('resource') ||
    (typeof window !== 'undefined' ? document.referrer : '') ||
    'unknown resource';
  const userRole = claims?.role || null;

  useEffect(() => {
    // Only log the unauthorized access attempt
    if (user && claims) {
      auditLogger.logAccessControlViolation(
        user.uid,
        user.email || '',
        claims.role,
        attemptedResource,
        UserRole.ADMIN,
        'unauthorized_page_access'
      );
    }
  }, [user, claims, attemptedResource]);

  const getRoleIcon = (role: UserRole | null) => {
    switch (role) {
      case UserRole.STUDENT:
        return <GraduationCap className='h-4 w-4' />;
      case UserRole.TEACHER:
        return <BookOpen className='h-4 w-4' />;
      case UserRole.ADMIN:
        return <Shield className='h-4 w-4' />;
      case UserRole.PENDING_TEACHER:
        return <User className='h-4 w-4' />;
      default:
        return <User className='h-4 w-4' />;
    }
  };

  const getRoleColor = (role: UserRole | null) => {
    switch (role) {
      case UserRole.STUDENT:
        return 'bg-slate-100 text-blue-800';
      case UserRole.TEACHER:
        return 'bg-green-100 text-green-800';
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-800';
      case UserRole.PENDING_TEACHER:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendedAction = () => {
    if (!userRole) {
      return {
        message: 'Please log in to access your dashboard.',
        action: 'Login',
        href: '/auth/login',
      };
    }

    switch (userRole) {
      case UserRole.STUDENT:
        return {
          message: 'Access your student dashboard to continue learning.',
          action: 'Go to Student Dashboard',
          href: '/dashboard/student',
        };
      case UserRole.TEACHER:
        return {
          message: 'Access your teacher dashboard to manage your sessions.',
          action: 'Go to Teacher Dashboard',
          href: '/dashboard/teacher',
        };
      case UserRole.ADMIN:
        return {
          message: 'Access the admin panel to manage the platform.',
          action: 'Go to Admin Panel',
          href: '/admin',
        };
      case UserRole.PENDING_TEACHER:
        return {
          message:
            'Check your application status and complete any pending requirements.',
          action: 'View Application Status',
          href: '/dashboard/teacher/pending',
        };
      default:
        return {
          message: 'Complete your profile setup to access the platform.',
          action: 'Complete Setup',
          href: '/welcome',
        };
    }
  };

  const recommendedAction = getRecommendedAction();

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>
        <Card>
          <CardHeader className='text-center'>
            <div className='mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
              <AlertTriangle className='h-6 w-6 text-red-600' />
            </div>
            <CardTitle className='text-xl'>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this resource
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* User Role Display */}
            {userRole && (
              <div className='flex items-center justify-center'>
                <Badge className={getRoleColor(userRole)}>
                  {getRoleIcon(userRole)}
                  <span className='ml-1'>{userRole.replace('_', ' ')}</span>
                </Badge>
              </div>
            )}

            {/* Error Details */}
            <div className='text-center text-sm text-gray-600 space-y-2'>
              <p>
                {userRole
                  ? `Your current role (${userRole.replace('_', ' ')}) doesn't have access to this resource.`
                  : 'You need to be logged in with the appropriate permissions.'}
              </p>
              {attemptedResource &&
                attemptedResource !== 'unknown resource' && (
                  <p className='text-xs text-gray-500'>
                    Attempted to access: {attemptedResource}
                  </p>
                )}
            </div>

            {/* Recommended Action */}
            <div className='bg-slate-50 border border-blue-200 rounded-lg p-3'>
              <p className='text-sm text-blue-800 mb-2'>
                {recommendedAction.message}
              </p>
              <Link href={recommendedAction.href}>
                <Button className='w-full' size='sm'>
                  {recommendedAction.action}
                </Button>
              </Link>
            </div>

            {/* Navigation Options */}
            <div className='flex flex-col sm:flex-row gap-3'>
              <Button
                variant='outline'
                className='flex-1'
                onClick={() => window.history.back()}
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
                Go Back
              </Button>
              <Link href='/' className='flex-1'>
                <Button variant='outline' className='w-full'>
                  <Home className='h-4 w-4 mr-2' />
                  Home
                </Button>
              </Link>
            </div>

            {/* Contact Support */}
            <div className='text-center text-xs text-gray-500 pt-2 border-t'>
              <p>If you believe this is an error, please contact support.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

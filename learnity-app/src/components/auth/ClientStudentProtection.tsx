'use client';

/**
 * Client-Side Student Protection Component
 * Protects student-only routes and ensures proper role-based access control
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Shield, AlertTriangle, GraduationCap } from 'lucide-react';
import { auth } from '@/lib/config/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { UserRole } from '@/types/auth';
import { auditLogger } from '@/lib/services/audit-logger.service';

interface ClientStudentProtectionProps {
  children: React.ReactNode;
}

export function ClientStudentProtection({
  children,
}: ClientStudentProtectionProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Get the user's custom claims to check their role
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const claims = idTokenResult.claims;
          const role = claims.role as UserRole;

          console.log('Student protection - User claims:', claims);
          setUserRole(role);

          if (role === UserRole.STUDENT) {
            setIsAuthorized(true);
            // Log successful access for audit
            auditLogger.logDashboardAccess(
              firebaseUser.uid,
              firebaseUser.email || '',
              role,
              'student'
            );
          } else {
            console.log('Access denied - User is not a student, role:', role);
            setIsAuthorized(false);

            // Log unauthorized access attempt
            auditLogger.logUnauthorizedAccess(
              firebaseUser.uid,
              firebaseUser.email || '',
              role,
              '/dashboard/student',
              UserRole.STUDENT
            );

            // Redirect to appropriate dashboard or unauthorized page
            setTimeout(() => {
              if (role === UserRole.TEACHER) {
                router.push('/dashboard/teacher');
              } else if (role === UserRole.ADMIN) {
                router.push('/admin');
              } else if (role === UserRole.PENDING_TEACHER) {
                router.push('/dashboard/teacher/pending');
              } else {
                router.push('/unauthorized');
              }
            }, 2000);
          }
        } catch (error) {
          console.error('Error checking student authorization:', error);
          setIsAuthorized(false);
          setTimeout(() => {
            router.push('/unauthorized');
          }, 2000);
        }
      } else {
        console.log('No user authenticated for student dashboard');
        setIsAuthorized(false);
        setTimeout(() => {
          router.push('/auth/login?redirect=/dashboard/student');
        }, 2000);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <StudentLoadingFallback />;
  }

  if (!user) {
    return <StudentAuthRequiredFallback />;
  }

  if (!isAuthorized) {
    return <StudentUnauthorizedFallback userRole={userRole} />;
  }

  return <>{children}</>;
}

/**
 * Loading fallback component
 */
function StudentLoadingFallback() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardContent className='pt-6'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Verifying Access
            </h3>
            <p className='text-gray-500'>
              Checking your student permissions...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Authentication required fallback
 */
function StudentAuthRequiredFallback() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardContent className='pt-6'>
          <div className='text-center'>
            <GraduationCap className='h-12 w-12 text-blue-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Authentication Required
            </h3>
            <p className='text-gray-500 mb-4'>
              You need to be logged in to access the student dashboard.
            </p>
            <p className='text-sm text-gray-400'>Redirecting to login...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Unauthorized access fallback
 */
function StudentUnauthorizedFallback({
  userRole,
}: {
  userRole: UserRole | null;
}) {
  const getRedirectMessage = () => {
    switch (userRole) {
      case UserRole.TEACHER:
        return 'Redirecting to teacher dashboard...';
      case UserRole.ADMIN:
        return 'Redirecting to admin panel...';
      case UserRole.PENDING_TEACHER:
        return 'Redirecting to application status...';
      default:
        return 'Student privileges required.';
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardContent className='pt-6'>
          <div className='text-center'>
            <AlertTriangle className='h-12 w-12 text-red-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Access Denied
            </h3>
            <p className='text-gray-500 mb-4'>
              You don't have permission to access the student dashboard.
            </p>
            <p className='text-sm text-gray-400'>{getRedirectMessage()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

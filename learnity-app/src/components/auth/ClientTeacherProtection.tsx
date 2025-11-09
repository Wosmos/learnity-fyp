'use client';

/**
 * Client-Side Teacher Protection Component
 * Protects teacher-only routes and ensures proper role-based access control
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle, BookOpen } from 'lucide-react';
import { UserRole } from '@/types/auth';
import { auditLogger } from '@/lib/services/audit-logger.service';

interface ClientTeacherProtectionProps {
  children: React.ReactNode;
}

export function ClientTeacherProtection({ children }: ClientTeacherProtectionProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get the user's custom claims to check their role
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const claims = idTokenResult.claims;
          const role = claims.role as UserRole;
          
          console.log('Teacher protection - User claims:', claims);
          setUserRole(role);
          
          // Allow both TEACHER and ADMIN roles to access teacher dashboard
          if (role === UserRole.TEACHER || role === UserRole.ADMIN) {
            setIsAuthorized(true);
            // Log successful access for audit
            auditLogger.logDashboardAccess(
              firebaseUser.uid,
              firebaseUser.email || '',
              role,
              'teacher'
            );
          } else {
            console.log('Access denied - User is not a teacher or admin, role:', role);
            setIsAuthorized(false);
            
            // Log unauthorized access attempt
            auditLogger.logUnauthorizedAccess(
              firebaseUser.uid,
              firebaseUser.email || '',
              role,
              '/dashboard/teacher',
              UserRole.TEACHER
            );
            
            // Redirect to appropriate dashboard or unauthorized page
            setTimeout(() => {
              if (role === UserRole.STUDENT) {
                router.push('/dashboard/student');
              } else if (role === UserRole.PENDING_TEACHER) {
                router.push('/application/status');
              } else {
                router.push('/unauthorized');
              }
            }, 2000);
          }
        } catch (error) {
          console.error('Error checking teacher authorization:', error);
          setIsAuthorized(false);
          setTimeout(() => {
            router.push('/unauthorized');
          }, 2000);
        }
      } else {
        console.log('No user authenticated for teacher dashboard');
        setIsAuthorized(false);
        setTimeout(() => {
          router.push('/auth/login?redirect=/dashboard/teacher');
        }, 2000);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <TeacherLoadingFallback />;
  }

  if (!user) {
    return <TeacherAuthRequiredFallback />;
  }

  if (!isAuthorized) {
    return <TeacherUnauthorizedFallback userRole={userRole} />;
  }

  return <>{children}</>;
}

/**
 * Loading fallback component
 */
function TeacherLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Verifying Access</h3>
            <p className="text-gray-500">
              Checking your teacher permissions...
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
function TeacherAuthRequiredFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-500 mb-4">
              You need to be logged in to access the teacher dashboard.
            </p>
            <p className="text-sm text-gray-400">
              Redirecting to login...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Unauthorized access fallback
 */
function TeacherUnauthorizedFallback({ userRole }: { userRole: UserRole | null }) {
  const getRedirectMessage = () => {
    switch (userRole) {
      case UserRole.STUDENT:
        return "Redirecting to student dashboard...";
      case UserRole.PENDING_TEACHER:
        return "Redirecting to application status...";
      default:
        return "Teacher privileges required.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500 mb-4">
              You don't have permission to access the teacher dashboard.
            </p>
            <p className="text-sm text-gray-400">
              {getRedirectMessage()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
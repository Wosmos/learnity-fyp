'use client';

/**
 * Client-Side Admin Protection Component
 * Simple client-side protection that doesn't import Firebase Admin SDK
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';
import { auditLogger } from '@/lib/services/audit-logger.service';
import { UserRole } from '@/types/auth';

interface ClientAdminProtectionProps {
  children: React.ReactNode;
}

export function ClientAdminProtection({ children }: ClientAdminProtectionProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get the user's custom claims to check if they're an admin
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const claims = idTokenResult.claims;
          
          console.log('User claims:', claims); // Debug log
          
          if (claims.role === 'ADMIN') {
            setIsAdmin(true);
            // Log successful admin access
            auditLogger.logDashboardAccess(
              firebaseUser.uid,
              firebaseUser.email || '',
              UserRole.ADMIN,
              'admin'
            );
          } else {
            console.log('User is not admin, role:', claims.role);
            setIsAdmin(false);
            // Log unauthorized access attempt
            auditLogger.logUnauthorizedAccess(
              firebaseUser.uid,
              firebaseUser.email || '',
              claims.role as UserRole,
              '/admin',
              UserRole.ADMIN
            );
            // Don't redirect immediately, let user see the error
            setTimeout(() => {
              router.push('/unauthorized');
            }, 2000);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setTimeout(() => {
            router.push('/unauthorized');
          }, 2000);
        }
      } else {
        console.log('No user authenticated');
        setIsAdmin(false);
        setTimeout(() => {
          router.push('/auth/login?redirect=/admin');
        }, 2000);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <AdminLoadingFallback />;
  }

  if (!user) {
    return <AdminAuthRequiredFallback />;
  }

  if (!isAdmin) {
    return <AdminUnauthorizedFallback />;
  }

  return <>{children}</>;
}

/**
 * Loading fallback component
 */
function AdminLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Verifying Access</h3>
            <p className="text-gray-500">
              Checking your admin permissions...
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
function AdminAuthRequiredFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-500 mb-4">
              You need to be logged in to access the admin panel.
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
function AdminUnauthorizedFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500 mb-4">
              You don't have permission to access the admin panel.
            </p>
            <p className="text-sm text-gray-400">
              Admin privileges required.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
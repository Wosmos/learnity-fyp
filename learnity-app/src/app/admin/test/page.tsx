
/**
 * Admin Test Page
 * Simple test page to verify admin protection is working
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClientAuth } from '@/hooks/useClientAuth';
import { CheckCircle, User, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminTestPage() {
  const { user, loading, isAdmin, isAuthenticated } = useClientAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Test Page</h1>
          <p className="text-gray-600">Testing admin authentication and protection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Authentication Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-4 w-4 ${isAuthenticated ? 'text-green-500' : 'text-red-500'}`} />
                <span>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Shield className={`h-4 w-4 ${isAdmin ? 'text-green-500' : 'text-red-500'}`} />
                <span>Admin Role: {isAdmin ? 'Yes' : 'No'}</span>
              </div>

              {user && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm font-medium">User Email:</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm font-medium mt-2">User ID:</p>
                  <p className="text-sm text-gray-600 font-mono">{user.uid}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Navigation</CardTitle>
              <CardDescription>
                Test different admin features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin">
                <Button variant="outline" className="w-full justify-start">
                  Security Dashboard
                </Button>
              </Link>
              <Link href="/admin/audit-logs">
                <Button variant="outline" className="w-full justify-start">
                  Audit Logs
                </Button>
              </Link>
              <Link href="/admin/security-events">
                <Button variant="outline" className="w-full justify-start">
                  Security Events
                </Button>
              </Link>
              <Link href="/admin/demo">
                <Button variant="outline" className="w-full justify-start">
                  Generate Test Data
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Status Messages */}
        <div className="mt-8">
          {!isAuthenticated && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-800">
                  ❌ You are not authenticated. Please log in to access admin features.
                </p>
              </CardContent>
            </Card>
          )}

          {isAuthenticated && !isAdmin && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <p className="text-orange-800">
                  ⚠️ You are authenticated but don't have admin privileges.
                </p>
              </CardContent>
            </Card>
          )}

          {isAuthenticated && isAdmin && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <p className="text-green-800">
                  ✅ You have admin access! All admin features should be available.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

/**
 * Admin Auth Test Page
 * Debug authentication state and claims
 */

import { useAuth } from '@/hooks/useAuth.unified';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, User, Shield, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminAuthTestPage() {
  const { user, loading, isAuthenticated, claims, error, refreshClaims } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication Test</h1>
          <p className="text-gray-600">Debug authentication state and claims</p>
        </div>

        {/* Auth State Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Authentication State</span>
            </CardTitle>
            <CardDescription>Current authentication status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {loading ? (
                    <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                </div>
                <p className="font-medium">Loading</p>
                <Badge variant={loading ? "default" : "secondary"}>
                  {loading ? "Loading..." : "Complete"}
                </Badge>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {isAuthenticated ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  )}
                </div>
                <p className="font-medium">Authenticated</p>
                <Badge variant={isAuthenticated ? "default" : "destructive"}>
                  {isAuthenticated ? "Yes" : "No"}
                </Badge>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {user ? (
                    <User className="h-6 w-6 text-blue-500" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <p className="font-medium">User Object</p>
                <Badge variant={user ? "default" : "secondary"}>
                  {user ? "Present" : "None"}
                </Badge>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {claims ? (
                    <Shield className="h-6 w-6 text-purple-500" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <p className="font-medium">Claims</p>
                <Badge variant={claims ? "default" : "secondary"}>
                  {claims ? "Present" : "None"}
                </Badge>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="font-medium text-red-800">Error</p>
                </div>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Details */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle>User Details</CardTitle>
              <CardDescription>Firebase user information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">UID</p>
                    <p className="text-sm text-gray-900 font-mono">{user.uid}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email Verified</p>
                    <Badge variant={user.emailVerified ? "default" : "destructive"}>
                      {user.emailVerified ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Display Name</p>
                    <p className="text-sm text-gray-900">{user.displayName || "Not set"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Claims Details */}
        {claims && (
          <Card>
            <CardHeader>
              <CardTitle>Custom Claims</CardTitle>
              <CardDescription>User role and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <Badge className="mt-1">
                      {claims.role}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Profile Complete</p>
                    <Badge variant={claims.profileComplete ? "default" : "secondary"}>
                      {claims.profileComplete ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Profile ID</p>
                    <p className="text-sm text-gray-900 font-mono">{claims.profileId || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Login</p>
                    <p className="text-sm text-gray-900">
                      {claims.lastLoginAt ? new Date(claims.lastLoginAt).toLocaleString() : "Not set"}
                    </p>
                  </div>
                </div>
                
                {claims.permissions && claims.permissions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Permissions</p>
                    <div className="flex flex-wrap gap-2">
                      {claims.permissions.map((permission, index) => (
                        <Badge key={index} variant="outline">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Test authentication functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button onClick={refreshClaims} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Claims
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Raw Data */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Data</CardTitle>
            <CardDescription>Complete authentication state (for debugging)</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto">
              {JSON.stringify({
                loading,
                isAuthenticated,
                error,
                user: user ? {
                  uid: user.uid,
                  email: user.email,
                  emailVerified: user.emailVerified,
                  displayName: user.displayName,
                  photoURL: user.photoURL
                } : null,
                claims
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
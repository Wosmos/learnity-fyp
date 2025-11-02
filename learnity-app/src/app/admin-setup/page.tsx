'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Shield } from 'lucide-react';

export default function AdminSetupPage() {
  const [email, setEmail] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handlePromoteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/auth/promote-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, secretKey }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message || 'Admin role set successfully!' });
      } else {
        setResult({ success: false, message: data.error || 'Failed to promote user' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-red-600" />
            <CardTitle>Admin Setup</CardTitle>
          </div>
          <CardDescription>
            Promote a user to admin role (Development Only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePromoteAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secretKey">Setup Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                placeholder="Enter secret key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Default: &quot;change-me-in-production&quot; (set in .env.local as ADMIN_SETUP_SECRET)
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Promote to Admin'}
            </Button>
          </form>

          {result && (
            <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start space-x-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.message}
                  </p>
                  {result.success && (
                    <p className="text-xs text-green-700 mt-2">
                      Note: Since Firebase Admin SDK is not configured, you need to manually set custom claims in Firebase Console.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">Manual Setup Instructions:</h4>
            <ol className="text-xs text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Go to Firebase Console → Authentication → Users</li>
              <li>Click on the user you want to promote</li>
              <li>Go to &quot;Custom claims&quot; tab</li>
              <li>Add: {`{"role": "ADMIN", "permissions": ["view:admin_panel", "manage:users"]}`}</li>
              <li>User must logout and login again to see changes</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

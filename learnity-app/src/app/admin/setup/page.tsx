'use client';

/**
 * Admin Setup Page
 * Temporary page for promoting users to admin role during development
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Shield, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminSetupPage() {
  const [email, setEmail] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const { toast } = useToast();

  const handlePromoteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !secretKey) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch('/api/auth/promote-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, secretKey }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, ...data });
        toast({
          title: "Success",
          description: `Successfully promoted ${email} to admin role.`,
        });
        setEmail('');
        setSecretKey('');
      } else {
        setResult({ success: false, ...data });
        toast({
          title: "Error",
          description: data.error || "Failed to promote user to admin.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Admin promotion error:', error);
      setResult({ 
        success: false, 
        error: 'Network error occurred',
        details: (error as Error).message 
      });
      toast({
        title: "Error",
        description: "Network error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Setup</h1>
          <p className="text-gray-600">Promote a user to admin role for development</p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Development Only:</strong> This page is for development purposes only. 
            Remove this endpoint before deploying to production.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Promote User to Admin</span>
            </CardTitle>
            <CardDescription>
              Enter the email of a registered user to promote them to admin role
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
                <p className="text-sm text-gray-500">
                  The user must already be registered in the system
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Key</Label>
                <Input
                  id="secretKey"
                  type="password"
                  placeholder="Enter admin setup secret"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  Check your environment variables for ADMIN_SETUP_SECRET
                </p>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Promoting..." : "Promote to Admin"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Result</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">{result.message}</p>
                    {result.userUid && (
                      <p className="text-green-700 text-sm mt-1">
                        User UID: <code className="bg-green-100 px-1 rounded">{result.userUid}</code>
                      </p>
                    )}
                  </div>
                  
                  {result.note && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{result.note}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    <p><strong>Next steps:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 mt-2">
                      <li>The user should log out and log back in</li>
                      <li>Or refresh their browser to get new claims</li>
                      <li>They should now have access to admin features</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-medium">{result.error}</p>
                    {result.details && (
                      <p className="text-red-700 text-sm mt-1">{result.details}</p>
                    )}
                  </div>
                  
                  {result.instructions && (
                    <div className="text-sm text-gray-600">
                      <p><strong>Instructions:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 mt-2">
                        {result.instructions.map((instruction: string, index: number) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Manual Setup Alternative</CardTitle>
            <CardDescription>
              If the API doesn't work, you can manually set admin claims
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
'use client';

/**
 * Admin Demo Page
 * Demonstrates audit logging functionality by generating test events
 */

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedFetch';

export default function AdminDemoPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const api = useAuthenticatedApi();

  const generateTestEvents = async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // Generate various test audit events
      const testEvents = [
        {
          type: 'login_success',
          description: 'Successful login event'
        },
        {
          type: 'login_failure',
          description: 'Failed login attempt'
        },
        {
          type: 'security_event',
          description: 'Suspicious activity detected'
        },
        {
          type: 'admin_action',
          description: 'Admin performed action'
        }
      ];

      for (const event of testEvents) {
        try {
          await api.post('/api/admin/demo/generate-event', {
            eventType: event.type,
            description: event.description
          });
          setResults(prev => [...prev, `✅ Generated ${event.description}`]);
        } catch (err) {
          setResults(prev => [...prev, `❌ Error generating ${event.description}`]);
        }

        // Add small delay between events
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setResults(prev => [...prev, '🎉 All test events generated successfully!']);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return (
    <AdminLayout

    >
      <div className="space-y-6">
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Logging Demo</CardTitle>
            <CardDescription>
              This demo generates test audit events to showcase the audit logging system.
              Click the button below to generate sample events, then view them in the Audit Logs section.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">What this demo does:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Generates successful login events</li>
                  <li>• Creates failed login attempts</li>
                  <li>• Simulates security events</li>
                  <li>• Records admin actions</li>
                </ul>
              </div>

              <Button
                onClick={generateTestEvents}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Events...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate Test Audit Events
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generation Results</CardTitle>
              <CardDescription>
                Status of test event generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {result}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              After generating test events, explore the audit logging features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/audit-logs">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div className="text-center">
                    <div className="font-medium">View Audit Logs</div>
                    <div className="text-xs text-gray-500">See all authentication events</div>
                  </div>
                </Button>
              </Link>

              <Link href="/admin/security-events">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  <div className="text-center">
                    <div className="font-medium">Security Events</div>
                    <div className="text-xs text-gray-500">Monitor security incidents</div>
                  </div>
                </Button>
              </Link>

              <Link href="/admin">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <Play className="h-6 w-6 text-blue-600" />
                  <div className="text-center">
                    <div className="font-medium">Security Dashboard</div>
                    <div className="text-xs text-gray-500">Overview and analytics</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
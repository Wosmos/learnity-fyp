
/**
 * Admin Security Events Page
 * Dedicated page for monitoring security events and threats
 */


import { SecurityEventsViewer } from '@/components/admin/SecurityEventsViewer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function SecurityEventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Security Events</h1>
                <p className="text-sm text-gray-500">Monitor security threats and suspicious activities</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SecurityEventsViewer />
      </div>
    </div>
  );
}
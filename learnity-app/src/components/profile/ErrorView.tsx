'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorViewProps {
  message: string;
  timestamp: number;
  isFetching: boolean;
  onRetry: () => void;
}

export function ErrorView({ message, timestamp, isFetching, onRetry }: ErrorViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle>Profile Loading Error</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">{message}</p>
          <Button
            onClick={onRetry}
            disabled={isFetching}
            className="w-full"
          >
            {isFetching ? 'Retrying...' : 'Try Again'}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Last attempt: {new Date(timestamp).toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

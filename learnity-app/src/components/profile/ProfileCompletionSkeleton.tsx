/**
 * Profile Completion Banner Skeleton
 * Loading skeleton for ProfileCompletionBanner component
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function ProfileCompletionSkeleton() {
  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <CardContent className="pt-6">
        <div className="space-y-6 animate-pulse">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="text-right">
              <div className="h-12 w-16 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-16 mt-1"></div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 rounded w-12"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>

          {/* Feature Unlocks */}
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Feature Unlock */}
          <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-10 w-10 bg-white rounded-lg"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="h-9 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

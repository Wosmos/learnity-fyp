/**
 * Mobile Authentication Layout Component
 * Provides mobile-optimized layout for authentication flows
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu } from 'lucide-react';

export interface MobileAuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  headerActions?: React.ReactNode;
  className?: string;
}

export const MobileAuthLayout: React.FC<MobileAuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBack,
  headerActions,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 ${className}`}>
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            {showBackButton && onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2 -ml-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            
            {title && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600">{subtitle}</p>
                )}
              </div>
            )}
          </div>
          
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 lg:py-12">
        {/* Desktop Header (hidden on mobile) */}
        <div className="hidden lg:block text-center mb-8">
          {title && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              {subtitle && (
                <p className="text-lg text-gray-600">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="w-full max-w-md mx-auto lg:max-w-2xl">
          {/* Mobile-optimized card */}
          <div className="lg:hidden">
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-0">
                {children}
              </CardContent>
            </Card>
          </div>

          {/* Desktop card */}
          <div className="hidden lg:block">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                {children}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Safe Area */}
      <div className="h-safe-area-inset-bottom lg:hidden" />
    </div>
  );
};

export default MobileAuthLayout;
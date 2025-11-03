/**
 * Reusable Loading Button Component
 * Common loading button with spinner for auth forms
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormLoadingButtonProps {
  isLoading: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onClick?: () => void;
}

export function FormLoadingButton({
  isLoading,
  disabled = false,
  children,
  loadingText,
  type = 'submit',
  variant = 'default',
  size = 'default',
  className = '',
  onClick
}: FormLoadingButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      disabled={isLoading || disabled}
      className={`${className} ${isLoading ? 'cursor-not-allowed' : ''}`}
      onClick={onClick}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? (loadingText || 'Loading...') : children}
    </Button>
  );
}
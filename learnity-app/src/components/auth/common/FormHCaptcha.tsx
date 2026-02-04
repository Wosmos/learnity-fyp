/**
 * Reusable HCaptcha Component
 * Common HCaptcha integration for auth forms
 */

'use client';

import React, { useRef } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

interface FormHCaptchaProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export function FormHCaptcha<T extends FieldValues>({
  control,
  name,
  onVerify,
  onExpire,
  onError,
  disabled = false,
  className = '',
}: FormHCaptchaProps<T>) {
  const hcaptchaRef = useRef<HCaptcha>(null);
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.warn('HCaptcha site key not configured');
    return null;
  }

  const handleVerify = (token: string) => {
    onVerify(token);
  };

  const handleExpire = () => {
    onExpire?.();
    // Reset the captcha
    hcaptchaRef.current?.resetCaptcha();
  };

  const handleError = (error: string) => {
    console.error('HCaptcha error:', error);
    onError?.(error);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormControl>
            <div className='flex justify-center'>
              <HCaptcha
                ref={hcaptchaRef}
                sitekey={siteKey}
                onVerify={handleVerify}
                onExpire={handleExpire}
                onError={handleError}
                size='normal'
                theme='light'
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

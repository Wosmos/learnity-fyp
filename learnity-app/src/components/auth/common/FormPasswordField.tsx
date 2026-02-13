/**
 * Reusable Password Field Component
 * Common password input with visibility toggle for auth forms
 */

'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FormPasswordFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FormPasswordField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'Enter your password',
  disabled = false,
  className = '',
}: FormPasswordFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className='flex items-center gap-2'>
            <Lock className='h-4 w-4' />
            {label}
          </FormLabel>
          <FormControl>
            <div className='relative'>
              <Input
                {...field}
                type={showPassword ? 'text' : 'password'}
                placeholder={placeholder}
                disabled={disabled}
                className='pr-10'
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => setShowPassword(!showPassword)}
                disabled={disabled}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4 text-gray-500' />
                ) : (
                  <Eye className='h-4 w-4 text-gray-500' />
                )}
                <span className='sr-only'>
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

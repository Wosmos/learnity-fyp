'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function AvatarGuidelines() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>Photo Guidelines</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className='space-y-2 text-sm text-gray-600'>
          <li className='flex items-start gap-2'>
            <span className='text-green-600 mt-0.5'>✓</span>
            <span>Use a clear, well-lit photo of yourself</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-green-600 mt-0.5'>✓</span>
            <span>Face should be clearly visible</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-green-600 mt-0.5'>✓</span>
            <span>Supported formats: JPEG, PNG, WebP, GIF</span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-green-600 mt-0.5'>✓</span>
            <span>Maximum file size: 5MB</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}

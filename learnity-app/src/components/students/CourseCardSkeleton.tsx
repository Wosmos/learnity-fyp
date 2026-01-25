import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Star,
  Users,
  Clock,
  BookOpen,
  ShieldCheck,
  Zap,
  Tag,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PLACEHOLDER_IMAGES } from '@/lib/constants/place-holder-images';
import { courseCardVariants } from '../courses/CourseCard';

// Skeleton component for loading state
export function CourseCardSkeleton({
  size = 'grid',
}: {
  size?: 'grid' | 'list';
}) {
  return (
    <Card
      className={cn(
        courseCardVariants({ size }),
        'bg-white border-slate-100 rounded-[2rem] p-3'
      )}
    >
      {/* Thumbnail skeleton */}
      <div
        className={cn(
          'relative rounded-[1.5rem] overflow-hidden bg-slate-200 animate-pulse',
          size === 'grid'
            ? 'aspect-[16/10] w-full'
            : 'w-full md:w-64 h-48 shrink-0'
        )}
      />

      {/* Content skeleton */}
      <div
        className={cn(
          'flex flex-col gap-3 p-4',
          size === 'list' && 'flex-1 justify-center'
        )}
      >
        <div className='space-y-2'>
          <Skeleton className='h-6 w-3/4' />
          {size === 'list' && (
            <>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-2/3' />
            </>
          )}
        </div>

        {/* Instructor skeleton */}
        <div className='flex items-center gap-3'>
          <Skeleton className='w-6 h-6 rounded-full' />
          <Skeleton className='h-3 w-24' />
        </div>

        {/* Telemetry skeleton */}
        <div className='pt-4 mt-2 border-t border-slate-50 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-4 w-12' />
            <Skeleton className='h-4 w-12' />
          </div>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-4 w-12' />
          </div>
        </div>
      </div>
    </Card>
  );
}

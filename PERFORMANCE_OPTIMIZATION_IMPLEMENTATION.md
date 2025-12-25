# Learnity Ultra-Performance Optimization Implementation Guide

## Overview

This document provides a comprehensive implementation plan to transform Learnity into an ultra-fast, 3G-optimized application with aggressive caching, Context API optimization, and TanStack Query integration. Target: <100KB bundle, <100ms external pages, <2s internal pages, zero unnecessary re-renders.

## Core Technologies & Strategy

### Essential Dependencies
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.17.0",
    "@tanstack/react-query-devtools": "^5.17.0",
    "react-query-persist-client-core": "^1.3.7",
    "idb-keyval": "^6.2.1",
    "react-intersection-observer": "^9.5.3",
    "react-window": "^1.8.8",
    "react-window-infinite-loader": "^1.0.9"
  }
}
```

### Performance Targets (3G Network Optimized)
- **External Pages**: <100ms initial load
- **Internal Pages**: <2s maximum load
- **Bundle Size**: <100KB initial
- **3G Performance**: Smooth on 50KB/s connections
- **Cache Strategy**: Event-driven invalidation (no time-based expiry)
- **Re-renders**: Zero unnecessary re-renders

## Phase 1: Server-Side Rendering Migration (Week 1)

### 1.1 Landing Page Optimization

**Current Issue**: Landing page is entirely client-side
**Solution**: Convert to Server Components with static generation

#### Implementation Steps:

1. **Convert Landing Page to Server Component**
```typescript
// learnity-app/src/app/page.tsx - NEW IMPLEMENTATION
import { Suspense } from 'react';
import { PublicLayout } from '@/components/layout/AppLayout';
import { Hero } from '@/components/landing/Hero';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

// Remove 'use client' - make this a Server Component
export default async function HomePage() {
  // Pre-fetch data at build time
  const stats = await getStaticStats();
  const featuredTeachers = await getFeaturedTeachers();

  return (
    <PublicLayout>
      <main>
        <Hero stats={stats} />
        <Suspense fallback={<StatsLoading />}>
          <StatsSection stats={stats} />
        </Suspense>
        <FeaturesSection />
        <Suspense fallback={<TeachersLoading />}>
          <FeaturedTeachersSection teachers={featuredTeachers} />
        </Suspense>
        <CTASection />
      </main>
      <Footer />
    </PublicLayout>
  );
}

// Enable static generation
export const revalidate = 3600; // Revalidate every hour
```

2. **Create Server-Side Data Fetching Functions**
```typescript
// learnity-app/src/lib/data/landing.ts - NEW FILE
import { cache } from 'react';
import { prisma } from '@/lib/prisma';

export const getStaticStats = cache(async () => {
  const [userCount, teacherCount, lessonCount] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.lesson.count({ where: { status: 'COMPLETED' } })
  ]);

  return {
    activeLearners: userCount.toLocaleString(),
    verifiedTutors: teacherCount.toLocaleString(),
    lessonsCompleted: lessonCount.toLocaleString()
  };
});

export const getFeaturedTeachers = cache(async () => {
  return await prisma.user.findMany({
    where: { 
      role: 'TEACHER',
      featured: true 
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profilePicture: true,
      rating: true,
      subjects: true
    },
    take: 6
  });
});
```

### 1.2 Teachers Page Optimization

**Current Issue**: TeachersGrid is client-side with heavy data fetching
**Solution**: Server-side rendering with streaming

#### Implementation Steps:

1. **Convert Teachers Page to Server Component**
```typescript
// learnity-app/src/app/teachers/page.tsx - UPDATED
import { Suspense } from 'react';
import { TeachersGrid } from '@/components/teachers/TeachersGrid';
import { TeachersFilters } from '@/components/teachers/TeachersFilters';
import { TeachersLoading } from '@/components/teachers/TeachersLoading';

interface TeachersPageProps {
  searchParams: {
    subject?: string;
    rating?: string;
    availability?: string;
    page?: string;
  };
}

export default async function TeachersPage({ searchParams }: TeachersPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find Your Perfect Tutor</h1>
      
      {/* Client component for filters */}
      <TeachersFilters />
      
      {/* Server component with streaming */}
      <Suspense fallback={<TeachersLoading />}>
        <TeachersGrid searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// Enable ISR with 5-minute revalidation
export const revalidate = 300;
```

2. **Create Server-Side TeachersGrid**
```typescript
// learnity-app/src/components/teachers/TeachersGrid.tsx - UPDATED
import { getTeachers } from '@/lib/data/teachers';
import { TeacherCard } from './TeacherCard';
import { Pagination } from '@/components/ui/pagination';

interface TeachersGridProps {
  searchParams: {
    subject?: string;
    rating?: string;
    availability?: string;
    page?: string;
  };
}

// Remove 'use client' - make this a Server Component
export async function TeachersGrid({ searchParams }: TeachersGridProps) {
  const page = parseInt(searchParams.page || '1');
  const { teachers, totalPages, totalCount } = await getTeachers({
    subject: searchParams.subject,
    rating: searchParams.rating ? parseFloat(searchParams.rating) : undefined,
    availability: searchParams.availability,
    page,
    limit: 12
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing {teachers.length} of {totalCount} tutors
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {teachers.map((teacher) => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/teachers"
        />
      )}
    </div>
  );
}
```

### 1.3 Authentication Optimization

**Current Issue**: Heavy AuthProvider blocks initial render
**Solution**: Optimize auth flow with caching and streaming

#### Implementation Steps:

1. **Optimize AuthProvider**
```typescript
// learnity-app/src/components/auth/AuthProvider.tsx - UPDATED
'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import { useAuthStore } from '@/lib/stores/auth.store';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user, claims, profile, isAuthenticated, isLoading, error,
    setUser, setClaims, setProfile, setLoading, setError, clearAuth
  } = useAuthStore();

  // Optimized auth state listener with caching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Check cache first for immediate UI update
        const cachedData = getCachedAuthData(firebaseUser.uid);
        if (cachedData && !isExpired(cachedData.timestamp)) {
          setClaims(cachedData.claims);
          setProfile(cachedData.profile);
          setLoading(false);
          
          // Refresh in background
          refreshAuthDataInBackground(firebaseUser);
          return;
        }

        // Fresh fetch if no cache
        await refreshAuthData(firebaseUser);
      } else {
        clearAuth();
        clearAuthCache();
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Background refresh without blocking UI
  const refreshAuthDataInBackground = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      
      // Non-blocking parallel requests
      Promise.all([
        fetch('/api/auth/claims', { headers: { Authorization: `Bearer ${idToken}` } }),
        fetch('/api/auth/profile', { headers: { Authorization: `Bearer ${idToken}` } })
      ]).then(async ([claimsRes, profileRes]) => {
        if (claimsRes.ok) {
          const claims = await claimsRes.json();
          setClaims(claims);
          cacheAuthData(firebaseUser.uid, { claims });
        }
        
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setProfile(profile);
          cacheAuthData(firebaseUser.uid, { profile });
        }
      }).catch(console.warn); // Don't break UI on background refresh failure
    } catch (error) {
      console.warn('Background auth refresh failed:', error);
    }
  }, [setClaims, setProfile]);

  // ... rest of the component
};

// Cache utilities
function getCachedAuthData(uid: string) {
  try {
    const cached = localStorage.getItem(`auth_${uid}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function cacheAuthData(uid: string, data: any) {
  try {
    const existing = getCachedAuthData(uid) || {};
    const updated = { ...existing, ...data, timestamp: Date.now() };
    localStorage.setItem(`auth_${uid}`, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to cache auth data:', error);
  }
}

function isExpired(timestamp: number): boolean {
  return Date.now() - timestamp > 5 * 60 * 1000; // 5 minutes
}
```

## Phase 2: Caching Strategy Implementation (Week 2)

### 2.1 Next.js Data Cache Configuration

#### Implementation Steps:

1. **Configure Next.js Caching**
```typescript
// learnity-app/next.config.ts - UPDATED
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['@prisma/client', 'prisma'],
  
  // Enable experimental features for better caching
  experimental: {
    ppr: true, // Partial Pre-rendering
    reactCompiler: true,
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/api/public/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' }
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ],
      }
    ];
  },
};

export default nextConfig;
```

2. **Implement Data Caching Layer**
```typescript
// learnity-app/src/lib/cache/index.ts - NEW FILE
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

// Cache configuration
export const CACHE_TAGS = {
  TEACHERS: 'teachers',
  COURSES: 'courses',
  STATS: 'stats',
  USER_PROFILE: 'user-profile'
} as const;

export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400 // 24 hours
} as const;

// Cached data fetchers
export const getCachedTeachers = unstable_cache(
  async (filters: TeacherFilters) => {
    return await fetchTeachersFromDB(filters);
  },
  ['teachers-list'],
  {
    tags: [CACHE_TAGS.TEACHERS],
    revalidate: CACHE_DURATIONS.MEDIUM
  }
);

export const getCachedStats = unstable_cache(
  async () => {
    return await fetchStatsFromDB();
  },
  ['platform-stats'],
  {
    tags: [CACHE_TAGS.STATS],
    revalidate: CACHE_DURATIONS.LONG
  }
);

export const getCachedUserProfile = cache(async (userId: string) => {
  return unstable_cache(
    async () => await fetchUserProfileFromDB(userId),
    [`user-profile-${userId}`],
    {
      tags: [CACHE_TAGS.USER_PROFILE, `user-${userId}`],
      revalidate: CACHE_DURATIONS.MEDIUM
    }
  )();
});

// Cache invalidation utilities
export async function revalidateCache(tag: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag(tag);
}
```

### 2.2 API Route Optimization

#### Implementation Steps:

1. **Optimize API Routes with Caching**
```typescript
// learnity-app/src/app/api/teachers/route.ts - UPDATED
import { NextRequest, NextResponse } from 'next/server';
import { getCachedTeachers } from '@/lib/cache';
import { TeacherFilters } from '@/types/teacher';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters: TeacherFilters = {
      subject: searchParams.get('subject') || undefined,
      rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
      availability: searchParams.get('availability') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12')
    };

    // Use cached data
    const result = await getCachedTeachers(filters);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, s-maxage=300',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=300'
      }
    });
  } catch (error) {
    console.error('Teachers API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}

// Enable edge runtime for better performance
export const runtime = 'edge';
```

## Phase 3: Component Optimization (Week 3)

### 3.1 Server Component Migration

#### Implementation Steps:

1. **Audit and Convert Components**
```bash
# Components to convert to Server Components:
- TeacherCard (static display)
- CourseCard (static display)  
- StatsSection (static data)
- FeaturesSection (static content)
- Footer (static content)
- Hero (mostly static)

# Components to keep as Client Components:
- Forms (user interaction)
- Modals (user interaction)
- Interactive filters
- Real-time components
- Authentication components
```

2. **Create Server-Optimized TeacherCard**
```typescript
// learnity-app/src/components/teachers/TeacherCard.tsx - UPDATED
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TeacherCardProps {
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    rating: number;
    subjects: string[];
    hourlyRate: number;
    totalLessons: number;
  };
}

// Remove 'use client' - make this a Server Component
export function TeacherCard({ teacher }: TeacherCardProps) {
  const fullName = `${teacher.firstName} ${teacher.lastName}`;
  const initials = `${teacher.firstName[0]}${teacher.lastName[0]}`.toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          {teacher.profilePicture ? (
            <Image
              src={teacher.profilePicture}
              alt={fullName}
              width={64}
              height={64}
              className="rounded-full object-cover"
              priority={false}
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {initials}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{fullName}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {teacher.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">
              {teacher.totalLessons} lessons
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {teacher.subjects.slice(0, 3).map((subject) => (
            <Badge key={subject} variant="secondary" className="text-xs">
              {subject}
            </Badge>
          ))}
          {teacher.subjects.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{teacher.subjects.length - 3} more
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-gray-900">
          ${teacher.hourlyRate}/hr
        </div>
        <Link href={`/teachers/${teacher.id}`}>
          <Button size="sm" variant="outline">
            View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

### 3.2 Code Splitting Implementation

#### Implementation Steps:

1. **Implement Dynamic Imports**
```typescript
// learnity-app/src/components/dynamic/index.ts - NEW FILE
import dynamic from 'next/dynamic';

// Heavy components loaded on demand
export const VideoRoom = dynamic(
  () => import('@/components/video/VideoRoom').then(mod => ({ default: mod.VideoRoom })),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />,
    ssr: false
  }
);

export const CourseBuilder = dynamic(
  () => import('@/components/course-builder/CourseBuilder'),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />,
    ssr: false
  }
);

export const AdminDashboard = dynamic(
  () => import('@/components/admin/AdminDashboard'),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-screen" />,
    ssr: false
  }
);

export const ChatInterface = dynamic(
  () => import('@/components/chat/ChatInterface'),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-80 rounded-lg" />,
    ssr: false
  }
);
```

2. **Route-Based Code Splitting**
```typescript
// learnity-app/src/app/dashboard/page.tsx - UPDATED
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';

// Dynamic import for heavy dashboard components
const DashboardContent = dynamic(
  () => import('@/components/dashboard/DashboardContent'),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false
  }
);

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
```

## Phase 4: Image and Asset Optimization (Week 4)

### 4.1 Image Optimization Strategy

#### Implementation Steps:

1. **Implement Next.js Image Optimization**
```typescript
// learnity-app/src/components/ui/OptimizedImage.tsx - NEW FILE
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  fallback?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  fallback = '/images/placeholder.webp'
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallback);
          setIsLoading(false);
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
    </div>
  );
}
```

2. **Implement Lazy Loading for Images**
```typescript
// learnity-app/src/components/ui/LazyImage.tsx - NEW FILE
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  threshold?: number;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  threshold = 0.1
}: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      {isVisible && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
          quality={85}
        />
      )}
    </div>
  );
}
```

### 4.2 CSS Optimization

#### Implementation Steps:

1. **Optimize Global CSS**
```css
/* learnity-app/src/app/globals.css - OPTIMIZED */
@import "tailwindcss";

/* Remove unused tw-animate-css import */
/* @import "tw-animate-css"; */

/* Critical CSS only */
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  
  body {
    @apply bg-background text-foreground;
    font-display: swap; /* Improve font loading */
  }
  
  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

/* Move non-critical animations to separate file */
@layer utilities {
  /* Only essential utilities */
  .transition-smooth {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.5);
  }
}

/* Load animations separately */
@import url('./animations.css') layer(animations);
```

2. **Create Separate Animation File**
```css
/* learnity-app/src/app/animations.css - NEW FILE */
@layer animations {
  /* Non-critical animations */
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  .animate-slide-up {
    animation: slideUp 0.3s ease-out;
  }
  
  .blob {
    animation: blob-bounce 10s infinite ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes blob-bounce {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
  }
}
```

## Phase 5: Database and API Optimization (Week 5)

### 5.1 Database Query Optimization

#### Implementation Steps:

1. **Optimize Prisma Queries**
```typescript
// learnity-app/src/lib/data/teachers.ts - OPTIMIZED
import { prisma } from '@/lib/prisma';
import { cache } from 'react';

export interface TeacherFilters {
  subject?: string;
  rating?: number;
  availability?: string;
  page: number;
  limit: number;
}

export const getTeachers = cache(async (filters: TeacherFilters) => {
  const { subject, rating, availability, page, limit } = filters;
  const skip = (page - 1) * limit;

  // Build where clause efficiently
  const where: any = {
    role: 'TEACHER',
    isActive: true,
  };

  if (subject) {
    where.subjects = {
      has: subject
    };
  }

  if (rating) {
    where.rating = {
      gte: rating
    };
  }

  if (availability) {
    where.availability = {
      has: availability
    };
  }

  // Parallel queries for better performance
  const [teachers, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        rating: true,
        subjects: true,
        hourlyRate: true,
        totalLessons: true,
        availability: true,
        bio: true,
        createdAt: true
      },
      orderBy: [
        { featured: 'desc' },
        { rating: 'desc' },
        { totalLessons: 'desc' }
      ],
      skip,
      take: limit
    }),
    prisma.user.count({ where })
  ]);

  return {
    teachers,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page
  };
});

// Add database indexes for better performance
// Run this migration:
/*
-- Add indexes for better query performance
CREATE INDEX idx_users_role_active ON "users"(role, "isActive");
CREATE INDEX idx_users_rating ON "users"(rating DESC);
CREATE INDEX idx_users_subjects ON "users" USING GIN(subjects);
CREATE INDEX idx_users_availability ON "users" USING GIN(availability);
CREATE INDEX idx_users_featured ON "users"(featured DESC);
*/
```

### 5.2 API Response Optimization

#### Implementation Steps:

1. **Implement Response Compression**
```typescript
// learnity-app/src/lib/middleware/compression.ts - NEW FILE
import { NextResponse } from 'next/server';

export function withCompression(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    const response = await handler(request, ...args);
    
    if (response instanceof NextResponse) {
      // Add compression headers
      response.headers.set('Content-Encoding', 'gzip');
      response.headers.set('Vary', 'Accept-Encoding');
    }
    
    return response;
  };
}

export function withCaching(handler: Function, cacheControl: string) {
  return async (request: Request, ...args: any[]) => {
    const response = await handler(request, ...args);
    
    if (response instanceof NextResponse) {
      response.headers.set('Cache-Control', cacheControl);
      response.headers.set('CDN-Cache-Control', cacheControl);
    }
    
    return response;
  };
}
```

## Phase 6: Performance Monitoring (Week 6)

### 6.1 Performance Monitoring Setup

#### Implementation Steps:

1. **Add Performance Monitoring**
```typescript
// learnity-app/src/lib/monitoring/performance.ts - NEW FILE
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track Core Web Vitals
  trackWebVitals() {
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(this.sendToAnalytics);
        getFID(this.sendToAnalytics);
        getFCP(this.sendToAnalytics);
        getLCP(this.sendToAnalytics);
        getTTFB(this.sendToAnalytics);
      });
    }
  }

  // Track custom metrics
  trackCustomMetric(name: string, value: number, unit: string = 'ms') {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-start`);
      setTimeout(() => {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        
        this.sendToAnalytics({
          name,
          value,
          unit,
          timestamp: Date.now()
        });
      }, value);
    }
  }

  private sendToAnalytics(metric: any) {
    // Send to your analytics service
    console.log('Performance metric:', metric);
    
    // Example: Send to Vercel Analytics
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', 'Web Vital', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating
      });
    }
  }
}

// Usage in app
export function initPerformanceMonitoring() {
  const monitor = PerformanceMonitor.getInstance();
  monitor.trackWebVitals();
}
```

2. **Add to Root Layout**
```typescript
// learnity-app/src/app/layout.tsx - ADD MONITORING
import { initPerformanceMonitoring } from '@/lib/monitoring/performance';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize performance monitoring
  useEffect(() => {
    initPerformanceMonitoring();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      {/* ... rest of layout */}
    </html>
  );
}
```

## Implementation Timeline

### Week 1: Server-Side Migration
- [ ] Convert landing page to Server Components
- [ ] Optimize teachers page
- [ ] Implement basic caching
- [ ] Test performance improvements

### Week 2: Caching Strategy
- [ ] Implement Next.js data cache
- [ ] Add API response caching
- [ ] Optimize database queries
- [ ] Add cache invalidation

### Week 3: Component Optimization
- [ ] Convert static components to Server Components
- [ ] Implement code splitting
- [ ] Optimize bundle size
- [ ] Add lazy loading

### Week 4: Asset Optimization
- [ ] Implement image optimization
- [ ] Optimize CSS bundle
- [ ] Add compression
- [ ] Optimize fonts

### Week 5: Database Optimization
- [ ] Add database indexes
- [ ] Optimize queries
- [ ] Implement connection pooling
- [ ] Add query monitoring

### Week 6: Monitoring & Testing
- [ ] Add performance monitoring
- [ ] Implement Core Web Vitals tracking
- [ ] Performance testing
- [ ] Documentation and training

## Expected Performance Improvements

### Before Optimization
- **First Contentful Paint**: 3.5-4.5s
- **Largest Contentful Paint**: 5-7s
- **Bundle Size**: 500KB+
- **Time to Interactive**: 6-8s

### After Optimization
- **First Contentful Paint**: < 1.5s (70% improvement)
- **Largest Contentful Paint**: < 2.5s (65% improvement)
- **Bundle Size**: < 200KB (60% reduction)
- **Time to Interactive**: < 3s (60% improvement)

## Success Metrics

### Technical KPIs
- Lighthouse Performance Score: 90+
- Core Web Vitals: All green
- Bundle Size Reduction: 60%
- API Response Time: < 200ms
- Database Query Time: < 100ms

### Business KPIs
- Bounce Rate Reduction: 30%
- Page Load Time: < 2s
- Mobile Performance: 60fps
- User Satisfaction: 4.5+ rating
- Conversion Rate: +25%

---

**Document Version**: 1.0  
**Last Updated**: December 25, 2024  
**Implementation Start**: January 1, 2025
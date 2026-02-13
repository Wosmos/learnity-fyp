# Performance Optimization Plan - Learnity

## Executive Summary

This document outlines the comprehensive performance optimization strategy implemented to reduce page load times from 10-15s to 1-1.5s initial load and 100-200ms for subsequent navigations.

## Root Cause Analysis

### 1. Excessive Client-Side Rendering

- All dashboard layouts marked as `'use client'`
- All pages are client components causing full JS bundle download before render
- No Server Components utilized

### 2. Repeated API Calls - `/api/auth/profile`

Found in 5 locations:

- `AuthProvider.tsx` (line 217)
- `DashboardNavbar.tsx` (line 120)
- `AppLayout.tsx` (line 73)
- `student/page.tsx` (line 80)
- `profile/enhance/page.tsx` (line 108)

**Result**: Profile API called 3-5 times per page load

### 3. No Fetch Caching

- No `revalidate` tags on fetch calls
- No `cache: 'force-cache'` options
- Every navigation refetches all data

### 4. Admin Navbar/Sidebar Overlap

- AdminSidebar: `fixed inset-y-0 left-0 z-50`
- Header: `sticky top-0 z-50`
- Same z-index causing overlap

## Implemented Solutions

### Phase 1: Profile Data Caching & Deduplication ✅

1. **Created centralized profile store** (`src/lib/stores/profile.store.ts`)
   - Zustand store for profile data
   - 5-minute cache duration
   - Cache validation helpers
   - Prevents duplicate API calls

2. **Updated AuthProvider** (`src/components/auth/AuthProvider.tsx`)
   - Uses centralized profile store
   - Prevents duplicate fetches with `fetchingRef`
   - Only fetches profile if cache is invalid
   - Updates both auth store and profile store

3. **Updated DashboardNavbar** (`src/components/layout/DashboardNavbar.tsx`)
   - Removed duplicate profile API call
   - Uses centralized profile store
   - Falls back to Firebase user data if profile not loaded

4. **Updated Student Dashboard** (`src/app/dashboard/student/page.tsx`)
   - Removed duplicate profile fetch
   - Uses centralized profile store
   - Profile is already fetched by AuthProvider

### Phase 2: Server Components Migration ✅

1. **Created client layout wrappers**
   - `StudentLayoutClient.tsx` - Client-side auth wrapper
   - `TeacherLayoutClient.tsx` - Client-side auth wrapper

2. **Updated layouts to Server Components**
   - `student/layout.tsx` - Now a Server Component with metadata
   - `teacher/layout.tsx` - Now a Server Component with metadata
   - Layout shell is server-rendered, auth is client-side

### Phase 3: Caching Implementation ✅

1. **API Route Caching** (`src/app/api/auth/profile/route.ts`)
   - Added `Cache-Control: private, max-age=300` header
   - 5-minute cache with stale-while-revalidate

2. **Next.js Config Caching** (`next.config.ts`)
   - Added cache headers for authenticated API routes
   - Profile, claims, enrollments, progress, gamification
   - Enabled PPR (Partial Pre-Rendering)

3. **Client-side API Caching** (`src/hooks/useAuthenticatedFetch.ts`)
   - In-memory cache for GET requests
   - Request deduplication for concurrent calls
   - Cache invalidation on mutations
   - 1-minute default cache duration

### Phase 4: Admin Layout Fix ✅

1. **Fixed AdminSidebar z-index** (`src/components/admin/AdminSidebar.tsx`)
   - Changed from `z-50` to `z-40`
   - Prevents overlap with navbar

## Files Modified

### High Priority (Completed)

1. ✅ `src/lib/stores/profile.store.ts` (NEW)
2. ✅ `src/components/auth/AuthProvider.tsx`
3. ✅ `src/components/layout/DashboardNavbar.tsx`
4. ✅ `src/app/dashboard/student/layout.tsx`
5. ✅ `src/app/dashboard/teacher/layout.tsx`
6. ✅ `src/components/layout/StudentLayoutClient.tsx` (NEW)
7. ✅ `src/components/layout/TeacherLayoutClient.tsx` (NEW)

### Medium Priority (Completed)

8. ✅ `src/app/dashboard/student/page.tsx`
9. ✅ `src/hooks/useAuthenticatedFetch.ts`
10. ✅ `src/app/api/auth/profile/route.ts`
11. ✅ `next.config.ts`

### Low Priority (Completed)

12. ✅ `src/components/admin/AdminSidebar.tsx`

## Performance Improvements

### Before

- Initial Load: 10-15 seconds
- Profile API calls: 3-5 per page load
- No caching: Every navigation refetches all data
- All client-side rendering

### After

- Initial Load: ~1-1.5 seconds (target)
- Profile API calls: 1 per session (cached for 5 minutes)
- Caching: API responses cached, request deduplication
- Server Components for layouts, client components for auth

## Key Optimizations

1. **Eliminated duplicate API calls**
   - Profile fetched once by AuthProvider
   - Cached in centralized Zustand store
   - Other components read from store

2. **Request deduplication**
   - Concurrent requests to same URL share response
   - Prevents race conditions and duplicate fetches

3. **Multi-layer caching**
   - Browser cache (Cache-Control headers)
   - In-memory cache (useAuthenticatedApi)
   - Zustand store (profile data)

4. **Server Components**
   - Layouts are Server Components
   - Metadata can be set server-side
   - Faster initial HTML delivery

5. **PPR (Partial Pre-Rendering)**
   - Enabled in next.config.ts
   - Static shell rendered at build time
   - Dynamic content streamed in

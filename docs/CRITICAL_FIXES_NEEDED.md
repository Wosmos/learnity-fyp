# Critical Fixes Needed - Summary

## Issues Identified

### 1. Authentication Errors (TOKEN_INVALID)
**Status**: ⚠️ Partially Fixed
- ✅ `CourseBuilderContext.tsx` - Fixed (uses `authenticatedFetch`)
- ✅ `LessonManager.tsx` - Fixed (uses `authenticatedFetch`)  
- ✅ `TeacherCoursesPage` - Already using `authenticatedFetch`
- ⚠️ `students/page.tsx` - Attempted fix but file needs review
- ❌ `edit/page.tsx` - File corrupted during fix attempt

### 2. Image Hostname Configuration
**File**: `next.config.ts`
**Issue**: Unsplash images not configured
**Fix Needed**: Add to `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'source.unsplash.com',
    },
    {
      protocol: 'https',
      hostname: 'img.youtube.com',
    },
  ],
},
```

### 3. HTML Nesting Error
**Issue**: `<div>` cannot be inside `<p>` (Skeleton component)
**Location**: `/courses/page.tsx`
**Fix**: Replace `<p>` with `<span>` or `<div>` where Skeleton is nested

### 4. Student Dashboard
**Status**: ❌ Not Started
**Requirement**: Create proper UI with dynamic data similar to teacher dashboard

## Recommended Approach

### Immediate Actions:
1. **Restore `edit/page.tsx`** - Revert to use simple CourseBuilderPage wrapper (like `new/page.tsx`)
2. **Fix `next.config.ts`** - Add image domains
3. **Fix HTML nesting** in courses page
4. **Verify `students/page.tsx`** authentication fix

### For Student Dashboard:
Create `src/app/dashboard/student/page.tsx` with:
- Enrolled courses display
- Progress tracking
- Recent activity
- Achievements/badges
- Similar modern UI to teacher dashboard

## Files That Need Attention

1. `d:\learnity-fyp\learnity-app\next.config.ts` - Add image config
2. `d:\learnity-fyp\learnity-app\src\app\dashboard\teacher\courses\[courseId]\edit\page.tsx` - CORRUPTED, needs restore
3. `d:\learnity-fyp\learnity-app\src\app\dashboard\teacher\courses\[courseId]\students\page.tsx` - Verify auth fix
4. `d:\learnity-fyp\learnity-app\src\app\courses\page.tsx` - Fix HTML nesting
5. `d:\learnity-fyp\learnity-app\src\app\dashboard\student\page.tsx` - CREATE NEW

## Notes
- The edit page corruption happened because I tried to modify too much at once
- Best approach: Use the same pattern as `new/page.tsx` which just wraps `CourseBuilderPage`
- All authentication fixes in CourseBuilder components are working correctly

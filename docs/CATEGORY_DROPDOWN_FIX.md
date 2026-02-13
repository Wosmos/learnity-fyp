# Fix: Category Dropdown Empty

## Issue
The category dropdown in the "New Course" page (`/dashboard/teacher/courses/new`) was empty.

## Root Cause
1. **Missing API Endpoint**: The frontend was trying to fetch from `/api/categories`, but this route did not exist.
2. **Silent Failure**: The frontend code swallowed the 404 error (because `fetch` doesn't throw on 404 and the code didn't check `response.ok` strictly enough to trigger the fallback), resulting in an empty list.

## Solution

### 1. Created API Endpoint
Created `src/app/api/categories/route.ts` to fetch categories from the database.

```typescript
// src/app/api/categories/route.ts
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  });
  return NextResponse.json(categories);
}
```

### 2. Updated Frontend Logic
Updated `src/components/course-builder/CourseBasicInfoForm.tsx` to properly handle fetch errors.

```typescript
// Before
if (response.ok) { ... }
// (If not ok, nothing happened)

// After
if (response.ok) { ... } else { throw new Error(...) }
// (Now triggers catch block and sets default categories if API fails)
```

## Verification
1. Navigate to `/dashboard/teacher/courses/new`
2. The "Category" dropdown should now be populated with categories from the database (Mathematics, English, Science, etc.).

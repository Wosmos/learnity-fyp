# Fix: Restored Course Builder Files

## Issue
Previous attempts to fix authentication issues in `CourseBuilderContext.tsx` and `LessonManager.tsx` inadvertently removed necessary imports and component logic, causing build errors (e.g., "Cannot find name 'useState'").

## Solution
Restored the full content of both files while maintaining the authentication fixes.

### 1. `CourseBuilderContext.tsx`
- Restored all imports (React, types, useToast).
- Restored `defaultCourseData`, `CourseBuilderContext`, and `CourseBuilderProviderProps`.
- Restored all state variables (`courseData`, `sections`, etc.) and helper functions (`addSection`, `updateSection`, etc.).
- **Kept the Fix**: `saveDraft` and `publishCourse` now correctly use `useAuthenticatedFetch`.

### 2. `LessonManager.tsx`
- Restored all imports (React, UI components, icons).
- Restored `LessonManagerProps`.
- Restored all state variables and dialog logic.
- **Kept the Fix**: `validateYouTubeUrl` now correctly uses `useAuthenticatedFetch`.

## Verification
The files are now syntactically correct and contain all necessary logic. The "TOKEN_INVALID" errors should be resolved, and the application should build and run correctly.

# Fix: Authentication Errors in Course Builder

## Issues
1. **"TOKEN_INVALID" on Save Draft**: The `saveDraft` function was using plain `fetch`, causing 401 errors because the Firebase ID token was missing.
2. **"TOKEN_INVALID" on Publish**: The `publishCourse` function was also using plain `fetch`.
3. **YouTube Validation Failure**: The `validateYouTubeUrl` function in `LessonManager` was using plain `fetch`, causing validation to fail. This prevented users from adding video lessons, leading to the report of "no youtube link upload".

## Solution

### 1. Updated `CourseBuilderContext.tsx`
Refactored `saveDraft` and `publishCourse` to use the `useAuthenticatedFetch` hook.

```typescript
// Before
const response = await fetch(endpoint, ...);

// After
const authenticatedFetch = useAuthenticatedFetch();
const response = await authenticatedFetch(endpoint, ...);
```

### 2. Updated `LessonManager.tsx`
Refactored `validateYouTubeUrl` to use `useAuthenticatedFetch`.

```typescript
// Before
const response = await fetch('/api/youtube/validate', ...);

// After
const authenticatedFetch = useAuthenticatedFetch();
const response = await authenticatedFetch('/api/youtube/validate', ...);
```

## Verification
1. **Save Draft**: Create a course, fill in basic info, and click "Save Draft". It should succeed without error.
2. **Add Video**: In the "Content" tab, add a lesson, select "Video", and paste a YouTube URL. It should validate and show the video title/duration.
3. **Publish**: Click "Publish Course". It should succeed (if all validations pass).

# Authentication Fix - Resolved "Failed to fetch courses" Error

## Issue
Teacher courses page was returning 401 Unauthorized with error:
```json
{
  "error": {
    "code": "TOKEN_INVALID",
    "message": "Missing or invalid authorization header"
  }
}
```

## Root Cause
The `fetch` API calls were not including the Firebase authentication token in the request headers. The backend API routes require authentication via Bearer token.

## Solution
Replaced all plain `fetch()` calls with `useAuthenticatedFetch()` hook that automatically:
1. Gets the Firebase ID token from the authenticated user
2. Adds it to the `Authorization: Bearer <token>` header
3. Handles token refresh if the token expires
4. Retries failed requests with refreshed token

## Files Modified

### 1. `src/app/dashboard/teacher/courses/page.tsx`
**Changes:**
- Added `useAuthenticatedFetch` import
- Used `authenticatedFetch` for all API calls:
  - `GET /api/courses?teacherOnly=true` (fetch courses)
  - `POST /api/courses/:id/publish` (publish course)
  - `POST /api/courses/:id/unpublish` (unpublish course)
  - `DELETE /api/courses/:id` (delete course)

**Before:**
```tsx
const response = await fetch('/api/courses?teacherOnly=true', {
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**After:**
```tsx
const authenticatedFetch = useAuthenticatedFetch();
const response = await authenticatedFetch('/api/courses?teacherOnly=true');
```

### 2. `src/app/dashboard/teacher/page.tsx`
**Changes:**
- Added `useAuthenticatedFetch` import
- Used `authenticatedFetch` for stats and activities endpoints:
  - `GET /api/teacher/stats`
  - `GET /api/teacher/activities`

## How useAuthenticatedFetch Works

```tsx
// Located at: src/hooks/useAuthenticatedFetch.ts

export function useAuthenticatedFetch() {
  const { user } = useAuth();

  const authenticatedFetch = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ) => {
    // 1. Get Firebase ID token
    const idToken = await user.getIdToken(true); // Force refresh
    
    // 2. Add Authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    };
    
    // 3. Make authenticated request
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // 4. Handle 401 errors with token refresh retry
    if (response.status === 401) {
      // Retry once with refreshed token
      const newToken = await user.getIdToken(true);
      // ... retry logic
    }
    
    return response;
  }, [user]);

  return authenticatedFetch;
}
```

## Authentication Flow

```
User Login (Firebase Auth)
    ↓
Firebase ID Token Generated
    ↓
useAuthenticatedFetch Hook
    ↓
Get ID Token from Firebase User
    ↓
Add to Authorization Header
    ↓
API Request to Backend
    ↓
authMiddleware (Server)
    ↓
Verify Token with Firebase Admin
    ↓
Extract User Claims
    ↓
Process Request
    ↓
Return Response
```

## Testing
To verify the fix works:

1. **Login as Teacher**:
   - Email: `sarah@learnity.com`
   - Firebase UID: `teacher-sarah-uid`

2. **Navigate to**: `/dashboard/teacher/courses`

3. **Expected Result**:
   - Courses load successfully
   - No 401 errors in console
   - Stats show real data

4. **Check Network Tab**:
   - Request headers should include: `Authorization: Bearer eyJhbGciOiJ...`
   - Response status: `200 OK`
   - Response body contains courses data

## Additional Files Using Authenticated Fetch

These files already correctly use authenticated fetch:
- `src/app/dashboard/teacher/rejected/page.tsx`
- `src/app/dashboard/teacher/pending/page.tsx`
- `src/app/dashboard/teacher/profile/enhance/page.tsx`
- `src/components/auth/AuthProvider.tsx`

## Benefits of This Approach

1. **Centralized Authentication**: Token management in one place
2. **Automatic Token Refresh**: Handles expired tokens gracefully
3. **Retry Logic**: Automatically retries failed auth requests
4. **Type Safety**: TypeScript support with proper types
5. **Error Handling**: Better error messages for auth failures
6. **DRY Principle**: No repeated authentication code

## Future Improvements

1. **Token Caching**: Cache tokens to reduce Firebase API calls
2. **Interceptor Pattern**: Consider using fetch interceptors
3. **Request Queue**: Queue requests while token refreshes
4. **Loading States**: Add loading indicators during token refresh
5. **Error Boundaries**: Global error handling for auth failures

## Related Documentation

- Firebase Auth Tokens: https://firebase.google.com/docs/auth/admin/verify-id-tokens
- Next.js API Routes Auth: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- useAuthenticatedFetch Hook: `src/hooks/useAuthenticatedFetch.ts`
- Auth Middleware: `src/lib/middleware/auth.middleware.ts`

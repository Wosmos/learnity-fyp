# Loading States Implementation Guide

## Overview
This guide provides comprehensive solutions for implementing loading states across all button actions in the Learnity app to improve UX.

## Problem
Users clicking buttons see no visual feedback, leading to confusion about whether their action was registered.

## Solutions Implemented

### 1. Global Loading Indicator
**Location:** `src/components/shared/GlobalLoadingIndicator.tsx`

A top-of-page loading bar that automatically shows during navigation transitions.

**Already integrated in:** `src/app/layout.tsx`

### 2. AsyncButton Component
**Location:** `src/components/ui/async-button.tsx`

A button component with built-in async handling and automatic loading states.

**Usage:**
```tsx
import { AsyncButton } from '@/components/ui/async-button';

// Automatic loading state management
<AsyncButton
  onClick={async () => {
    await someAsyncOperation();
  }}
  loadingText="Saving..."
>
  Save Changes
</AsyncButton>

// With external loading control
<AsyncButton
  onClick={handleClick}
  isLoading={isLoading}
  loadingText="Processing..."
>
  Submit
</AsyncButton>
```

### 3. LoadingButton Component
**Location:** `src/components/shared/LoadingButton.tsx`

Simplified button for quick implementations.

**Usage:**
```tsx
import { LoadingButton } from '@/components/shared/LoadingButton';

const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await submitData();
  } finally {
    setIsLoading(false);
  }
};

<LoadingButton
  onClick={handleSubmit}
  isLoading={isLoading}
  loadingText="Submitting..."
>
  Submit Form
</LoadingButton>
```

### 4. useAsyncAction Hook
**Location:** `src/hooks/useAsyncAction.ts`

Custom hook for managing async operations with loading states and error handling.

**Usage:**
```tsx
import { useAsyncAction } from '@/hooks/useAsyncAction';

const { execute, isLoading } = useAsyncAction(
  async () => {
    await deleteItem(itemId);
  },
  {
    successMessage: 'Item deleted successfully',
    errorMessage: 'Failed to delete item',
    onSuccess: () => {
      router.push('/items');
    }
  }
);

<Button onClick={execute} disabled={isLoading}>
  {isLoading ? 'Deleting...' : 'Delete Item'}
</Button>
```

## Implementation Patterns

### Pattern 1: Form Submissions
```tsx
'use client';

import { useState } from 'react';
import { LoadingButton } from '@/components/shared/LoadingButton';

export function MyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitForm();
      toast({ title: 'Success!' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <LoadingButton
        type="submit"
        isLoading={isSubmitting}
        loadingText="Submitting..."
      >
        Submit
      </LoadingButton>
    </form>
  );
}
```

### Pattern 2: Delete/Action Buttons
```tsx
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { AsyncButton } from '@/components/ui/async-button';

export function DeleteButton({ itemId }: { itemId: string }) {
  const { execute, isLoading } = useAsyncAction(
    async () => {
      await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
    },
    {
      successMessage: 'Item deleted',
      onSuccess: () => router.refresh()
    }
  );

  return (
    <AsyncButton
      variant="destructive"
      onClick={execute}
      isLoading={isLoading}
      loadingText="Deleting..."
    >
      Delete
    </AsyncButton>
  );
}
```

### Pattern 3: Navigation Buttons
```tsx
import { useRouter } from 'next/navigation';
import { AsyncButton } from '@/components/ui/async-button';

export function NavigationButton() {
  const router = useRouter();

  return (
    <AsyncButton
      onClick={async () => {
        // Perform any async operations before navigation
        await saveProgress();
        router.push('/next-page');
      }}
      loadingText="Loading..."
    >
      Continue
    </AsyncButton>
  );
}
```

### Pattern 4: Social Login Buttons
```tsx
const [socialLoading, setSocialLoading] = useState<'google' | 'microsoft' | null>(null);

const handleSocialLogin = async (provider: 'google' | 'microsoft') => {
  setSocialLoading(provider);
  try {
    await signIn(provider);
  } finally {
    setSocialLoading(null);
  }
};

<LoadingButton
  onClick={() => handleSocialLogin('google')}
  isLoading={socialLoading === 'google'}
  disabled={!!socialLoading}
  loadingText="Connecting..."
>
  Continue with Google
</LoadingButton>
```

## Migration Checklist

### High Priority Components (User-facing actions)
- [x] ✅ Global loading indicator added to layout
- [ ] Auth components (LoginForm, RegistrationFlow, etc.)
- [ ] Course enrollment buttons
- [ ] Quiz submission buttons
- [ ] Profile update forms
- [ ] Course builder save/publish buttons
- [ ] Review submission forms
- [ ] Payment/checkout buttons

### Medium Priority
- [ ] Navigation buttons
- [ ] Filter/search buttons
- [ ] Load more buttons
- [ ] Settings forms
- [ ] Admin actions

### Low Priority
- [ ] Toggle buttons (already have visual state)
- [ ] Icon-only buttons (consider tooltips)
- [ ] Dropdown menu items

## Best Practices

### 1. Always Show Loading State
```tsx
// ❌ Bad - No loading feedback
<Button onClick={handleClick}>Submit</Button>

// ✅ Good - Clear loading state
<LoadingButton onClick={handleClick} isLoading={isLoading}>
  Submit
</LoadingButton>
```

### 2. Disable During Loading
```tsx
// ✅ Automatically handled by LoadingButton/AsyncButton
<LoadingButton isLoading={isLoading} disabled={isLoading}>
  Submit
</LoadingButton>
```

### 3. Provide Context in Loading Text
```tsx
// ❌ Generic
<LoadingButton loadingText="Loading...">Submit</LoadingButton>

// ✅ Specific
<LoadingButton loadingText="Submitting form...">Submit</LoadingButton>
<LoadingButton loadingText="Saving changes...">Save</LoadingButton>
<LoadingButton loadingText="Deleting item...">Delete</LoadingButton>
```

### 4. Handle Multiple Async Actions
```tsx
const [action, setAction] = useState<'save' | 'publish' | null>(null);

<LoadingButton
  onClick={() => handleSave()}
  isLoading={action === 'save'}
  disabled={!!action}
>
  Save Draft
</LoadingButton>

<LoadingButton
  onClick={() => handlePublish()}
  isLoading={action === 'publish'}
  disabled={!!action}
>
  Publish
</LoadingButton>
```

### 5. Optimistic UI Updates
```tsx
const { execute, isLoading } = useAsyncAction(
  async () => {
    // Optimistically update UI
    setLiked(true);
    
    try {
      await likePost(postId);
    } catch (error) {
      // Revert on error
      setLiked(false);
      throw error;
    }
  }
);
```

## Testing Checklist

For each button action, verify:
- [ ] Loading state shows immediately on click
- [ ] Button is disabled during loading
- [ ] Loading text/spinner is visible
- [ ] Multiple clicks don't trigger multiple requests
- [ ] Loading state clears on success
- [ ] Loading state clears on error
- [ ] Error messages are shown to user
- [ ] Success feedback is provided

## Performance Considerations

1. **Debouncing**: For search/filter buttons, use debouncing
```tsx
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  async (query: string) => {
    await searchItems(query);
  },
  300
);
```

2. **Optimistic Updates**: For like/favorite actions, update UI immediately
3. **Loading Skeletons**: For data fetching, use skeleton loaders instead of spinners

## Common Pitfalls

### 1. Forgetting to Reset Loading State
```tsx
// ❌ Bad - Loading state never resets on error
const handleClick = async () => {
  setIsLoading(true);
  await doSomething(); // If this throws, loading stays true
};

// ✅ Good - Always reset in finally
const handleClick = async () => {
  setIsLoading(true);
  try {
    await doSomething();
  } finally {
    setIsLoading(false);
  }
};
```

### 2. Not Disabling Other Actions
```tsx
// ❌ Bad - User can click other buttons during loading
<Button onClick={handleSave} disabled={isSaving}>Save</Button>
<Button onClick={handleDelete}>Delete</Button>

// ✅ Good - Disable all actions during any loading
<Button onClick={handleSave} disabled={isSaving || isDeleting}>Save</Button>
<Button onClick={handleDelete} disabled={isSaving || isDeleting}>Delete</Button>
```

### 3. Missing Error Handling
```tsx
// ❌ Bad - No error feedback
const handleClick = async () => {
  await doSomething();
};

// ✅ Good - Show errors to user
const handleClick = async () => {
  try {
    await doSomething();
    toast({ title: 'Success!' });
  } catch (error) {
    toast({ 
      title: 'Error', 
      description: error.message,
      variant: 'destructive' 
    });
  }
};
```

## Next Steps

1. **Audit all components** - Search for `<Button` and `onClick` patterns
2. **Replace standard buttons** - Use LoadingButton or AsyncButton
3. **Add loading states** - Ensure all async operations have loading feedback
4. **Test thoroughly** - Verify UX improvements across the app
5. **Monitor performance** - Ensure loading states don't impact performance

## Additional Resources

- [React Hook Form with Loading States](https://react-hook-form.com/)
- [Next.js Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Optimistic UI Updates](https://www.apollographql.com/docs/react/performance/optimistic-ui/)

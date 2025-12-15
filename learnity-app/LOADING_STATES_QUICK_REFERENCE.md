# Loading States Quick Reference

## 🚀 Quick Start

### Option 1: LoadingButton (Recommended for most cases)
```tsx
import { LoadingButton } from '@/components/shared/LoadingButton';

const [isLoading, setIsLoading] = useState(false);

<LoadingButton
  onClick={handleClick}
  isLoading={isLoading}
  loadingText="Saving..."
>
  Save
</LoadingButton>
```

### Option 2: AsyncButton (Automatic handling)
```tsx
import { AsyncButton } from '@/components/ui/async-button';

<AsyncButton
  onClick={async () => {
    await saveData();
  }}
  loadingText="Saving..."
>
  Save
</AsyncButton>
```

### Option 3: useAsyncAction Hook (With error handling)
```tsx
import { useAsyncAction } from '@/hooks/useAsyncAction';

const { execute, isLoading } = useAsyncAction(
  async () => { await saveData(); },
  { successMessage: 'Saved!' }
);

<LoadingButton onClick={execute} isLoading={isLoading}>
  Save
</LoadingButton>
```

## 📋 Common Patterns

### Form Submit
```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    await submitForm();
  } finally {
    setIsSubmitting(false);
  }
};

<LoadingButton
  type="submit"
  isLoading={isSubmitting}
  loadingText="Submitting..."
>
  Submit
</LoadingButton>
```

### Delete Action
```tsx
const { execute, isLoading } = useAsyncAction(
  async () => { await deleteItem(); },
  { successMessage: 'Deleted!' }
);

<LoadingButton
  onClick={execute}
  isLoading={isLoading}
  variant="destructive"
>
  Delete
</LoadingButton>
```

### Multiple Actions
```tsx
const [action, setAction] = useState<'save' | 'publish' | null>(null);

<LoadingButton
  onClick={() => handleSave()}
  isLoading={action === 'save'}
  disabled={!!action}
>
  Save
</LoadingButton>

<LoadingButton
  onClick={() => handlePublish()}
  isLoading={action === 'publish'}
  disabled={!!action}
>
  Publish
</LoadingButton>
```

## 🎯 When to Use What

| Scenario | Use | Why |
|----------|-----|-----|
| Simple button click | `LoadingButton` | Easy to implement, full control |
| Auto-managed async | `AsyncButton` | No manual state needed |
| Need error handling | `useAsyncAction` | Built-in toasts and error handling |
| Form submission | `LoadingButton` | Works with form events |
| Multiple actions | `LoadingButton` + state | Fine-grained control |

## ⚡ Quick Fixes

### Before (No loading state)
```tsx
<Button onClick={handleClick}>Save</Button>
```

### After (With loading state)
```tsx
<LoadingButton onClick={handleClick} isLoading={isLoading}>
  Save
</LoadingButton>
```

## 🔧 Props Reference

### LoadingButton
- `isLoading`: boolean - Show loading state
- `loadingText`: string - Text during loading (optional)
- All standard Button props

### AsyncButton
- `onClick`: async function - Async handler
- `isLoading`: boolean - External loading control (optional)
- `loadingText`: string - Text during loading (optional)
- `showLoadingIcon`: boolean - Show spinner (default: true)
- All standard Button props

### useAsyncAction
- `action`: async function - Function to execute
- `options.successMessage`: string - Toast on success
- `options.errorMessage`: string - Toast on error
- `options.onSuccess`: function - Callback on success
- `options.onError`: function - Callback on error

Returns: `{ execute, isLoading, error }`

## 📚 Full Documentation
See `LOADING_STATES_IMPLEMENTATION_GUIDE.md` for complete documentation.

## 🧪 Example Component
See `src/components/shared/LoadingStatesExample.tsx` for live examples.

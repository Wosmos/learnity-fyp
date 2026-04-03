'use client';

import { ErrorBoundaryContent } from '@/components/shared/ErrorBoundaryContent';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundaryContent
      error={error}
      reset={reset}
      title='Authentication error'
      backHref='/auth/login'
      backLabel='Back to login'
    />
  );
}

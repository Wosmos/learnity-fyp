'use client';

import { ErrorBoundaryContent } from '@/components/shared/ErrorBoundaryContent';

export default function CoursesError({
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
      backHref='/courses'
      backLabel='Back to courses'
    />
  );
}

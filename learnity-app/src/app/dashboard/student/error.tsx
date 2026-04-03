'use client';

import { ErrorBoundaryContent } from '@/components/shared/ErrorBoundaryContent';

export default function StudentDashboardError({
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
      backHref='/dashboard/student'
      backLabel='Back to dashboard'
    />
  );
}

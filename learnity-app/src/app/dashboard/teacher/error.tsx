'use client';

import { ErrorBoundaryContent } from '@/components/shared/ErrorBoundaryContent';

export default function TeacherDashboardError({
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
      backHref='/dashboard/teacher'
      backLabel='Back to dashboard'
    />
  );
}

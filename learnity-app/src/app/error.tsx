'use client';

import { ErrorBoundaryContent } from '@/components/shared/ErrorBoundaryContent';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundaryContent error={error} reset={reset} backHref='/' backLabel='Go home' />;
}

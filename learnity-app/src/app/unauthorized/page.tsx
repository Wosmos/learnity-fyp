/**
 * Unauthorized Access Page
 * Enhanced page with role-based messaging and proper redirect handling
 */

import { SearchParamsProvider } from '@/components/providers/SearchParamsProvider';
import { UnauthorizedContent } from './UnauthorizedContent';

export default function UnauthorizedPage() {
  return (
    <SearchParamsProvider>
      <UnauthorizedContent />
    </SearchParamsProvider>
  );
}

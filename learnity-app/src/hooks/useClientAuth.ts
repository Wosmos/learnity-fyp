/**
 * Client-Side Authentication Hook
 * @deprecated This hook is maintained for backward compatibility.
 * Please use useAuth() from '@/hooks/useAuth' instead.
 * 
 * This file re-exports the unified authentication hook to maintain
 * backward compatibility with existing code.
 */

'use client';

// Re-export for backward compatibility
export {
  useClientAuth,
  type ClientAuthState
} from './useAuth.unified';
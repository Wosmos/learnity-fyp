/**
 * Toast Hook
 * Simple toast notification system
 */

import { useState, useCallback } from 'react';

export interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((toast: Toast) => {
    // For now, use browser alert
    // In production, implement proper toast UI
    if (toast.variant === 'destructive') {
      alert(`Error: ${toast.title}\n${toast.description || ''}`);
    } else {
      alert(`${toast.title}\n${toast.description || ''}`);
    }
  }, []);

  return { toast, toasts };
}

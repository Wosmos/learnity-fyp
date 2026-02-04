/**
 * Admin Route Group Layout
 * Provides admin route protection at the route group level
 */

import { Metadata } from 'next';
import { AdminRoute } from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Admin Panel - Learnity',
  description: 'Administrative interface for Learnity platform management',
};

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminRoute>{children}</AdminRoute>;
}

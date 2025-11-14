/**
 * Admin Route Group Layout
 * Provides admin route protection at the route group level
 */

import { Metadata } from 'next';
import { ClientAdminProtection } from '@/components/auth/ClientAdminProtection';

export const metadata: Metadata = {
  title: 'Admin Panel - Learnity',
  description: 'Administrative interface for Learnity platform management',
};

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientAdminProtection>
      {children}
    </ClientAdminProtection>
  );
}
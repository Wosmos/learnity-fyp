/**
 * Admin Layout
 * Protects admin routes and provides common layout
 */

import { Metadata } from 'next';
import { ClientAdminProtection } from '@/components/auth/ClientAdminProtection';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Learnity',
  description: 'Administrative interface for Learnity platform management',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientAdminProtection>
      <div className="admin-layout">
        {children}
      </div>
    </ClientAdminProtection>
  );
}
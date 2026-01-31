import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDemoClient } from '@/components/admin/AdminDemoClient';

/**
 * Admin Demo Page (Server Component)
 * Demonstrates audit logging functionality via SSR shell + Client Logic
 */
export default async function AdminDemoPage() {
  // Role protection is handled by AdminLayout (client-side)
  // and basic auth by middleware.ts

  return (
    <AdminLayout>
      <AdminDemoClient />
    </AdminLayout>
  );
}

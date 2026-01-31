import { getUsers } from '@/lib/services/user-management.service';
import { UserManagementClient } from '@/components/admin/users/UserManagementClient';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Management | Admin',
  description:
    'Unified control center for managing platform users, students, and teacher applications.',
};

/**
 * Unified User Management Page (Server Component)
 * Combines Student and Teacher management with recursive SSR data fetching
 * and tag-based caching for lightning fast performance.
 */
export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: Promise<{
    role?: string;
    search?: string;
    page?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const role = params.role || 'all';
  const search = params.search || '';
  const page = parseInt(params.page || '1');
  const status = params.status || 'all';

  // Fetch SSR data with Next.js Cache (using tag-based revalidation)
  const data = await getUsers({
    role,
    search,
    page,
    status,
    limit: 50,
  });

  return (
    <AdminLayout>
      <div className='flex flex-col gap-8'>
        {/* Header */}
        <div className='flex flex-col gap-1'>
          <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
            User Management
          </h1>
          <p className='text-slate-500 max-w-2xl'>
            Manage access, review teacher applications, and monitor user
            activity across the entire Learnity platform from one unified
            dashboard.
          </p>
        </div>

        {/* Data Integrated Interface */}
        <UserManagementClient initialData={data} />
      </div>
    </AdminLayout>
  );
}

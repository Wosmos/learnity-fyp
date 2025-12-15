import { AdminRoute } from '@/components/auth';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Learnity',
  description: 'Administrative dashboard for managing the Learnity platform',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminRoute>{children}</AdminRoute>;
}
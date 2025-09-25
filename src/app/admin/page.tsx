'use client';

import dynamic from 'next/dynamic';

// Dynamically import the AdminDashboard to avoid SSR issues
const AdminDashboard = dynamic(() => import('@/components/pages/AdminDashboard'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AdminPage() {
  return <AdminDashboard />;
}
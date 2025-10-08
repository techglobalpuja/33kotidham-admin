'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { isAuthenticated } from '@/utils/auth';

// Dynamically import the AdminDashboard to avoid SSR issues
const AdminDashboard = dynamic(() => import('@/components/pages/AdminDashboard'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AdminPage() {
  const router = useRouter();
  const { user } = useSelector((state: any) => state.auth);

  useEffect(() => {
    // Check if user is authenticated
    const authenticated = isAuthenticated() && user;
    
    if (!authenticated) {
      // Redirect to signin page if not authenticated
      router.push('/admin/signin');
    }
  }, [router, user]);

  // If not authenticated, don't render the dashboard
  if (!isAuthenticated() || !user) {
    return null;
  }

  return <AdminDashboard />;
}
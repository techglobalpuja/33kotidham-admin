'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AdminStats } from '@/types';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { fetchDashboardStats } from '@/store/slices/dashboardSlice';
import { RootState, AppDispatch } from '@/store';
import OverviewTab from '@/components/admin/dashboard/OverviewTab';
import PujaManagement from '@/components/admin/puja/PujaManagement';
import PujaProcessManagement from '@/components/admin/puja-process/PujaProcessManagement';
import PlanManagement from '@/components/admin/plan/PlanManagement';
import ChawadaManagement from '@/components/admin/chawada/ChawadaManagement';
import ProductManagement from '@/components/admin/product/ProductManagement';
import UsersManagement from '@/components/admin/users/UsersManagement';
import PujaBookingManagement from '@/components/admin/puja-bookings/PujaBookingManagement';
import ChadawaBookingManagement from '@/components/admin/chadawa-bookings/ChadawaBookingManagement';
import ContentManagement from '@/components/admin/content/ContentManagement';
import BlogManagement from '@/components/admin/blog/BlogManagement';
import TempleManagement from '@/components/admin/temple/TempleManagement';
import AnalyticsTab from '@/components/admin/analytics/AnalyticsTab';
import { useRequireAuth } from '@/hooks/useAuth';

interface AdminDashboardProps {
  // Add props here if needed in the future
  [key: string]: unknown;
}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { isAuthenticated } = useRequireAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get dashboard stats from Redux store
  const { stats, isLoading, error } = useSelector((state: RootState) => state.dashboard);
  
  // Get initial tab from URL or default to 'overview'
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    const validTabs = ['overview', 'pujas', 'puja-process', 'plans', 'store', 'chawada', 'products', 'users', 'puja-bookings', 'chadawa-bookings', 'content', 'blogs', 'temples', 'analytics'];
    return tabParam && validTabs.includes(tabParam) ? tabParam : 'overview';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL without page reload
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Fetch dashboard stats on component mount
  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getInitialTab());
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // If not authenticated, don't render the dashboard
  if (!isAuthenticated) {
    return null;
  }

  // Fallback stats for when data is loading or unavailable
  const defaultStats: AdminStats = {
    totalUsers: 0,
    totalPujas: 0,
    totalEarnings: 0,
    totalOrders: 0,
    totalPujaBookings: 0,
    totalChadawaBookings: 0,
    totalBlogs: 0,
    totalChadawaItems: 0,
    monthlyGrowth: {
      users: 0,
      pujas: 0,
      earnings: 0,
      orders: 0,
      pujaBookings: 0,
      chadawaBookings: 0
    }
  };

  const adminStats = stats || defaultStats;

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={adminStats} isLoading={isLoading} error={error} onTabChange={handleTabChange} />;
      case 'pujas':
        return <PujaManagement />;
      case 'puja-process':
        return <PujaProcessManagement />;
      case 'plans':
        return <PlanManagement />;
      case 'store':
        return <ProductManagement />;
      case 'chawada':
        return <ChawadaManagement />;
      case 'products':
        return <ProductManagement />;
      case 'users':
        return <UsersManagement />;
      case 'puja-bookings':
        return <PujaBookingManagement />;
      case 'chadawa-bookings':
        return <ChadawaBookingManagement />;
      case 'content':
        return <ContentManagement />;
      case 'blogs':
        return <BlogManagement />;
      case 'temples':
        return <TempleManagement />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return <OverviewTab stats={adminStats} isLoading={isLoading} error={error} onTabChange={handleTabChange} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hi-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderActiveTab()}
    </AdminLayout>
  );
};

export default AdminDashboard;
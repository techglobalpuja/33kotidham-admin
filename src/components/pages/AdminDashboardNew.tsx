'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AdminStats } from '@/types';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import OverviewTab from '@/components/admin/dashboard/OverviewTab';
import PujaManagement from '@/components/admin/puja/PujaManagement';
import PlanManagement from '@/components/admin/plan/PlanManagement';
import ChawadaManagement from '@/components/admin/chawada/ChawadaManagement';
import ProductManagement from '@/components/admin/product/ProductManagement';
import PujaProcessManagement from '@/components/admin/puja-process/PujaProcessManagement';
import TempleManagement from '@/components/admin/temple/TempleManagement';
import UsersManagement from '@/components/admin/users/UsersManagement';
import PujaBookingManagement from '@/components/admin/puja-bookings/PujaBookingManagement';
import ChadawaBookingManagement from '@/components/admin/chadawa-bookings/ChadawaBookingManagement';
import BlogManagement from '@/components/admin/blog/BlogManagement';
import { fetchDashboardStats } from '@/store/slices/dashboardSlice';
import { RootState, AppDispatch } from '@/store';

interface AdminDashboardProps {
  // Add props here if needed in the future
  [key: string]: unknown;
}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const dispatch = useDispatch<AppDispatch>();
  
  // Get dashboard stats from Redux store
  const { stats, isLoading, error } = useSelector((state: RootState) => state.dashboard);

  // Fetch dashboard stats on component mount
  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

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
        return <OverviewTab stats={adminStats} isLoading={isLoading} error={error} />;
      case 'pujas':
        return <PujaManagement />;
      case 'puja-process':
        return <PujaProcessManagement />;
      case 'temples':
        return <TempleManagement />;
      case 'plans':
        return <PlanManagement />;
      case 'users':
        return <UsersManagement />;
      case 'chawada':
        return <ChawadaManagement />;
      case 'puja-bookings':
        return <PujaBookingManagement />;
      case 'chadawa-bookings':
        return <ChadawaBookingManagement />;
      case 'blogs':
        return <BlogManagement />;
      case 'products':
        return <ProductManagement />;
      default:
        return <OverviewTab stats={adminStats} isLoading={isLoading} error={error} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActiveTab()}
    </AdminLayout>
  );
};

export default AdminDashboard;
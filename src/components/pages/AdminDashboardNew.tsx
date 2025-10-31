'use client';

import React, { useState } from 'react';
import { AdminStats } from '@/types';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import OverviewTab from '@/components/admin/dashboard/OverviewTab';
import PujaManagement from '@/components/admin/puja/PujaManagement';
import PlanManagement from '@/components/admin/plan/PlanManagement';
import ChawadaManagement from '@/components/admin/chawada/ChawadaManagement';
import ProductManagement from '@/components/admin/product/ProductManagement';

interface AdminDashboardProps {
  // Add props here if needed in the future
  [key: string]: unknown;
}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock admin stats data
  const adminStats: AdminStats = {
    totalUsers: 1284,
    totalPujas: 156,
    totalEarnings: 2847593,
    totalOrders: 3456,
    totalPujaBookings: 892,
    totalChadawaBookings: 1204,
    monthlyGrowth: {
      users: 12.5,
      pujas: 8.3,
      earnings: 15.7,
      orders: 11.2,
      pujaBookings: 9.7,
      chadawaBookings: 14.2
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={adminStats} />;
      case 'pujas':
        return <PujaManagement />;
      case 'plans':
        return <PlanManagement />;
      case 'chawada':
        return <ChawadaManagement />;
      case 'products':
        return <ProductManagement />;
      case 'users':
        return <div>Users Management</div>;
      case 'orders':
        return <div>Orders Management</div>;
      case 'content':
        return <div>Content Management</div>;
      default:
        return <OverviewTab stats={adminStats} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActiveTab()}
    </AdminLayout>
  );
};

export default AdminDashboard;
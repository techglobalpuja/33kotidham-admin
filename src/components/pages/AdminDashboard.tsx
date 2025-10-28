'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { AdminStats } from '@/types';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import OverviewTab from '@/components/admin/dashboard/OverviewTab';
import PujaManagement from '@/components/admin/puja/PujaManagement';
import PlanManagement from '@/components/admin/plan/PlanManagement';
import ChawadaManagement from '@/components/admin/chawada/ChawadaManagement';
import ProductManagement from '@/components/admin/product/ProductManagement';
import UsersManagement from '@/components/admin/users/UsersManagement';
import BookingManagement from '@/components/admin/bookings/BookingManagement';
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
  const { isAuthenticated, user } = useRequireAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get initial tab from URL or default to 'overview'
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    const validTabs = ['overview', 'pujas', 'plans', 'chawada', 'products', 'users', 'orders', 'content', 'blogs', 'temples', 'analytics'];
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

  // Mock admin stats data
  const adminStats: AdminStats = {
    totalUsers: 1247,
    totalPujas: 156,
    totalEarnings: 2847593,
    totalOrders: 3456,
    monthlyGrowth: {
      users: 12.5,
      pujas: 8.3,
      earnings: 15.7,
      orders: 11.2
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
        return <UsersManagement />;
      case 'orders':
        return <BookingManagement />;
      case 'content':
        return <ContentManagement />;
      case 'blogs':
        return <BlogManagement />;
      case 'temples':
        return <TempleManagement />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return <OverviewTab stats={adminStats} />;
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
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.totalUsers.toLocaleString()}</p>
                  <p className={`text-sm ${getGrowthColor(adminStats.monthlyGrowth.users)}`}>
                    +{adminStats.monthlyGrowth.users}% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            

            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(adminStats.totalEarnings)}</p>
                  <p className={`text-sm ${getGrowthColor(adminStats.monthlyGrowth.earnings)}`}>
                    +{adminStats.monthlyGrowth.earnings}% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Puja Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.totalOrders.toLocaleString()}</p>
                  <p className={`text-sm ${getGrowthColor(adminStats.monthlyGrowth.orders)}`}>
                    +{adminStats.monthlyGrowth.orders}% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chadhawa Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.totalOrders.toLocaleString()}</p>
                  <p className={`text-sm ${getGrowthColor(adminStats.monthlyGrowth.orders)}`}>
                    +{adminStats.monthlyGrowth.orders}% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pujas</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.totalPujas}</p>
                  
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Blogs</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.totalOrders.toLocaleString()}</p>
                  
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chadhawa Items</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.totalOrders.toLocaleString()}</p>
                  
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => handleTabChange('pujas')}
                className="p-4 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg hover:from-orange-200 hover:to-orange-300 transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 text-orange-600 group-hover:scale-110 transition-transform duration-200">
                    🛕
                  </div>
                  <p className="text-sm font-medium text-gray-900">Add Puja</p>
                </div>
              </button>
              
              <button
                onClick={() => handleTabChange('plans')}
                className="p-4 bg-gradient-to-r from-indigo-100 to-indigo-200 rounded-lg hover:from-indigo-200 hover:to-indigo-300 transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 text-indigo-600 group-hover:scale-110 transition-transform duration-200">
                    📋
                  </div>
                  <p className="text-sm font-medium text-gray-900">Add Plan</p>
                </div>
              </button>
              
              {/* <button
                onClick={() => handleTabChange('products')}
                className="p-4 bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-lg hover:from-emerald-200 hover:to-emerald-300 transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 text-emerald-600 group-hover:scale-110 transition-transform duration-200">
                    📦
                  </div>
                  <p className="text-sm font-medium text-gray-900">Add Product</p>
                </div>
              </button> */}
              
              <button
                onClick={() => handleTabChange('chawada')}
                className="p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg hover:from-purple-200 hover:to-purple-300 transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform duration-200">
                    🛍️
                  </div>
                  <p className="text-sm font-medium text-gray-900">Add Chadhawa</p>
                </div>
              </button>
              
              <button
                onClick={() => handleTabChange('users')}
                className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg hover:from-blue-200 hover:to-blue-300 transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform duration-200">
                    👥
                  </div>
                  <p className="text-sm font-medium text-gray-900">Check Bookings</p>
                </div>
              </button>
              
              {/* <button
                onClick={() => handleTabChange('content')}
                className="p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-lg hover:from-green-200 hover:to-green-300 transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform duration-200">
                    📁
                  </div>
                  <p className="text-sm font-medium text-gray-900">Upload Content</p>
                </div>
              </button> */}
            </div>
          </div>
        </div>
      )}

      {/* Other tabs */}
      {activeTab !== 'overview' && renderActiveTab()}
    </AdminLayout>
  );
};

export default AdminDashboard;
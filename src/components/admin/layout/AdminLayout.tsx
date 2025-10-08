'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearAuthToken } from '@/utils/auth';
import { clearUser } from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'pujas', label: 'Manage Pujas', icon: '🛕' },
    { id: 'plans', label: 'Manage Plans', icon: '📋' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'chawada', label: 'Chawada Store', icon: '🛍️' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'blogs', label: 'Blogs', icon: '📝' },
    { id: 'content', label: 'Content', icon: '📁' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  const handleLogout = () => {
    // Clear auth token and user data
    clearAuthToken();
    dispatch(clearUser());
    
    // Redirect to signin page
    router.push('/admin/signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-orange-200">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">Home</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900 font-['Philosopher']">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Logout</span>
              </button>
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-orange-100 px-4 py-2 rounded-full">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                  A
                </div>
                <span className="text-sm font-medium text-gray-700">Admin User</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {menuItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
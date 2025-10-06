'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const router = useRouter();
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
    // TODO: Implement logout functionality
    router.push('/');
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
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900 font-['Philosopher']">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
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
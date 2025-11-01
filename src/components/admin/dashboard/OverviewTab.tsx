'use client';

import React from 'react';
import { AdminStats } from '@/types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OverviewTabProps {
  stats: AdminStats;
  isLoading?: boolean;
  error?: string | null;
  onTabChange?: (tab: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ stats, isLoading = false, error = null, onTabChange }) => {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.monthlyGrowth.users}%`,
      changeLabel: 'this month',
      icon: '👥',
      color: 'bg-blue-500'
    },
    {
      title: 'Total Earnings',
      value: `₹${stats.totalEarnings.toLocaleString()}`,
      change: `+${stats.monthlyGrowth.earnings}%`,
      changeLabel: 'this month',
      icon: '💰',
      color: 'bg-yellow-500'
    },
    {
      title: 'Puja Bookings',
      value: stats.totalPujaBookings.toLocaleString(),
      change: `+${stats.monthlyGrowth.pujaBookings}%`,
      changeLabel: 'this month',
      icon: '📦',
      color: 'bg-purple-500'
    },
    {
      title: 'Chadhawa Bookings',
      value: stats.totalChadawaBookings.toLocaleString(),
      change: `+${stats.monthlyGrowth.chadawaBookings}%`,
      changeLabel: 'this month',
      icon: '🛍️',
      color: 'bg-orange-500'
    },
    {
      title: 'Total Pujas',
      value: stats.totalPujas.toLocaleString(),
      change: null,
      changeLabel: null,
      icon: '🛕',
      color: 'bg-green-500'
    },
    {
      title: 'Total Blogs',
      value: stats.totalBlogs.toLocaleString(),
      change: null,
      changeLabel: null,
      icon: '📝',
      color: 'bg-indigo-500'
    },
    {
      title: 'Chadhawa Items',
      value: stats.totalChadawaItems.toLocaleString(),
      change: null,
      changeLabel: null,
      icon: '🎁',
      color: 'bg-pink-500'
    }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                {card.change && card.changeLabel && (
                  <p className="text-sm text-green-500 mt-1">
                    <span className="inline-flex items-center">
                      {card.change} {card.changeLabel}
                    </span>
                  </p>
                )}
              </div>
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statistics Overview Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  name: 'Users',
                  count: stats.totalUsers,
                  fill: '#3B82F6'
                },
                {
                  name: 'Pujas',
                  count: stats.totalPujas,
                  fill: '#10B981'
                },
                {
                  name: 'Puja Bookings',
                  count: stats.totalPujaBookings,
                  fill: '#8B5CF6'
                },
                {
                  name: 'Chadawa Bookings',
                  count: stats.totalChadawaBookings,
                  fill: '#F59E0B'
                },
                {
                  name: 'Blogs',
                  count: stats.totalBlogs,
                  fill: '#6366F1'
                },
                {
                  name: 'Chadawa Items',
                  count: stats.totalChadawaItems,
                  fill: '#EC4899'
                }
              ]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Growth (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={[
                {
                  name: 'Users',
                  growth: stats.monthlyGrowth.users
                },
                {
                  name: 'Pujas',
                  growth: stats.monthlyGrowth.pujas
                },
                {
                  name: 'Earnings',
                  growth: stats.monthlyGrowth.earnings
                },
                {
                  name: 'Puja Bookings',
                  growth: stats.monthlyGrowth.pujaBookings
                },
                {
                  name: 'Chadawa Bookings',
                  growth: stats.monthlyGrowth.chadawaBookings
                }
              ]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line type="monotone" dataKey="growth" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <button
            onClick={() => onTabChange?.('pujas')}
            className="p-4 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg hover:from-orange-200 hover:to-orange-300 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                🛕
              </div>
              <p className="text-sm font-medium text-gray-900">Manage Pujas</p>
            </div>
          </button>
          
          <button
            onClick={() => onTabChange?.('plans')}
            className="p-4 bg-gradient-to-r from-indigo-100 to-indigo-200 rounded-lg hover:from-indigo-200 hover:to-indigo-300 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                📋
              </div>
              <p className="text-sm font-medium text-gray-900">Manage Plans</p>
            </div>
          </button>
          
          <button
            onClick={() => onTabChange?.('chawada')}
            className="p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg hover:from-purple-200 hover:to-purple-300 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                🛍️
              </div>
              <p className="text-sm font-medium text-gray-900">Chawada Store</p>
            </div>
          </button>
          
          <button
            onClick={() => onTabChange?.('puja-bookings')}
            className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg hover:from-blue-200 hover:to-blue-300 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                📦
              </div>
              <p className="text-sm font-medium text-gray-900">Puja Bookings</p>
            </div>
          </button>
          
          <button
            onClick={() => onTabChange?.('blogs')}
            className="p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-lg hover:from-green-200 hover:to-green-300 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                📝
              </div>
              <p className="text-sm font-medium text-gray-900">Manage Blogs</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
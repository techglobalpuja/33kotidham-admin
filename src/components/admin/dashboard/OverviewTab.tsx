'use client';

import React from 'react';
import { AdminStats } from '@/types';

interface OverviewTabProps {
  stats: AdminStats;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: `${stats.monthlyGrowth.users}%`,
      icon: '👥',
      color: 'bg-blue-500'
    },
    {
      title: 'Total Pujas',
      value: stats.totalPujas.toLocaleString(),
      change: `${stats.monthlyGrowth.pujas}%`,
      icon: '🛕',
      color: 'bg-green-500'
    },
    {
      title: 'Total Earnings',
      value: `₹${(stats.totalEarnings / 100000).toFixed(2)}L`,
      change: `${stats.monthlyGrowth.earnings}%`,
      icon: '💰',
      color: 'bg-yellow-500'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      change: `${stats.monthlyGrowth.orders}%`,
      icon: '📋',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-sm text-green-500 mt-1">
                  <span className="inline-flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {card.change}
                  </span>
                  from last month
                </p>
              </div>
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <span className="text-gray-400">📊 Revenue Chart</span>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <span className="text-gray-400">📈 Growth Chart</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center py-3 border-b border-gray-100 last:border-0">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                {item}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-900">Recent activity {item}</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
              <div className="text-sm text-gray-500">₹{item * 1000}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
'use client';

import React from 'react';

const AnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Analytics */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">📊 Revenue Chart</span>
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">📈 Growth Chart</span>
          </div>
        </div>

        {/* Popular Pujas */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Pujas</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">🔥 Popular Pujas Chart</span>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">🌍 Geographic Chart</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
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

export default AnalyticsTab;
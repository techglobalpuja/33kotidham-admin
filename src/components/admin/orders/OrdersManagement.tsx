'use client';

import React from 'react';
import OrderList from './components/OrderList';

const OrdersManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage all product orders</p>
        </div>
      </div>

      {/* Orders Management Section */}
      <div className="bg-white rounded-xl shadow-lg border border-orange-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">All Orders</h2>
              <p className="text-sm text-gray-600 mt-1">View and manage customer orders</p>
            </div>
          </div>

          <OrderList />
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement;
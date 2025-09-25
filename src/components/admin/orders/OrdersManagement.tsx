'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import EditText from '@/components/ui/EditText';

const OrdersManagement: React.FC = () => {
  // Mock order data
  const mockOrders = [
    {
      id: '1',
      orderNumber: 'GP001234',
      customer: 'John Doe',
      puja: 'Ganesh Puja',
      date: '2024-01-15',
      amount: 2500,
      status: 'Completed'
    },
    {
      id: '2',
      orderNumber: 'LP002345',
      customer: 'Jane Smith',
      puja: 'Lakshmi Puja',
      date: '2024-01-14',
      amount: 3200,
      status: 'Processing'
    },
    {
      id: '3',
      orderNumber: 'SP003456',
      customer: 'Robert Johnson',
      puja: 'Saraswati Puja',
      date: '2024-01-13',
      amount: 1800,
      status: 'Shipped'
    },
    {
      id: '4',
      orderNumber: 'DP004567',
      customer: 'Emily Davis',
      puja: 'Durga Puja',
      date: '2024-01-12',
      amount: 4500,
      status: 'Cancelled'
    }
  ];

  // Status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        <Button variant="primary">
          Export Orders
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex space-x-2">
          <EditText
            placeholder="Search orders..."
            className="w-48"
          />
          <Button variant="outline" size="sm">
            Filter
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Puja
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{order.customer}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{order.puja}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ₹{order.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button variant="outline" size="sm" className="mr-2">
                    View
                  </Button>
                  <Button variant="primary" size="sm">
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
        <div className="flex flex-1 justify-between sm:hidden">
          <Button variant="outline">Previous</Button>
          <Button variant="outline">Next</Button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">4</span> of{' '}
              <span className="font-medium">4</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <Button variant="outline" className="rounded-l-md">Previous</Button>
              <Button variant="primary">1</Button>
              <Button variant="outline" className="rounded-r-md">Next</Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement;
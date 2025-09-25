'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import EditText from '@/components/ui/EditText';

const PlanManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'add'>('all');

  // Mock plan data
  const mockPlans = [
    {
      id: '1',
      name: 'Basic Puja Package',
      price: 1500,
      category: 'Normal',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Premium VIP Experience',
      price: 5000,
      category: 'VIP',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Standard Family Package',
      price: 3000,
      category: 'Normal',
      status: 'Inactive'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Plan Management</h2>
        <div className="flex space-x-3">
          <Button
            variant={activeSubTab === 'all' ? 'primary' : 'outline'}
            onClick={() => setActiveSubTab('all')}
          >
            All Plans
          </Button>
          <Button
            variant={activeSubTab === 'add' ? 'primary' : 'outline'}
            onClick={() => setActiveSubTab('add')}
          >
            Add New Plan
          </Button>
        </div>
      </div>

      {activeSubTab === 'all' ? (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex space-x-2">
              <EditText
                placeholder="Search plans..."
                className="w-48"
              />
              <Button variant="outline" size="sm">
                Filter
              </Button>
            </div>
          </div>

          {/* Plan List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
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
                {mockPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">₹{plan.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        plan.category === 'VIP' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {plan.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        plan.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="outline" size="sm" className="mr-2">
                        Edit
                      </Button>
                      <Button variant="danger" size="sm">
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Add New Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <EditText
                label="Plan Name"
                placeholder="Enter plan name"
                fullWidth
              />
            </div>
            <div>
              <EditText
                label="Price"
                placeholder="Enter price"
                type="number"
                fullWidth
              />
            </div>
            <div>
              <div className="block text-sm font-medium text-[#111111] mb-1 sm:mb-2">
                Category
              </div>
              <select className="w-full transition-all duration-200 ease-in-out border border-[#5c4228] rounded-[30px] bg-[#fff3ee] text-[#111111] placeholder:text-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#f37335] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-4 py-3 sm:py-4">
                <option value="Normal">Normal</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <div className="block text-sm font-medium text-[#111111] mb-1 sm:mb-2">
                Description
              </div>
              <textarea
                placeholder="Enter plan description"
                className="w-full transition-all duration-200 ease-in-out border border-[#5c4228] rounded-[30px] bg-[#fff3ee] text-[#111111] placeholder:text-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#f37335] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-4 py-3 sm:py-4"
                rows={4}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline">Cancel</Button>
            <Button variant="primary">Save Plan</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagement;
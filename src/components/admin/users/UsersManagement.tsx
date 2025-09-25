'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import EditText from '@/components/ui/EditText';

const UsersManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'add'>('all');

  // Mock user data
  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'Active',
      joinedDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'User',
      status: 'Active',
      joinedDate: '2024-01-10'
    },
    {
      id: '3',
      name: 'Robert Johnson',
      email: 'robert@example.com',
      role: 'User',
      status: 'Inactive',
      joinedDate: '2024-01-08'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex space-x-3">
          <Button
            variant={activeSubTab === 'all' ? 'primary' : 'outline'}
            onClick={() => setActiveSubTab('all')}
          >
            All Users
          </Button>
          <Button
            variant={activeSubTab === 'add' ? 'primary' : 'outline'}
            onClick={() => setActiveSubTab('add')}
          >
            Add New User
          </Button>
        </div>
      </div>

      {activeSubTab === 'all' ? (
        <>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex space-x-2">
              <EditText
                placeholder="Search users..."
                className="w-48"
              />
              <Button variant="outline" size="sm">
                Filter
              </Button>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-orange-600 font-medium">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.joinedDate}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Add New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <EditText
                label="Full Name"
                placeholder="Enter full name"
                fullWidth
              />
            </div>
            <div>
              <EditText
                label="Email Address"
                type="email"
                placeholder="Enter email address"
                fullWidth
              />
            </div>
            <div>
              <EditText
                label="Password"
                type="password"
                placeholder="Enter password"
                fullWidth
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1 sm:mb-2">
                Role
              </label>
              <select className="w-full transition-all duration-200 ease-in-out border border-[#5c4228] rounded-[30px] bg-[#fff3ee] text-[#111111] placeholder:text-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#f37335] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-4 py-3 sm:py-4">
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline">Cancel</Button>
            <Button variant="primary">Save User</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
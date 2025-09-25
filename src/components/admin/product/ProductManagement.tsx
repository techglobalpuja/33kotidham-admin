'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import EditText from '@/components/ui/EditText';

const ProductManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'add'>('all');

  // Mock product data
  const mockProducts = [
    {
      id: '1',
      name: 'Puja Thali',
      price: 750,
      category: 'Puja Items',
      inStock: true,
      quantity: 100
    },
    {
      id: '2',
      name: 'Yantra Set',
      price: 1200,
      category: 'Spiritual',
      inStock: true,
      quantity: 30
    },
    {
      id: '3',
      name: 'Divine Fragrance',
      price: 450,
      category: 'Accessories',
      inStock: false,
      quantity: 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        <div className="flex space-x-3">
          <Button
            variant={activeSubTab === 'all' ? 'primary' : 'outline'}
            onClick={() => setActiveSubTab('all')}
          >
            All Products
          </Button>
          <Button
            variant={activeSubTab === 'add' ? 'primary' : 'outline'}
            onClick={() => setActiveSubTab('add')}
          >
            Add New Product
          </Button>
        </div>
      </div>

      {activeSubTab === 'all' ? (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex space-x-2">
              <EditText
                placeholder="Search products..."
                className="w-48"
              />
              <Button variant="outline" size="sm">
                Filter
              </Button>
            </div>
          </div>

          {/* Product List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">₹{product.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{product.quantity}</div>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Add New Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <EditText
                label="Product Name"
                placeholder="Enter product name"
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
              <EditText
                label="Category"
                placeholder="Enter category"
                fullWidth
              />
            </div>
            <div>
              <EditText
                label="Quantity"
                placeholder="Enter quantity"
                type="number"
                fullWidth
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inStock"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="inStock" className="ml-2 block text-sm text-gray-900">
                  In Stock
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="block text-sm font-medium text-[#111111] mb-1 sm:mb-2">
                Description
              </div>
              <textarea
                placeholder="Enter product description"
                className="w-full transition-all duration-200 ease-in-out border border-[#5c4228] rounded-[30px] bg-[#fff3ee] text-[#111111] placeholder:text-[#6d6d6d] focus:outline-none focus:ring-2 focus:ring-[#f37335] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-4 py-3 sm:py-4"
                rows={4}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline">Cancel</Button>
            <Button variant="primary">Save Product</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
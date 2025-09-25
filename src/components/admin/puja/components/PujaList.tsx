'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

interface Puja {
  id: string;
  pujaName: string;
  subHeading: string;
  templeAddress: string;
  category: string;
  prasadPrice: number;
  dakshinaPrice: number;
  manokamnaPrice: number;
  about: string;
  isActive: boolean;
  isFeatured: boolean;
  pujaImages: string[];
  createdDate: string;
  selectedPlan: string;
}

interface PujaListProps {
  viewMode?: 'grid' | 'table';
}

const PujaList: React.FC<PujaListProps> = ({ viewMode = 'grid' }) => {
  // Mock puja data
  const mockPujas: Puja[] = [
    {
      id: '1',
      pujaName: 'Ganesh Puja',
      subHeading: 'Remove Obstacles & Bring Prosperity',
      templeAddress: 'Siddhivinayak Temple, Mumbai',
      category: 'prosperity',
      prasadPrice: 500,
      dakshinaPrice: 1500,
      manokamnaPrice: 251,
      about: 'Complete Ganesh puja for removing obstacles and bringing prosperity to your life',
      isActive: true,
      isFeatured: true,
      pujaImages: ['/images/ganesh-puja-1.jpg', '/images/ganesh-puja-2.jpg'],
      createdDate: '2024-01-15',
      selectedPlan: 'Premium VIP Experience'
    },
    {
      id: '2',
      pujaName: 'Lakshmi Puja',
      subHeading: 'Attract Wealth & Abundance',
      templeAddress: 'Mahalakshmi Temple, Kolhapur',
      category: 'prosperity',
      prasadPrice: 750,
      dakshinaPrice: 2500,
      manokamnaPrice: 351,
      about: 'Divine Lakshmi puja for wealth, abundance and financial prosperity',
      isActive: true,
      isFeatured: false,
      pujaImages: ['/images/lakshmi-puja-1.jpg'],
      createdDate: '2024-01-10',
      selectedPlan: 'Basic Puja Package'
    },
    {
      id: '3',
      pujaName: 'Saraswati Puja',
      subHeading: 'Gain Knowledge & Wisdom',
      templeAddress: 'Saraswati Temple, Varanasi',
      category: 'education',
      prasadPrice: 300,
      dakshinaPrice: 1000,
      manokamnaPrice: 201,
      about: 'Sacred Saraswati puja for knowledge, wisdom and academic success',
      isActive: true,
      isFeatured: false,
      pujaImages: ['/images/saraswati-puja-1.jpg', '/images/saraswati-puja-2.jpg', '/images/saraswati-puja-3.jpg'],
      createdDate: '2024-01-08',
      selectedPlan: 'Standard Family Package'
    },
    {
      id: '4',
      pujaName: 'Durga Puja',
      subHeading: 'Protection & Divine Strength',
      templeAddress: 'Durga Mandir, Haridwar',
      category: 'spiritual',
      prasadPrice: 1000,
      dakshinaPrice: 3500,
      manokamnaPrice: 501,
      about: 'Powerful Durga puja for protection, strength and victory over obstacles',
      isActive: false,
      isFeatured: true,
      pujaImages: ['/images/durga-puja-1.jpg'],
      createdDate: '2024-01-05',
      selectedPlan: 'Exclusive VIP Darshan'
    },
    {
      id: '5',
      pujaName: 'Shiva Puja',
      subHeading: 'Spiritual Awakening & Peace',
      templeAddress: 'Kedarnath Temple, Uttarakhand',
      category: 'spiritual',
      prasadPrice: 600,
      dakshinaPrice: 2000,
      manokamnaPrice: 301,
      about: 'Divine Shiva puja for spiritual awakening, inner peace and liberation',
      isActive: true,
      isFeatured: false,
      pujaImages: ['/images/shiva-puja-1.jpg', '/images/shiva-puja-2.jpg'],
      createdDate: '2024-01-03',
      selectedPlan: 'Premium VIP Experience'
    },
    {
      id: '6',
      pujaName: 'Vishnu Puja',
      subHeading: 'Harmony & Universal Peace',
      templeAddress: 'Tirupati Temple, Andhra Pradesh',
      category: 'general',
      prasadPrice: 800,
      dakshinaPrice: 2800,
      manokamnaPrice: 401,
      about: 'Sacred Vishnu puja for peace, harmony and universal well-being',
      isActive: true,
      isFeatured: false,
      pujaImages: ['/images/vishnu-puja-1.jpg'],
      createdDate: '2024-01-01',
      selectedPlan: 'Basic Puja Package'
    }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter pujas based on search term, category, and status
  const filteredPujas = mockPujas.filter(puja => {
    const matchesSearch = puja.pujaName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         puja.subHeading.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         puja.templeAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || puja.category === categoryFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && puja.isActive) || 
                         (statusFilter === 'inactive' && !puja.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hi-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search pujas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          />
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        >
          <option value="all">All Categories</option>
          <option value="general">General</option>
          <option value="prosperity">Prosperity</option>
          <option value="health">Health</option>
          <option value="education">Education</option>
          <option value="spiritual">Spiritual</option>
        </select>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Puja List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPujas.map((puja) => (
            <div key={puja.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-white">
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                {puja.pujaImages && puja.pujaImages.length > 0 ? (
                  <div className="relative w-full h-full">
                    <div className="w-full h-full bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 text-3xl">🛕</span>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded">
                      {puja.pujaImages.length} img{puja.pujaImages.length > 1 ? 's' : ''}
                    </div>
                  </div>
                ) : (
                  <span className="text-orange-600 text-3xl">🛕</span>
                )}
                {puja.isFeatured && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    ⭐ Featured
                  </div>
                )}
                <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-medium ${
                  puja.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {puja.isActive ? '● Active' : '● Inactive'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900 text-lg font-['Philosopher'] leading-tight">{puja.pujaName}</h4>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Dakshina</div>
                    <span className="text-orange-600 font-bold text-lg">{formatCurrency(puja.dakshinaPrice)}</span>
                  </div>
                </div>
                
                <p className="text-sm text-orange-600 font-medium">{puja.subHeading}</p>
                <p className="text-sm text-gray-600 font-medium">📍 {puja.templeAddress}</p>
                
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    puja.category === 'prosperity' ? 'bg-yellow-100 text-yellow-800' :
                    puja.category === 'education' ? 'bg-blue-100 text-blue-800' :
                    puja.category === 'spiritual' ? 'bg-purple-100 text-purple-800' :
                    puja.category === 'health' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {puja.category.charAt(0).toUpperCase() + puja.category.slice(1)}
                  </span>
                  <span className="text-xs text-gray-500">📋 {puja.selectedPlan}</span>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">{puja.about}</p>
                
                {/* Pricing Details */}
                <div className="grid grid-cols-3 gap-2 text-xs border-t pt-2 mt-3">
                  <div className="text-center">
                    <div className="text-gray-500">Prasad</div>
                    <div className="font-medium text-green-600">{formatCurrency(puja.prasadPrice)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">Dakshina</div>
                    <div className="font-medium text-orange-600">{formatCurrency(puja.dakshinaPrice)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">Manokamna</div>
                    <div className="font-medium text-purple-600">{formatCurrency(puja.manokamnaPrice)}</div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 border-t pt-2 mt-3">
                  Created: {new Date(puja.createdDate).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1">
                  <span>✏️</span> Edit
                </button>
                <button className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1">
                  <span>👁️</span> View
                </button>
                <button className="bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puja Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temple
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pricing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPujas.map((puja) => (
                  <tr key={puja.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                            <span className="text-orange-600 text-lg">🛕</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 font-['Philosopher']">{puja.pujaName}</div>
                          <div className="text-sm text-orange-600">{puja.subHeading}</div>
                          <div className="text-xs text-gray-500">Created: {new Date(puja.createdDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        puja.category === 'prosperity' ? 'bg-yellow-100 text-yellow-800' :
                        puja.category === 'education' ? 'bg-blue-100 text-blue-800' :
                        puja.category === 'spiritual' ? 'bg-purple-100 text-purple-800' :
                        puja.category === 'health' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {puja.category.charAt(0).toUpperCase() + puja.category.slice(1)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">📋 {puja.selectedPlan}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-1">📍</span>
                          <span className="truncate max-w-32">{puja.templeAddress}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Prasad:</span>
                          <span className="font-medium text-green-600">{formatCurrency(puja.prasadPrice)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Dakshina:</span>
                          <span className="font-medium text-orange-600">{formatCurrency(puja.dakshinaPrice)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Manokamna:</span>
                          <span className="font-medium text-purple-600">{formatCurrency(puja.manokamnaPrice)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          puja.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {puja.isActive ? '● Active' : '● Inactive'}
                        </span>
                        {puja.isFeatured && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100" title="View">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50" disabled>
          ←
        </button>
        <button className="px-3 py-2 bg-orange-500 text-white rounded-lg">1</button>
        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">2</button>
        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">3</button>
        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          →
        </button>
      </div>
    </>
  );
};

export default PujaList;
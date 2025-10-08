'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { fetchPujas, updatePuja } from '@/store/slices/pujaSlice';
import Button from '@/components/ui/Button';
import type { AppDispatch } from '@/store';

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
  const dispatch = useDispatch<AppDispatch>();
  const { pujas: rawPujas, isLoading } = useSelector((state: RootState) => state.puja);
  
  // Transform raw pujas to match the component interface with null handling
  const pujas: Puja[] = (rawPujas ?? []).map((puja: any) => ({
    id: puja?.id ?? puja?._id ?? '',
    pujaName: puja?.name ?? '',
    subHeading: puja?.sub_heading ?? '',
    templeAddress: puja?.temple_address ?? '',
    category: puja?.category ?? 'general',
    prasadPrice: puja?.prasad_price ?? 0,
    dakshinaPrice: (() => {
      const pricesStr = puja?.dakshina_prices_inr ?? '';
      if (!pricesStr) return 0;
      const firstPrice = pricesStr.split(',')[0]?.trim();
      return parseInt(firstPrice ?? '0') || 0;
    })(),
    manokamnaPrice: (() => {
      const pricesStr = puja?.manokamna_prices_inr ?? '';
      if (!pricesStr) return 0;
      const firstPrice = pricesStr.split(',')[0]?.trim();
      return parseInt(firstPrice ?? '0') || 0;
    })(),
    about: puja?.description ?? '',
    isActive: puja?.is_active ?? true,
    isFeatured: puja?.is_featured ?? false,
    pujaImages: puja?.puja_images ?? [],
    createdDate: puja?.created_date ?? new Date().toISOString().split('T')[0],
    selectedPlan: puja?.selected_plan ?? 'Basic Puja Package',
  }));

  const [selectedPujaId, setSelectedPujaId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedPuja, setSelectedPuja] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    name: '',
    sub_heading: '',
    description: '',
    date: null,
    time: null,
    temple_image_url: '',
    temple_address: '',
    temple_description: '',
    prasad_price: 0,
    is_prasad_active: false,
    dakshina_prices_inr: '',
    dakshina_prices_usd: '',
    is_dakshina_active: false,
    manokamna_prices_inr: '',
    manokamna_prices_usd: '',
    is_manokamna_active: false,
    category: 'general',
    is_active: true,
    is_featured: false,
    benefits: [
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' },
    ],
    selected_plan_ids: [],
    puja_images: [],
  });

  useEffect(() => {
    dispatch(fetchPujas() as any);
  }, [dispatch]);

  const handleEditClick = (pujaId: string, pujaData: any) => {
    console.log('Edit button clicked with pujaId:', pujaId);
    if (!pujaId) {
      console.error('Puja ID is missing');
      return;
    }
    setSelectedPujaId(pujaId);
    setSelectedPuja(pujaData);
    
    // Prefill form data with puja details
    setFormData({
      name: pujaData.pujaName || '',
      sub_heading: pujaData.subHeading || '',
      description: pujaData.about || '',
      date: null,
      time: null,
      temple_image_url: pujaData.templeImage || '',
      temple_address: pujaData.templeAddress || '',
      temple_description: pujaData.templeDescription || '',
      prasad_price: pujaData.prasadPrice || 0,
      is_prasad_active: pujaData.prasadStatus || false,
      dakshina_prices_inr: pujaData.dakshinaPrices || '',
      dakshina_prices_usd: pujaData.dakshinaPricesUSD || '',
      is_dakshina_active: pujaData.dakshinaStatus || false,
      manokamna_prices_inr: pujaData.manokamnaPrices || '',
      manokamna_prices_usd: pujaData.manokamnaPricesUSD || '',
      is_manokamna_active: pujaData.manokamnaStatus || false,
      category: pujaData.category || 'general',
      is_active: pujaData.isActive !== undefined ? pujaData.isActive : true,
      is_featured: pujaData.isFeatured || false,
      benefits: pujaData.benefits || [
        { title: '', description: '' },
        { title: '', description: '' },
        { title: '', description: '' },
        { title: '', description: '' },
      ],
      selected_plan_ids: pujaData.selectedPlanIds || [],
      puja_images: pujaData.pujaImages || [],
    });
    
    setIsModalVisible(true);
  };

  const handleViewClick = (pujaData: any) => {
    console.log('View button clicked with puja data:', pujaData);
    setSelectedPuja(pujaData);
    
    // Prefill form data with puja details for viewing
    setFormData({
      name: pujaData.pujaName || '',
      sub_heading: pujaData.subHeading || '',
      description: pujaData.about || '',
      date: null,
      time: null,
      temple_image_url: pujaData.templeImage || '',
      temple_address: pujaData.templeAddress || '',
      temple_description: pujaData.templeDescription || '',
      prasad_price: pujaData.prasadPrice || 0,
      is_prasad_active: pujaData.prasadStatus || false,
      dakshina_prices_inr: pujaData.dakshinaPrices || '',
      dakshina_prices_usd: pujaData.dakshinaPricesUSD || '',
      is_dakshina_active: pujaData.dakshinaStatus || false,
      manokamna_prices_inr: pujaData.manokamnaPrices || '',
      manokamna_prices_usd: pujaData.manokamnaPricesUSD || '',
      is_manokamna_active: pujaData.manokamnaStatus || false,
      category: pujaData.category || 'general',
      is_active: pujaData.isActive !== undefined ? pujaData.isActive : true,
      is_featured: pujaData.isFeatured || false,
      benefits: pujaData.benefits || [
        { title: '', description: '' },
        { title: '', description: '' },
        { title: '', description: '' },
        { title: '', description: '' },
      ],
      selected_plan_ids: pujaData.selectedPlanIds || [],
      puja_images: pujaData.pujaImages || [],
    });
    
    setIsViewModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedPujaId(null);
    setSelectedPuja(null);
  };

  const handleViewModalClose = () => {
    setIsViewModalVisible(false);
    setSelectedPuja(null);
  };

  const handleUpdateSuccess = () => {
    dispatch(fetchPujas() as any);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBenefitChange = (index: number, field: string, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = { ...newBenefits[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      benefits: newBenefits
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!selectedPujaId) {
        console.error('Puja ID is missing');
        return;
      }
      
      const updateData = {
        id: selectedPujaId,
        name: formData.name,
        sub_heading: formData.sub_heading,
        description: formData.description,
        date: null,
        time: null,
        temple_image_url: formData.temple_image_url,
        temple_address: formData.temple_address,
        temple_description: formData.temple_description,
        prasad_price: formData.prasad_price,
        is_prasad_active: formData.is_prasad_active,
        dakshina_prices_inr: formData.dakshina_prices_inr,
        dakshina_prices_usd: formData.dakshina_prices_usd,
        is_dakshina_active: formData.is_dakshina_active,
        manokamna_prices_inr: formData.manokamna_prices_inr,
        manokamna_prices_usd: formData.manokamna_prices_usd,
        is_manokamna_active: formData.is_manokamna_active,
        category: formData.category,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        benefits: formData.benefits,
        selected_plan_ids: formData.selected_plan_ids,
      };
      
      await dispatch(updatePuja(updateData) as any);
      // Refresh the puja list after successful update
      dispatch(fetchPujas() as any);
      handleModalClose();
    } catch (error) {
      console.error('Error updating puja:', error);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter pujas based on search term, category, and status with null checks
  const filteredPujas = (pujas ?? []).filter(puja => {
    const pujaName = puja?.pujaName ?? '';
    const subHeading = puja?.subHeading ?? '';
    const templeAddress = puja?.templeAddress ?? '';
    
    const matchesSearch = pujaName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         subHeading.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         templeAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || puja?.category === categoryFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && puja?.isActive) || 
                         (statusFilter === 'inactive' && !puja?.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (amount: number | null | undefined) => {
    const safeAmount = amount ?? 0;
    return new Intl.NumberFormat('hi-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(safeAmount);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-8">Loading pujas...</div>;
  }

  return (
    <>
      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search pujas..."
            value={searchTerm ?? ''}
            onChange={(e) => setSearchTerm(e.target.value ?? '')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-black placeholder-gray-400"
          />
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value ?? 'all')}
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
          onChange={(e) => setStatusFilter(e.target.value ?? 'all')}
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
          {(filteredPujas ?? []).map((puja) => (
            <div key={puja?.id ?? ''} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-white">
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                {puja?.pujaImages && (puja.pujaImages.length ?? 0) > 0 ? (
                  <div className="relative w-full h-full">
                    <div className="w-full h-full bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 text-3xl">🛕</span>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded">
                      {(puja.pujaImages.length ?? 0)} img{(puja.pujaImages.length ?? 0) > 1 ? 's' : ''}
                    </div>
                  </div>
                ) : (
                  <span className="text-orange-600 text-3xl">🛕</span>
                )}
                {puja?.isFeatured && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    ⭐ Featured
                  </div>
                )}
                <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-medium ${
                  puja?.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {puja?.isActive ? '● Active' : '● Inactive'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900 text-lg font-['Philosopher'] leading-tight">{puja?.pujaName ?? ''}</h4>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Dakshina</div>
                    <span className="text-orange-600 font-bold text-lg">{formatCurrency(puja?.dakshinaPrice)}</span>
                  </div>
                </div>
                
                <p className="text-sm text-orange-600 font-medium">{puja?.subHeading ?? ''}</p>
                <p className="text-sm text-gray-600 font-medium">📍 {puja?.templeAddress ?? ''}</p>
                
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    (puja?.category === 'prosperity' ? 'bg-yellow-100 text-yellow-800' :
                    puja?.category === 'education' ? 'bg-blue-100 text-blue-800' :
                    puja?.category === 'spiritual' ? 'bg-purple-100 text-purple-800' :
                    puja?.category === 'health' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800')
                  }`}>
                    {(puja?.category ?? '').charAt(0).toUpperCase() + (puja?.category ?? '').slice(1)}
                  </span>
                  <span className="text-xs text-gray-500">📋 {puja?.selectedPlan ?? ''}</span>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">{puja?.about ?? ''}</p>
                
                {/* Pricing Details */}
                <div className="grid grid-cols-3 gap-2 text-xs border-t pt-2 mt-3">
                  <div className="text-center">
                    <div className="text-gray-500">Prasad</div>
                    <div className="font-medium text-green-600">{formatCurrency(puja?.prasadPrice)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">Dakshina</div>
                    <div className="font-medium text-orange-600">{formatCurrency(puja?.dakshinaPrice)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">Manokamna</div>
                    <div className="font-medium text-purple-600">{formatCurrency(puja?.manokamnaPrice)}</div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 border-t pt-2 mt-3">
                  Created: {new Date(puja?.createdDate ?? '').toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(puja.id, puja);
                  }}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                >
                  <span>✏️</span> Edit
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewClick(puja);
                  }}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                >
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
                {(filteredPujas ?? []).map((puja) => (
                  <tr key={puja?.id ?? ''} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                            <span className="text-orange-600 text-lg">🛕</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 font-['Philosopher']">{puja?.pujaName ?? ''}</div>
                          <div className="text-sm text-orange-600">{puja?.subHeading ?? ''}</div>
                          <div className="text-xs text-gray-500">Created: {new Date(puja?.createdDate ?? '').toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        (puja?.category === 'prosperity' ? 'bg-yellow-100 text-yellow-800' :
                        puja?.category === 'education' ? 'bg-blue-100 text-blue-800' :
                        puja?.category === 'spiritual' ? 'bg-purple-100 text-purple-800' :
                        puja?.category === 'health' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800')
                      }`}>
                        {(puja?.category ?? '').charAt(0).toUpperCase() + (puja?.category ?? '').slice(1)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">📋 {puja?.selectedPlan ?? ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-1">📍</span>
                          <span className="truncate max-w-32">{puja?.templeAddress ?? ''}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Prasad:</span>
                          <span className="font-medium text-green-600">{formatCurrency(puja?.prasadPrice)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Dakshina:</span>
                          <span className="font-medium text-orange-600">{formatCurrency(puja?.dakshinaPrice)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Manokamna:</span>
                          <span className="font-medium text-purple-600">{formatCurrency(puja?.manokamnaPrice)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          puja?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {puja?.isActive ? '● Active' : '● Inactive'}
                        </span>
                        {puja?.isFeatured && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(puja.id, puja);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100" 
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewClick(puja);
                          }}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100" 
                          title="View"
                        >
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

      {/* Update Puja Modal */}
      {/* <UpdatePujaModal
        pujaId={selectedPujaId || ''}
        visible={isModalVisible}
        onCancel={handleModalClose}
        onSuccess={handleUpdateSuccess}
      /> */}

      {/* Update Puja Modal - Tailwind Implementation */}
      {isModalVisible && selectedPuja && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true" onClick={handleModalClose}></div>
            
            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex items-center justify-between border-b border-orange-200 pb-4">
                      <h3 className="text-2xl leading-6 font-bold text-orange-800 flex items-center">
                        <span className="mr-2 text-2xl">🛕</span>
                        <span className="font-['Philosopher']">Update Puja</span>
                      </h3>
                      <button
                        type="button"
                        className="text-orange-400 hover:text-orange-600 focus:outline-none"
                        onClick={handleModalClose}
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-4">
                      <div className="bg-white p-4 rounded-lg mb-6 border border-orange-200 shadow-sm">
                        <h4 className="font-medium text-orange-800 text-lg font-['Philosopher']">Puja: {formData.name}</h4>
                        <p className="text-sm text-orange-600">ID: {selectedPujaId}</p>
                      </div>
                      
                      <div className="bg-white rounded-xl border border-orange-200 p-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Section 1: Basic Details */}
                          <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-orange-800 mb-4 font-['Philosopher'] flex items-center gap-2">
                              <span className="text-xl">🛕</span>
                              1. Puja Details
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Puja Name</label>
                                <input
                                  type="text"
                                  value={formData.name || ''}
                                  onChange={(e) => handleInputChange('name', e.target.value)}
                                  className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder-gray-400"
                                  placeholder="Enter puja name"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sub Heading</label>
                                <input
                                  type="text"
                                  value={formData.sub_heading || ''}
                                  onChange={(e) => handleInputChange('sub_heading', e.target.value)}
                                  className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder-gray-400"
                                  placeholder="Enter puja sub heading"
                                />
                              </div>
                              
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                  rows={4}
                                  value={formData.description || ''}
                                  onChange={(e) => handleInputChange('description', e.target.value)}
                                  className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder-gray-400"
                                  placeholder="Enter detailed description about the puja"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Section 2: Temple Details */}
                          <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-indigo-800 mb-4 font-['Philosopher'] flex items-center gap-2">
                              <span className="text-xl">🏦</span>
                              2. Temple Details
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Temple Image URL</label>
                                <input
                                  type="text"
                                  value={formData.temple_image_url || ''}
                                  onChange={(e) => handleInputChange('temple_image_url', e.target.value)}
                                  className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder-gray-400"
                                  placeholder="Enter temple image URL"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Temple Address</label>
                                <input
                                  type="text"
                                  value={formData.temple_address || ''}
                                  onChange={(e) => handleInputChange('temple_address', e.target.value)}
                                  className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder-gray-400"
                                  placeholder="Enter complete temple address"
                                />
                              </div>
                              
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Temple Description</label>
                                <textarea
                                  rows={4}
                                  value={formData.temple_description || ''}
                                  onChange={(e) => handleInputChange('temple_description', e.target.value)}
                                  className="w-full px-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder-gray-400"
                                  placeholder="Enter temple description, history, and significance"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Section 3: Benefits */}
                          <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-green-800 mb-4 font-['Philosopher'] flex items-center gap-2">
                              <span className="text-xl">✨</span>
                              3. Puja Benefits
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {formData.benefits.map((benefit: any, index: number) => (
                                <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                                  <h4 className="font-medium text-green-800 mb-3">Benefit {index + 1}</h4>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                                      <input
                                        type="text"
                                        value={benefit.title || ''}
                                        onChange={(e) => handleBenefitChange(index, 'title', e.target.value)}
                                        className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                        placeholder={`Enter benefit ${index + 1} title`}
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                      <textarea
                                        rows={2}
                                        value={benefit.description || ''}
                                        onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                                        className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                        placeholder={`Enter benefit ${index + 1} description`}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Section 4: Prasad */}
                          <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-yellow-800 mb-4 font-['Philosopher'] flex items-center gap-2">
                              <span className="text-xl">🍯</span>
                              4. Prasad
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prasad Price (₹)</label>
                                <input
                                  type="number"
                                  value={formData.prasad_price || 0}
                                  onChange={(e) => handleInputChange('prasad_price', parseInt(e.target.value) || 0)}
                                  className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                />
                              </div>
                              
                              <div className="flex items-center pt-6">
                                <input
                                  type="checkbox"
                                  checked={formData.is_prasad_active || false}
                                  onChange={(e) => handleInputChange('is_prasad_active', e.target.checked)}
                                  className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-yellow-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Active Prasad Service</label>
                              </div>
                            </div>
                          </div>
                          
                          {/* Section 5: Dakshina */}
                          <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-red-800 mb-4 font-['Philosopher'] flex items-center gap-2">
                              <span className="text-xl">💰</span>
                              5. Dakshina
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dakshina Prices (₹)</label>
                                <input
                                  type="text"
                                  value={formData.dakshina_prices_inr || ''}
                                  onChange={(e) => handleInputChange('dakshina_prices_inr', e.target.value)}
                                  className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                  placeholder="e.g., 101,201,310,500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Enter comma-separated values</p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dakshina Prices (USD)</label>
                                <input
                                  type="text"
                                  value={formData.dakshina_prices_usd || ''}
                                  onChange={(e) => handleInputChange('dakshina_prices_usd', e.target.value)}
                                  className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                  placeholder="e.g., 1.5,2.5,4.0,6.0"
                                />
                                <p className="text-xs text-gray-500 mt-1">Optional: Manual USD pricing</p>
                              </div>
                              
                              <div className="flex items-center pt-6">
                                <input
                                  type="checkbox"
                                  checked={formData.is_dakshina_active || false}
                                  onChange={(e) => handleInputChange('is_dakshina_active', e.target.checked)}
                                  className="h-5 w-5 text-red-600 focus:ring-red-500 border-red-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Active Dakshina</label>
                              </div>
                            </div>
                          </div>
                          
                          {/* Section 6: Manokamna */}
                          <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-pink-800 mb-4 font-['Philosopher'] flex items-center gap-2">
                              <span className="text-xl">📜</span>
                              6. Manokamna Parchi
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Manokamna Prices (₹)</label>
                                <input
                                  type="text"
                                  value={formData.manokamna_prices_inr || ''}
                                  onChange={(e) => handleInputChange('manokamna_prices_inr', e.target.value)}
                                  className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                  placeholder="e.g., 51,101,151,251"
                                />
                                <p className="text-xs text-gray-500 mt-1">Enter comma-separated values</p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Manokamna Prices (USD)</label>
                                <input
                                  type="text"
                                  value={formData.manokamna_prices_usd || ''}
                                  onChange={(e) => handleInputChange('manokamna_prices_usd', e.target.value)}
                                  className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                  placeholder="e.g., 0.75,1.25,2.0,3.0"
                                />
                                <p className="text-xs text-gray-500 mt-1">Optional: Manual USD pricing</p>
                              </div>
                              
                              <div className="flex items-center pt-6">
                                <input
                                  type="checkbox"
                                  checked={formData.is_manokamna_active || false}
                                  onChange={(e) => handleInputChange('is_manokamna_active', e.target.checked)}
                                  className="h-5 w-5 text-pink-600 focus:ring-pink-500 border-pink-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Active Manokamna</label>
                              </div>
                            </div>
                          </div>
                          
                          {/* Section 7: Settings */}
                          <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 font-['Philosopher'] flex items-center gap-2">
                              <span className="text-xl">⚙️</span>
                              7. Settings
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                  value={formData.category || 'general'}
                                  onChange={(e) => handleInputChange('category', e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                  <option value="general">General</option>
                                  <option value="prosperity">Prosperity</option>
                                  <option value="health">Health</option>
                                  <option value="education">Education</option>
                                  <option value="marriage">Marriage</option>
                                  <option value="spiritual">Spiritual</option>
                                </select>
                              </div>
                              
                              <div className="flex items-center pt-6">
                                <input
                                  type="checkbox"
                                  checked={formData.is_active || true}
                                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                  className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-orange-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Active</label>
                              </div>
                              
                              <div className="flex items-center pt-6">
                                <input
                                  type="checkbox"
                                  checked={formData.is_featured || false}
                                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                                  className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-orange-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">Featured</label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-base font-medium text-white hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                  onClick={handleSubmit}
                >
                  Update Puja
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  onClick={handleModalClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Puja Modal - Tailwind Implementation */}
      {isViewModalVisible && selectedPuja && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" aria-hidden="true" onClick={handleViewModalClose}></div>
            
            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex items-center justify-between border-b border-orange-200 pb-4">
                      <h3 className="text-2xl leading-6 font-bold text-orange-800 flex items-center">
                        <span className="mr-2 text-2xl">🛕</span>
                        <span className="font-['Philosopher']">Puja Details</span>
                      </h3>
                      <button
                        type="button"
                        className="text-orange-400 hover:text-orange-600 focus:outline-none"
                        onClick={handleViewModalClose}
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-4">
                      <div className="bg-white p-4 rounded-lg mb-6 border border-orange-200 shadow-sm">
                        <h4 className="font-medium text-orange-800 text-lg font-['Philosopher']">Puja: {formData.name}</h4>
                        <p className="text-sm text-orange-600">ID: {selectedPuja.id}</p>
                      </div>
                      
                      <div className="bg-white rounded-xl border border-orange-200 p-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Section 1: Basic Details */}
                          <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-orange-800 mb-4 font-['Philosopher'] flex items-center gap-2">
                              <span className="text-xl">🛕</span>
                              1. Puja Details
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Puja Name</label>
                                <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-black">
                                  {formData.name || 'N/A'}
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sub Heading</label>
                                <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-black">
                                  {formData.sub_heading || 'N/A'}
                                </div>
                              </div>
                              
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-black min-h-24">
                                  {formData.description || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Section 2: Temple Details */}
                          <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-indigo-800 mb-4 font-['Philosopher'] flex items-center gap-2">
                              <span className="text-xl">🏦</span>
                              2. Temple Details
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Temple Image URL</label>
                                <div className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg text-black break-words">
                                  {formData.temple_image_url || 'N/A'}
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Temple Address</label>
                                <div className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg text-black">
                                  {formData.temple_address || 'N/A'}
                                </div>
                              </div>
                              
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Temple Description</label>
                                <div className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg text-black min-h-24">
                                  {formData.temple_description || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Section 3: Benefits */}
                          <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-green-800 mb-4 font-['Philosopher'] flex items-center gap-2">
                              <span className="text-xl">✨</span>
                              3. Puja Benefits
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {formData.benefits.map((benefit: any, index: number) => (
                                <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                                  <h4 className="font-medium text-green-800 mb-3">Benefit {index + 1}</h4>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                                      <div className="w-full px-3 py-2 bg-green-100 border border-green-200 rounded-lg text-sm">
                                        {benefit.title || 'N/A'}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                      <div className="w-full px-3 py-2 bg-green-100 border border-green-200 rounded-lg text-sm min-h-16">
                                        {benefit.description || 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Section 4: Prasad */}
                          <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-yellow-800 mb-4 font-['Philosopher'] flex items-center gap-2">
                              <span className="text-xl">🍯</span>
                              4. Prasad
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prasad Price (₹)</label>
                                <div className="w-full px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  {formData.prasad_price || 0}
                                </div>
                              </div>
                              
                              <div className="flex items-center pt-6">
                                <div className={`h-5 w-5 rounded-full ${formData.is_prasad_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <label className="ml-2 block text-sm text-gray-700">
                                  {formData.is_prasad_active ? 'Active' : 'Inactive'}
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          {/* Section 5: Dakshina */}
                          <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-red-800 mb-4 font-['Philosopher'] flex items-center gap-2">
                              <span className="text-xl">💰</span>
                              5. Dakshina
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dakshina Prices (₹)</label>
                                <div className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                                  {formData.dakshina_prices_inr || 'N/A'}
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dakshina Prices (USD)</label>
                                <div className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                                  {formData.dakshina_prices_usd || 'N/A'}
                                </div>
                              </div>
                              
                              <div className="flex items-center pt-6">
                                <div className={`h-5 w-5 rounded-full ${formData.is_dakshina_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <label className="ml-2 block text-sm text-gray-700">
                                  {formData.is_dakshina_active ? 'Active' : 'Inactive'}
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          {/* Section 6: Manokamna */}
                          <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-pink-800 mb-4 font-['Philosopher'] flex items-center gap-2">
                              <span className="text-xl">📜</span>
                              6. Manokamna Parchi
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Manokamna Prices (₹)</label>
                                <div className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-lg">
                                  {formData.manokamna_prices_inr || 'N/A'}
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Manokamna Prices (USD)</label>
                                <div className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-lg">
                                  {formData.manokamna_prices_usd || 'N/A'}
                                </div>
                              </div>
                              
                              <div className="flex items-center pt-6">
                                <div className={`h-5 w-5 rounded-full ${formData.is_manokamna_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <label className="ml-2 block text-sm text-gray-700">
                                  {formData.is_manokamna_active ? 'Active' : 'Inactive'}
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          {/* Section 7: Settings */}
                          <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 font-['Philosopher'] flex items-center gap-2">
                              <span className="text-xl">⚙️</span>
                              7. Settings
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                                  {formData.category || 'N/A'}
                                </div>
                              </div>
                              
                              <div className="flex items-center pt-6">
                                <div className={`h-5 w-5 rounded-full ${formData.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <label className="ml-2 block text-sm text-gray-700">
                                  {formData.is_active ? 'Active' : 'Inactive'}
                                </label>
                              </div>
                              
                              <div className="flex items-center pt-6">
                                <div className={`h-5 w-5 rounded-full ${formData.is_featured ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <label className="ml-2 block text-sm text-gray-700">
                                  {formData.is_featured ? 'Featured' : 'Not Featured'}
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-base font-medium text-white hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                  onClick={handleViewModalClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {/* <div className="flex justify-center items-center gap-2 mt-8">
        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50" disabled>
          ←
        </button>
        <button className="px-3 py-2 bg-orange-500 text-white rounded-lg">1</button>
        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">2</button>
        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">3</button>
        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          →
        </button>
      </div> */}
    </>
  );
};

export default PujaList;
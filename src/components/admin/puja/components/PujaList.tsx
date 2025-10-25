import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal } from 'antd';
import { RootState } from '@/store';
import { fetchPujas, fetchPujaById, deletePuja } from '@/store/slices/pujaSlice';
import UpdatePujaModal from './UpdatePujaModal';
import ViewPujaModal from './ViewPujaModal';
import type { AppDispatch } from '@/store';

interface Image {
  id: number;
  image_url: string;
}

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
  images?: Image[]; // Add this property
}

interface PujaListProps {
  viewMode?: 'grid' | 'table';
}

const PujaList: React.FC<PujaListProps> = ({ viewMode = 'grid' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { pujas: rawPujas, isLoading } = useSelector((state: RootState) => state.puja);
  
  // Transform raw pujas to match the component interface with comprehensive null handling
  const pujas: Puja[] = React.useMemo(() => {
    if (!Array.isArray(rawPujas)) {
      console.warn('rawPujas is not an array:', rawPujas);
      return [];
    }
    
    return rawPujas
      .filter(puja => puja && typeof puja === 'object') // Filter out null/undefined/invalid entries
      .map((puja: any) => {
        try {
          return {
            id: (puja?.id ?? puja?._id ?? '').toString().trim() || `temp-${Date.now()}-${Math.random()}`,
            pujaName: (puja?.name ?? '').toString().trim(),
            subHeading: (puja?.sub_heading ?? '').toString().trim(),
            templeAddress: (puja?.temple_address ?? '').toString().trim(),
            category: (puja?.category ?? 'general').toString().trim(),
            prasadPrice: (() => {
              const price = puja?.prasad_price;
              if (price === null || price === undefined) return 0;
              const numPrice = Number(price);
              return isNaN(numPrice) ? 0 : Math.max(0, numPrice);
            })(),
            dakshinaPrice: (() => {
              try {
                const pricesStr = (puja?.dakshina_prices_inr ?? '').toString().trim();
                if (!pricesStr) return 0;
                const firstPrice = pricesStr.split(',')[0]?.trim();
                if (!firstPrice) return 0;
                const numPrice = parseInt(firstPrice, 10);
                return isNaN(numPrice) ? 0 : Math.max(0, numPrice);
              } catch (error) {
                console.warn('Error parsing dakshina price:', error);
                return 0;
              }
            })(),
            manokamnaPrice: (() => {
              try {
                const pricesStr = (puja?.manokamna_prices_inr ?? '').toString().trim();
                if (!pricesStr) return 0;
                const firstPrice = pricesStr.split(',')[0]?.trim();
                if (!firstPrice) return 0;
                const numPrice = parseInt(firstPrice, 10);
                return isNaN(numPrice) ? 0 : Math.max(0, numPrice);
              } catch (error) {
                console.warn('Error parsing manokamna price:', error);
                return 0;
              }
            })(),
            about: (puja?.description ?? '').toString().trim(),
            isActive: Boolean(puja?.is_active ?? true),
            isFeatured: Boolean(puja?.is_featured ?? false),
            pujaImages: (() => {
              const images = puja?.puja_images;
              if (!Array.isArray(images)) return [];
              return images.filter(img => img && typeof img === 'string').map(img => img.toString().trim()).filter(Boolean);
            })(),
            images: (() => {
              // Handle the images array from API response
              const images = puja?.images;
              if (!Array.isArray(images)) return [];
              return images
                .filter(img => img && typeof img === 'object' && img.image_url)
                .map(img => ({
                  id: img.id || 0,
                  image_url: img.image_url || ''
                }))
                .filter(img => img.image_url);
            })(),
            createdDate: (() => {
              try {
                const date = puja?.created_date;
                if (!date) return new Date().toISOString().split('T')[0];
                const parsedDate = new Date(date);
                return isNaN(parsedDate.getTime()) ? new Date().toISOString().split('T')[0] : parsedDate.toISOString().split('T')[0];
              } catch (error) {
                return new Date().toISOString().split('T')[0];
              }
            })(),
            selectedPlan: (puja?.selected_plan ?? 'Basic Puja Package').toString().trim(),
          };
        } catch (error) {
          console.error('Error transforming puja data:', error, puja);
          // Return a safe default object for corrupted data
          return {
            id: `error-${Date.now()}-${Math.random()}`,
            pujaName: 'Error Loading Puja',
            subHeading: '',
            templeAddress: '',
            category: 'general',
            prasadPrice: 0,
            dakshinaPrice: 0,
            manokamnaPrice: 0,
            about: 'Error loading puja data',
            isActive: false,
            isFeatured: false,
            pujaImages: [],
            images: [], // Add this line
            createdDate: new Date().toISOString().split('T')[0],
            selectedPlan: 'Basic Puja Package',
          };
        }
      })
      .filter(puja => puja.id && !puja.id.startsWith('error-')); // Filter out error entries
  }, [rawPujas]);

  const [selectedPujaId, setSelectedPujaId] = useState<string | null>(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedPuja, setSelectedPuja] = useState<any>(null);
  const [updatePujaData, setUpdatePujaData] = useState<any>(null); // Data for update modal
  const [viewPujaData, setViewPujaData] = useState<any>(null); // Data for view modal
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState<string | null>(null); // Track which puja is being deleted

  useEffect(() => {
    dispatch(fetchPujas());
  }, [dispatch]);

  // Function to handle update modal opening
  const onUpdateModalOpen = async (pujaId: string, pujaData: any) => {
    console.log('onUpdateModalOpen called for pujaId:', pujaId);
    
    try {
      const safePujaId = (pujaId ?? '').toString().trim();
      if (!safePujaId) {
        console.error('Invalid puja ID for update');
        return;
      }

      setIsLoadingUpdate(true);
      setSelectedPujaId(safePujaId);
      setSelectedPuja(pujaData);
      
      // Call API to fetch full puja details
      const result = await dispatch(fetchPujaById(safePujaId));
      
      if (fetchPujaById.fulfilled.match(result)) {
        console.log('Puja data fetched successfully:', result.payload);
        setUpdatePujaData(result.payload);
        setIsUpdateModalVisible(true);
      } else {
        console.error('Failed to fetch puja data:', result);
      }
    } catch (error) {
      console.error('Error in onUpdateModalOpen:', error);
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  // Function to handle update modal closing
  const onUpdateModalClose = () => {
    console.log('onUpdateModalClose called');
    
    try {
      // Clear all update-related states
      setIsUpdateModalVisible(false);
      setSelectedPujaId(null);
      setSelectedPuja(null);
      setUpdatePujaData(null);
      setIsLoadingUpdate(false);
    } catch (error) {
      console.error('Error in onUpdateModalClose:', error);
    }
  };

  // Function to handle view modal opening
  const onViewModalOpen = async (pujaId: string, pujaData: any) => {
    console.log('onViewModalOpen called for pujaId:', pujaId);
    
    try {
      const safePujaId = (pujaId ?? '').toString().trim();
      if (!safePujaId) {
        console.error('Invalid puja ID for view');
        return;
      }

      setIsLoadingView(true);
      setSelectedPuja(pujaData);
      
      // Call API to fetch full puja details
      const result = await dispatch(fetchPujaById(safePujaId));
      
      if (fetchPujaById.fulfilled.match(result)) {
        console.log('Puja data fetched successfully for view:', result.payload);
        setViewPujaData(result.payload);
        setIsViewModalVisible(true);
      } else {
        console.error('Failed to fetch puja data for view:', result);
      }
    } catch (error) {
      console.error('Error in onViewModalOpen:', error);
    } finally {
      setIsLoadingView(false);
    }
  };

  // Function to handle view modal closing
  const onViewModalClose = () => {
    console.log('onViewModalClose called');
    
    try {
      // Clear all view-related states
      setIsViewModalVisible(false);
      setSelectedPuja(null);
      setViewPujaData(null);
      setIsLoadingView(false);
    } catch (error) {
      console.error('Error in onViewModalClose:', error);
    }
  };

  const handleUpdateSuccess = () => {
    dispatch(fetchPujas());
    onUpdateModalClose();
  };

  // Function to handle puja deletion
  const handleDeletePuja = async (pujaId: string, pujaName: string) => {
    try {
      const safePujaId = (pujaId ?? '').toString().trim();
      const safePujaName = (pujaName ?? '').toString().trim();
      
      if (!safePujaId) {
        console.error('Invalid puja ID for deletion');
        return;
      }

      // Show Ant Design confirmation modal
      Modal.confirm({
        title: 'Delete Puja',
        content: (
          <div>
            <p>Are you sure you want to delete the puja <strong>"{safePujaName}"</strong>?</p>
            <p className="text-red-600 text-sm mt-2">This action cannot be undone.</p>
          </div>
        ),
        icon: <span className="text-red-500">🗑️</span>,
        okText: 'Yes, Delete',
        cancelText: 'Cancel',
        okType: 'danger',
        centered: true,
        onOk: async () => {
          try {
            setIsLoadingDelete(safePujaId);
            console.log('Deleting puja with ID:', safePujaId);
            
            const result = await dispatch(deletePuja(safePujaId));
            
            if (deletePuja.fulfilled.match(result)) {
              console.log('Puja deleted successfully');
              // Fetch updated puja list from server to ensure data consistency
              await dispatch(fetchPujas());
              
              // Show success message
              Modal.success({
                title: 'Puja Deleted',
                content: `"${safePujaName}" has been successfully deleted.`,
                centered: true,
              });
            } else {
              console.error('Failed to delete puja:', result.payload);
              Modal.error({
                title: 'Delete Failed',
                content: 'Failed to delete puja. Please try again.',
                centered: true,
              });
            }
          } catch (error) {
            console.error('Error in delete operation:', error);
            Modal.error({
              title: 'Error',
              content: 'An error occurred while deleting the puja.',
              centered: true,
            });
          } finally {
            setIsLoadingDelete(null);
          }
        },
        onCancel: () => {
          console.log('Delete operation cancelled');
        },
      });
    } catch (error) {
      console.error('Error in handleDeletePuja:', error);
      Modal.error({
        title: 'Error',
        content: 'An error occurred while preparing to delete the puja.',
        centered: true,
      });
    }
  };

  // Filter pujas based on search term, category, and status with comprehensive null checks
  const filteredPujas = (pujas ?? []).filter(puja => {
    // Ensure puja object exists and has basic structure
    if (!puja || typeof puja !== 'object') {
      return false;
    }

    const pujaName = (puja?.pujaName ?? '').toString().trim();
    const subHeading = (puja?.subHeading ?? '').toString().trim();
    const templeAddress = (puja?.templeAddress ?? '').toString().trim();
    const searchTermSafe = (searchTerm ?? '').toString().trim();
    
    const matchesSearch = searchTermSafe === '' || 
                         pujaName.toLowerCase().includes(searchTermSafe.toLowerCase()) || 
                         subHeading.toLowerCase().includes(searchTermSafe.toLowerCase()) ||
                         templeAddress.toLowerCase().includes(searchTermSafe.toLowerCase());
    
    const pujaCategory = (puja?.category ?? 'general').toString().trim();
    const matchesCategory = categoryFilter === 'all' || pujaCategory === categoryFilter;
    
    const isActive = Boolean(puja?.isActive);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && isActive) || 
                         (statusFilter === 'inactive' && !isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (amount: number | string | null | undefined) => {
    try {
      let safeAmount = 0;
      
      if (amount === null || amount === undefined) {
        safeAmount = 0;
      } else if (typeof amount === 'string') {
        const parsed = parseFloat(amount.replace(/[^\d.-]/g, ''));
        safeAmount = isNaN(parsed) ? 0 : Math.max(0, parsed);
      } else if (typeof amount === 'number') {
        safeAmount = isNaN(amount) ? 0 : Math.max(0, amount);
      }
      
      return new Intl.NumberFormat('hi-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(safeAmount);
    } catch (error) {
      console.warn('Error formatting currency:', error, amount);
      return '₹0';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mr-3"></div>
        <span className="text-gray-600">Loading pujas...</span>
      </div>
    );
  }

  if (!Array.isArray(pujas) || pujas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🛕</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No pujas available</h3>
        <p className="text-gray-500">Start by creating your first puja</p>
      </div>
    );
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
            onChange={(e) => setSearchTerm(e?.target?.value?.toString()?.trim() ?? '')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-black placeholder-gray-400"
          />
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e?.target?.value?.toString()?.trim() ?? 'all')}
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
          onChange={(e) => setStatusFilter(e?.target?.value?.toString()?.trim() ?? 'all')}
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
          {(filteredPujas ?? []).length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pujas found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            (filteredPujas ?? []).map((puja) => {
              // Skip rendering if puja data is invalid
              if (!puja || typeof puja !== 'object' || !puja.id) {
                return null;
              }
              return (
            <div key={puja?.id ?? ''} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-white">
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                {puja?.images && puja.images.length > 0 ? (
                  <div className="relative w-full h-full">
                    {/* Show the first image as preview if available */}
                    {puja.images[0] && puja.images[0].image_url ? (
                      <img 
                        src={`https://api.33kotidham.in/${puja.images[0].image_url}`} 
                        alt="Puja preview"
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full bg-orange-100 rounded-lg flex items-center justify-center"><span class="text-orange-600 text-3xl">🛕</span></div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-orange-600 text-3xl">🛕</span>
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded">
                      {(puja.images.length ?? 0)} img{(puja.images.length ?? 0) > 1 ? 's' : ''}
                    </div>
                  </div>
                ) : puja?.pujaImages && (puja.pujaImages.length ?? 0) > 0 ? (
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
                  <h4 className="font-semibold text-gray-900 text-lg leading-tight">{puja?.pujaName ?? ''}</h4>
                  {/* <div className="text-right">
                    <div className="text-xs text-gray-500">Dakshina</div>
                    <span className="text-orange-600 font-bold text-lg">{formatCurrency(puja?.dakshinaPrice)}</span>
                  </div> */}
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
                {/* <div className="grid grid-cols-3 gap-2 text-xs border-t pt-2 mt-3">
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
                </div> */}
                
                <div className="text-xs text-gray-500 border-t pt-2 mt-3">
                  Created: {(() => {
                    try {
                      const date = puja?.createdDate;
                      if (!date) return 'N/A';
                      const parsedDate = new Date(date);
                      return isNaN(parsedDate.getTime()) ? 'Invalid Date' : parsedDate.toLocaleDateString();
                    } catch (error) {
                      return 'N/A';
                    }
                  })()}
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button 
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    onUpdateModalOpen(puja.id, puja);
                  }}
                  disabled={!puja?.id || isLoadingUpdate}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingUpdate ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  ) : (
                    <>
                      <span>✏️</span> Edit
                    </>
                  )}
                </button>
                <button 
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    onViewModalOpen(puja.id, puja);
                  }}
                  disabled={!puja || isLoadingView}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingView ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  ) : (
                    <>
                      <span>👁️</span> View
                    </>
                  )}
                </button>
                <button 
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    handleDeletePuja(puja.id, puja.pujaName);
                  }}
                  disabled={!puja?.id || isLoadingDelete === puja.id}
                  className="bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingDelete === puja.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <>🗑️</>
                  )}
                </button>
              </div>
            </div>
              );
            })
          )}
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
                {(filteredPujas ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-400 text-4xl mb-4">🔍</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No pujas found</h3>
                      <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </td>
                  </tr>
                ) : (
                  (filteredPujas ?? []).map((puja) => {
                    // Skip rendering if puja data is invalid
                    if (!puja || typeof puja !== 'object' || !puja.id) {
                      return null;
                    }
                    return (
                  <tr key={puja?.id ?? ''} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                            <span className="text-orange-600 text-lg">🛕</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{puja?.pujaName ?? ''}</div>
                          <div className="text-sm text-orange-600">{puja?.subHeading ?? ''}</div>
                          <div className="text-xs text-gray-500">Created: {(() => {
                            try {
                              const date = puja?.createdDate;
                              if (!date) return 'N/A';
                              const parsedDate = new Date(date);
                              return isNaN(parsedDate.getTime()) ? 'Invalid Date' : parsedDate.toLocaleDateString();
                            } catch (error) {
                              return 'N/A';
                            }
                          })()}</div>
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
                    {/* <td className="px-6 py-4 whitespace-nowrap">
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
                    </td> */}
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
                            e?.stopPropagation?.();
                            onUpdateModalOpen(puja?.id, puja);
                          }}
                          disabled={!puja?.id || isLoadingUpdate}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                          title="Edit"
                        >
                          {isLoadingUpdate ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          )}
                        </button>
                        <button 
                          onClick={(e) => {
                            e?.stopPropagation?.();
                            onViewModalOpen(puja?.id, puja);
                          }}
                          disabled={!puja || isLoadingView}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                          title="View"
                        >
                          {isLoadingView ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                        <button 
                          onClick={(e) => {
                            e?.stopPropagation?.();
                            handleDeletePuja(puja.id, puja.pujaName);
                          }}
                          disabled={!puja?.id || isLoadingDelete === puja.id}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                          title="Delete"
                        >
                          {isLoadingDelete === puja.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Puja Modal */}
      {updatePujaData && (
        <UpdatePujaModal
          pujaId={selectedPujaId}
          visible={isUpdateModalVisible}
          pujaData={updatePujaData}
          onCancel={onUpdateModalClose}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* View Puja Modal */}
      {viewPujaData && (
        <ViewPujaModal
          puja={viewPujaData}
          visible={isViewModalVisible}
          onCancel={onViewModalClose}
        />
      )}
    </>
  );
};

export default PujaList;
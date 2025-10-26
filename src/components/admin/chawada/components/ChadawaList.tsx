import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal } from 'antd';
import { RootState } from '@/store';
import { fetchChadawas, fetchChadawaById, deleteChadawa } from '@/store/slices/chadawaSlice';
import UpdateChadawaModal from './UpdateChadawaModal';
import ViewChadawaModal from './ViewChadawaModal';
import type { AppDispatch } from '@/store';

interface Chadawa {
  id: number;
  name: string;
  description: string;
  image_url: string;
  price: number;
  requires_note: boolean;
}

interface ChadawaListProps {
  viewMode?: 'grid' | 'table';
}

const ChadawaList: React.FC<ChadawaListProps> = ({ viewMode = 'grid' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { chadawas: rawChadawas, isLoading } = useSelector((state: RootState) => state.chadawa);
  
  // Transform raw chadawas to match the component interface
  const chadawas: Chadawa[] = React.useMemo(() => {
    if (!Array.isArray(rawChadawas)) {
      console.warn('rawChadawas is not an array:', rawChadawas);
      return [];
    }
    
    return rawChadawas
      .filter(chadawa => chadawa && typeof chadawa === 'object')
      .map((chadawa: any) => {
        try {
          return {
            id: chadawa?.id ?? 0,
            name: (chadawa?.name ?? '').toString().trim(),
            description: (chadawa?.description ?? '').toString().trim(),
            image_url: (chadawa?.image_url ?? '').toString().trim(),
            price: (() => {
              const price = chadawa?.price;
              if (price === null || price === undefined) return 0;
              const numPrice = Number(price);
              return isNaN(numPrice) ? 0 : Math.max(0, numPrice);
            })(),
            requires_note: Boolean(chadawa?.requires_note ?? false),
          };
        } catch (error) {
          console.error('Error transforming chadawa data:', error, chadawa);
          // Return a safe default object for corrupted data
          return {
            id: 0,
            name: 'Error Loading Chadawa',
            description: '',
            image_url: '',
            price: 0,
            requires_note: false,
          };
        }
      })
      .filter(chadawa => chadawa.id !== 0);
  }, [rawChadawas]);

  const [selectedChadawaId, setSelectedChadawaId] = useState<number | null>(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [updateChadawaData, setUpdateChadawaData] = useState<any>(null);
  const [viewChadawaData, setViewChadawaData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchChadawas());
  }, [dispatch]);

  // Function to handle update modal opening
  const onUpdateModalOpen = async (chadawaId: number, chadawaData: any) => {
    try {
      if (!chadawaId) {
        console.error('Invalid chadawa ID for update');
        return;
      }

      setIsLoadingUpdate(true);
      setSelectedChadawaId(chadawaId);
      
      const result = await dispatch(fetchChadawaById(chadawaId));
      
      if (fetchChadawaById.fulfilled.match(result)) {
        setUpdateChadawaData(result.payload);
        setIsUpdateModalVisible(true);
      } else {
        console.error('Failed to fetch chadawa data:', result);
      }
    } catch (error) {
      console.error('Error in onUpdateModalOpen:', error);
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  // Function to handle update modal closing
  const onUpdateModalClose = () => {
    setIsUpdateModalVisible(false);
    setSelectedChadawaId(null);
    setUpdateChadawaData(null);
    setIsLoadingUpdate(false);
  };

  // Function to handle view modal opening
  const onViewModalOpen = async (chadawaId: number, chadawaData: any) => {
    try {
      if (!chadawaId) {
        console.error('Invalid chadawa ID for view');
        return;
      }

      setIsLoadingView(true);
      
      const result = await dispatch(fetchChadawaById(chadawaId));
      
      if (fetchChadawaById.fulfilled.match(result)) {
        setViewChadawaData(result.payload);
        setIsViewModalVisible(true);
      } else {
        console.error('Failed to fetch chadawa data for view:', result);
      }
    } catch (error) {
      console.error('Error in onViewModalOpen:', error);
    } finally {
      setIsLoadingView(false);
    }
  };

  // Function to handle view modal closing
  const onViewModalClose = () => {
    setIsViewModalVisible(false);
    setViewChadawaData(null);
    setIsLoadingView(false);
  };

  const handleUpdateSuccess = () => {
    dispatch(fetchChadawas());
    onUpdateModalClose();
  };

  // Function to handle chadawa deletion
  const handleDeleteChadawa = async (chadawaId: number, chadawaName: string) => {
    try {
      if (!chadawaId) {
        console.error('Invalid chadawa ID for deletion');
        return;
      }

      Modal.confirm({
        title: 'Delete Chadawa',
        content: (
          <div>
            <p>Are you sure you want to delete <strong>"{chadawaName}"</strong>?</p>
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
            setIsLoadingDelete(chadawaId);
            const result = await dispatch(deleteChadawa(chadawaId));
            
            if (deleteChadawa.fulfilled.match(result)) {
              await dispatch(fetchChadawas());
              
              Modal.success({
                title: 'Chadawa Deleted',
                content: `"${chadawaName}" has been successfully deleted.`,
                centered: true,
              });
            } else {
              Modal.error({
                title: 'Delete Failed',
                content: 'Failed to delete chadawa. Please try again.',
                centered: true,
              });
            }
          } catch (error) {
            Modal.error({
              title: 'Error',
              content: 'An error occurred while deleting the chadawa.',
              centered: true,
            });
          } finally {
            setIsLoadingDelete(null);
          }
        },
      });
    } catch (error) {
      console.error('Error in handleDeleteChadawa:', error);
    }
  };

  // Filter chadawas based on search term
  const filteredChadawas = (chadawas ?? []).filter(chadawa => {
    if (!chadawa || typeof chadawa !== 'object') {
      return false;
    }

    const name = (chadawa?.name ?? '').toString().trim();
    const description = (chadawa?.description ?? '').toString().trim();
    const searchTermSafe = (searchTerm ?? '').toString().trim();
    
    return searchTermSafe === '' || 
           name.toLowerCase().includes(searchTermSafe.toLowerCase()) || 
           description.toLowerCase().includes(searchTermSafe.toLowerCase());
  });

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat('hi-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount);
    } catch (error) {
      return `₹${amount}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mr-3"></div>
        <span className="text-gray-600">Loading chadawas...</span>
      </div>
    );
  }

  if (!Array.isArray(chadawas) || chadawas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🎁</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No chadawas available</h3>
        <p className="text-gray-500">Start by creating your first chadawa</p>
      </div>
    );
  }

  return (
    <>
      {/* Search */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search chadawas..."
            value={searchTerm ?? ''}
            onChange={(e) => setSearchTerm(e?.target?.value?.toString()?.trim() ?? '')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-black placeholder-gray-400"
          />
        </div>
      </div>

      {/* Chadawa List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredChadawas ?? []).length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chadawas found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            (filteredChadawas ?? []).map((chadawa) => (
            <div key={chadawa.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-white">
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                {chadawa.image_url ? (
                  <img 
                    src={`https://api.33kotidham.in/${chadawa.image_url}`} 
                    alt={chadawa.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = '<span class="text-orange-600 text-3xl">🎁</span>';
                      }
                    }}
                  />
                ) : (
                  <span className="text-orange-600 text-3xl">🎁</span>
                )}
                {chadawa.requires_note && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    📝 Note Required
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900 text-lg leading-tight">{chadawa.name}</h4>
                  <span className="text-orange-600 font-bold text-lg">{formatCurrency(chadawa.price)}</span>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-3">{chadawa.description}</p>
              </div>
              
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button 
                  onClick={() => onUpdateModalOpen(chadawa.id, chadawa)}
                  disabled={isLoadingUpdate}
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
                  onClick={() => onViewModalOpen(chadawa.id, chadawa)}
                  disabled={isLoadingView}
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
                  onClick={() => handleDeleteChadawa(chadawa.id, chadawa.name)}
                  disabled={isLoadingDelete === chadawa.id}
                  className="bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingDelete === chadawa.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <>🗑️</>
                  )}
                </button>
              </div>
            </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chadawa Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note Required
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(filteredChadawas ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-400 text-4xl mb-4">🔍</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No chadawas found</h3>
                      <p className="text-gray-500">Try adjusting your search criteria</p>
                    </td>
                  </tr>
                ) : (
                  (filteredChadawas ?? []).map((chadawa) => (
                  <tr key={chadawa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {chadawa.image_url ? (
                              <img 
                                src={`https://api.33kotidham.in/${chadawa.image_url}`} 
                                alt={chadawa.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.innerHTML = '<span class="text-orange-600 text-lg">🎁</span>';
                                  }
                                }}
                              />
                            ) : (
                              <span className="text-orange-600 text-lg">🎁</span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{chadawa.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2 max-w-xs">{chadawa.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-orange-600">{formatCurrency(chadawa.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        chadawa.requires_note ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {chadawa.requires_note ? '📝 Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => onUpdateModalOpen(chadawa.id, chadawa)}
                          disabled={isLoadingUpdate}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => onViewModalOpen(chadawa.id, chadawa)}
                          disabled={isLoadingView}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteChadawa(chadawa.id, chadawa.name)}
                          disabled={isLoadingDelete === chadawa.id}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Chadawa Modal */}
      {updateChadawaData && (
        <UpdateChadawaModal
          chadawaId={selectedChadawaId}
          visible={isUpdateModalVisible}
          chadawaData={updateChadawaData}
          onCancel={onUpdateModalClose}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* View Chadawa Modal */}
      {viewChadawaData && (
        <ViewChadawaModal
          chadawa={viewChadawaData}
          visible={isViewModalVisible}
          onCancel={onViewModalClose}
        />
      )}
    </>
  );
};

export default ChadawaList;

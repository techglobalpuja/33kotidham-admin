import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal } from 'antd';
import { RootState } from '@/store';
import { fetchTemples, fetchTempleById, deleteTemple } from '@/store/slices/templeSlice';
import UpdateTempleModal from './UpdateTempleModal';
import ViewTempleModal from './ViewTempleModal';
import type { AppDispatch } from '@/store';
import { Temple } from '@/types';

interface TempleListProps {
  viewMode?: 'grid' | 'table';
}

const TempleList: React.FC<TempleListProps> = ({ viewMode = 'grid' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { temples: rawTemples, isLoading } = useSelector((state: RootState) => state.temple);
  
  // Transform raw temples to match the component interface
  const temples: Temple[] = React.useMemo(() => {
    if (!Array.isArray(rawTemples)) {
      console.warn('rawTemples is not an array:', rawTemples);
      return [];
    }
    
    return rawTemples
      .filter(temple => temple && typeof temple === 'object')
      .map((temple: any) => {
        try {
          return {
            id: temple?.id ?? 0,
            name: (temple?.name ?? '').toString().trim(),
            description: (temple?.description ?? '').toString().trim(),
            image_url: (temple?.image_url ?? '').toString().trim(),
            location: (temple?.location ?? '').toString().trim(),
            slug: (temple?.slug ?? '').toString().trim(),
            created_at: temple?.created_at ?? new Date().toISOString(),
            updated_at: temple?.updated_at ?? new Date().toISOString(),
            recommended_pujas: temple?.recommended_pujas ?? [],
            chadawas: temple?.chadawas ?? [],
          };
        } catch (error) {
          console.error('Error transforming temple data:', error, temple);
          return null;
        }
      })
      .filter(temple => temple !== null) as Temple[];
  }, [rawTemples]);

  const [selectedTempleId, setSelectedTempleId] = useState<number | null>(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [updateTempleData, setUpdateTempleData] = useState<Temple | null>(null);
  const [viewTempleData, setViewTempleData] = useState<Temple | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchTemples({}));
  }, [dispatch]);

  // Function to handle update modal opening
  const onUpdateModalOpen = async (templeId: number, templeData: Temple) => {
    console.log('onUpdateModalOpen called for templeId:', templeId);
    
    try {
      if (!templeId || typeof templeId !== 'number') {
        console.error('Invalid temple ID for update');
        return;
      }

      setIsLoadingUpdate(true);
      setSelectedTempleId(templeId);
      
      // Call API to fetch full temple details
      const result = await dispatch(fetchTempleById(templeId));
      
      if (fetchTempleById.fulfilled.match(result)) {
        console.log('Temple data fetched successfully:', result.payload);
        setUpdateTempleData(result.payload);
        setIsUpdateModalVisible(true);
      } else {
        console.error('Failed to fetch temple data:', result);
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
      setIsUpdateModalVisible(false);
      setSelectedTempleId(null);
      setUpdateTempleData(null);
      setIsLoadingUpdate(false);
    } catch (error) {
      console.error('Error in onUpdateModalClose:', error);
    }
  };

  // Function to handle view modal opening
  const onViewModalOpen = async (templeId: number, templeData: Temple) => {
    console.log('onViewModalOpen called for templeId:', templeId);
    
    try {
      if (!templeId || typeof templeId !== 'number') {
        console.error('Invalid temple ID for view');
        return;
      }

      setIsLoadingView(true);
      
      // Call API to fetch full temple details
      const result = await dispatch(fetchTempleById(templeId));
      
      if (fetchTempleById.fulfilled.match(result)) {
        console.log('Temple data fetched successfully for view:', result.payload);
        setViewTempleData(result.payload);
        setIsViewModalVisible(true);
      } else {
        console.error('Failed to fetch temple data for view:', result);
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
      setIsViewModalVisible(false);
      setViewTempleData(null);
      setIsLoadingView(false);
    } catch (error) {
      console.error('Error in onViewModalClose:', error);
    }
  };

  const handleUpdateSuccess = () => {
    dispatch(fetchTemples({}));
    onUpdateModalClose();
  };

  // Function to handle temple deletion
  const handleDeleteTemple = async (templeId: number, templeName: string) => {
    try {
      if (!templeId || typeof templeId !== 'number') {
        console.error('Invalid temple ID for deletion');
        return;
      }

      // Show Ant Design confirmation modal
      Modal.confirm({
        title: 'Delete Temple',
        content: (
          <div>
            <p>Are you sure you want to delete the temple <strong>"{templeName}"</strong>?</p>
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
            setIsLoadingDelete(templeId);
            console.log('Deleting temple with ID:', templeId);
            
            const result = await dispatch(deleteTemple(templeId));
            
            if (deleteTemple.fulfilled.match(result)) {
              console.log('Temple deleted successfully');
              // Fetch updated temple list from server
              await dispatch(fetchTemples({}));
              
              // Show success message
              Modal.success({
                title: 'Temple Deleted',
                content: `"${templeName}" has been successfully deleted.`,
                centered: true,
              });
            } else {
              console.error('Failed to delete temple:', result.payload);
              Modal.error({
                title: 'Delete Failed',
                content: 'Failed to delete temple. Please try again.',
                centered: true,
              });
            }
          } catch (error) {
            console.error('Error in delete operation:', error);
            Modal.error({
              title: 'Error',
              content: 'An error occurred while deleting the temple.',
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
      console.error('Error in handleDeleteTemple:', error);
      Modal.error({
        title: 'Error',
        content: 'An error occurred while preparing to delete the temple.',
        centered: true,
      });
    }
  };

  // Filter temples based on search term
  const filteredTemples = (temples ?? []).filter(temple => {
    if (!temple || typeof temple !== 'object') {
      return false;
    }

    const templeName = (temple?.name ?? '').toString().trim();
    const location = (temple?.location ?? '').toString().trim();
    const description = (temple?.description ?? '').toString().trim();
    const searchTermSafe = (searchTerm ?? '').toString().trim();
    
    const matchesSearch = searchTermSafe === '' || 
                         templeName.toLowerCase().includes(searchTermSafe.toLowerCase()) || 
                         location.toLowerCase().includes(searchTermSafe.toLowerCase()) ||
                         description.toLowerCase().includes(searchTermSafe.toLowerCase());
    
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mr-3"></div>
        <span className="text-gray-600">Loading temples...</span>
      </div>
    );
  }

  if (!Array.isArray(temples) || temples.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🛕</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No temples available</h3>
        <p className="text-gray-500">Start by creating your first temple</p>
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
            placeholder="Search temples..."
            value={searchTerm ?? ''}
            onChange={(e) => setSearchTerm(e?.target?.value?.toString()?.trim() ?? '')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-black placeholder-gray-400"
          />
        </div>
      </div>

      {/* Temple List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredTemples ?? []).length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No temples found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            (filteredTemples ?? []).map((temple) => {
              if (!temple || typeof temple !== 'object') {
                return null;
              }
              
              const templeId = temple?.id ?? 0;
              if (!templeId) {
                return null;
              }
              
              return (
            <div key={templeId} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-white">
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                {temple?.image_url ? (
                  <img 
                    src={`https://api.33kotidham.in/${temple.image_url}`} 
                    alt={temple.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full bg-orange-100 rounded-lg flex items-center justify-center"><span class="text-orange-600 text-3xl">🛕</span></div>';
                      }
                    }}
                  />
                ) : (
                  <span className="text-orange-600 text-3xl">🛕</span>
                )}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-lg leading-tight">{temple?.name ?? ''}</h4>
                <p className="text-sm text-orange-600 font-medium flex items-center gap-1">
                  📍 {temple?.location ?? ''}
                </p>
                <p className="text-sm text-gray-600 line-clamp-3">{temple?.description ?? ''}</p>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                  <span>Recommended Pujas: {temple?.recommended_pujas?.length ?? 0}</span>
                  <span>•</span>
                  <span>Chadawas: {temple?.chadawas?.length ?? 0}</span>
                </div>
                
                <div className="text-xs text-gray-500 border-t pt-2 mt-3">
                  Created: {(() => {
                    try {
                      const date = temple?.created_at;
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
                    onUpdateModalOpen(templeId, temple);
                  }}
                  disabled={!templeId || isLoadingUpdate}
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
                    onViewModalOpen(templeId, temple);
                  }}
                  disabled={!templeId || isLoadingView}
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
                    handleDeleteTemple(templeId, temple.name);
                  }}
                  disabled={!templeId || isLoadingDelete === templeId}
                  className="bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingDelete === templeId ? (
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
                    Temple Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Associated Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(filteredTemples ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="text-gray-400 text-4xl mb-4">🔍</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No temples found</h3>
                      <p className="text-gray-500">Try adjusting your search criteria</p>
                    </td>
                  </tr>
                ) : (
                  (filteredTemples ?? []).map((temple) => {
                    if (!temple || typeof temple !== 'object') {
                      return null;
                    }
                    
                    const templeId = temple?.id ?? 0;
                    if (!templeId) {
                      return null;
                    }
                    
                    return (
                  <tr key={templeId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {temple?.image_url ? (
                              <img 
                                src={`https://api.33kotidham.in/${temple.image_url}`} 
                                alt={temple.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-orange-600 text-lg">🛕</span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{temple?.name ?? ''}</div>
                          <div className="text-xs text-gray-500 line-clamp-2 max-w-md">{temple?.description ?? ''}</div>
                          <div className="text-xs text-gray-500 mt-1">Created: {(() => {
                            try {
                              const date = temple?.created_at;
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
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-1">📍</span>
                          <span>{temple?.location ?? ''}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1 text-xs">
                        <div className="text-gray-600">
                          Pujas: <span className="font-medium text-orange-600">{temple?.recommended_pujas?.length ?? 0}</span>
                        </div>
                        <div className="text-gray-600">
                          Chadawas: <span className="font-medium text-green-600">{temple?.chadawas?.length ?? 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e?.stopPropagation?.();
                            onUpdateModalOpen(templeId, temple);
                          }}
                          disabled={!templeId || isLoadingUpdate}
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
                            onViewModalOpen(templeId, temple);
                          }}
                          disabled={!templeId || isLoadingView}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                          title="View"
                        >
                          {isLoadingView ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                        <button 
                          onClick={(e) => {
                            e?.stopPropagation?.();
                            handleDeleteTemple(templeId, temple.name);
                          }}
                          disabled={!templeId || isLoadingDelete === templeId}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                          title="Delete"
                        >
                          {isLoadingDelete === templeId ? (
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

      {/* Update Temple Modal */}
      {updateTempleData && (
        <UpdateTempleModal
          templeId={selectedTempleId}
          visible={isUpdateModalVisible}
          templeData={updateTempleData}
          onCancel={onUpdateModalClose}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* View Temple Modal */}
      {viewTempleData && (
        <ViewTempleModal
          temple={viewTempleData}
          visible={isViewModalVisible}
          onCancel={onViewModalClose}
        />
      )}
    </>
  );
};

export default TempleList;

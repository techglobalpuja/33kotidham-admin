import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal } from 'antd';
import { RootState } from '@/store';
import { fetchPlans, fetchPlanById, deletePlan } from '@/store/slices/planSlice';
import UpdatePlanModal from './UpdatePlanModal';
import ViewPlanModal from './ViewPlanModal';
import type { AppDispatch } from '@/store';

interface Plan {
  id: number;
  name: string;
  description: string;
  image_url: string;
  actual_price: string;
  discounted_price: string;
  created_at: string;
}

interface PlanListProps {
  viewMode?: 'grid' | 'table';
}

const PlanList: React.FC<PlanListProps> = ({ viewMode = 'grid' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { plans: rawPlans, isLoading } = useSelector((state: RootState) => state.plan);
  
  // Transform raw plans to match the component interface with comprehensive null handling
  const plans: Plan[] = React.useMemo(() => {
    if (!Array.isArray(rawPlans)) {
      console.warn('rawPlans is not an array:', rawPlans);
      return [];
    }
    
    return rawPlans
      .filter(plan => plan && typeof plan === 'object')
      .map((plan: any) => {
        try {
          return {
            id: plan?.id ?? 0,
            name: (plan?.name ?? '').toString().trim(),
            description: (plan?.description ?? '').toString().trim(),
            image_url: (plan?.image_url ?? '').toString().trim(),
            actual_price: (plan?.actual_price ?? '0').toString().trim(),
            discounted_price: (plan?.discounted_price ?? '0').toString().trim(),
            created_at: (plan?.created_at ?? new Date().toISOString()).toString().trim(),
          };
        } catch (error) {
          console.error('Error transforming plan data:', error, plan);
          return {
            id: 0,
            name: 'Error Loading Plan',
            description: '',
            image_url: '',
            actual_price: '0',
            discounted_price: '0',
            created_at: new Date().toISOString(),
          };
        }
      })
      .filter(plan => plan.id !== 0);
  }, [rawPlans]);

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [updatePlanData, setUpdatePlanData] = useState<any>(null);
  const [viewPlanData, setViewPlanData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  // Function to handle update modal opening
  const onUpdateModalOpen = async (planId: number, planData: any) => {
    console.log('onUpdateModalOpen called for planId:', planId);
    
    try {
      if (!planId) {
        console.error('Invalid plan ID for update');
        return;
      }

      setIsLoadingUpdate(true);
      setSelectedPlanId(planId);
      
      // Call API to fetch full plan details
      const result = await dispatch(fetchPlanById(planId));
      
      if (fetchPlanById.fulfilled.match(result)) {
        console.log('Plan data fetched successfully:', result.payload);
        setUpdatePlanData(result.payload);
        setIsUpdateModalVisible(true);
      } else {
        console.error('Failed to fetch plan data:', result);
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
      setSelectedPlanId(null);
      setUpdatePlanData(null);
      setIsLoadingUpdate(false);
    } catch (error) {
      console.error('Error in onUpdateModalClose:', error);
    }
  };

  // Function to handle view modal opening
  const onViewModalOpen = async (planId: number, planData: any) => {
    console.log('onViewModalOpen called for planId:', planId);
    
    try {
      if (!planId) {
        console.error('Invalid plan ID for view');
        return;
      }

      setIsLoadingView(true);
      
      // Call API to fetch full plan details
      const result = await dispatch(fetchPlanById(planId));
      
      if (fetchPlanById.fulfilled.match(result)) {
        console.log('Plan data fetched successfully for view:', result.payload);
        setViewPlanData(result.payload);
        setIsViewModalVisible(true);
      } else {
        console.error('Failed to fetch plan data for view:', result);
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
      setViewPlanData(null);
      setIsLoadingView(false);
    } catch (error) {
      console.error('Error in onViewModalClose:', error);
    }
  };

  const handleUpdateSuccess = () => {
    dispatch(fetchPlans());
    onUpdateModalClose();
  };

  // Function to handle plan deletion
  const handleDeletePlan = async (planId: number, planName: string) => {
    try {
      if (!planId) {
        console.error('Invalid plan ID for deletion');
        return;
      }

      // Show Ant Design confirmation modal
      Modal.confirm({
        title: 'Delete Plan',
        content: (
          <div>
            <p>Are you sure you want to delete the plan <strong>"{planName}"</strong>?</p>
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
            setIsLoadingDelete(planId);
            console.log('Deleting plan with ID:', planId);
            
            const result = await dispatch(deletePlan(planId));
            
            if (deletePlan.fulfilled.match(result)) {
              console.log('Plan deleted successfully');
              await dispatch(fetchPlans());
              
              Modal.success({
                title: 'Plan Deleted',
                content: `"${planName}" has been successfully deleted.`,
                centered: true,
              });
            } else {
              console.error('Failed to delete plan:', result.payload);
              Modal.error({
                title: 'Delete Failed',
                content: 'Failed to delete plan. Please try again.',
                centered: true,
              });
            }
          } catch (error) {
            console.error('Error in delete operation:', error);
            Modal.error({
              title: 'Error',
              content: 'An error occurred while deleting the plan.',
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
      console.error('Error in handleDeletePlan:', error);
      Modal.error({
        title: 'Error',
        content: 'An error occurred while preparing to delete the plan.',
        centered: true,
      });
    }
  };

  // Filter plans based on search term
  const filteredPlans = (plans ?? []).filter(plan => {
    if (!plan || typeof plan !== 'object') {
      return false;
    }

    const planName = (plan?.name ?? '').toString().trim();
    const description = (plan?.description ?? '').toString().trim();
    const searchTermSafe = (searchTerm ?? '').toString().trim();
    
    return searchTermSafe === '' || 
           planName.toLowerCase().includes(searchTermSafe.toLowerCase()) || 
           description.toLowerCase().includes(searchTermSafe.toLowerCase());
  });

  const formatCurrency = (amount: string | null | undefined) => {
    try {
      const numAmount = parseFloat(amount ?? '0');
      if (isNaN(numAmount)) return '₹0';
      
      return new Intl.NumberFormat('hi-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(numAmount);
    } catch (error) {
      console.warn('Error formatting currency:', error, amount);
      return '₹0';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mr-3"></div>
        <span className="text-gray-600">Loading plans...</span>
      </div>
    );
  }

  if (!Array.isArray(plans) || plans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No plans available</h3>
        <p className="text-gray-500">Start by creating your first plan</p>
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
            placeholder="Search plans..."
            value={searchTerm ?? ''}
            onChange={(e) => setSearchTerm(e?.target?.value?.toString()?.trim() ?? '')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-black placeholder-gray-400"
          />
        </div>
      </div>

      {/* Plan List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredPlans ?? []).length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            (filteredPlans ?? []).map((plan) => {
              if (!plan || typeof plan !== 'object' || !plan.id) {
                return null;
              }
              return (
            <div key={plan?.id ?? ''} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-white">
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                {plan?.image_url ? (
                  <img 
                    src={`https://api.33kotidham.in/${plan.image_url}`} 
                    alt={plan.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full bg-purple-100 rounded-lg flex items-center justify-center"><span class="text-purple-600 text-3xl">📋</span></div>';
                      }
                    }}
                  />
                ) : (
                  <span className="text-purple-600 text-3xl">📋</span>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900 text-lg   leading-tight">{plan?.name ?? ''}</h4>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">{plan?.description ?? ''}</p>
                
                {/* Pricing Details */}
                <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2 mt-3">
                  <div className="text-center">
                    <div className="text-gray-500">Actual Price</div>
                    <div className="font-medium text-gray-600">{formatCurrency(plan?.actual_price)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500">Discounted</div>
                    <div className="font-medium text-green-600">{formatCurrency(plan?.discounted_price)}</div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 border-t pt-2 mt-3">
                  Created: {(() => {
                    try {
                      const date = plan?.created_at;
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
                    onUpdateModalOpen(plan.id, plan);
                  }}
                  disabled={!plan?.id || isLoadingUpdate}
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
                    onViewModalOpen(plan.id, plan);
                  }}
                  disabled={!plan || isLoadingView}
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
                    handleDeletePlan(plan.id, plan.name);
                  }}
                  disabled={!plan?.id || isLoadingDelete === plan.id}
                  className="bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingDelete === plan.id ? (
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
                    Plan Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pricing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(filteredPlans ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <div className="text-gray-400 text-4xl mb-4">🔍</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
                      <p className="text-gray-500">Try adjusting your search criteria</p>
                    </td>
                  </tr>
                ) : (
                  (filteredPlans ?? []).map((plan) => {
                    if (!plan || typeof plan !== 'object' || !plan.id) {
                      return null;
                    }
                    return (
                  <tr key={plan?.id ?? ''} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                            <span className="text-purple-600 text-lg">📋</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900  ">{plan?.name ?? ''}</div>
                          <div className="text-sm text-gray-600">{plan?.description ?? ''}</div>
                          <div className="text-xs text-gray-500">Created: {(() => {
                            try {
                              const date = plan?.created_at;
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
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Actual:</span>
                          <span className="font-medium text-gray-600">{formatCurrency(plan?.actual_price)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Discounted:</span>
                          <span className="font-medium text-green-600">{formatCurrency(plan?.discounted_price)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e?.stopPropagation?.();
                            onUpdateModalOpen(plan?.id, plan);
                          }}
                          disabled={!plan?.id || isLoadingUpdate}
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
                            onViewModalOpen(plan?.id, plan);
                          }}
                          disabled={!plan || isLoadingView}
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
                            handleDeletePlan(plan.id, plan.name);
                          }}
                          disabled={!plan?.id || isLoadingDelete === plan.id}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                          title="Delete"
                        >
                          {isLoadingDelete === plan.id ? (
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

      {/* Update Plan Modal */}
      {updatePlanData && (
        <UpdatePlanModal
          planId={selectedPlanId}
          visible={isUpdateModalVisible}
          planData={updatePlanData}
          onCancel={onUpdateModalClose}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* View Plan Modal */}
      {viewPlanData && (
        <ViewPlanModal
          plan={viewPlanData}
          visible={isViewModalVisible}
          onCancel={onViewModalClose}
        />
      )}
    </>
  );
};

export default PlanList;

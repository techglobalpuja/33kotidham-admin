import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { fetchPujasWithProcess } from '@/store/slices/pujaProcessSlice';
import PujaProcessModal from './PujaProcessModal';
import { AppDispatch } from '@/store';

interface Puja {
  id: string;
  name: string;
  date: string;
  temple_address: string;
  total_bookings: number;
  process_status: string;
  is_active: boolean;
  sub_heading: string;
  created_date: string;
  video_url?: string;
}

const PujaProcessList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const pujaProcessState = useSelector((state: RootState) => state.pujaProcess);
  const { pujas: rawPujas, isLoading } = pujaProcessState;
  
  // Transform raw pujas to match our interface
  const pujas: Puja[] = React.useMemo(() => {
    if (!Array.isArray(rawPujas)) {
      return [];
    }
    
    return rawPujas
      .filter(puja => puja && typeof puja === 'object')
      .map((puja: any) => {
        return {
          id: (puja?.id ?? '').toString().trim() || `temp-${Date.now()}-${Math.random()}`,
          name: (puja?.name ?? '').toString().trim(),
          date: (puja?.date ?? '').toString().trim(),
          temple_address: (puja?.temple_address ?? '').toString().trim(),
          total_bookings: puja?.total_bookings ?? 0,
          process_status: (puja?.process_status ?? 'Scheduled').toString().trim(),
          is_active: Boolean(puja?.is_active ?? true),
          sub_heading: (puja?.sub_heading ?? '').toString().trim(),
          created_date: (puja?.created_date ?? '').toString().trim(),
          video_url: (puja?.video_url ?? '').toString().trim(), // Added video_url field
        };
      })
      .filter(puja => puja.id && !puja.id.startsWith('error-'));
  }, [rawPujas]);

  const [selectedPuja, setSelectedPuja] = useState<Puja | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchPujasWithProcess());
  }, [dispatch]);

  const handleProcessClick = (puja: Puja) => {
    setSelectedPuja(puja);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedPuja(null);
  };

  const handleUpdateSuccess = () => {
    dispatch(fetchPujasWithProcess());
    handleModalClose();
  };

  // Filter pujas based on search term
  const filteredPujas = (pujas ?? []).filter((puja: Puja) => {
    if (!puja || typeof puja !== 'object') {
      return false;
    }

    const pujaName = (puja?.name ?? '').toString().trim();
    const templeAddress = (puja?.temple_address ?? '').toString().trim();
    const searchTermSafe = (searchTerm ?? '').toString().trim();
    
    const matchesSearch = searchTermSafe === '' || 
                         pujaName.toLowerCase().includes(searchTermSafe.toLowerCase()) || 
                         templeAddress.toLowerCase().includes(searchTermSafe.toLowerCase());
    
    return matchesSearch;
  });

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

  // Format date helper function
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <>
      {/* Puja Process Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puja Details
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puja Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temple
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Process Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Bookings
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Process
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(filteredPujas ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="text-gray-400 text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pujas found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                (filteredPujas ?? []).map((puja) => {
                  if (!puja || typeof puja !== 'object') {
                    return null;
                  }
                  
                  const safePujaId = (puja?.id ?? '').toString().trim();
                  if (!safePujaId) {
                    return null;
                  }
                  
                  return (
                    <tr key={safePujaId} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded flex items-center justify-center">
                              <span className="text-orange-600 text-sm">🛕</span>
                            </div>
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-32" title={puja?.name ?? ''}>{puja?.name ?? ''}</div>
                            {puja?.sub_heading && (
                              <div className="text-xs text-orange-600 truncate max-w-32" title={puja?.sub_heading ?? ''}>{puja?.sub_heading ?? ''}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {puja?.date ? formatDate(puja.date) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm text-gray-900 max-w-24 truncate" title={puja?.temple_address ?? ''}>
                          {puja?.temple_address ?? ''}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {/* Status column showing is_active field */}
                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                          puja?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {puja?.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {/* Process Status column showing process_status field */}
                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                          puja?.process_status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                          puja?.process_status === 'Puja Started' ? 'bg-yellow-100 text-yellow-800' :
                          puja?.process_status === 'Puja Ended' ? 'bg-green-100 text-green-800' :
                          puja?.process_status === 'Shared Video' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {puja?.process_status ?? 'Scheduled'}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {puja?.total_bookings ?? 0}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleProcessClick(puja)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-200"
                        >
                          Process
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Modal */}
      {selectedPuja && (
        <PujaProcessModal
          visible={isModalVisible}
          puja={selectedPuja}
          onCancel={handleModalClose}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
};

export default PujaProcessList;
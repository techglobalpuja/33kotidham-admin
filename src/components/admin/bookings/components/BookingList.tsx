import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { fetchBookings, fetchBookingById } from '@/store/slices/bookingSlice';
import ViewBookingModal from '@/components/admin/bookings/components/ViewBookingModal';
import type { AppDispatch } from '@/store';
import type { BookingState } from '@/types';

interface Booking {
  id: number;
  puja_id: number;
  plan_id: number;
  booking_date: string;
  mobile_number: string;
  whatsapp_number: string;
  gotra: string;
  user_id: number;
  status: string;
  puja_link: string | null;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    mobile: string;
    role: string;
    is_active: boolean;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
  };
  puja: {
    id: number;
    name: string;
    sub_heading: string;
    description: string;
    date: string;
    time: string;
    temple_image_url: string;
    temple_address: string;
    temple_description: string;
    prasad_price: number;
    is_prasad_active: boolean;
    dakshina_prices_inr: string;
    dakshina_prices_usd: string;
    is_dakshina_active: boolean;
    manokamna_prices_inr: string;
    manokamna_prices_usd: string;
    is_manokamna_active: boolean;
    category: string;
    created_at: string;
    updated_at: string;
    benefits: Array<{
      id: number;
      benefit_title: string;
      benefit_description: string;
      puja_id: number;
      created_at: string;
    }>;
    images: Array<{
      id: number;
      image_url: string;
    }>;
    plan_ids: number[];
    chadawas: any[];
  };
  plan: {
    id: number;
    name: string;
    description: string;
    image_url: string;
    actual_price: string;
    discounted_price: string;
    created_at: string;
  };
  booking_chadawas: Array<{
    id: number;
    chadawa_id: number;
    note: string | null;
    chadawa: {
      id: number;
      name: string;
      description: string;
      image_url: string;
      price: string;
      requires_note: boolean;
    };
  }>;
}

interface BookingListProps {
  viewMode?: 'table';
}

const BookingList: React.FC<BookingListProps> = ({ viewMode = 'table' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings: rawBookings, isLoading } = useSelector((state: RootState) => state.booking as BookingState);
  
  // Transform raw bookings to match the component interface with comprehensive null handling
  const bookings: Booking[] = React.useMemo(() => {
    if (!Array.isArray(rawBookings)) {
      console.warn('rawBookings is not an array:', rawBookings);
      return [];
    }
    
    return rawBookings
      .filter(booking => booking && typeof booking === 'object') // Filter out null/undefined/invalid entries
      .map((booking: any) => {
        try {
          return {
            id: booking?.id ?? 0,
            puja_id: booking?.puja_id ?? 0,
            plan_id: booking?.plan_id ?? 0,
            booking_date: (booking?.booking_date ?? '').toString().trim(),
            mobile_number: (booking?.mobile_number ?? '').toString().trim(),
            whatsapp_number: (booking?.whatsapp_number ?? '').toString().trim(),
            gotra: (booking?.gotra ?? '').toString().trim(),
            user_id: booking?.user_id ?? 0,
            status: (booking?.status ?? 'pending').toString().trim(),
            puja_link: booking?.puja_link ?? null,
            created_at: (booking?.created_at ?? '').toString().trim(),
            user: {
              id: booking?.user?.id ?? 0,
              name: (booking?.user?.name ?? '').toString().trim(),
              email: (booking?.user?.email ?? '').toString().trim(),
              mobile: (booking?.user?.mobile ?? '').toString().trim(),
              role: (booking?.user?.role ?? '').toString().trim(),
              is_active: Boolean(booking?.user?.is_active ?? false),
              email_verified: Boolean(booking?.user?.email_verified ?? false),
              created_at: (booking?.user?.created_at ?? '').toString().trim(),
              updated_at: (booking?.user?.updated_at ?? '').toString().trim(),
            },
            puja: {
              id: booking?.puja?.id ?? 0,
              name: (booking?.puja?.name ?? '').toString().trim(),
              sub_heading: (booking?.puja?.sub_heading ?? '').toString().trim(),
              description: (booking?.puja?.description ?? '').toString().trim(),
              date: (booking?.puja?.date ?? '').toString().trim(),
              time: (booking?.puja?.time ?? '').toString().trim(),
              temple_image_url: (booking?.puja?.temple_image_url ?? '').toString().trim(),
              temple_address: (booking?.puja?.temple_address ?? '').toString().trim(),
              temple_description: (booking?.puja?.temple_description ?? '').toString().trim(),
              prasad_price: booking?.puja?.prasad_price ?? 0,
              is_prasad_active: Boolean(booking?.puja?.is_prasad_active ?? false),
              dakshina_prices_inr: (booking?.puja?.dakshina_prices_inr ?? '').toString().trim(),
              dakshina_prices_usd: (booking?.puja?.dakshina_prices_usd ?? '').toString().trim(),
              is_dakshina_active: Boolean(booking?.puja?.is_dakshina_active ?? false),
              manokamna_prices_inr: (booking?.puja?.manokamna_prices_inr ?? '').toString().trim(),
              manokamna_prices_usd: (booking?.puja?.manokamna_prices_usd ?? '').toString().trim(),
              is_manokamna_active: Boolean(booking?.puja?.is_manokamna_active ?? false),
              category: (booking?.puja?.category ?? '').toString().trim(),
              created_at: (booking?.puja?.created_at ?? '').toString().trim(),
              updated_at: (booking?.puja?.updated_at ?? '').toString().trim(),
              benefits: Array.isArray(booking?.puja?.benefits) ? booking.puja.benefits : [],
              images: Array.isArray(booking?.puja?.images) ? booking.puja.images : [],
              plan_ids: Array.isArray(booking?.puja?.plan_ids) ? booking.puja.plan_ids : [],
              chadawas: Array.isArray(booking?.puja?.chadawas) ? booking.puja.chadawas : [],
            },
            plan: {
              id: booking?.plan?.id ?? 0,
              name: (booking?.plan?.name ?? '').toString().trim(),
              description: (booking?.plan?.description ?? '').toString().trim(),
              image_url: (booking?.plan?.image_url ?? '').toString().trim(),
              actual_price: (booking?.plan?.actual_price ?? '0').toString().trim(),
              discounted_price: (booking?.plan?.discounted_price ?? '0').toString().trim(),
              created_at: (booking?.plan?.created_at ?? '').toString().trim(),
            },
            booking_chadawas: Array.isArray(booking?.booking_chadawas) ? booking.booking_chadawas : [],
          };
        } catch (error) {
          console.error('Error transforming booking data:', error, booking);
          // Return a safe default object for corrupted data
          return {
            id: 0,
            puja_id: 0,
            plan_id: 0,
            booking_date: '',
            mobile_number: '',
            whatsapp_number: '',
            gotra: '',
            user_id: 0,
            status: 'pending',
            puja_link: null,
            created_at: '',
            user: {
              id: 0,
              name: '',
              email: '',
              mobile: '',
              role: '',
              is_active: false,
              email_verified: false,
              created_at: '',
              updated_at: '',
            },
            puja: {
              id: 0,
              name: '',
              sub_heading: '',
              description: '',
              date: '',
              time: '',
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
              category: '',
              created_at: '',
              updated_at: '',
              benefits: [],
              images: [],
              plan_ids: [],
              chadawas: [],
            },
            plan: {
              id: 0,
              name: '',
              description: '',
              image_url: '',
              actual_price: '0',
              discounted_price: '0',
              created_at: '',
            },
            booking_chadawas: [],
          };
        }
      })
      .filter(booking => booking.id > 0); // Filter out invalid bookings
  }, [rawBookings]);

  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [viewBookingData, setViewBookingData] = useState<any>(null); // Data for view modal
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoadingView, setIsLoadingView] = useState(false);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  // Function to handle view modal opening
  const onViewModalOpen = async (bookingId: number, bookingData: any) => {
    console.log('onViewModalOpen called for bookingId:', bookingId);
    
    try {
      if (!bookingId) {
        console.error('Invalid booking ID for view');
        return;
      }

      setIsLoadingView(true);
      setSelectedBooking(bookingData);
      
      // Call API to fetch full booking details
      const result = await dispatch(fetchBookingById(bookingId.toString()));
      
      if (fetchBookingById.fulfilled.match(result)) {
        console.log('Booking data fetched successfully for view:', result.payload);
        setViewBookingData(result.payload);
        setIsViewModalVisible(true);
      } else {
        console.error('Failed to fetch booking data for view:', result);
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
      setSelectedBooking(null);
      setViewBookingData(null);
      setIsLoadingView(false);
    } catch (error) {
      console.error('Error in onViewModalClose:', error);
    }
  };

  // Status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter bookings based on status with comprehensive null checks
  const filteredBookings = (bookings ?? []).filter(booking => {
    // Ensure booking object exists and has basic structure
    if (!booking || typeof booking !== 'object') {
      return false;
    }

    const bookingStatus = (booking?.status ?? 'pending').toString().trim();
    const matchesStatus = statusFilter === 'all' || bookingStatus === statusFilter;
    
    return matchesStatus;
  });

  const formatCurrency = (amount: string) => {
    try {
      const numAmount = parseFloat(amount);
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mr-3"></div>
        <span className="text-gray-600">Loading bookings...</span>
      </div>
    );
  }

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings available</h3>
        <p className="text-gray-500">No bookings have been made yet</p>
      </div>
    );
  }

  return (
    <>
      {/* Filters */ }
      {/* <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e?.target?.value?.toString()?.trim() ?? 'all')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div> */}

      {/* Booking List */ }
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puja
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
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
              {(filteredBookings ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-400 text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-500">Try adjusting your filter criteria</p>
                  </td>
                </tr>
              ) : (
                (filteredBookings ?? []).map((booking) => {
                  // Skip rendering if booking data is invalid
                  if (!booking || typeof booking !== 'object') {
                    return null;
                  }
                  
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{booking.id}</div>
                        <div className="text-xs text-gray-500">
                          Booked: {formatDate(booking.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
                        <div className="text-sm text-gray-500">{booking.user.email}</div>
                        <div className="text-xs text-gray-500">{booking.mobile_number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{booking.puja.name}</div>
                        <div className="text-xs text-gray-500">Plan: {booking.plan.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.puja.date}</div>
                        <div className="text-xs text-gray-500">{booking.puja.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(booking.plan.actual_price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={(e) => {
                              e?.stopPropagation?.();
                              onViewModalOpen(booking.id, booking);
                            }}
                            disabled={isLoadingView}
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

      {/* View Booking Modal */ }
      {viewBookingData && (
        <ViewBookingModal
          booking={viewBookingData}
          visible={isViewModalVisible}
          onCancel={onViewModalClose}
        />
      )}
    </>
  );
};

export default BookingList;
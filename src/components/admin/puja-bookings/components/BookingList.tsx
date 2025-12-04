import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { fetchPujaBookings, fetchBookingById } from '@/store/slices/bookingSlice';
import { fetchAllPujas } from '@/store/slices/pujaSlice'; // Import fetchAllPujas
import ViewBookingModal from '@/components/admin/puja-bookings/components/ViewBookingModal';
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
    benefits: Array<{ id: number; benefit_title: string; benefit_description: string; puja_id: number; created_at: string }>;
    images: Array<{ id: number; image_url: string }>;
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
  booking_chadawas: Array<{ id: number; chadawa_id: number; note: string | null; chadawa: { id: number; name: string; description: string; image_url: string; price: string; requires_note: boolean } }>;
}

interface BookingListProps {
  viewMode?: 'table';
  bookingType?: 'puja'; // Specific to puja bookings
}

const BookingList: React.FC<BookingListProps> = ({ viewMode = 'table', bookingType = 'all' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings: rawBookings, isLoading } = useSelector((state: RootState) => state.booking as BookingState);
  const { pujas: allPujas } = useSelector((state: RootState) => state.puja); // Get all pujas from Redux store

  // UI state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pujaFilter, setPujaFilter] = useState<string>('all'); // New puja filter state
  const [isLoadingView, setIsLoadingView] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewBookingData, setViewBookingData] = useState<any>(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Fetch all pujas when component mounts
  useEffect(() => {
    dispatch(fetchAllPujas()); // Fetch all pujas (both active and inactive)
  }, [dispatch]);

  // Transform raw bookings
  const bookings: Booking[] = useMemo(() => {
    if (!Array.isArray(rawBookings)) {
      console.warn('rawBookings is not an array:', rawBookings);
      return [];
    }
    return rawBookings
      .filter((b) => b && typeof b === 'object')
      .map((b: any) => {
        try {
          return {
            id: b?.id ?? 0,
            puja_id: b?.puja_id ?? 0,
            plan_id: b?.plan_id ?? 0,
            booking_date: (b?.booking_date ?? '').toString().trim(),
            mobile_number: (b?.mobile_number ?? '').toString().trim(),
            whatsapp_number: (b?.whatsapp_number ?? '').toString().trim(),
            gotra: (b?.gotra ?? '').toString().trim(),
            user_id: b?.user_id ?? 0,
            status: (b?.status ?? 'pending').toString().trim(),
            puja_link: b?.puja_link ?? null,
            created_at: (b?.created_at ?? '').toString().trim(),
            user: {
              id: b?.user?.id ?? 0,
              name: (b?.user?.name ?? '').toString().trim(),
              email: (b?.user?.email ?? '').toString().trim(),
              mobile: (b?.user?.mobile ?? '').toString().trim(),
              role: (b?.user?.role ?? '').toString().trim(),
              is_active: Boolean(b?.user?.is_active ?? false),
              email_verified: Boolean(b?.user?.email_verified ?? false),
              created_at: (b?.user?.created_at ?? '').toString().trim(),
              updated_at: (b?.user?.updated_at ?? '').toString().trim(),
            },
            puja: {
              id: b?.puja?.id ?? 0,
              name: (b?.puja?.name ?? '').toString().trim(),
              sub_heading: (b?.puja?.sub_heading ?? '').toString().trim(),
              description: (b?.puja?.description ?? '').toString().trim(),
              date: (b?.puja?.date ?? '').toString().trim(),
              time: (b?.puja?.time ?? '').toString().trim(),
              temple_image_url: (b?.puja?.temple_image_url ?? '').toString().trim(),
              temple_address: (b?.puja?.temple_address ?? '').toString().trim(),
              temple_description: (b?.puja?.temple_description ?? '').toString().trim(),
              prasad_price: b?.puja?.prasad_price ?? 0,
              is_prasad_active: Boolean(b?.puja?.is_prasad_active ?? false),
              dakshina_prices_inr: (b?.puja?.dakshina_prices_inr ?? '').toString().trim(),
              dakshina_prices_usd: (b?.puja?.dakshina_prices_usd ?? '').toString().trim(),
              is_dakshina_active: Boolean(b?.puja?.is_dakshina_active ?? false),
              manokamna_prices_inr: (b?.puja?.manokamna_prices_inr ?? '').toString().trim(),
              manokamna_prices_usd: (b?.puja?.manokamna_prices_usd ?? '').toString().trim(),
              is_manokamna_active: Boolean(b?.puja?.is_manokamna_active ?? false),
              category: (b?.puja?.category ?? '').toString().trim(),
              created_at: (b?.puja?.created_at ?? '').toString().trim(),
              updated_at: (b?.puja?.updated_at ?? '').toString().trim(),
              benefits: Array.isArray(b?.puja?.benefits) ? b.puja.benefits : [],
              images: Array.isArray(b?.puja?.images) ? b.puja.images : [],
              plan_ids: Array.isArray(b?.puja?.plan_ids) ? b.puja.plan_ids : [],
              chadawas: Array.isArray(b?.puja?.chadawas) ? b.puja.chadawas : [],
            },
            plan: {
              id: b?.plan?.id ?? 0,
              name: (b?.plan?.name ?? '').toString().trim(),
              description: (b?.plan?.description ?? '').toString().trim(),
              image_url: (b?.plan?.image_url ?? '').toString().trim(),
              actual_price: (b?.plan?.actual_price ?? '0').toString().trim(),
              discounted_price: (b?.plan?.discounted_price ?? '0').toString().trim(),
              created_at: (b?.plan?.created_at ?? '').toString().trim(),
            },
            booking_chadawas: Array.isArray(b?.booking_chadawas) ? b.booking_chadawas : [],
          } as Booking;
        } catch (error) {
          console.error('Error transforming booking data:', error, b);
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
            user: { id: 0, name: '', email: '', mobile: '', role: '', is_active: false, email_verified: false, created_at: '', updated_at: '' },
            puja: { id: 0, name: '', sub_heading: '', description: '', date: '', time: '', temple_image_url: '', temple_address: '', temple_description: '', prasad_price: 0, is_prasad_active: false, dakshina_prices_inr: '', dakshina_prices_usd: '', is_dakshina_active: false, manokamna_prices_inr: '', manokamna_prices_usd: '', is_manokamna_active: false, category: '', created_at: '', updated_at: '', benefits: [], images: [], plan_ids: [], chadawas: [] },
            plan: { id: 0, name: '', description: '', image_url: '', actual_price: '0', discounted_price: '0', created_at: '' },
            booking_chadawas: [],
          } as Booking;
        }
      });
  }, [rawBookings]);

  // Filter and sort
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const bookingStatus = (b?.status ?? 'pending').toString().trim();
        const bookingPujaId = b?.puja?.id ?? 0;
        
        // Apply status filter
        const statusMatch = statusFilter === 'all' || bookingStatus === statusFilter;
        
        // Apply puja filter
        const pujaMatch = pujaFilter === 'all' || bookingPujaId === parseInt(pujaFilter);
        
        return statusMatch && pujaMatch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA; // newest first
      });
  }, [bookings, statusFilter, pujaFilter]); // Add pujaFilter to dependencies

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage));
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, pujaFilter]); // Add pujaFilter to dependencies

  // Helpers
  const formatCurrency = (amount: string) => {
    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return '₹0';
      return new Intl.NumberFormat('hi-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
    } catch {
      return '₹0';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

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

  const onViewModalOpen = async (bookingId: number, bookingData: Booking) => {
    console.log('onViewModalOpen', bookingId);
    try {
      setIsLoadingView(true);
      setSelectedBooking(bookingData);
      const result = await dispatch(fetchBookingById(bookingId.toString()));
      if (fetchBookingById.fulfilled.match(result)) {
        setViewBookingData(result.payload);
        setIsViewModalVisible(true);
      } else {
        console.error('Failed to fetch booking', result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingView(false);
    }
  };

  const onViewModalClose = () => {
    setIsViewModalVisible(false);
    setSelectedBooking(null);
    setViewBookingData(null);
    setIsLoadingView(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mr-3"></div>
        <span className="text-gray-600">Loading bookings...</span>
      </div>
    );
  }

  if (!bookings.length) {
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
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4">
          {/* Puja Name Filter */}
          <select
            value={pujaFilter}
            onChange={(e) => setPujaFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-800"
          >
            <option value="all">All Pujas</option>
            {allPujas && allPujas.map((puja: any) => (
              <option key={puja.id} value={puja.id}>
                {puja.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-800"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        {/* Total Count Display */}
        <div className="text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          Total Records: <span className="text-orange-600 font-bold">{filteredBookings.length}</span>
        </div>
      </div>

      {/* Booking List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puja</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{booking.id}</div>
                    <div className="text-xs text-gray-5">
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
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(booking.plan.actual_price)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewModalOpen(booking.id, booking); }}
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
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredBookings.length)}</span> of{' '}
                  <span className="font-medium">{filteredBookings.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1 ? 'z-10 bg-orange-50 border-orange-500 text-orange-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewModalVisible && selectedBooking && (
        <ViewBookingModal
          booking={selectedBooking}
          visible={isViewModalVisible}
          onCancel={onViewModalClose}
        />
      )}
    </>
  );
};

export default BookingList;
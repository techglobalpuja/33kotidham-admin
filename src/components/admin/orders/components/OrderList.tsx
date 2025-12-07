'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { fetchOrders, Order } from '../../../../store/slices/orderSlice';
import { axiosInstance } from '@/services/apiConfig';
import type { AppDispatch } from '@/store';

const OrderList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders: rawOrders, isLoading } = useSelector((state: RootState) => state.order || { orders: null, isLoading: false });
  
  const [statusFilter, setStatusFilter] = useState<string>('all'); // Order status filter
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all'); // Payment status filter
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [usersCache, setUsersCache] = useState<Record<number, any>>({}); // Cache for user data
  const itemsPerPage = 10;

  // Transform raw orders
  const orders: Order[] = useMemo(() => {
    if (!Array.isArray(rawOrders)) {
      return [];
    }
    
    return rawOrders
      .filter((o) => o && typeof o === 'object')
      .map((o: any) => {
        try {
          return {
            id: o?.id ?? 0,
            user_id: o?.user_id ?? 0,
            order_number: (o?.order_number ?? '').toString().trim(),
            total_amount: (o?.total_amount ?? '0').toString().trim(),
            status: (o?.status ?? '').toString().trim(),
            payment_status: (o?.payment_status ?? '').toString().trim(),
            created_at: (o?.created_at ?? '').toString().trim(),
            user: o?.user ? {
              name: (o.user.name ?? '').toString().trim(),
              email: (o.user.email ?? '').toString().trim(),
              mobile: (o.user.mobile ?? '').toString().trim(),
            } : undefined,
            order_items: Array.isArray(o?.order_items) ? o.order_items : [],
          } as Order;
        } catch (error) {
          console.error('Error transforming order data:', error, o);
          return {
            id: 0,
            user_id: 0,
            order_number: '',
            total_amount: '0',
            status: '',
            payment_status: '',
            created_at: '',
          } as Order;
        }
      });
  }, [rawOrders]);

  // Fetch user details for orders
  useEffect(() => {
    const fetchUserDetails = async () => {
      const userIds = Array.from(new Set(orders.map(o => o.user_id).filter(id => id && !usersCache[id])));
      
      if (userIds.length === 0) return;

      try {
        const userPromises = userIds.map(userId =>
          axiosInstance.get(`/api/v1/users/${userId}`)
            .then((response: any) => ({ userId, data: response.data }))
            .catch((error: any) => {
              console.error(`Failed to fetch user ${userId}:`, error);
              return { userId, data: null };
            })
        );

        const userResults = await Promise.all(userPromises);
        const newUsersCache = { ...usersCache };
        
        userResults.forEach(({ userId, data }: { userId: number; data: any }) => {
          if (data) {
            newUsersCache[userId] = data;
          }
        });

        setUsersCache(newUsersCache);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [orders]);

  // Transform orders with user data from cache
  const ordersWithUsers = useMemo(() => {
    return orders.map(order => ({
      ...order,
      user: usersCache[order.user_id] || order.user
    }));
  }, [orders, usersCache]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return ordersWithUsers
      .filter((o) => {
        if (statusFilter === 'all' && paymentStatusFilter === 'all') return true;
        const statusMatch = statusFilter === 'all' || o.status === statusFilter;
        const paymentMatch = paymentStatusFilter === 'all' || o.payment_status === paymentStatusFilter;
        return statusMatch && paymentMatch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA; // newest first
      });
  }, [ordersWithUsers, statusFilter, paymentStatusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, paymentStatusFilter]);

  // Fetch orders on component mount
  useEffect(() => {
    dispatch(fetchOrders({ skip: 0, limit: 100 }));
  }, [dispatch]);

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
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mr-3"></div>
        <span className="text-gray-600">Loading orders...</span>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders available</h3>
        <p className="text-gray-500">No orders have been placed yet</p>
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {/* Order Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-800"
        >
          <option value="all">All Order Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Payment Status Filter */}
        <select
          value={paymentStatusFilter}
          onChange={(e) => setPaymentStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-800"
        >
          <option value="all">All Payment Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Order List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{order.order_number}</div>
                    <div className="text-xs text-gray-500">
                      ID: {order.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.user?.name || `User ID: ${order.user_id}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.user?.email || order.user?.mobile || `ID: ${order.user_id}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {order.order_items && order.order_items.length > 0 ? (
                        <div className="space-y-1">
                          {order.order_items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="font-medium">{item.product_name}</span>
                              <span className="text-xs text-gray-500">×{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No products</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(order.total_amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadgeClass(order.payment_status)}`}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
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
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of{' '}
                  <span className="font-medium">{filteredOrders.length}</span> results
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
    </>
  );
};

export default OrderList;
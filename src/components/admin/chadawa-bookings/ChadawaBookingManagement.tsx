'use client';

import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchChadawaBookings } from '@/store/slices/bookingSlice';
import BookingList from './components/BookingList';

const ChadawaBookingManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  React.useEffect(() => {
    dispatch(fetchChadawaBookings());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Chadawa Booking Management</h2>
      </div>

      {/* Chadawa Booking Management Section */}
      <div className="bg-white rounded-xl shadow-lg border border-orange-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">All Chadawa Bookings</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your chadawa customer bookings</p>
            </div>
          </div>

          <BookingList bookingType="chadawa" />
        </div>
      </div>
    </div>
  );
};

export default ChadawaBookingManagement;
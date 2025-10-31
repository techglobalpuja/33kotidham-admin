'use client';

import React from 'react';
import { Modal } from 'antd';

interface BookingData {
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

interface ViewBookingModalProps {
  booking?: BookingData | null;
  visible?: boolean;
  onCancel?: () => void;
}

const ViewBookingModal: React.FC<ViewBookingModalProps> = ({ 
  booking, 
  visible, 
  onCancel
}) => {
  // Enhanced safety checks and handlers
  const isVisible = Boolean(visible ?? false);
  const safeOnCancel = onCancel ?? (() => {});
  
  // Early return with comprehensive null checks
  if (!isVisible || !booking || typeof booking !== 'object') {
    return null;
  }

  // Safe data extraction with fallbacks
  const safeData = {
    id: booking.id ?? 0,
    booking_date: (booking.booking_date ?? '').toString().trim() || 'N/A',
    mobile_number: (booking.mobile_number ?? '').toString().trim() || 'N/A',
    whatsapp_number: (booking.whatsapp_number ?? '').toString().trim() || 'N/A',
    gotra: (booking.gotra ?? '').toString().trim() || 'N/A',
    status: (booking.status ?? 'pending').toString().trim(),
    created_at: (booking.created_at ?? '').toString().trim() || 'N/A',
    user: {
      id: booking.user?.id ?? 0,
      name: (booking.user?.name ?? '').toString().trim() || 'N/A',
      email: (booking.user?.email ?? '').toString().trim() || 'N/A',
      mobile: (booking.user?.mobile ?? '').toString().trim() || 'N/A',
      role: (booking.user?.role ?? '').toString().trim() || 'N/A',
    },
    puja: {
      id: booking.puja?.id ?? 0,
      name: (booking.puja?.name ?? '').toString().trim() || 'N/A',
      sub_heading: (booking.puja?.sub_heading ?? '').toString().trim() || 'N/A',
      description: (booking.puja?.description ?? '').toString().trim() || 'N/A',
      date: (booking.puja?.date ?? '').toString().trim() || 'N/A',
      time: (booking.puja?.time ?? '').toString().trim() || 'N/A',
      temple_address: (booking.puja?.temple_address ?? '').toString().trim() || 'N/A',
      benefits: Array.isArray(booking.puja?.benefits) ? booking.puja.benefits : [],
      images: Array.isArray(booking.puja?.images) ? booking.puja.images : [],
    },
    plan: {
      id: booking.plan?.id ?? 0,
      name: (booking.plan?.name ?? '').toString().trim() || 'N/A',
      description: (booking.plan?.description ?? '').toString().trim() || 'N/A',
      actual_price: (booking.plan?.actual_price ?? '0').toString().trim(),
      discounted_price: (booking.plan?.discounted_price ?? '0').toString().trim(),
    },
    booking_chadawas: Array.isArray(booking.booking_chadawas) ? booking.booking_chadawas : [],
  };

  // Format price safely
  const formatPrice = (price: string) => {
    try {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice)) return '₹0';
      
      return new Intl.NumberFormat('hi-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(numPrice);
    } catch (error) {
      return `₹${price}`;
    }
  };

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
    } catch (error) {
      return 'N/A';
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

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <span className="text-xl">View Booking Details</span>
        </div>
      }
      open={visible}
      onCancel={safeOnCancel}
      footer={null}
      width={1000}
      style={{ top: 20 }}
      className="admin-booking-view-modal"
    >
      <div className="max-h-[75vh] overflow-y-auto pr-2">
        {/* Booking Header Info */ }
        <div className="bg-white p-4 rounded-lg mb-6 border border-orange-200 shadow-sm">
          <h4 className="font-medium text-orange-800 text-lg">
            Booking ID: #{safeData.id}
          </h4>
          <p className="text-sm text-orange-600">Status: 
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${getStatusBadgeClass(safeData.status)}`}>
              {safeData.status.charAt(0).toUpperCase() + safeData.status.slice(1)}
            </span>
          </p>
        </div>

        {/* Section 1: Booking Details */ }
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 mb-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            1. Booking Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date</label>
              <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-black">
                {formatDate(safeData.created_at)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Puja Date</label>
              <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-black">
                {safeData.puja.date}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Puja Time</label>
              <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-black">
                {safeData.puja.time}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gotra</label>
              <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-black">
                {safeData.gotra || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Customer Details */ }
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200 mb-6">
          <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">👤</span>
            2. Customer Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <div className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg text-black">
                {safeData.user.name}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg text-black">
                {safeData.user.email}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg text-black">
                {safeData.mobile_number}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <div className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg text-black">
                {safeData.whatsapp_number}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Puja Details */ }
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🛕</span>
            3. Puja Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Puja Name</label>
              <div className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-black">
                {safeData.puja.name}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub Heading</label>
              <div className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-black">
                {safeData.puja.sub_heading}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-black min-h-24">
                {safeData.puja.description}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temple Address</label>
              <div className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-black">
                {safeData.puja.temple_address}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Plan Details */ }
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 mb-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            4. Plan Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
              <div className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg text-black">
                {safeData.plan.name}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual Price</label>
              <div className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg text-black font-medium">
                {formatPrice(safeData.plan.actual_price)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price</label>
              <div className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg text-black font-medium">
                {formatPrice(safeData.plan.discounted_price)}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg text-black min-h-16">
                {safeData.plan.description}
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Puja Benefits */ }
        {safeData.puja.benefits.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              5. Puja Benefits
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeData.puja.benefits.map((benefit, index) => (
                <div key={benefit.id} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">{benefit.benefit_title}</h4>
                  <p className="text-sm text-gray-700">{benefit.benefit_description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 6: Chadawas */ }
        {safeData.booking_chadawas.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎁</span>
              6. Chadawas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeData.booking_chadawas.map((chadawaItem) => (
                <div key={chadawaItem.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800">{chadawaItem.chadawa.name}</h4>
                  <p className="text-sm text-gray-700 mt-1">{chadawaItem.chadawa.description}</p>
                  <div className="mt-2 text-sm font-medium text-blue-600">
                    Price: {formatPrice(chadawaItem.chadawa.price)}
                  </div>
                  {chadawaItem.note && (
                    <div className="mt-2 text-xs text-gray-600">
                      Note: {chadawaItem.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ViewBookingModal;
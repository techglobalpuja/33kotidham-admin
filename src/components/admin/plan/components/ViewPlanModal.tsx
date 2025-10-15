'use client';

import React from 'react';
import { Modal, Typography } from 'antd';

const { Text } = Typography;

interface PlanData {
  id?: number | null;
  name?: string | null;
  description?: string | null;
  image_url?: string | null;
  actual_price?: string | null;
  discounted_price?: string | null;
  created_at?: string | null;
}

interface ViewPlanModalProps {
  plan?: PlanData | null;
  visible?: boolean;
  onCancel?: () => void;
}

const ViewPlanModal: React.FC<ViewPlanModalProps> = ({ 
  plan, 
  visible, 
  onCancel
}) => {
  const isVisible = Boolean(visible ?? false);
  const safeOnCancel = onCancel ?? (() => {});

  if (!isVisible || !plan || typeof plan !== 'object') {
    return null;
  }

  // Safe data extraction with fallbacks
  const safeData = {
    id: (plan.id ?? 0).toString(),
    name: (plan.name ?? '').toString().trim() || 'Unnamed Plan',
    description: (plan.description ?? '').toString().trim() || 'No description available',
    image_url: (plan.image_url ?? '').toString().trim() || '',
    actual_price: (plan.actual_price ?? '0').toString().trim(),
    discounted_price: (plan.discounted_price ?? '0').toString().trim(),
    created_at: (plan.created_at ?? '').toString().trim() || new Date().toISOString(),
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

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <span className="font-['Philosopher'] text-xl">View Plan Details</span>
        </div>
      }
      open={visible}
      onCancel={safeOnCancel}
      footer={null}
      width={800}
      style={{ top: 20 }}
      className="admin-plan-view-modal"
    >
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        {/* Plan Header Info */}
        <div className="bg-white p-4 rounded-lg mb-6 border border-purple-200 shadow-sm">
          <h4 className="font-medium text-purple-800 text-lg font-['Philosopher']">
            Plan: {safeData.name}
          </h4>
          <p className="text-sm text-purple-600">ID: {safeData.id}</p>
        </div>

        {/* Section 1: Plan Details */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 mb-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-4 font-['Philosopher'] flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Plan Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
              <div className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg text-black">
                {safeData.name}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <div className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg text-black">
                {(() => {
                  try {
                    const date = new Date(safeData.created_at);
                    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
                  } catch (error) {
                    return 'N/A';
                  }
                })()}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="w-full px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg text-black min-h-24">
                {safeData.description}
              </div>
            </div>
            
            {/* Plan Image Preview */}
            {safeData.image_url && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Image</label>
                <div className="mt-2">
                  <img 
                    src={`https://api.33kotidham.in/${safeData.image_url}`} 
                    alt={safeData.name}
                    className="w-full max-w-md h-auto rounded-lg border border-purple-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = '<div class="w-full h-48 bg-purple-100 rounded-lg flex items-center justify-center"><span class="text-purple-600 text-4xl">📋</span></div>';
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Pricing */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4 font-['Philosopher'] flex items-center gap-2">
            <span className="text-2xl">💰</span>
            Pricing Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual Price</label>
              <div className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-black font-semibold">
                {formatPrice(safeData.actual_price)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price</label>
              <div className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-black font-semibold text-green-600">
                {formatPrice(safeData.discounted_price)}
              </div>
            </div>

            {parseFloat(safeData.discounted_price) > 0 && parseFloat(safeData.actual_price) > 0 && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Savings</label>
                <div className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-black font-semibold text-green-600">
                  {formatPrice((parseFloat(safeData.actual_price) - parseFloat(safeData.discounted_price)).toString())} 
                  <span className="text-sm ml-2">
                    ({((((parseFloat(safeData.actual_price) - parseFloat(safeData.discounted_price)) / parseFloat(safeData.actual_price)) * 100).toFixed(0))}% off)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewPlanModal;

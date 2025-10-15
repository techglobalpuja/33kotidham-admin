'use client';

import React from 'react';
import { Modal, Typography } from 'antd';

const { Text } = Typography;

interface ChadawaData {
  id?: number | null;
  name?: string | null;
  description?: string | null;
  image_url?: string | null;
  price?: number | null;
  requires_note?: boolean | null;
}

interface ViewChadawaModalProps {
  chadawa?: ChadawaData | null;
  visible?: boolean;
  onCancel?: () => void;
}

const ViewChadawaModal: React.FC<ViewChadawaModalProps> = ({ 
  chadawa, 
  visible, 
  onCancel
}) => {
  const isVisible = Boolean(visible ?? false);
  const safeOnCancel = onCancel ?? (() => {});

  if (!isVisible || !chadawa || typeof chadawa !== 'object') {
    return null;
  }

  // Safe data extraction with fallbacks
  const safeData = {
    id: (chadawa.id ?? 0).toString(),
    name: (chadawa.name ?? '').toString().trim() || 'Unnamed Chadawa',
    description: (chadawa.description ?? '').toString().trim() || 'No description available',
    image_url: (chadawa.image_url ?? '').toString().trim() || '',
    price: (() => {
      const price = chadawa.price;
      if (price === null || price === undefined) return 0;
      const numPrice = Number(price);
      return isNaN(numPrice) ? 0 : Math.max(0, numPrice);
    })(),
    requires_note: Boolean(chadawa.requires_note ?? false),
  };

  // Format price safely
  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat('hi-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(price);
    } catch (error) {
      return `₹${price}`;
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎁</span>
          <span className="font-['Philosopher'] text-xl">View Chadawa Details</span>
        </div>
      }
      open={visible}
      onCancel={safeOnCancel}
      footer={null}
      width={800}
      style={{ top: 20 }}
      className="admin-chadawa-view-modal"
    >
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        {/* Chadawa Header Info */}
        <div className="bg-white p-4 rounded-lg mb-6 border border-orange-200 shadow-sm">
          <h4 className="font-medium text-orange-800 text-lg font-['Philosopher']">
            {safeData.name}
          </h4>
          <p className="text-sm text-orange-600">ID: {safeData.id}</p>
        </div>

        {/* Chadawa Details */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 mb-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-4 font-['Philosopher'] flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            Chadawa Details
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chadawa Name</label>
              <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-black">
                {safeData.name}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-black font-semibold text-orange-600">
                {formatPrice(safeData.price)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-black min-h-24">
                {safeData.description}
              </div>
            </div>
            
            {/* Image Preview */}
            {safeData.image_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chadawa Image</label>
                <div className="relative w-full max-w-md mx-auto">
                  <div className="aspect-square bg-orange-100 rounded-lg flex items-center justify-center overflow-hidden border border-orange-200">
                    <img 
                      src={`https://api.33kotidham.in/${safeData.image_url}`} 
                      alt={safeData.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.innerHTML = '<span class="text-orange-600 text-4xl">🎁</span>';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note Required from User</label>
              <div className="flex items-center gap-2">
                <div className={`h-5 w-5 rounded-full ${safeData.requires_note ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-700">
                  {safeData.requires_note ? 'Yes - Users must provide a note' : 'No - Note is optional'}
                </span>
              </div>
              {safeData.requires_note && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Text className="text-xs text-blue-700">
                    📝 Users will be prompted to enter additional notes when selecting this chadawa
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewChadawaModal;

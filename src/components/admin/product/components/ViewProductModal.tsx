'use client';

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Carousel } from 'antd';
import { AppDispatch, RootState } from '@/store';
import { fetchProductById } from '@/store/slices/productSlice';
import { message } from 'antd';

interface ViewProductModalProps {
  visible: boolean;
  productId: number;
  onClose: () => void;
}

const ViewProductModal: React.FC<ViewProductModalProps> = ({ visible, productId, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedProduct, isLoading } = useSelector((state: RootState) => state.product);
  const carouselRef = useRef<any>(null);

  useEffect(() => {
    if (visible && productId) {
      // Only fetch if we don't already have the product data or it's a different product
      if (!selectedProduct || selectedProduct.id !== productId) {
        dispatch(fetchProductById(productId))
          .unwrap()
          .catch((error) => {
            message.error(error || 'Failed to load product details');
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, productId]);

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  // Helper function to get proper image URL
  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `https://api.33kotidham.in/${imageUrl}`;
  };

  const goToPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.prev();
    }
  };

  const goToNext = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="text-xl">👁️</span>
          <span className="text-lg font-semibold">Product Details</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : selectedProduct ? (
        <div className="space-y-6 mt-4">
          {/* Images */}
          {selectedProduct.images && selectedProduct.images.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              {selectedProduct.images.length === 1 ? (
                <div className="flex justify-center">
                  <img
                    src={getImageUrl(selectedProduct.images[0].image_url)}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-contain rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              ) : (
                <div className="relative">
                  <button 
                    onClick={goToPrev}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all"
                    style={{ zIndex: 10 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <Carousel 
                    ref={carouselRef}
                    arrows={false}
                    dots 
                    infinite 
                    slidesToShow={1} 
                    slidesToScroll={1}
                  >
                    {selectedProduct.images.map((image, index) => (
                      <div key={image.id} className="flex justify-center items-center">
                        <div className="relative w-full h-64 flex items-center justify-center">
                          <img
                            src={getImageUrl(image.image_url)}
                            alt={`${selectedProduct.name} - Image ${index + 1}`}
                            className="w-full h-64 object-contain rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </Carousel>
                  
                  <button 
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all"
                    style={{ zIndex: 10 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {selectedProduct.images.length} images
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Basic Info */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
            <p className="text-sm text-gray-600 mb-1">SKU: {selectedProduct.sku}</p>
            <p className="text-sm text-gray-600">{selectedProduct.short_description}</p>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">MRP</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedProduct.mrp)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Selling Price</p>
              <p className="text-lg font-semibold text-orange-600">{formatCurrency(selectedProduct.selling_price)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Discount</p>
              <p className="text-lg font-semibold text-green-600">{parseFloat(selectedProduct.discount_percentage).toFixed(0)}%</p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Category</p>
              <p className="text-sm text-gray-900">{selectedProduct.category?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Stock Quantity</p>
              <p className="text-sm text-gray-900">{selectedProduct.stock_quantity}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Weight</p>
              <p className="text-sm text-gray-900">{selectedProduct.weight ? `${selectedProduct.weight} kg` : '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Dimensions</p>
              <p className="text-sm text-gray-900">{selectedProduct.dimensions || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Material</p>
              <p className="text-sm text-gray-900">{selectedProduct.material || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Tags</p>
              <p className="text-sm text-gray-900">{selectedProduct.tags || '-'}</p>
            </div>
          </div>

          {/* Description */}
          {selectedProduct.long_description && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedProduct.long_description}</p>
            </div>
          )}

          {/* Status */}
          <div className="flex gap-2">
            {selectedProduct.is_active && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Active
              </span>
            )}
            {selectedProduct.is_featured && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                Featured
              </span>
            )}
            {selectedProduct.allow_cod && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                COD Available
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">Product not found</div>
      )}
    </Modal>
  );
};

export default ViewProductModal;